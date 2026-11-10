const mongoose = require('mongoose');

const LeaseSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant reference is required'],
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit reference is required'],
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Lease start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Lease end date is required'],
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Rent cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit cannot be negative'],
    },
    depositStatus: {
      type: String,
      enum: {
        values: ['held', 'returned', 'partial'],
        message: '{VALUE} is not a valid deposit status',
      },
      default: 'held',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'expired', 'terminated', 'pending'],
        message: '{VALUE} is not a valid lease status',
      },
      default: 'pending',
    },
    terms: {
      type: String,
      maxlength: [5000, 'Terms cannot exceed 5000 characters'],
    },
    renewedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lease',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
LeaseSchema.index({ tenant: 1 });
LeaseSchema.index({ unit: 1 });
LeaseSchema.index({ property: 1 });
LeaseSchema.index({ status: 1 });
LeaseSchema.index({ endDate: 1 });

// Virtual: isExpired
LeaseSchema.virtual('isExpired').get(function () {
  return this.endDate < new Date() && this.status !== 'terminated';
});

// Virtual: daysRemaining
LeaseSchema.virtual('daysRemaining').get(function () {
  if (this.status === 'terminated' || this.status === 'expired') return 0;
  const now = new Date();
  const diff = this.endDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

module.exports = mongoose.model('Lease', LeaseSchema);
