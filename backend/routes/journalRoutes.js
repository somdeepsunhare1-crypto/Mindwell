const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/authMiddleware');
const { getPromptOfTheDay, getRandomPrompt } = require('../utils/prompts');

const router = express.Router();

// All journal routes require authentication
router.use(protect);

// GET /api/journal/prompt - get today's guided prompt
router.get('/prompt', (req, res) => {
  res.json({ prompt: getPromptOfTheDay() });
});

// GET /api/journal/prompt/random - get a random prompt (e.g. "Surprise me" button)
router.get('/prompt/random', (req, res) => {
  res.json({ prompt: getRandomPrompt() });
});

// POST /api/journal - create a new journal entry
router.post('/', async (req, res) => {
  try {
    const { content, mood, energy, emotion, prompt } = req.body;

    if (!content || !mood) {
      return res.status(400).json({ message: 'Content and mood are required' });
    }

    const entry = await JournalEntry.create({
      user: req.userId,
      content,
      mood,
      energy,
      emotion,
      prompt,
    });

    // .toJSON() applies the getter, so content comes back decrypted to the user
    res.status(201).json(entry.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating entry' });
  }
});

// GET /api/journal - get all entries for the logged-in user (decrypted)
router.get('/', async (req, res) => {
  try {
    const { search, limit } = req.query;

    let entries = await JournalEntry.find({ user: req.userId }).sort({ createdAt: -1 });

    // Convert to JSON (applies decrypt getter)
    entries = entries.map((e) => e.toJSON());

    // Simple search on decrypted content (done in app memory, not in DB query,
    // since the DB itself only ever stores ciphertext)
    if (search) {
      const term = search.toLowerCase();
      entries = entries.filter((e) => e.content.toLowerCase().includes(term));
    }

    if (limit) {
      entries = entries.slice(0, parseInt(limit, 10));
    }

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching entries' });
  }
});

// GET /api/journal/:id - get one entry (decrypted)
router.get('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry.toJSON());
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching entry' });
  }
});

// PUT /api/journal/:id - update an entry
router.put('/:id', async (req, res) => {
  try {
    const { content, mood, energy, emotion } = req.body;
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (content !== undefined) entry.content = content; // setter re-encrypts automatically
    if (mood !== undefined) entry.mood = mood;
    if (energy !== undefined) entry.energy = energy;
    if (emotion !== undefined) entry.emotion = emotion;

    await entry.save();
    res.json(entry.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating entry' });
  }
});

// DELETE /api/journal/:id
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting entry' });
  }
});

// GET /api/journal/export/json - GDPR-style full data export
router.get('/export/json', async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.userId }).sort({ createdAt: 1 });
    const decrypted = entries.map((e) => e.toJSON());

    res.setHeader('Content-Disposition', 'attachment; filename="mindwell-export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json({
      exportedAt: new Date().toISOString(),
      totalEntries: decrypted.length,
      entries: decrypted,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error exporting data' });
  }
});

module.exports = router;
