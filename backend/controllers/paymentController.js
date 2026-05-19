const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Notification = require('../models/Notification');

if (!stripe) {
    console.warn('⚠️  WARNING: STRIPE_SECRET_KEY is missing. Stripe payments will not work.');
}

// @desc    Initiate a deposit to wallet
// @route   POST /api/payments/deposit
// @access  Private
const depositFunds = async (req, res) => {
    try {
        const { amount, method, paymentDetails } = req.body; // method: 'STRIPE', 'JAZZCASH', 'EASYPAISA'

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Mock payment gateway generation
        const referenceId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // Construct simulation of JazzCash payload if method is JazzCash
        let gatewayPayload = {};
        if (method === 'JAZZCASH') {
            gatewayPayload = {
                pp_Version: "1.1",
                pp_TxnType: "MPAY",
                pp_TxnRefNo: referenceId,
                pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID || "Test_ID",
                pp_Amount: (amount * 100).toString(), // Usually in cents/paise
                pp_TxnCurrency: "PKR",
                pp_Description: "Wallet Deposit",
                pp_CustomerCardNumber: paymentDetails?.number || "",
                pp_CustomerCardExpiry: paymentDetails?.expiry?.replace('/', '') || "",
                pp_CustomerCardCvv: paymentDetails?.cvv || "",
            };
            console.log("JazzCash Payload Constructed:", gatewayPayload);
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            amount,
            type: 'DEPOSIT',
            paymentGateway: method,
            status: 'PENDING',
            referenceId,
            description: `Deposit via ${method}`,
        });

        // REAL STRIPE INTEGRATION
        if (method === 'STRIPE') {
            if (!stripe) {
                return res.status(500).json({ message: 'Stripe is not configured on the server.' });
            }
            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [{
                        price_data: {
                            currency: 'usd', // Adjust currency as needed
                            product_data: {
                                name: 'Wallet Deposit',
                                description: `Ref: ${referenceId}`,
                            },
                            unit_amount: Math.round(amount * 100), // Stripe expects cents
                        },
                        quantity: 1,
                    }],
                    mode: 'payment',
                    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/wallet?status=COMPLETED&ref=${referenceId}`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/wallet?status=CANCELLED`,
                    metadata: {
                        referenceId: referenceId,
                        userId: req.user._id.toString()
                    }
                });

                return res.status(200).json({ 
                    success: true, 
                    referenceId, 
                    checkoutUrl: session.url 
                });
            } catch (stripeError) {
                console.error("Stripe Session Error:", stripeError);
                return res.status(500).json({ message: 'Error creating Stripe session' });
            }
        }

        // We return the simulated payment URL for other methods (Mock).
        const mockCheckoutUrl = `/api/payments/mock-checkout?ref=${referenceId}&method=${method}&amount=${amount}`;

        res.status(200).json({ 
            success: true, 
            referenceId, 
            checkoutUrl: mockCheckoutUrl 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error initiating deposit' });
    }
};

// @desc    Mock checkout page (Simulates Stripe/JazzCash UI)
// @route   GET /api/payments/mock-checkout
// @access  Public
const mockCheckout = async (req, res) => {
    const { ref, method, amount } = req.query;
    
    // Simulate a simple HTML page that automatically posts back to verify
    res.send(`
        <html>
            <head><title>Mock ${method} Checkout</title></head>
            <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f4f4f4;">
                <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
                    <h2>${method} Sandbox Sandbox</h2>
                    <p>Amount: $${amount}</p>
                    <p>Ref: ${ref}</p>
                    <form action="/api/payments/verify" method="POST">
                        <input type="hidden" name="referenceId" value="${ref}" />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button type="submit" style="background: #22c55e; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                            Simulate Successful Payment
                        </button>
                    </form>
                    <form action="/api/payments/verify" method="POST" style="margin-top: 10px;">
                        <input type="hidden" name="referenceId" value="${ref}" />
                        <input type="hidden" name="status" value="FAILED" />
                        <button type="submit" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px;">
                            Simulate Failed Payment
                        </button>
                    </form>
                </div>
            </body>
        </html>
    `);
};

// @desc    Verify payment and update wallet (Webhook / Callback handler)
// @route   POST /api/payments/verify
// @access  Public (in real life, verified via signatures)
const verifyPayment = async (req, res) => {
    try {
        const { referenceId, status } = req.body;

        const transaction = await Transaction.findOne({ referenceId });

        if (!transaction) {
            return res.status(404).send('Transaction not found');
        }

        if (transaction.status !== 'PENDING') {
            return res.status(400).send('Transaction already processed');
        }

        transaction.status = status === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
        await transaction.save();

        if (status === 'COMPLETED' && transaction.type === 'DEPOSIT') {
            const user = await User.findById(transaction.user);
            user.walletBalance += transaction.amount;
            await user.save();

            try {
                // Customer Notification
                await Notification.create({
                    user: transaction.user,
                    title: '🔋 Wallet Top-Up Completed',
                    message: `Successfully deposited $${transaction.amount.toFixed(2)} into your digital wallet via ${transaction.paymentGateway || 'Mock Gateway'}.`,
                    type: 'WALLET_DEPOSIT'
                });
                // Admin Notification
                await Notification.create({
                    user: transaction.user,
                    title: '💵 Wallet Deposit Received',
                    message: `User completed deposit of $${transaction.amount.toFixed(2)} via ${transaction.paymentGateway || 'Mock Gateway'}.`,
                    type: 'WALLET_DEPOSIT',
                    isAdminNotification: true
                });
            } catch (err) {
                console.error('Failed to create mock wallet deposit notifications:', err.message);
            }
        }

        // Redirect back to the frontend wallet page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/profile/wallet?status=${status}`);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error verifying payment');
    }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/payments/stripe-webhook
// @access  Public
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const referenceId = session.metadata.referenceId;
        const orderId = session.metadata.orderId;

        if (referenceId) {
            // Wallet Deposit logic
            const transaction = await Transaction.findOne({ referenceId });
            if (transaction && transaction.status === 'PENDING') {
                transaction.status = 'COMPLETED';
                await transaction.save();

                const user = await User.findById(transaction.user);
                user.walletBalance += transaction.amount;
                await user.save();
                console.log(`Wallet Deposit successful for Ref: ${referenceId}`);

                try {
                    // Customer Notification
                    await Notification.create({
                        user: transaction.user,
                        title: '🔋 Wallet Top-Up Completed',
                        message: `Successfully deposited $${transaction.amount.toFixed(2)} into your digital wallet via Stripe.`,
                        type: 'WALLET_DEPOSIT'
                    });
                    // Admin Notification
                    await Notification.create({
                        user: transaction.user,
                        title: '💵 Wallet Deposit Received',
                        message: `User completed deposit of $${transaction.amount.toFixed(2)} via Stripe.`,
                        type: 'WALLET_DEPOSIT',
                        isAdminNotification: true
                    });
                } catch (err) {
                    console.error('Failed to create stripe wallet deposit notifications:', err.message);
                }
            }
        } else if (orderId) {
            // Direct Order Payment logic
            const order = await Order.findById(orderId);
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = new Date();
                order.paymentResult = {
                    id: session.id,
                    status: 'COMPLETED',
                    email_address: session.customer_details?.email
                };
                await order.save();
                console.log(`Order Payment successful for Order ID: ${orderId}`);

                try {
                    // Customer Notification
                    await Notification.create({
                        user: order.user,
                        title: '💳 Stripe Payment Confirmed',
                        message: `Your payment of $${order.totalPrice.toFixed(2)} for order #${order._id} was successfully verified via Stripe.`,
                        type: 'PAYMENT_RECEIVED'
                    });
                    // Admin Notification
                    await Notification.create({
                        user: order.user,
                        title: '💰 Stripe Payment Received',
                        message: `Stripe payment of $${order.totalPrice.toFixed(2)} processed successfully for order #${order._id}.`,
                        type: 'PAYMENT_RECEIVED',
                        isAdminNotification: true
                    });
                } catch (err) {
                    console.error('Failed to create stripe order payment notifications:', err.message);
                }
            }
        }
    }

    res.json({ received: true });
};

// @desc    Process wallet cashback (reward on wallet payments)
// @route   POST /api/payments/cashback
// @access  Private
const processCashback = async (req, res) => {
    try {
        const { orderTotal } = req.body;
        const Setting = require('../models/Setting');
        let settings = await Setting.findOne();
        const cashbackPercent = settings ? settings.walletCashback : 5;
        const CASHBACK_RATE = cashbackPercent / 100;
        const cashbackAmount = Math.round(orderTotal * CASHBACK_RATE * 100) / 100;

        if (cashbackAmount <= 0) {
            return res.json({ cashback: 0 });
        }

        const referenceId = `CB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        await Transaction.create({
            user: req.user._id,
            amount: cashbackAmount,
            type: 'DEPOSIT',
            paymentGateway: 'CASHBACK',
            status: 'COMPLETED',
            referenceId,
            description: `${cashbackPercent}% cashback on wallet order ($${orderTotal.toFixed(2)})`,
        });

        const user = await User.findById(req.user._id);
        user.walletBalance += cashbackAmount;
        await user.save();

        res.json({ cashback: cashbackAmount, newBalance: user.walletBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error processing cashback' });
    }
};

// @desc    Get user's transactions
// @route   GET /api/payments/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        const user = await User.findById(req.user._id);

        res.json({
            balance: user.walletBalance,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching transactions' });
    }
};

module.exports = {
    depositFunds,
    mockCheckout,
    verifyPayment,
    stripeWebhook,
    processCashback,
    getTransactions
};
