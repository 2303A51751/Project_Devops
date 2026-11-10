const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true,
      },
      country: {
        type: String,
        default: 'USA',
        trim: true,
      },
    },
    type: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: ['apartment', 'house', 'condo', 'commercial', 'townhouse'],
        message: '{VALUE} is not a valid property type',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Property owner is required'],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    images: [
      {
        type: String,
      },
    ],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    totalUnits: {
      type: Number,
      default: 1,
      min: [1, 'Total units must be at least 1'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'maintenance'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    yearBuilt: {
      type: Number,
      min: [1800, 'Year built must be after 1800'],
      max: [new Date().getFullYear() + 5, 'Year built cannot be too far in the future'],
    },
    parkingSpaces: {
      type: Number,
      default: 0,
      min: 0,
    },
    petPolicy: {
      type: String,
      enum: ['allowed', 'not_allowed', 'case_by_case'],
      default: 'not_allowed',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PropertySchema.index({ owner: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ type: 1 });
PropertySchema.index({ 'address.city': 1 });
PropertySchema.index({ title: 'text', description: 'text' });

// Virtual to populate units
PropertySchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'property',
  justOne: false,
});

module.exports = mongoose.model('Property', PropertySchema);
