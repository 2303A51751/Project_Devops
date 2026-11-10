const Property = require('../models/Property');
const Unit = require('../models/Unit');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all properties (with search, filter, pagination)
// @route   GET /api/properties
// @access  Private
exports.getProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by type
    if (req.query.type) filter.type = req.query.type;

    // Filter by status
    if (req.query.status) filter.status = req.query.status;

    // Filter by owner
    if (req.query.owner) filter.owner = req.query.owner;

    // Filter by city
    if (req.query.city) filter['address.city'] = { $regex: req.query.city, $options: 'i' };

    // Search by title or description
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // For non-admin/non-owner users or public guests, only show active properties
    if (!req.user || req.user.role === 'tenant') {
      filter.status = 'active';
    }

    // Sort
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',').join(' ');
      sort = sortFields;
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('owner', 'name email phone')
        .populate('manager', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: properties.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Owner/Admin
exports.createProperty = async (req, res, next) => {
  try {
    // Set owner to current user if not admin
    if (req.user.role !== 'admin') {
      req.body.owner = req.user._id;
    }

    const property = await Property.create(req.body);

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'Property',
      resourceId: property._id,
      details: `Created property: ${property.title}`,
      ipAddress: req.ip,
    });

    const populated = await Property.findById(property._id)
      .populate('owner', 'name email')
      .populate('manager', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('manager', 'name email phone');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Get units for this property
    const units = await Unit.find({ property: property._id })
      .populate('currentTenant', 'name email phone');

    res.json({ success: true, data: { ...property.toJSON(), units } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Owner/Admin
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Only owner or admin can update
    if (req.user.role !== 'admin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email')
      .populate('manager', 'name email');

    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'Property',
      resourceId: property._id,
      details: `Updated property: ${property.title}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Owner/Admin
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Only owner or admin can delete
    if (req.user.role !== 'admin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    // Check for occupied units
    const occupiedUnits = await Unit.countDocuments({ property: property._id, status: 'occupied' });
    if (occupiedUnits > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete property with ${occupiedUnits} occupied unit(s). Please handle active tenants first.`,
      });
    }

    // Delete associated units
    await Unit.deleteMany({ property: property._id });
    await Property.findByIdAndDelete(property._id);

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'Property',
      resourceId: property._id,
      details: `Deleted property: ${property.title}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my properties (for owners)
// @route   GET /api/properties/my/properties
// @access  Owner
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('manager', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    next(error);
  }
};

// @desc    Get property stats
// @route   GET /api/properties/:id/stats
// @access  Private
exports.getPropertyStats = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const units = await Unit.find({ property: property._id });
    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
    const availableUnits = units.filter((u) => u.status === 'available').length;
    const maintenanceUnits = units.filter((u) => u.status === 'maintenance').length;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;
    const totalMonthlyRevenue = units
      .filter((u) => u.status === 'occupied')
      .reduce((sum, u) => sum + u.monthlyRent, 0);
    const potentialMonthlyRevenue = units.reduce((sum, u) => sum + u.monthlyRent, 0);

    res.json({
      success: true,
      data: {
        property: property.title,
        totalUnits,
        occupiedUnits,
        availableUnits,
        maintenanceUnits,
        occupancyRate: parseFloat(occupancyRate),
        totalMonthlyRevenue,
        potentialMonthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};
