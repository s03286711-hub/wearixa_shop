const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  totalVisits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
