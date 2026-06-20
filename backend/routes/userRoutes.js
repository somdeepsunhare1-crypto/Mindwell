const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// POST /api/user/upgrade - simulate upgrading to premium
// (In a real app this would be behind a payment gateway like Stripe/Razorpay.
// For this project, it's a demo toggle showing the freemium gating logic.)
router.post('/upgrade', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { isPremium: true }, { new: true });
    res.json({
      message: 'Upgraded to Premium! Advanced analytics unlocked.',
      user: { id: user._id, name: user.name, email: user.email, isPremium: user.isPremium },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error upgrading account' });
  }
});

// GET /api/user/me - get current user info
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

module.exports = router;
