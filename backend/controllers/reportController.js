const Property = require('../models/Property');
const Unit = require('../models/Unit');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// Helper to scope by user role
const getRoleFilter = async (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'owner') {
    const properties = await Property.find({ owner: user._id }).select('_id');
    return { propertyIds: properties.map((p) => p._id) };
  }
  if (user.role === 'manager') {
    const properties = await Property.find({ manager: user._id }).select('_id');
    return { propertyIds: properties.map((p) => p._id) };
  }
  return { propertyIds: [] };
};

// @desc    Property Availability Report
// @route   GET /api/reports/property-availability
// @access  Admin/Owner/Manager
exports.getPropertyAvailabilityReport = async (req, res, next) => {
  try {
    const roleFilter = await getRoleFilter(req.user);
    const propertyFilter = roleFilter.propertyIds ? { _id: { $in: roleFilter.propertyIds } } : {};

    const properties = await Property.find(propertyFilter)
      .populate('owner', 'name email')
      .lean();

    const allUnits = await Unit.find(
      roleFilter.propertyIds ? { property: { $in: roleFilter.propertyIds } } : {}
    ).lean();

    const totalProperties = properties.length;
    const totalUnits = allUnits.length;
    const occupiedUnits = allUnits.filter((u) => u.status === 'occupied').length;
    const availableUnits = allUnits.filter((u) => u.status === 'available').length;
    const maintenanceUnits = allUnits.filter((u) => u.status === 'maintenance').length;
    const reservedUnits = allUnits.filter((u) => u.status === 'reserved').length;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

    // Property-wise breakdown
    const propertyBreakdown = properties.map((prop) => {
      const propUnits = allUnits.filter((u) => u.property.toString() === prop._id.toString());
      const propOccupied = propUnits.filter((u) => u.status === 'occupied').length;
      const propAvailable = propUnits.filter((u) => u.status === 'available').length;
      const propTotal = propUnits.length;

      return {
        property: { _id: prop._id, title: prop.title, address: prop.address, type: prop.type },
        owner: prop.owner,
        totalUnits: propTotal,
        occupied: propOccupied,
        available: propAvailable,
        maintenance: propUnits.filter((u) => u.status === 'maintenance').length,
        occupancyRate: propTotal > 0 ? ((propOccupied / propTotal) * 100).toFixed(1) : 0,
      };
    });

    // Properties with all units vacant
    const vacantProperties = propertyBreakdown.filter(
      (p) => p.totalUnits > 0 && p.occupied === 0
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalProperties,
          totalUnits,
          occupiedUnits,
          availableUnits,
          maintenanceUnits,
          reservedUnits,
          occupancyRate: parseFloat(occupancyRate),
        },
        propertyBreakdown,
        vacantProperties,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rent Collection Report
// @route   GET /api/reports/rent-collection
// @access  Admin/Owner/Manager
exports.getRentCollectionReport = async (req, res, next) => {
  try {
    const roleFilter = await getRoleFilter(req.user);
    const paymentFilter = roleFilter.propertyIds
      ? { property: { $in: roleFilter.propertyIds } }
      : {};

    // Active leases for expected rent
    const leaseFilter = { ...paymentFilter, status: 'active' };
    if (roleFilter.propertyIds) leaseFilter.property = { $in: roleFilter.propertyIds };
    const activeLeases = await Lease.find(leaseFilter).lean();

    const totalExpectedMonthly = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);

    // Payments this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const thisMonthPayments = await Payment.find({
      ...paymentFilter,
      paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'completed',
    }).lean();

    const totalCollectedThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Pending payments
    const pendingPayments = await Payment.find({
      ...paymentFilter,
      status: 'pending',
    }).lean();
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Overdue (pending where dueDate is past)
    const overduePayments = pendingPayments.filter((p) => new Date(p.dueDate) < now);
    const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = monthStart.toLocaleString('default', { month: 'short', year: 'numeric' });

      const monthPayments = await Payment.find({
        ...paymentFilter,
        paymentDate: { $gte: monthStart, $lte: monthEnd },
        status: 'completed',
      }).lean();

      monthlyTrends.push({
        month: monthLabel,
        collected: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthPayments.length,
      });
    }

    // Property-wise collection (this month)
    const properties = await Property.find(
      roleFilter.propertyIds ? { _id: { $in: roleFilter.propertyIds } } : {}
    ).lean();

    const propertyCollection = await Promise.all(
      properties.map(async (prop) => {
        const propPayments = thisMonthPayments.filter(
          (p) => p.property.toString() === prop._id.toString()
        );
        const propLeases = activeLeases.filter(
          (l) => l.property.toString() === prop._id.toString()
        );

        return {
          property: { _id: prop._id, title: prop.title },
          expected: propLeases.reduce((sum, l) => sum + l.monthlyRent, 0),
          collected: propPayments.reduce((sum, p) => sum + p.amount, 0),
          paymentCount: propPayments.length,
        };
      })
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalExpectedMonthly,
          totalCollectedThisMonth,
          totalPending,
          totalOverdue,
          collectionRate:
            totalExpectedMonthly > 0
              ? ((totalCollectedThisMonth / totalExpectedMonthly) * 100).toFixed(1)
              : 0,
        },
        monthlyTrends,
        propertyCollection,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lease Expiry Report
// @route   GET /api/reports/lease-expiry
// @access  Admin/Owner/Manager
exports.getLeaseExpiryReport = async (req, res, next) => {
  try {
    const roleFilter = await getRoleFilter(req.user);
    const leaseFilter = roleFilter.propertyIds
      ? { property: { $in: roleFilter.propertyIds } }
      : {};

    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);

    const allLeases = await Lease.find(leaseFilter)
      .populate('tenant', 'name email phone')
      .populate('unit', 'unitNumber')
      .populate('property', 'title address')
      .lean();

    const activeLeases = allLeases.filter((l) => l.status === 'active');
    const expiredLeases = allLeases.filter(
      (l) => l.status === 'expired' || (l.status === 'active' && new Date(l.endDate) < now)
    );

    const expiringIn30Days = activeLeases.filter(
      (l) => new Date(l.endDate) >= now && new Date(l.endDate) <= thirtyDays
    );
    const expiringIn60Days = activeLeases.filter(
      (l) => new Date(l.endDate) >= now && new Date(l.endDate) <= sixtyDays
    );

    res.json({
      success: true,
      data: {
        summary: {
          total: allLeases.length,
          active: activeLeases.length,
          expired: expiredLeases.length,
          terminated: allLeases.filter((l) => l.status === 'terminated').length,
          expiringIn30Days: expiringIn30Days.length,
          expiringIn60Days: expiringIn60Days.length,
        },
        expiringIn30Days,
        expiringIn60Days,
        expiredLeases: expiredLeases.slice(0, 20),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Maintenance Report
// @route   GET /api/reports/maintenance
// @access  Admin/Owner/Manager
exports.getMaintenanceReport = async (req, res, next) => {
  try {
    const roleFilter = await getRoleFilter(req.user);
    const maintenanceFilter = roleFilter.propertyIds
      ? { property: { $in: roleFilter.propertyIds } }
      : {};

    const allRequests = await MaintenanceRequest.find(maintenanceFilter).lean();

    // By status
    const byStatus = {
      pending: allRequests.filter((r) => r.status === 'pending').length,
      assigned: allRequests.filter((r) => r.status === 'assigned').length,
      in_progress: allRequests.filter((r) => r.status === 'in_progress').length,
      resolved: allRequests.filter((r) => r.status === 'resolved').length,
      rejected: allRequests.filter((r) => r.status === 'rejected').length,
    };

    // By priority
    const byPriority = {
      emergency: allRequests.filter((r) => r.priority === 'emergency').length,
      high: allRequests.filter((r) => r.priority === 'high').length,
      medium: allRequests.filter((r) => r.priority === 'medium').length,
      low: allRequests.filter((r) => r.priority === 'low').length,
    };

    // By category
    const categories = ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'cleaning', 'other'];
    const byCategory = {};
    categories.forEach((cat) => {
      byCategory[cat] = allRequests.filter((r) => r.category === cat).length;
    });

    // Total cost
    const totalEstimatedCost = allRequests.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    const totalActualCost = allRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0);

    // Average resolution time (for resolved requests)
    const resolvedRequests = allRequests.filter((r) => r.status === 'resolved' && r.resolvedDate);
    let avgResolutionDays = 0;
    if (resolvedRequests.length > 0) {
      const totalDays = resolvedRequests.reduce((sum, r) => {
        const diff = new Date(r.resolvedDate) - new Date(r.createdAt);
        return sum + diff / (1000 * 60 * 60 * 24);
      }, 0);
      avgResolutionDays = (totalDays / resolvedRequests.length).toFixed(1);
    }

    // Property-wise stats
    const properties = await Property.find(
      roleFilter.propertyIds ? { _id: { $in: roleFilter.propertyIds } } : {}
    ).lean();

    const propertyStats = properties.map((prop) => {
      const propRequests = allRequests.filter(
        (r) => r.property.toString() === prop._id.toString()
      );
      return {
        property: { _id: prop._id, title: prop.title },
        total: propRequests.length,
        pending: propRequests.filter((r) => r.status === 'pending').length,
        resolved: propRequests.filter((r) => r.status === 'resolved').length,
        totalCost: propRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0),
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          total: allRequests.length,
          open: byStatus.pending + byStatus.assigned + byStatus.in_progress,
          resolved: byStatus.resolved,
          rejected: byStatus.rejected,
          avgResolutionDays: parseFloat(avgResolutionDays),
          totalEstimatedCost,
          totalActualCost,
        },
        byStatus,
        byPriority,
        byCategory,
        propertyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
