const express = require('express');
const router = express.Router();
const {
  getRequests,
  createRequest,
  getRequest,
  updateRequest,
  updateRequestStatus,
  assignRequest,
  getMyRequests,
  getRequestsByProperty,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { maintenanceValidation, idParamValidation } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/my/requests', authorize('tenant'), getMyRequests);
router.get('/property/:propertyId', getRequestsByProperty);
router.get('/', getRequests);
router.post('/', authorize('tenant', 'admin', 'owner', 'manager'), maintenanceValidation, createRequest);
router.get('/:id', idParamValidation, getRequest);
router.put('/:id/status', authorize('admin', 'owner', 'manager'), idParamValidation, updateRequestStatus);
router.put('/:id/assign', authorize('admin', 'owner', 'manager'), idParamValidation, assignRequest);
router.put('/:id', authorize('admin', 'owner', 'manager'), idParamValidation, updateRequest);

module.exports = router;
