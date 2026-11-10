const express = require('express');
const router = express.Router();
const {
  getPayments,
  createPayment,
  getPayment,
  getPaymentHistory,
  getPaymentsByLease,
  getMyPayments,
  getPaymentReceipt,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { paymentValidation, idParamValidation } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/my/payments', authorize('tenant'), getMyPayments);
router.get('/history/summary', authorize('admin', 'owner', 'manager'), getPaymentHistory);
router.get('/lease/:leaseId', getPaymentsByLease);
router.get('/:id/receipt', idParamValidation, getPaymentReceipt);
router.get('/', getPayments);
router.post('/', authorize('admin', 'owner', 'manager', 'tenant'), paymentValidation, createPayment);
router.get('/:id', idParamValidation, getPayment);

module.exports = router;
