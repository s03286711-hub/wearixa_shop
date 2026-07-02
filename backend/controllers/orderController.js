const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const sendEmail = require('../utils/sendEmail');
const Setting = require('../models/Setting');
const Notification = require('../models/Notification');

if (!stripe) {
    console.warn('⚠️  WARNING: STRIPE_SECRET_KEY is missing in Order Controller.');
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const user = await User.findById(req.user._id);

        if (paymentMethod === 'wallet') {
            if (user.walletBalance < totalPrice) {
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }
            // Deduct balance
            user.walletBalance -= totalPrice;
            await user.save();

            // Record transaction
            await Transaction.create({
                user: user._id,
                amount: totalPrice,
                type: 'PURCHASE',
                paymentGateway: 'WALLET',
                status: 'COMPLETED',
                description: `Payment for Order`,
            });
        }

        const settings = await Setting.findOne();
        const autoApprove = settings ? settings.autoApprove : false;

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: (paymentMethod === 'wallet' || autoApprove),
            paidAt: (paymentMethod === 'wallet' || autoApprove) ? new Date() : undefined,
            expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Default 4 days
            status: autoApprove ? 'Delivered' : 'Processing',
            isDelivered: autoApprove ? true : false,
            deliveredAt: autoApprove ? new Date() : undefined,
            statusTimeline: [
                {
                    status: 'Processing',
                    message: 'Order placed successfully and is being processed.',
                    timestamp: new Date(),
                },
                ...(autoApprove ? [{
                    status: 'Delivered',
                    message: 'Order has been automatically approved and delivered.',
                    timestamp: new Date(),
                }] : [])
            ],
        });

        let sessionUrl = null;
        if (paymentMethod === 'stripe') {
            if (!stripe) {
                return res.status(500).json({ message: 'Stripe is not configured on the server.' });
            }
            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: orderItems.map(item => ({
                        price_data: {
                            currency: 'pkr',
                            product_data: {
                                name: item.name,
                                images: [item.image.startsWith('http') ? item.image : `${process.env.BACKEND_URL || 'http://localhost:5000'}${item.image}`],
                            },
                            unit_amount: Math.round(item.price * 100),
                        },
                        quantity: item.qty,
                    })),
                    mode: 'payment',
                    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders?status=COMPLETED&orderId=${order._id}`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?status=CANCELLED`,
                    metadata: {
                        orderId: order._id.toString(),
                        userId: req.user._id.toString()
                    }
                });
                sessionUrl = session.url;
            } catch (stripeError) {
                console.error("Stripe Order Session Error:", stripeError);
                return res.status(500).json({ message: 'Error creating Stripe checkout for order' });
            }
        }

        const createdOrder = await order.save();

        // ─── PERSISTENT NOTIFICATIONS ─────────────────────────────────
        try {
            // Customer notification
            await Notification.create({
                user: req.user._id,
                title: '🎉 Order Placed Successfully',
                message: `Your order #${createdOrder._id} for Rs. ${totalPrice.toFixed(2)} has been placed successfully and is now being processed.`,
                type: 'ORDER_PLACED'
            });

            // Admin notification
            await Notification.create({
                user: req.user._id,
                title: '🚨 New Order Placed',
                message: `Customer ${user.name} placed a new order #${createdOrder._id} totaling Rs. ${totalPrice.toFixed(2)} using ${paymentMethod.toUpperCase()}.`,
                type: 'ORDER_PLACED',
                isAdminNotification: true
            });

            if (autoApprove) {
                await Notification.create({
                    user: req.user._id,
                    title: '📦 Order Approved & Delivered',
                    message: `Your order #${createdOrder._id} has been automatically approved and marked as delivered.`,
                    type: 'ORDER_DELIVERED'
                });
            }

            if (paymentMethod === 'wallet') {
                // Wallet customer payment notification
                await Notification.create({
                    user: req.user._id,
                    title: '💳 Payment Done via Wallet',
                    message: `Payment of Rs. ${totalPrice.toFixed(2)} has been successfully debited from your Wearixa digital wallet.`,
                    type: 'PAYMENT_RECEIVED'
                });

                // Wallet admin payment notification
                await Notification.create({
                    user: req.user._id,
                    title: '💰 Wallet Payment Received',
                    message: `Successfully received payment of Rs. ${totalPrice.toFixed(2)} via Digital Wallet for order #${createdOrder._id}.`,
                    type: 'PAYMENT_RECEIVED',
                    isAdminNotification: true
                });
            }
        } catch (notifErr) {
            console.error('Failed to create order placement notifications:', notifErr.message);
        }

        // ─── NOTIFICATIONS & ALERTS ──────────────────────────────────
        // Send email to customer if enabled
        const emailNotify = settings ? settings.emailNotify : true;
        if (emailNotify) {
            try {
                const emailMessage = `
                    <div style="font-family: 'Playfair Display', serif; color: #1a1a2e; padding: 20px; border: 1px solid #c9a84c; border-radius: 10px;">
                        <h1 style="color: #c9a84c; text-align: center;">WEARIXA</h1>
                        <h2 style="text-align: center; color: #1a1a2e;">Order Confirmed!</h2>
                        <p>Dear ${user.name},</p>
                        <p>Thank you for shopping at Wearixa! Your order has been placed successfully and is now being processed.</p>
                        <p><b>Order ID:</b> ${createdOrder._id}</p>
                        <p><b>Total Amount:</b> Rs. ${totalPrice.toFixed(2)}</p>
                        <p>We will notify you once your package is on its way.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="text-align: center; font-size: 0.75rem; color: #aaa;">&copy; 2026 Wearixa Fashion House. All rights reserved.</p>
                    </div>
                `;
                sendEmail({
                    email: user.email,
                    subject: 'Order Confirmation - Wearixa',
                    message: emailMessage,
                }).catch(err => console.error('Async email error:', err.message));
                console.log('Order confirmation email sent asynchronously!');
            } catch (emailErr) {
                console.error('Failed to send order confirmation email:', emailErr.message);
            }
        }

        // Send alert to admin if enabled
        const orderAlerts = settings ? settings.orderAlerts : true;
        if (orderAlerts) {
            try {
                // Send specifically to official email
                const adminEmail = 'wearixastore@gmail.com';

                const adminEmailMessage = `
                    <div style="font-family: 'Playfair Display', serif; color: #1a1a2e; padding: 20px; border: 1px solid #c9a84c; border-radius: 10px;">
                        <h1 style="color: #c9a84c; text-align: center;">WEARIXA ADMIN ALERT</h1>
                        <h2 style="text-align: center; color: #ef4444;">🚨 New Order Placed!</h2>
                        <p>A new order has been placed on the storefront.</p>
                        <p><b>Order ID:</b> ${createdOrder._id}</p>
                        <p><b>Customer:</b> ${user.name} (${user.email})</p>
                        <p><b>Total Amount:</b> Rs. ${totalPrice.toFixed(2)}</p>
                        <p><b>Payment Method:</b> ${paymentMethod.toUpperCase()}</p>
                        <p>Please log in to the admin panel to review and manage this order.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="text-align: center; font-size: 0.75rem; color: #aaa;">&copy; 2026 Wearixa Admin Notification System. All rights reserved.</p>
                    </div>
                `;
                sendEmail({
                    email: adminEmail,
                    subject: '🚨 WEARIXA ALERT: New Order Placed',
                    message: adminEmailMessage,
                }).catch(err => console.error('Async admin email error:', err.message));
                console.log('Admin order alert email sent asynchronously!');
            } catch (adminAlertErr) {
                console.error('Failed to send admin order alert email:', adminAlertErr.message);
            }
        }

        if (paymentMethod === 'stripe') {
            return res.status(201).json({
                ...createdOrder.toObject(),
                checkoutUrl: sessionUrl
            });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error processing order' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer?.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';
        
        order.statusTimeline.push({
            status: 'Delivered',
            message: 'Order has been delivered.',
            timestamp: new Date(),
        });

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const oldStatus = order.status;
        order.status = req.body.status || order.status;
        order.expectedDelivery = req.body.expectedDelivery || order.expectedDelivery;

        if (oldStatus !== order.status) {
            let message = '';
            switch (order.status) {
                case 'Packing': message = 'Your order is being packed and prepared for shipment.'; break;
                case 'Shipped': message = 'Your order has been shipped and is on its way.'; break;
                case 'Delivered': message = 'Your order has been delivered.'; break;
                case 'Cancelled': message = 'Your order has been cancelled.'; break;
                default: message = `Order status updated to ${order.status}`;
            }
            
            order.statusTimeline.push({
                status: order.status,
                message: message,
                timestamp: new Date(),
            });
        }

        if (order.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
};

module.exports = { addOrderItems, getOrderById, updateOrderToPaid, updateOrderToDelivered, updateOrderStatus, getMyOrders, getOrders };
