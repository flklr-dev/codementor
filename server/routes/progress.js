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
    
    console.log('User from token:', req.user);
    console.log('User ID from params:', userId);
    
    // Fix the ID comparison - your auth middleware might use a different property name
    if (req.user._id !== userId && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this user\'s data' });
    }
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user progress
    let userProgress = await UserProgress.findOne({ userId })
      .populate('completedLessons.lessonId')
      .populate('completedChallenges.challengeId')
      .populate('achievements.achievementId');
    
    // If no progress record exists yet, create one
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
      await userProgress.save();
    }
    
    // Get all achievements
    const allAchievements = await Achievement.find();
    
    // Calculate next level XP requirement
    const nextLevelXp = user.getXpForNextLevel();
    
    // Calculate average quiz score
    let avgQuizScore = 0;
    if (userProgress.quizScores && userProgress.quizScores.length > 0) {
      const totalScore = userProgress.quizScores.reduce((sum, quiz) => {
        return sum + (quiz.score / quiz.maxScore) * 100;
      }, 0);
      avgQuizScore = Math.round(totalScore / userProgress.quizScores.length);
    }
    
    // Format achievements for frontend
    const formattedAchievements = await Promise.all(allAchievements.map(async achievement => {
      // Find user's progress on this achievement
      const userAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId._id.toString() === achievement._id.toString()
      );
      
      // Calculate progress based on achievement type
      let progress = 0;
      let earned = false;
      
      if (userAchievement) {
        progress = userAchievement.progress;
        earned = userAchievement.earned;
      } else {
        // Calculate progress based on requirement type
        switch(achievement.requirement) {
          case 'completedLessons':
            progress = userProgress.completedLessons.length;
            break;
          case 'completedChallenges':
            progress = userProgress.completedChallenges.length;
            break;
          case 'streak':
            progress = user.streak;
            break;
          case 'codingHours':
            progress = Math.round(userProgress.totalCodingTime / 60);
            break;
          case 'completedCourses':
            // Would need to calculate completed courses
            progress = 0;
            break;
          case 'perfectQuizzes':
            if (userProgress.quizScores) {
              progress = userProgress.quizScores.filter(quiz => 
                quiz.score === quiz.maxScore
              ).length;
            }
            break;
        }
        
        // Check if achievement should be marked as earned
        if (progress >= achievement.targetValue && !earned) {
          earned = true;
          
          // Add achievement to user progress if they've earned it
          userProgress.achievements.push({
            achievementId: achievement._id,
            progress: progress,
            earned: true,
            earnedAt: new Date()
          });
          
          // Award XP
          user.xp += achievement.xpReward;
          
          // Check if user should level up
          while (user.xp >= user.level * 1000) {
            user.level += 1;
          }
          
          // Save changes
          await userProgress.save();
          await user.save();
        }
      }
      
      return {
        _id: achievement._id,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        color: achievement.color,
        targetValue: achievement.targetValue,
        progress: progress,
        earned: earned
      };
    }));
    
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