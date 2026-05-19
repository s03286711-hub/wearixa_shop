const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // Payment Gateways
  stripeEnabled: { type: Boolean, default: true },
  walletEnabled: { type: Boolean, default: true },
  codEnabled: { type: Boolean, default: true },
  jazzEnabled: { type: Boolean, default: true },
  easyEnabled: { type: Boolean, default: true },

  // Tax & Fees
  taxRate: { type: Number, default: 8 },
  shippingFlat: { type: Number, default: 12.99 },
  freeShipThreshold: { type: Number, default: 100 },
  walletCashback: { type: Number, default: 5 },

  // Platform Config
  maintenanceMode: { type: Boolean, default: false },
  emailNotify: { type: Boolean, default: true },
  orderAlerts: { type: Boolean, default: true },
  autoApprove: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
