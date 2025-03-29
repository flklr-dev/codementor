const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new user with initial streak of 1
    const user = new User({ 
      name, 
      email, 
      password,
      streak: 1,
      level: 1,
      xp: 0,
      lastLogin: new Date()
    });
    await user.save();
    
    // Create initial user progress record
    const userProgress = new UserProgress({
      userId: user._id,
      completedLessons: [],
      completedChallenges: [],
      currentLesson: null,
      achievements: [],
      totalCodingTime: 0
    });
    await userProgress.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login and streak
    const now = new Date();
    const lastLogin = user.lastLogin;
    
    if (!lastLogin) {
      // First time login (shouldn't happen normally as it's set during registration)
      user.streak = 1;
    } else {
      const hoursSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60));
      
      // If last login was between 20-28 hours ago (allowing some flexibility around the 24-hour mark)
      if (hoursSinceLastLogin >= 20 && hoursSinceLastLogin <= 28) {
        // Increment streak if user logged in roughly 24 hours later
        user.streak += 1;
        
        // Check for streak achievements and award XP if needed
        await checkAndUpdateAchievements(user._id);
      } else if (hoursSinceLastLogin > 28) {
        // Reset streak if user missed the 24-hour window
        user.streak = 1;
      }
      // Keep current streak if logging in multiple times within the same day
    }
    
    user.lastLogin = now;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to check and update streak achievements
async function checkAndUpdateAchievements(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Get user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
      await userProgress.save();
    }
    
    // Get streak achievements
    const streakAchievements = await Achievement.find({ requirement: 'streak' });
    
    // Check each achievement
    for (const achievement of streakAchievements) {
      // Check if user already has this achievement
      const existingAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      // If already earned, skip
      if (existingAchievement && existingAchievement.earned) continue;
      
      // Check if streak meets or exceeds target
      if (user.streak >= achievement.targetValue) {
        // If existing achievement entry, update it
        if (existingAchievement) {
          existingAchievement.progress = user.streak;
          existingAchievement.earned = true;
          existingAchievement.earnedAt = new Date();
        } else {
          // Add new achievement
          userProgress.achievements.push({
            achievementId: achievement._id,
            progress: user.streak,
            earned: true,
            earnedAt: new Date()
          });
        }
        
        // Award XP
        user.xp += achievement.xpReward;
        
        // Check if user should level up
        const levelsGained = user.checkAndLevelUp();
        await user.save();
      }
    }
    
    // Save progress changes
    await userProgress.save();
    
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    // Get fresh user data from database (don't use cached req.user)
    const freshUser = await User.findById(req.userId);
    if (!freshUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Fresh user data:', {
      id: freshUser._id,
      xp: freshUser.xp,
      level: freshUser.level,
      streak: freshUser.streak
    });
    
    res.json({
      id: freshUser._id,
      name: freshUser.name,
      email: freshUser.email,
      level: freshUser.level,
      xp: freshUser.xp,
      streak: freshUser.streak
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
    }
    
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      streak: user.streak
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check and update streak on app open
router.post('/check-streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date();
    const lastLogin = user.lastLogin;
    let streakUpdated = false;
    let newStreak = user.streak;
    
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
      const todayDate = new Date().setHours(0, 0, 0, 0);
      
      // If last login was yesterday or earlier, and not today
      if (lastLoginDate < todayDate) {
        // If last login was yesterday
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (todayDate - lastLoginDate <= oneDayMs) {
          // Increment streak
          user.streak += 1;
          newStreak = user.streak;
          streakUpdated = true;
        } else {
          // Streak broken - more than one day gap
          user.streak = 1;
          newStreak = 1;
          streakUpdated = true;
        }
      }
    }
    
    // Always update last login time
    user.lastLogin = now;
    await user.save();
    
    res.json({
      streakUpdated,
      streak: newStreak
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 