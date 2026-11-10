const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  getActivityLogs,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { idParamValidation } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/role/:role', authorize('admin', 'manager'), getUsersByRole);
router.get('/activity-logs', authorize('admin'), getActivityLogs);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), idParamValidation, getUser);
router.put('/:id', authorize('admin'), idParamValidation, updateUser);
router.delete('/:id', authorize('admin'), idParamValidation, deleteUser);

module.exports = router;
