const Transaction = require('../models/Transaction');
const User = require('../models/User');

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

        // We return the simulated payment URL. For mock, we'll just redirect to the verification endpoint after a delay.
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
        }

        // Redirect back to the frontend wallet page
        res.redirect('http://localhost:3000/profile/wallet?status=' + status);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error verifying payment');
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
    getTransactions
};
