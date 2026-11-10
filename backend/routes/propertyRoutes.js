const express = require('express');
const router = express.Router();
const {
  getProperties,
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  getPropertyStats,
} = require('../controllers/propertyController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { propertyValidation, idParamValidation } = require('../middleware/validationMiddleware');

// Public or authenticated property listing
router.get('/', optionalAuth, getProperties);
router.get('/my/properties', protect, authorize('owner', 'admin'), getMyProperties);
router.get('/:id/stats', protect, authorize('admin', 'owner', 'manager'), idParamValidation, getPropertyStats);
router.get('/:id', optionalAuth, idParamValidation, getProperty);

// Admin & Owner only
router.post('/', protect, authorize('admin', 'owner'), propertyValidation, createProperty);
router.put('/:id', protect, authorize('admin', 'owner'), idParamValidation, updateProperty);
router.delete('/:id', protect, authorize('admin', 'owner'), idParamValidation, deleteProperty);

module.exports = router;
