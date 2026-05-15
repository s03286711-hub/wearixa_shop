const mongoose = require('mongoose');

const promoCodeSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number,
        default: 0, // 0 means no cap
    },
    usageLimit: {
        type: Number,
        default: 0, // 0 means unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
module.exports = PromoCode;
