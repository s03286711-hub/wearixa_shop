const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Optional auth)
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice, guestEmail } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const isGuest = !req.user;
        let user = null;

        if (!isGuest) {
            user = await User.findById(req.user._id);
        } else if (!guestEmail) {
            return res.status(400).json({ message: 'Guest email is required' });
        }

        if (paymentMethod === 'wallet') {
            if (isGuest) {
                return res.status(400).json({ message: 'Wallet payment is not available for guests' });
            }
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

        const order = new Order({
            orderItems,
            user: isGuest ? undefined : req.user._id,
            guestEmail: isGuest ? guestEmail : undefined,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: paymentMethod === 'wallet',
            paidAt: paymentMethod === 'wallet' ? new Date() : undefined,
            expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Default 4 days
            statusTimeline: [
                {
                    status: 'Processing',
                    message: 'Order placed successfully and is being processed.',
                    timestamp: new Date(),
                }
            ],
        });

        const createdOrder = await order.save();
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

// @desc    Track order as a guest
// @route   POST /api/orders/track
// @access  Public
const trackGuestOrder = async (req, res) => {
    const { orderId, email } = req.body;
    
    if (!orderId || !email) {
        return res.status(400).json({ message: 'Order ID and email are required' });
    }

    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Allow if it's a guest order with matching email OR if it's an authenticated user's order and their email matches
        if (order.guestEmail === email) {
            return res.json(order);
        } else if (order.user) {
            const user = await User.findById(order.user);
            if (user && user.email === email) {
                return res.json(order);
            }
        }
        
        res.status(404).json({ message: 'Order not found or email does not match' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addOrderItems, getOrderById, updateOrderToPaid, updateOrderToDelivered, updateOrderStatus, getMyOrders, getOrders, trackGuestOrder };
