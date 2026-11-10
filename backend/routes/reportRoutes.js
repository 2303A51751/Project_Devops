const express = require('express');
const router = express.Router();
const {
  getPropertyAvailabilityReport,
  getRentCollectionReport,
  getLeaseExpiryReport,
  getMaintenanceReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin', 'owner', 'manager'));

router.get('/property-availability', getPropertyAvailabilityReport);
router.get('/rent-collection', getRentCollectionReport);
router.get('/lease-expiry', getLeaseExpiryReport);
router.get('/maintenance', getMaintenanceReport);

module.exports = router;
