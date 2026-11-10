const Lease = require('../models/Lease');
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all leases (with filters)
// @route   GET /api/leases
// @access  Private
exports.getLeases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.tenant) filter.tenant = req.query.tenant;
    if (req.query.property) filter.property = req.query.property;

    // Role-based filtering
    if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    } else if (req.user.role === 'owner') {
      const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
      filter.property = { $in: ownerProperties.map((p) => p._id) };
    } else if (req.user.role === 'manager') {
      const managedProperties = await Property.find({ manager: req.user._id }).select('_id');
      filter.property = { $in: managedProperties.map((p) => p._id) };
    }

    const [leases, total] = await Promise.all([
      Lease.find(filter)
        .populate('tenant', 'name email phone')
        .populate('unit', 'unitNumber floor')
        .populate('property', 'title address')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lease.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: leases.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: leases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lease
// @route   POST /api/leases
// @access  Owner/Manager/Admin
exports.createLease = async (req, res, next) => {
  try {
    const { tenant, unit: unitId, startDate, endDate, monthlyRent, securityDeposit, terms } = req.body;

    // Validate unit
    const unit = await Unit.findById(unitId).populate('property');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    if (unit.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Unit is already occupied' });
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const lease = await Lease.create({
      tenant,
      unit: unitId,
      property: unit.property._id,
      startDate,
      endDate,
      monthlyRent: monthlyRent || unit.monthlyRent,
      securityDeposit: securityDeposit || unit.securityDeposit,
      status: 'active',
      terms,
      createdBy: req.user._id,
    });

    // Update unit
    unit.status = 'occupied';
    unit.currentTenant = tenant;
    await unit.save();

    // Notify tenant
    await Notification.create({
      user: tenant,
      title: 'Lease Created',
      message: `A new lease has been created for unit ${unit.unitNumber}.`,
      type: 'success',
      link: `/leases/${lease._id}`,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'Lease',
      resourceId: lease._id,
      details: `Created lease for unit ${unit.unitNumber}`,
      ipAddress: req.ip,
    });

    const populated = await Lease.findById(lease._id)
      .populate('tenant', 'name email')
      .populate('unit', 'unitNumber')
      .populate('property', 'title');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lease
// @route   GET /api/leases/:id
// @access  Private
exports.getLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('tenant', 'name email phone address')
      .populate('unit', 'unitNumber floor bedrooms bathrooms area')
      .populate('property', 'title address type')
      .populate('createdBy', 'name')
      .populate('renewedFrom');

    if (!lease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    // Tenants can only see their own leases
    if (
      req.user.role === 'tenant' &&
      lease.tenant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this lease' });
    }

    res.json({ success: true, data: lease });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lease
// @route   PUT /api/leases/:id
// @access  Owner/Manager/Admin
exports.updateLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    const allowed = ['monthlyRent', 'endDate', 'terms', 'status', 'depositStatus'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedLease = await Lease.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('tenant', 'name email')
      .populate('unit', 'unitNumber')
      .populate('property', 'title');

    res.json({ success: true, data: updatedLease });
  } catch (error) {
    next(error);
  }
};

// @desc    Terminate lease
// @route   PUT /api/leases/:id/terminate
// @access  Owner/Manager/Admin
exports.terminateLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    if (lease.status === 'terminated') {
      return res.status(400).json({ success: false, message: 'Lease is already terminated' });
    }

    lease.status = 'terminated';
    await lease.save();

    // Free up the unit
    const unit = await Unit.findById(lease.unit);
    if (unit) {
      unit.status = 'available';
      unit.currentTenant = null;
      await unit.save();
    }

    // Notify tenant
    await Notification.create({
      user: lease.tenant,
      title: 'Lease Terminated',
      message: 'Your lease has been terminated. Please contact management for details.',
      type: 'warning',
      link: `/leases/${lease._id}`,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'terminate',
      resourceType: 'Lease',
      resourceId: lease._id,
      details: `Terminated lease ${lease._id}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Lease terminated', data: lease });
  } catch (error) {
    next(error);
  }
};

// @desc    Renew lease
// @route   POST /api/leases/:id/renew
// @access  Owner/Manager/Admin
exports.renewLease = async (req, res, next) => {
  try {
    const oldLease = await Lease.findById(req.params.id);
    if (!oldLease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    if (oldLease.status !== 'active' && oldLease.status !== 'expired') {
      return res.status(400).json({ success: false, message: 'Only active or expired leases can be renewed' });
    }

    // Calculate new dates
    const newStartDate = req.body.startDate || oldLease.endDate;
    const newEndDate = req.body.endDate || new Date(new Date(newStartDate).setFullYear(new Date(newStartDate).getFullYear() + 1));
    const newRent = req.body.monthlyRent || oldLease.monthlyRent;

    // Mark old lease as expired
    oldLease.status = 'expired';
    await oldLease.save();

    // Create new lease
    const newLease = await Lease.create({
      tenant: oldLease.tenant,
      unit: oldLease.unit,
      property: oldLease.property,
      startDate: newStartDate,
      endDate: newEndDate,
      monthlyRent: newRent,
      securityDeposit: oldLease.securityDeposit,
      status: 'active',
      terms: req.body.terms || oldLease.terms,
      renewedFrom: oldLease._id,
      createdBy: req.user._id,
    });

    // Notify tenant
    await Notification.create({
      user: oldLease.tenant,
      title: 'Lease Renewed',
      message: `Your lease has been renewed until ${new Date(newEndDate).toLocaleDateString()}.`,
      type: 'success',
      link: `/leases/${newLease._id}`,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'renew',
      resourceType: 'Lease',
      resourceId: newLease._id,
      details: `Renewed lease from ${oldLease._id}`,
      ipAddress: req.ip,
    });

    const populated = await Lease.findById(newLease._id)
      .populate('tenant', 'name email')
      .populate('unit', 'unitNumber')
      .populate('property', 'title');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expiring leases (within 30 or 60 days)
// @route   GET /api/leases/expiring/soon
// @access  Private
exports.getExpiringLeases = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const filter = {
      status: 'active',
      endDate: { $gte: now, $lte: futureDate },
    };

    // Role-based filtering
    if (req.user.role === 'owner') {
      const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
      filter.property = { $in: ownerProperties.map((p) => p._id) };
    } else if (req.user.role === 'manager') {
      const managedProperties = await Property.find({ manager: req.user._id }).select('_id');
      filter.property = { $in: managedProperties.map((p) => p._id) };
    }

    const leases = await Lease.find(filter)
      .populate('tenant', 'name email phone')
      .populate('unit', 'unitNumber')
      .populate('property', 'title address')
      .sort({ endDate: 1 });

    res.json({ success: true, count: leases.length, data: leases });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my leases (tenant)
// @route   GET /api/leases/my/leases
// @access  Tenant
exports.getMyLeases = async (req, res, next) => {
  try {
    const leases = await Lease.find({ tenant: req.user._id })
      .populate('unit', 'unitNumber floor bedrooms bathrooms area')
      .populate('property', 'title address type')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leases.length, data: leases });
  } catch (error) {
    next(error);
  }
};
