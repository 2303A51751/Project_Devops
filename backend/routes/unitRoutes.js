const express = require('express');
const router = express.Router();
const {
  getUnits,
  createUnit,
  getUnit,
  updateUnit,
  deleteUnit,
  getAvailableUnits,
  getUnitsByProperty,
} = require('../controllers/unitController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { unitValidation, idParamValidation } = require('../middleware/validationMiddleware');

router.get('/available/list', optionalAuth, getAvailableUnits);
router.get('/property/:propertyId', protect, getUnitsByProperty);
router.get('/', optionalAuth, getUnits);
router.get('/:id', optionalAuth, idParamValidation, getUnit);

router.post('/', protect, authorize('admin', 'owner'), unitValidation, createUnit);
router.put('/:id', protect, authorize('admin', 'owner', 'manager'), idParamValidation, updateUnit);
router.delete('/:id', protect, authorize('admin', 'owner'), idParamValidation, deleteUnit);

module.exports = router;
