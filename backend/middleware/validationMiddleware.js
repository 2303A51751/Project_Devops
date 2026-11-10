const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'owner', 'tenant', 'manager'])
    .withMessage('Invalid role'),
  validate,
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Property validations
const propertyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('address.street').trim().notEmpty().withMessage('Street is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('type')
    .isIn(['apartment', 'house', 'condo', 'commercial', 'townhouse'])
    .withMessage('Invalid property type'),
  validate,
];

// Unit validations
const unitValidation = [
  body('property').isMongoId().withMessage('Valid property ID is required'),
  body('unitNumber').trim().notEmpty().withMessage('Unit number is required'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isNumeric({ min: 0 }).withMessage('Bathrooms must be a non-negative number'),
  body('area').isNumeric({ min: 1 }).withMessage('Area must be positive'),
  body('monthlyRent').isNumeric({ min: 0 }).withMessage('Rent must be non-negative'),
  validate,
];

// Application validations
const applicationValidation = [
  body('unit').isMongoId().withMessage('Valid unit ID is required'),
  body('moveInDate').isISO8601().withMessage('Valid move-in date is required'),
  validate,
];

// Lease validations
const leaseValidation = [
  body('tenant').isMongoId().withMessage('Valid tenant ID is required'),
  body('unit').isMongoId().withMessage('Valid unit ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('monthlyRent').isNumeric({ min: 0 }).withMessage('Rent must be non-negative'),
  validate,
];

// Payment validations
const paymentValidation = [
  body('lease').isMongoId().withMessage('Valid lease ID is required'),
  body('amount').isNumeric({ min: 0 }).withMessage('Amount must be non-negative'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('paymentMethod')
    .isIn(['cash', 'check', 'bank_transfer', 'online'])
    .withMessage('Invalid payment method'),
  validate,
];

// Maintenance validations
const maintenanceValidation = [
  body('unit').isMongoId().withMessage('Valid unit ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .isIn(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'cleaning', 'other'])
    .withMessage('Invalid category'),
  validate,
];

// ID param validation
const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  propertyValidation,
  unitValidation,
  applicationValidation,
  leaseValidation,
  paymentValidation,
  maintenanceValidation,
  idParamValidation,
};
