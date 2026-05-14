const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['DEPOSIT', 'PURCHASE', 'REFUND'],
        },
        paymentGateway: {
            type: String,
            required: true,
            enum: ['STRIPE', 'JAZZCASH', 'EASYPAISA', 'WALLET'],
        },
        status: {
            type: String,
            required: true,
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            default: 'PENDING',
        },
        referenceId: {
            type: String, // ID from Stripe/JazzCash/EasyPaisa
            required: false,
        },
        description: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
