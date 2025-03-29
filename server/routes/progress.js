const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');

// Get user's progress including achievements
router.get('/users/:userId/progress', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('User from token:', req.user._id);
    console.log('User ID from params:', userId);
    
    // Fix: If userId is missing from params, use the authenticated user's ID
    const userIdToUse = userId || req.userId;
    
    console.log('Using user ID:', userIdToUse);
    
    // Convert both IDs to strings for comparison (safely)
    const tokenUserId = req.user._id.toString();
    const paramUserId = userIdToUse.toString(); // Now this won't fail if userId was undefined
    
    console.log('Comparing IDs:', tokenUserId, paramUserId);
    
    // Only check for matching IDs if a specific userId was provided in the URL
    if (userId && tokenUserId !== paramUserId) {
      console.log('ID mismatch, unauthorized access attempt');
      return res.status(403).json({ error: 'Not authorized to access this user\'s data' });
    }
    
    // Get user data - use the authenticated user's ID if none provided
    const user = await User.findById(userIdToUse);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Found user data:', {
      id: user._id,
      level: user.level,
      xp: user.xp,
      streak: user.streak
    });
    
    // Get user progress
    let userProgress = await UserProgress.findOne({ userId: userIdToUse })
      .populate('completedLessons.lessonId')
      .populate('completedChallenges.challengeId')
      .populate('achievements.achievementId');
    
    // If no progress record exists yet, create one
    if (!userProgress) {
      userProgress = new UserProgress({ userId: userIdToUse });
      await userProgress.save();
    }
    
    // Get all achievements
    const allAchievements = await Achievement.find();
    
    // Calculate next level XP requirement using the user's method or levelUtils
    const nextLevelXp = user.getXpForNextLevel ? user.getXpForNextLevel() : 500 + (user.level * 500);
    
    // Add more detailed logging
    console.log('User progress response:', {
      userId: user._id,
      level: user.level,
      xp: user.xp,
      nextLevelXp,
      streak: user.streak
    });
    
    // Calculate average quiz score
    let avgQuizScore = 0;
    if (userProgress.quizScores && userProgress.quizScores.length > 0) {
      const totalScore = userProgress.quizScores.reduce((sum, quiz) => {
        return sum + (quiz.score / quiz.maxScore) * 100;
      }, 0);
      avgQuizScore = Math.round(totalScore / userProgress.quizScores.length);
    }
    
    // Format achievements for frontend
    const formattedAchievements = allAchievements.map(achievement => {
      // Log each achievement's XP reward for debugging
      console.log(`Achievement ${achievement.title} XP reward:`, achievement.xpReward);
      
      const userAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      const progress = userAchievement ? userAchievement.progress : 0;
      const earned = userAchievement ? userAchievement.earned : false;
      const earnedAt = userAchievement && userAchievement.earned ? userAchievement.earnedAt : null;
      
      return {
        _id: achievement._id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        color: achievement.color,
        category: achievement.category,
        targetValue: achievement.targetValue,
        xpReward: achievement.xpReward,
        progress: progress,
        earned: earned,
        earnedAt: earnedAt
      };
    });
    
    // After mapping, check a sample for debugging
    if (formattedAchievements.length > 0) {
      console.log('Sample formatted achievement:', {
        title: formattedAchievements[0].title,
        xpReward: formattedAchievements[0].xpReward
      });
    }
    
    // Prepare response
    const response = {
      userId: user._id,
      level: user.level,
      xp: user.xp,
      nextLevelXp,
      streak: user.streak,
      completedLessons: userProgress.completedLessons,
      completedChallenges: userProgress.completedChallenges,
      totalCodingTime: userProgress.totalCodingTime,
      quizScores: userProgress.quizScores,
      avgQuizScore,
      achievements: formattedAchievements
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 