const mongoose = require('mongoose');
const { generateReceiptNumber } = require('../utils/helpers');

const PaymentSchema = new mongoose.Schema(
  {
    lease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lease',
      required: [true, 'Lease reference is required'],
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant reference is required'],
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required'],
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'check', 'bank_transfer', 'online'],
        message: '{VALUE} is not a valid payment method',
      },
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'pending', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ tenant: 1 });
PaymentSchema.index({ lease: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ property: 1 });
PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ receiptNumber: 1 });

// Auto-generate receipt number before saving
PaymentSchema.pre('save', function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber = generateReceiptNumber();
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
