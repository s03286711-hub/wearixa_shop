const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { validatePromoCode, usePromoCode, createPromoCode, getPromoCodes, deletePromoCode } = require('../controllers/promoController');

router.post('/validate', protect, validatePromoCode);
router.post('/use', protect, usePromoCode);
router.route('/').get(protect, admin, getPromoCodes).post(protect, admin, createPromoCode);
router.delete('/:id', protect, admin, deletePromoCode);

module.exports = router;
