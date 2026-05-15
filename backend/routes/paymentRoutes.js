const express = require('express');
const router = express.Router();
const {
    depositFunds,
    mockCheckout,
    verifyPayment,
    processCashback,
    getTransactions
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/deposit', protect, depositFunds);
router.get('/mock-checkout', mockCheckout);
router.post('/verify', verifyPayment); // Webhook callback
router.post('/cashback', protect, processCashback);
router.get('/transactions', protect, getTransactions);

module.exports = router;
