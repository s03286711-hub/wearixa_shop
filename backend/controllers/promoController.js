const PromoCode = require('../models/PromoCode');

// @desc    Validate and apply a promo code
// @route   POST /api/promo/validate
// @access  Private
const validatePromoCode = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        const userId = req.user._id;

        const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

        if (!promo) {
            return res.status(404).json({ message: 'Invalid promo code' });
        }

        // Check expiry
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'This promo code has expired' });
        }

        // Check usage limit
        if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
            return res.status(400).json({ message: 'This promo code has reached its usage limit' });
        }

        // Check if user already used it
        if (promo.usedBy.includes(userId)) {
            return res.status(400).json({ message: 'You have already used this promo code' });
        }

        // Check minimum order amount
        if (orderTotal < promo.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order amount is $${promo.minOrderAmount.toFixed(2)}` });
        }

        // Calculate discount
        let discount = 0;
        if (promo.discountType === 'percentage') {
            discount = (orderTotal * promo.discountValue) / 100;
            if (promo.maxDiscount > 0) {
                discount = Math.min(discount, promo.maxDiscount);
            }
        } else {
            discount = promo.discountValue;
        }

        discount = Math.min(discount, orderTotal); // Can't discount more than total

        res.json({
            valid: true,
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            discount: Math.round(discount * 100) / 100,
            message: `${promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`} discount applied!`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error validating promo code' });
    }
};

// @desc    Mark promo code as used after order is placed
// @route   POST /api/promo/use
// @access  Private
const usePromoCode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        const promo = await PromoCode.findOne({ code: code.toUpperCase() });
        if (!promo) return res.status(404).json({ message: 'Promo code not found' });

        promo.usedCount += 1;
        promo.usedBy.push(userId);
        await promo.save();

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a promo code (Admin)
// @route   POST /api/promo
// @access  Private/Admin
const createPromoCode = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;

        const exists = await PromoCode.findOne({ code: code.toUpperCase() });
        if (exists) return res.status(400).json({ message: 'Promo code already exists' });

        const promo = await PromoCode.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || 0,
            usageLimit: usageLimit || 0,
            expiresAt: expiresAt || null,
        });

        res.status(201).json(promo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating promo code' });
    }
};

// @desc    Get all promo codes (Admin)
// @route   GET /api/promo
// @access  Private/Admin
const getPromoCodes = async (req, res) => {
    try {
        const codes = await PromoCode.find().sort({ createdAt: -1 });
        res.json(codes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a promo code (Admin)
// @route   DELETE /api/promo/:id
// @access  Private/Admin
const deletePromoCode = async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        res.json({ message: 'Promo code deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { validatePromoCode, usePromoCode, createPromoCode, getPromoCodes, deletePromoCode };
