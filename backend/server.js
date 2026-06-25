const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB().then(() => {
    // Auto-seed settings on startup if database is empty
    const Setting = require('./models/Setting');
    Setting.countDocuments().then(count => {
        if (count === 0) {
            Setting.create({}).then(() => console.log('🌱 Default system settings successfully seeded!'));
        }
    }).catch(err => console.error('Error auto-seeding settings:', err));
});

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

const { stripeWebhook } = require('./controllers/paymentController');
app.post('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

const sendEmail = require('./utils/sendEmail');
app.get('/api/test-email', async (req, res) => {
    try {
        await sendEmail({
            email: 'wearixastore@gmail.com',
            subject: 'Railway Test Email',
            message: '<h1>This is a test from the Railway Server</h1><p>If you get this, emails work on Railway.</p>'
        });
        res.json({ success: true, message: 'Email sent successfully from Railway!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, stack: err.stack, oauth_refresh_token_exists: !!process.env.OAUTH_REFRESH_TOKEN });
    }
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const promoRoutes = require('./routes/promoRoutes');
const settingRoutes = require('./routes/settingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
