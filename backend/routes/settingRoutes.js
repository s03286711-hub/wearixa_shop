const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get active system settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            // If no settings document exists, create and return default
            settings = await Setting.create({});
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error.message);
        res.status(500).json({ message: 'Server Error fetching settings' });
    }
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
    try {
        const settings = await Setting.findOneAndUpdate(
            {},
            req.body,
            { new: true, upsert: true, runValidators: true }
        );
        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error.message);
        res.status(500).json({ message: 'Server Error updating settings' });
    }
});

module.exports = router;
