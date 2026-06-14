const express = require('express');
const router = express.Router();
const NetworkMetric = require('../models/NetworkMetric');

// POST /api/network-metrics
// Stores a single network measurement sample from a device.
router.post('/', async (req, res) => {
  try {
    const {
      deviceId,
      timestamp,
      connectionType,
      isConnected,
      isInternetReachable,
      signalStrength,
      downloadSpeed,
      downloadStatus,
      uploadSpeed,
      uploadStatus,
      latency,
      latencyStatus,
      location,
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }

    const metric = await NetworkMetric.create({
      deviceId,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      connectionType,
      isConnected,
      isInternetReachable,
      signalStrength,
      downloadSpeed,
      downloadStatus,
      uploadSpeed,
      uploadStatus,
      latency,
      latencyStatus,
      location,
    });

    res.status(201).json({ message: 'Network metric saved', data: metric });
  } catch (error) {
    console.error('Error saving network metric:', error);
    res.status(500).json({ message: 'Failed to save network metric' });
  }
});

// GET /api/network-metrics/stats
// Returns today's average download speed, upload speed, and latency
// across all devices. Optionally filter by deviceId via ?deviceId=...
router.get('/stats', async (req, res) => {
  try {
    const { deviceId } = req.query;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const match = { timestamp: { $gte: startOfDay } };
    if (deviceId) match.deviceId = deviceId;

    const result = await NetworkMetric.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgDownloadSpeed: { $avg: '$downloadSpeed' },
          avgUploadSpeed: { $avg: '$uploadSpeed' },
          avgLatency: { $avg: '$latency' },
          sampleCount: { $sum: 1 },
        },
      },
    ]);

    const stats = result[0] || {
      avgDownloadSpeed: 0,
      avgUploadSpeed: 0,
      avgLatency: 0,
      sampleCount: 0,
    };

    res.json({
      message: 'OK',
      data: {
        avgDownloadSpeed: Number((stats.avgDownloadSpeed || 0).toFixed(2)),
        avgUploadSpeed: Number((stats.avgUploadSpeed || 0).toFixed(2)),
        avgLatency: Number((stats.avgLatency || 0).toFixed(2)),
        sampleCount: stats.sampleCount,
      },
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({ message: 'Failed to fetch network stats' });
  }
});

// GET /api/network-metrics
// Returns recent raw samples (optionally filtered by deviceId), most recent first.
router.get('/', async (req, res) => {
  try {
    const { deviceId, limit = 100 } = req.query;
    const filter = deviceId ? { deviceId } : {};

    const metrics = await NetworkMetric.find(filter)
      .sort({ timestamp: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.json({ message: 'OK', data: metrics });
  } catch (error) {
    console.error('Error fetching network metrics:', error);
    res.status(500).json({ message: 'Failed to fetch network metrics' });
  }
});

module.exports = router;
