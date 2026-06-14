const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

const VALID_EXPERIENCES = ['very_poor', 'poor', 'fair', 'good', 'excellent'];

// POST /api/feedback
// Stores a single piece of user feedback.
router.post('/', async (req, res) => {
  try {
    const {
      experience,
      areaOfFeedback,
      description,
      rating,
      location,
      networkProvider,
      resolved,
    } = req.body;

    if (!experience || !VALID_EXPERIENCES.includes(experience)) {
      return res.status(400).json({
        message: `experience is required and must be one of: ${VALID_EXPERIENCES.join(', ')}`,
      });
    }

    if (!areaOfFeedback) {
      return res.status(400).json({ message: 'areaOfFeedback is required' });
    }

    if (rating === undefined || rating === null || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating is required and must be between 1 and 5' });
    }

    const feedback = await Feedback.create({
      experience,
      areaOfFeedback,
      description,
      rating,
      location,
      networkProvider,
      resolved,
    });

    res.status(201).json({ message: 'Feedback saved', data: feedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Failed to save feedback' });
  }
});

// GET /api/feedback
// Returns recent feedback entries, most recent first. Optional ?resolved=true/false filter.
router.get('/', async (req, res) => {
  try {
    const { resolved, limit = 100 } = req.query;
    const filter = {};
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.json({ message: 'OK', data: feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// PATCH /api/feedback/:id
// Marks a feedback entry resolved/unresolved.
router.patch('/:id', async (req, res) => {
  try {
    const { resolved } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { resolved: !!resolved },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'OK', data: feedback });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Failed to update feedback' });
  }
});

module.exports = router;
