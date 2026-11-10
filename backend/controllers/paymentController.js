const Payment = require('../models/Payment');
const Lease = require('../models/Lease');
const Property = require('../models/Property');
const ActivityLog = require('../models/ActivityLog');
const { generateReceiptNumber, calculateLateFee } = require('../utils/helpers');

// @desc    Get all payments (with filters)
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.tenant) filter.tenant = req.query.tenant;
    if (req.query.property) filter.property = req.query.property;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.lease) filter.lease = req.query.lease;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.paymentDate = {};
      if (req.query.startDate) filter.paymentDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.paymentDate.$lte = new Date(req.query.endDate);
    }

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

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('tenant', 'name email')
        .populate('property', 'title')
        .populate('unit', 'unitNumber')
        .populate('lease', 'startDate endDate monthlyRent')
        .populate('recordedBy', 'name')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: payments.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create payment
// @route   POST /api/payments
// @access  Owner/Manager/Admin
exports.createPayment = async (req, res, next) => {
  try {
    const { lease: leaseId, amount, dueDate, paymentMethod, paymentDate, notes, status } = req.body;

    // Validate lease
    const lease = await Lease.findById(leaseId).populate('property');
    if (!lease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    // Calculate late fee
    const effectivePaymentDate = paymentDate || new Date();
    const lateFee = calculateLateFee(dueDate, effectivePaymentDate, lease.monthlyRent);

    const payment = await Payment.create({
      lease: leaseId,
      tenant: lease.tenant,
      property: lease.property._id,
      unit: lease.unit,
      amount,
      paymentDate: effectivePaymentDate,
      dueDate,
      paymentMethod,
      status: status || 'completed',
      notes,
      lateFee,
      recordedBy: req.user._id,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'Payment',
      resourceId: payment._id,
      details: `Recorded payment of $${amount} for lease ${leaseId}`,
      ipAddress: req.ip,
    });

    const populated = await Payment.findById(payment._id)
      .populate('tenant', 'name email')
      .populate('property', 'title')
      .populate('unit', 'unitNumber');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('tenant', 'name email phone address')
      .populate('property', 'title address')
      .populate('unit', 'unitNumber')
      .populate('lease', 'startDate endDate monthlyRent')
      .populate('recordedBy', 'name');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Tenants can only see their own payments
    if (
      req.user.role === 'tenant' &&
      payment.tenant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history (all payments with summary)
// @route   GET /api/payments/history/summary
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'tenant') {
      filter.tenant = req.user._id;
    } else if (req.user.role === 'owner') {
      const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
      filter.property = { $in: ownerProperties.map((p) => p._id) };
    }

    const payments = await Payment.find(filter)
      .populate('tenant', 'name email')
      .populate('property', 'title')
      .populate('unit', 'unitNumber')
      .sort({ paymentDate: -1 });

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      totalLateFees: payments.reduce((sum, p) => sum + (p.lateFee || 0), 0),
      completed: payments.filter((p) => p.status === 'completed').length,
      pending: payments.filter((p) => p.status === 'pending').length,
      failed: payments.filter((p) => p.status === 'failed').length,
      refunded: payments.filter((p) => p.status === 'refunded').length,
    };

    res.json({ success: true, summary, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments by lease
// @route   GET /api/payments/lease/:leaseId
// @access  Private
exports.getPaymentsByLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.leaseId);
    if (!lease) {
      return res.status(404).json({ success: false, message: 'Lease not found' });
    }

    const payments = await Payment.find({ lease: req.params.leaseId })
      .populate('tenant', 'name email')
      .populate('property', 'title')
      .populate('unit', 'unitNumber')
      .sort({ paymentDate: -1 });

    const totalPaid = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      count: payments.length,
      totalPaid,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my payments (tenant)
// @route   GET /api/payments/my/payments
// @access  Tenant
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ tenant: req.user._id })
      .populate('property', 'title')
      .populate('unit', 'unitNumber')
      .populate('lease', 'startDate endDate')
      .sort({ paymentDate: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:id/receipt
// @access  Private
exports.getPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('tenant', 'name email phone address')
      .populate('property', 'title address')
      .populate('unit', 'unitNumber')
      .populate('lease', 'startDate endDate monthlyRent')
      .populate('recordedBy', 'name');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Tenants can only see their own receipts
    if (
      req.user.role === 'tenant' &&
      payment.tenant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const receipt = {
      receiptNumber: payment.receiptNumber,
      date: payment.paymentDate,
      tenant: payment.tenant,
      property: payment.property,
      unit: payment.unit,
      lease: payment.lease,
      amount: payment.amount,
      lateFee: payment.lateFee,
      totalAmount: payment.amount + (payment.lateFee || 0),
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      status: payment.status,
      notes: payment.notes,
      recordedBy: payment.recordedBy,
    };

    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};
