const mongoose = require('mongoose');

const RentalApplicationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
    },
    moveInDate: {
      type: Date,
      required: [true, 'Move-in date is required'],
    },
    employmentInfo: {
      employer: {
        type: String,
        trim: true,
      },
      position: {
        type: String,
        trim: true,
      },
      monthlyIncome: {
        type: Number,
        min: 0,
      },
    },
    previousAddress: {
      type: String,
      trim: true,
    },
    references: [
      {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        relationship: { type: String, trim: true },
      },
    ],
    message: {
      type: String,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewDate: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      maxlength: [1000, 'Review notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RentalApplicationSchema.index({ tenant: 1 });
RentalApplicationSchema.index({ unit: 1 });
RentalApplicationSchema.index({ status: 1 });
RentalApplicationSchema.index({ property: 1 });

module.exports = mongoose.model('RentalApplication', RentalApplicationSchema);
