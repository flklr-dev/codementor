const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');
const { syncQuizData, updateAchievements } = require('../utils/achievements');

// Get user's progress including achievements
router.get('/users/:userId/progress', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdToUse = userId || req.userId;
    const forceRefresh = req.query.force === 'true';
    
    console.log(`Fetching progress for user: ${userIdToUse}, force refresh: ${forceRefresh}`);
    
    // Get user data
    const user = await User.findById(userIdToUse);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Always update achievements to ensure progress is current
    await updateAchievements(userIdToUse);
    
    // Get fresh user progress with updated achievements
    let userProgress = await UserProgress.findOne({ userId: userIdToUse })
      .populate('completedLessons.lessonId')
      .populate('achievements.achievementId');
    
    // If no progress record exists yet, create one
    if (!userProgress) {
      userProgress = new UserProgress({ userId: userIdToUse });
      await userProgress.save();
    }
    
    // Get all achievements
    const allAchievements = await Achievement.find();
    
    // Calculate next level XP requirement
    const nextLevelXp = user.getXpForNextLevel ? user.getXpForNextLevel() : 500 + (user.level * 500);
    
    // Calculate quiz statistics
    const quizScores = userProgress.quizScores || [];
    const completedQuizzes = quizScores.length;
    const avgQuizScore = completedQuizzes > 0 
      ? Math.round(quizScores.reduce((sum, quiz) => sum + quiz.score, 0) / completedQuizzes)
      : 0;
    
    console.log('Quiz statistics:', {
      completedQuizzes,
      avgQuizScore,
      quizScores: quizScores.map(q => ({
        score: q.score,
        maxScore: q.maxScore,
        completedAt: q.completedAt
      }))
    });
    
    // Format achievements for frontend
    const formattedAchievements = allAchievements.map(achievement => {
      const userAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      // Calculate progress based on requirement type
      let progress = 0;
      switch(achievement.requirement) {
        case 'completedLessons':
          progress = userProgress.completedLessons.length;
          break;
        case 'streak':
          progress = user.streak;
          break;
        case 'completedQuizzes':
          progress = completedQuizzes;
          break;
        case 'perfectQuizzes':
          progress = quizScores.filter(q => q.score === 100).length;
          break;
        case 'quizAverage':
          progress = avgQuizScore;
          break;
        default:
          progress = userAchievement ? userAchievement.progress : 0;
      }
      
      const earned = progress >= achievement.targetValue;
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
        earnedAt: earnedAt,
        requirement: achievement.requirement
      };
    });
    
    // Count earned achievements
    const earnedCount = formattedAchievements.filter(a => a.earned).length;
    console.log(`User has earned ${earnedCount}/${formattedAchievements.length} achievements`);
    
    // Check if any achievements should be fixed in the database
    const needsFix = formattedAchievements.some(a => {
      const userAchievement = userProgress.achievements.find(
        ua => ua.achievementId && ua.achievementId.toString() === a._id.toString()
      );
      return a.earned && userAchievement && !userAchievement.earned;
    });

    if (needsFix) {
      console.log('Some achievements need fixing in the database, scheduling update');
      // Schedule fix without waiting for it (async)
      setTimeout(async () => {
        try {
          await updateAchievements(userIdToUse);
          console.log('Fixed achievements after response was sent');
        } catch (err) {
          console.error('Error fixing achievements:', err);
        }
      }, 0);
    }
    
    // Prepare response
    const response = {
      userId: user._id,
      level: user.level,
      xp: user.xp,
      nextLevelXp,
      streak: user.streak,
      completedLessons: userProgress.completedLessons,
      quizScores: userProgress.quizScores,
      completedQuizzes,
      avgQuizScore,
      achievements: formattedAchievements,
      earnedAchievementsCount: earnedCount
    };
    
    console.log('Sending progress response with quiz data:', {
      completedQuizzes,
      avgQuizScore,
      earnedAchievements: earnedCount
    });
    res.json(response);
  } catch (error) {
    console.error('Error in progress route:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Add route to get progress for a specific user
router.get('/users/:userId/progress', auth, async (req, res) => {
  try {
    const userIdToUse = req.params.userId;
    console.log(`Fetching progress for user: ${userIdToUse}`);
    
    // Find user progress
    let userProgress = await UserProgress.findOne({ userId: userIdToUse });
    if (!userProgress) {
      userProgress = new UserProgress({ userId: userIdToUse });
      await userProgress.save();
      console.log('Created new user progress');
    }
    
    // Get user data for level info
    const userData = await User.findById(userIdToUse);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find all achievements
    const achievements = await Achievement.find({});
    
    // Format achievements with progress
    const formattedAchievements = achievements.map(achievement => {
      const userAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      const progress = userAchievement ? userAchievement.progress : 0;
      const earned = userAchievement ? userAchievement.earned : false;
      const earnedAt = userAchievement ? userAchievement.earnedAt : null;
      
      return {
        _id: achievement._id,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        color: achievement.color,
        targetValue: achievement.requirement,
        progress: progress,
        xpReward: achievement.xpReward,
        earned: earned,
        earnedAt: earnedAt
      };
    });
    
    // Calculate quiz stats
    const quizScores = userProgress.quizScores || [];
    const completedQuizzes = quizScores.length;
    const avgQuizScore = completedQuizzes > 0 
      ? quizScores.reduce((sum, quiz) => sum + quiz.score, 0) / completedQuizzes 
      : 0;
    
    // Count earned achievements
    const earnedCount = formattedAchievements.filter(a => a.earned).length;
    console.log(`User has earned ${earnedCount}/${formattedAchievements.length} achievements`);
    
    // Check if any achievements should be fixed in the database
    const needsFix = formattedAchievements.some(a => {
      const userAchievement = userProgress.achievements.find(
        ua => ua.achievementId && ua.achievementId.toString() === a._id.toString()
      );
      return a.earned && userAchievement && !userAchievement.earned;
    });
    
    if (needsFix) {
      console.log('Some achievements need fixing in the database, scheduling update');
      // Schedule fix without waiting for it (async)
      setTimeout(async () => {
        try {
          await updateAchievements(userIdToUse);
          console.log('Fixed achievements after response was sent');
        } catch (err) {
          console.error('Error fixing achievements:', err);
        }
      }, 0);
    }
    
    // Prepare response
    const response = {
      level: userData.level,
      xp: userData.xp,
      nextLevelXp: userData.getXpForNextLevel(),
      streak: userData.streak,
      completedLessons: userProgress.completedLessons || [],
      quizScores: quizScores,
      completedQuizzes: completedQuizzes,
      avgQuizScore: avgQuizScore,
      achievements: formattedAchievements
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: 'Failed to get user progress' });
  }
});

module.exports = router; 