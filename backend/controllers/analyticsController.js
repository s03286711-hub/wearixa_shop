const Analytics = require('../models/Analytics');

// Track a visit
exports.trackVisit = async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = new Analytics({ totalVisits: 1 });
    } else {
      analytics.totalVisits += 1;
    }
    await analytics.save();
    res.status(200).json({ success: true, message: 'Visit tracked' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get analytics stats for admin panel
exports.getStats = async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = { totalVisits: 0 };
    }
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
