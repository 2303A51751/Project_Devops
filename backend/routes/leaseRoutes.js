const express = require('express');
const router = express.Router();
const {
  getLeases,
  createLease,
  getLease,
  updateLease,
  terminateLease,
  renewLease,
  getExpiringLeases,
  getMyLeases,
} = require('../controllers/leaseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { leaseValidation, idParamValidation } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/my/leases', authorize('tenant'), getMyLeases);
router.get('/expiring/soon', authorize('admin', 'owner', 'manager'), getExpiringLeases);
router.get('/', getLeases);
router.post('/', authorize('admin', 'owner', 'manager'), leaseValidation, createLease);
router.get('/:id', idParamValidation, getLease);
router.put('/:id', authorize('admin', 'owner', 'manager'), idParamValidation, updateLease);
router.put('/:id/terminate', authorize('admin', 'owner', 'manager'), idParamValidation, terminateLease);
router.post('/:id/renew', authorize('admin', 'owner', 'manager'), idParamValidation, renewLease);

module.exports = router;
