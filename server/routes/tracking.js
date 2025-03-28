const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');
const { updateAchievements } = require('../utils/achievements');

router.post('/track-time', auth, async (req, res) => {
  try {
    const { minutes } = req.body;
    const userId = req.user.userId;
    
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ error: 'Invalid time value' });
    }
    
    // Update user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }
    
    // Add coding time
    userProgress.totalCodingTime += minutes;
    await userProgress.save();
    
    // Check for coding time achievements
    await updateAchievements(userId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking time:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 