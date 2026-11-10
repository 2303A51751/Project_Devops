const express = require('express');
const router = express.Router();
const {
  getApplications,
  createApplication,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
  getMyApplications,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { applicationValidation, idParamValidation } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/my/applications', authorize('tenant'), getMyApplications);
router.get('/', authorize('admin', 'owner', 'manager'), getApplications);
router.post('/', authorize('tenant'), applicationValidation, createApplication);
router.get('/:id', idParamValidation, getApplication);
router.put('/:id/status', authorize('admin', 'owner', 'manager'), idParamValidation, updateApplicationStatus);
router.put('/:id/withdraw', authorize('tenant'), idParamValidation, withdrawApplication);

module.exports = router;
