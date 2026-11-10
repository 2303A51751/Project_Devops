const Unit = require('../models/Unit');
const Property = require('../models/Property');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all units (filter by property, status, pagination)
// @route   GET /api/units
// @access  Private
exports.getUnits = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.property) filter.property = req.query.property;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.minRent || req.query.maxRent) {
      filter.monthlyRent = {};
      if (req.query.minRent) filter.monthlyRent.$gte = parseFloat(req.query.minRent);
      if (req.query.maxRent) filter.monthlyRent.$lte = parseFloat(req.query.maxRent);
    }
    if (req.query.bedrooms) filter.bedrooms = parseInt(req.query.bedrooms, 10);

    const [units, total] = await Promise.all([
      Unit.find(filter)
        .populate('property', 'title address type')
        .populate('currentTenant', 'name email phone')
        .sort({ property: 1, unitNumber: 1 })
        .skip(skip)
        .limit(limit),
      Unit.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: units.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: units,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create unit
// @route   POST /api/units
// @access  Owner/Admin
exports.createUnit = async (req, res, next) => {
  try {
    // Verify property exists
    const property = await Property.findById(req.body.property);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to add units to this property' });
    }

    const unit = await Unit.create(req.body);

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'Unit',
      resourceId: unit._id,
      details: `Created unit ${unit.unitNumber} in property ${property.title}`,
      ipAddress: req.ip,
    });

    const populated = await Unit.findById(unit._id)
      .populate('property', 'title address')
      .populate('currentTenant', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single unit
// @route   GET /api/units/:id
// @access  Private
exports.getUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id)
      .populate('property', 'title address type owner manager')
      .populate('currentTenant', 'name email phone');

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

// @desc    Update unit
// @route   PUT /api/units/:id
// @access  Owner/Admin
exports.updateUnit = async (req, res, next) => {
  try {
    let unit = await Unit.findById(req.params.id).populate('property');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      unit.property.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this unit' });
    }

    unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('property', 'title address')
      .populate('currentTenant', 'name email');

    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete unit
// @route   DELETE /api/units/:id
// @access  Owner/Admin
exports.deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('property');
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    if (
      req.user.role !== 'admin' &&
      unit.property.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this unit' });
    }

    if (unit.status === 'occupied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an occupied unit. Please handle the tenant first.',
      });
    }

    await Unit.findByIdAndDelete(unit._id);

    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available units
// @route   GET /api/units/available/list
// @access  Private
exports.getAvailableUnits = async (req, res, next) => {
  try {
    const filter = { status: 'available' };
    if (req.query.property) filter.property = req.query.property;

    const units = await Unit.find(filter)
      .populate('property', 'title address type')
      .sort({ monthlyRent: 1 });

    res.json({ success: true, count: units.length, data: units });
  } catch (error) {
    next(error);
  }
};

// @desc    Get units by property
// @route   GET /api/units/property/:propertyId
// @access  Private
exports.getUnitsByProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const units = await Unit.find({ property: req.params.propertyId })
      .populate('currentTenant', 'name email phone')
      .sort({ unitNumber: 1 });

    res.json({ success: true, count: units.length, data: units });
  } catch (error) {
    next(error);
  }
};
