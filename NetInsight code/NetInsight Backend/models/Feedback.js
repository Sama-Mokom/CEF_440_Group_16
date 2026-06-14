const mongoose = require('mongoose');

const feedbackLocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    experience: {
      type: String,
      enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
      required: true,
    },
    areaOfFeedback: { type: String, required: true },
    description: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, required: true },
    location: { type: feedbackLocationSchema, default: () => ({}) },
    networkProvider: { type: String, default: 'Anonymous' },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
