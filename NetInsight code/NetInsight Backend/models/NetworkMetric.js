const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
  },
  { _id: false }
);

const networkMetricSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    connectionType: { type: String, default: 'unknown' },
    isConnected: { type: Boolean, default: false },
    isInternetReachable: { type: Boolean, default: false },
    signalStrength: { type: Number, default: -100 },
    downloadSpeed: { type: Number, default: 0 },
    downloadStatus: { type: String, default: 'unknown' },
    uploadSpeed: { type: Number, default: 0 },
    uploadStatus: { type: String, default: 'unknown' },
    latency: { type: Number, default: 0 },
    latencyStatus: { type: String, default: 'unknown' },
    location: { type: locationSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Speeds up the /stats aggregation (filters by timestamp, optionally by deviceId)
networkMetricSchema.index({ timestamp: -1 });
networkMetricSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('NetworkMetric', networkMetricSchema);
