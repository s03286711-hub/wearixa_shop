const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Public route to track visit
router.post('/track', analyticsController.trackVisit);

// Admin route to get stats
router.get('/stats', analyticsController.getStats);

module.exports = router;
