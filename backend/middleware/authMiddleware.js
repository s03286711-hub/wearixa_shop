const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Warn loudly at startup if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET is not set in environment variables! Using insecure fallback.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret123_fallback_set_env_var';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            console.error('JWT verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
        return;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.error('Optional JWT verification error:', error.message);
        }
    }
    
    // Always proceed, even if no user
    next();
};

module.exports = { protect, admin, optionalAuth };
