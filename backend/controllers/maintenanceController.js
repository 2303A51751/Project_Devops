const MaintenanceRequest = require('../models/MaintenanceRequest');
const Unit = require('../models/Unit');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all maintenance requests (with filters)
// @route   GET /api/maintenance
// @access  Private
exports.getRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.property) filter.property = req.query.property;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;

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

    const [requests, total] = await Promise.all([
      MaintenanceRequest.find(filter)
        .populate('tenant', 'name email phone')
        .populate('property', 'title address')
        .populate('unit', 'unitNumber')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MaintenanceRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: requests.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create maintenance request (tenant)
// @route   POST /api/maintenance
// @access  Tenant
exports.createRequest = async (req, res, next) => {
  try {
    const { unit: unitId, title, description, category, priority, images } = req.body;

    // Validate unit
    const unit = await Unit.findById(unitId).populate('property');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    // Verify tenant is the current tenant of this unit
    if (unit.currentTenant && unit.currentTenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create maintenance requests for your own unit',
      });
    }

    const request = await MaintenanceRequest.create({
      tenant: req.user._id,
      property: unit.property._id,
      unit: unitId,
      title,
      description,
      category,
      priority: priority || 'medium',
      images: images || [],
    });

    // Notify property owner and manager
    const notifications = [
      {
        user: unit.property.owner,
        title: 'New Maintenance Request',
        message: `${req.user.name} submitted a ${priority || 'medium'} priority ${category} request for unit ${unit.unitNumber}: ${title}`,
        type: priority === 'emergency' ? 'warning' : 'info',
        link: `/maintenance/${request._id}`,
      },
    ];

    if (unit.property.manager) {
      notifications.push({
        user: unit.property.manager,
        title: 'New Maintenance Request',
        message: `${req.user.name} submitted a ${priority || 'medium'} priority ${category} request for unit ${unit.unitNumber}: ${title}`,
        type: priority === 'emergency' ? 'warning' : 'info',
        link: `/maintenance/${request._id}`,
      });
    }

    await Notification.insertMany(notifications);

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'MaintenanceRequest',
      resourceId: request._id,
      details: `Created maintenance request: ${title}`,
      ipAddress: req.ip,
    });

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('tenant', 'name email')
      .populate('property', 'title')
      .populate('unit', 'unitNumber');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance request
// @route   GET /api/maintenance/:id
// @access  Private
exports.getRequest = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('tenant', 'name email phone')
      .populate('property', 'title address owner manager')
      .populate('unit', 'unitNumber floor')
      .populate('assignedTo', 'name email phone');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Tenants can only see their own
    if (
      req.user.role === 'tenant' &&
      request.tenant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance request
// @route   PUT /api/maintenance/:id
// @access  Manager/Admin
exports.updateRequest = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    const allowed = [
      'title', 'description', 'category', 'priority', 'status',
      'assignedTo', 'resolution', 'estimatedCost', 'actualCost',
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // If resolving, set resolvedDate
    if (updates.status === 'resolved') {
      updates.resolvedDate = new Date();
    }

    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('tenant', 'name email')
      .populate('property', 'title')
      .populate('unit', 'unitNumber')
      .populate('assignedTo', 'name email');

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status
// @route   PUT /api/maintenance/:id/status
// @access  Manager/Admin
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;

    const validStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    request.status = status;
    if (status === 'resolved') {
      request.resolvedDate = new Date();
      request.resolution = resolution || request.resolution;
      if (req.body.actualCost !== undefined) {
        request.actualCost = Number(req.body.actualCost) || 0;
      }
    }
    await request.save();

    // Notify tenant
    await Notification.create({
      user: request.tenant,
      title: 'Maintenance Request Updated',
      message: `Your maintenance request "${request.title}" has been updated to: ${status}`,
      type: status === 'resolved' ? 'success' : 'info',
      link: `/maintenance/${request._id}`,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'update_status',
      resourceType: 'MaintenanceRequest',
      resourceId: request._id,
      details: `Updated maintenance request status to ${status}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign request
// @route   PUT /api/maintenance/:id/assign
// @access  Manager/Admin
exports.assignRequest = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'assignedTo is required' });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    request.assignedTo = assignedTo;
    request.status = 'assigned';
    await request.save();

    // Notify assigned user
    await Notification.create({
      user: assignedTo,
      title: 'Maintenance Request Assigned',
      message: `You have been assigned maintenance request: "${request.title}"`,
      type: 'info',
      link: `/maintenance/${request._id}`,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'assign',
      resourceType: 'MaintenanceRequest',
      resourceId: request._id,
      details: `Assigned maintenance request to ${assignedTo}`,
      ipAddress: req.ip,
    });

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('assignedTo', 'name email');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my maintenance requests (tenant)
// @route   GET /api/maintenance/my/requests
// @access  Tenant
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await MaintenanceRequest.find({ tenant: req.user._id })
      .populate('property', 'title')
      .populate('unit', 'unitNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance requests by property
// @route   GET /api/maintenance/property/:propertyId
// @access  Private
exports.getRequestsByProperty = async (req, res, next) => {
  try {
    const requests = await MaintenanceRequest.find({ property: req.params.propertyId })
      .populate('tenant', 'name email phone')
      .populate('unit', 'unitNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};
