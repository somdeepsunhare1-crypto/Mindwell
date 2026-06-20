const express = require('express');
const mongoose = require('mongoose');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/analytics/mood-over-time - for the line graph
// Free users get last 7 days; premium users get full history
router.get('/mood-over-time', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const isPremium = user?.isPremium;

    const query = { user: req.userId };

    if (!isPremium) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    }

    const entries = await JournalEntry.find(query).sort({ createdAt: 1 }).select('mood energy createdAt');

    const data = entries.map((e) => ({
      date: e.createdAt.toISOString().split('T')[0],
      mood: e.mood,
      energy: e.energy,
    }));

    res.json({ data, isPremium: !!isPremium });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching mood trend' });
  }
});

// GET /api/analytics/emotions - for the pie chart of "Most Common Emotions"
router.get('/emotions', async (req, res) => {
  try {
    const results = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const data = results.map((r) => ({ emotion: r._id || 'Neutral', count: r.count }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching emotion breakdown' });
  }
});

// GET /api/analytics/weekly-average - average mood/energy per week (premium feature)
router.get('/weekly-average', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.isPremium) {
      return res.status(403).json({ message: 'This is a premium feature. Upgrade to unlock advanced analytics.' });
    }

    const results = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: { week: { $week: '$createdAt' }, year: { $year: '$createdAt' } },
          avgMood: { $avg: '$mood' },
          avgEnergy: { $avg: '$energy' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error computing weekly averages' });
  }
});

// GET /api/analytics/summary - quick stats for dashboard header
router.get('/summary', async (req, res) => {
  try {
    const stats = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: null,
          avgMood: { $avg: '$mood' },
          avgEnergy: { $avg: '$energy' },
          totalEntries: { $sum: 1 },
        },
      },
    ]);

    res.json(stats[0] || { avgMood: 0, avgEnergy: 0, totalEntries: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching summary' });
  }
});

module.exports = router;
