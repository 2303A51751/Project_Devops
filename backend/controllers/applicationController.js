const RentalApplication = require('../models/RentalApplication');
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Owner/Manager/Admin
exports.getApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.property) filter.property = req.query.property;

    // Owners can only see applications for their properties
    if (req.user.role === 'owner') {
      const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
      filter.property = { $in: ownerProperties.map((p) => p._id) };
    }

    // Managers can only see applications for properties they manage
    if (req.user.role === 'manager') {
      const managedProperties = await Property.find({ manager: req.user._id }).select('_id');
      filter.property = { $in: managedProperties.map((p) => p._id) };
    }

    const [applications, total] = await Promise.all([
      RentalApplication.find(filter)
        .populate('tenant', 'name email phone')
        .populate('unit', 'unitNumber monthlyRent')
        .populate('property', 'title address')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RentalApplication.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: applications.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create application (tenant only)
// @route   POST /api/applications
// @access  Tenant
exports.createApplication = async (req, res, next) => {
  try {
    const { unit: unitId, moveInDate, employmentInfo, previousAddress, references, message } = req.body;

    // Validate unit exists and is available
    const unit = await Unit.findById(unitId).populate('property');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    if (unit.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Unit is not available. Current status: ${unit.status}`,
      });
    }

    // Check if tenant already has a pending application for this unit
    const existingApp = await RentalApplication.findOne({
      tenant: req.user._id,
      unit: unitId,
      status: 'pending',
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application for this unit',
      });
    }

    const application = await RentalApplication.create({
      tenant: req.user._id,
      unit: unitId,
      property: unit.property._id,
      moveInDate,
      employmentInfo,
      previousAddress,
      references,
      message,
    });

    // Notify property owner
    await Notification.create({
      user: unit.property.owner,
      title: 'New Rental Application',
      message: `${req.user.name} applied for unit ${unit.unitNumber} at ${unit.property.title}`,
      type: 'info',
      link: `/applications/${application._id}`,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'RentalApplication',
      resourceId: application._id,
      details: `Applied for unit ${unit.unitNumber} at ${unit.property.title}`,
      ipAddress: req.ip,
    });

    const populated = await RentalApplication.findById(application._id)
      .populate('tenant', 'name email')
      .populate('unit', 'unitNumber monthlyRent')
      .populate('property', 'title address');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res, next) => {
  try {
    const application = await RentalApplication.findById(req.params.id)
      .populate('tenant', 'name email phone address')
      .populate('unit', 'unitNumber monthlyRent bedrooms bathrooms area')
      .populate('property', 'title address type owner')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Authorization: tenant can see their own, owner/manager/admin can see property applications
    if (
      req.user.role === 'tenant' &&
      application.tenant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (approve/reject)
// @route   PUT /api/applications/:id/status
// @access  Owner/Manager/Admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "approved" or "rejected"',
      });
    }

    const application = await RentalApplication.findById(req.params.id)
      .populate('unit')
      .populate('property');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update application with status: ${application.status}`,
      });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewDate = new Date();
    application.reviewNotes = reviewNotes || '';
    await application.save();

    // On approval: create lease and update unit
    if (status === 'approved') {
      const unit = await Unit.findById(application.unit._id);

      // Create lease (1-year default)
      const startDate = application.moveInDate || new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const lease = await Lease.create({
        tenant: application.tenant,
        unit: unit._id,
        property: application.property._id,
        startDate,
        endDate,
        monthlyRent: unit.monthlyRent,
        securityDeposit: unit.securityDeposit,
        status: 'active',
        terms: 'Standard 12-month residential lease agreement.',
        createdBy: req.user._id,
      });

      // Update unit status
      unit.status = 'occupied';
      unit.currentTenant = application.tenant;
      await unit.save();

      // Reject other pending applications for same unit
      await RentalApplication.updateMany(
        {
          unit: unit._id,
          status: 'pending',
          _id: { $ne: application._id },
        },
        {
          status: 'rejected',
          reviewedBy: req.user._id,
          reviewDate: new Date(),
          reviewNotes: 'Unit is no longer available - another application was approved.',
        }
      );

      // Notify tenant
      await Notification.create({
        user: application.tenant,
        title: 'Application Approved!',
        message: `Your application for unit ${unit.unitNumber} has been approved. Lease created.`,
        type: 'success',
        link: `/leases/${lease._id}`,
      });
    } else {
      // Notify tenant of rejection
      await Notification.create({
        user: application.tenant,
        title: 'Application Rejected',
        message: `Your application for unit ${application.unit.unitNumber} has been rejected.`,
        type: 'error',
        link: `/applications/${application._id}`,
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: `application_${status}`,
      resourceType: 'RentalApplication',
      resourceId: application._id,
      details: `Application ${status} for unit ${application.unit.unitNumber}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Tenant
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await RentalApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application with status: ${application.status}`,
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications (tenant)
// @route   GET /api/applications/my/applications
// @access  Tenant
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await RentalApplication.find({ tenant: req.user._id })
      .populate('unit', 'unitNumber monthlyRent bedrooms bathrooms')
      .populate('property', 'title address type')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};
