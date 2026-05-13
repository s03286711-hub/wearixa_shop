const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        console.log(`NEW USER CREATED: ${user.email}`);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            city: user.city,
            postalCode: user.postalCode,
            country: user.country,
            phone: user.phone,
            cardLast4: user.cardLast4,
            cardBrand: user.cardBrand,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.address = req.body.address || user.address;
        user.city = req.body.city || user.city;
        user.postalCode = req.body.postalCode || user.postalCode;
        user.country = req.body.country || user.country;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            address: updatedUser.address,
            city: updatedUser.city,
            postalCode: updatedUser.postalCode,
            country: updatedUser.country,
            phone: updatedUser.phone,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ 
        email: { $regex: new RegExp(`^${req.body.email}$`, 'i') } 
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found with this email');
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;

    const message = `
        <div style="font-family: 'Playfair Display', serif; color: #1a1a2e; padding: 20px; border: 1px solid #c9a84c; border-radius: 10px;">
            <h1 style="color: #c9a84c; text-align: center;">WEARIXA</h1>
            <p style="font-size: 1.1rem;">Hello ${user.name},</p>
            <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
            <p>Please click on the button below to complete the process:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #c9a84c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; letter-spacing: 1px;">RESET PASSWORD</a>
            </div>
            <p style="font-size: 0.8rem; color: #888;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="text-align: center; font-size: 0.75rem; color: #aaa;">&copy; 2024 Wearixa Fashion House. All rights reserved.</p>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request - Wearixa',
            message,
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error('Email could not be sent');
    }
});

module.exports = { loginUser, registerUser, getUserProfile, updateUserProfile, getUsers, deleteUser, forgotPassword };
