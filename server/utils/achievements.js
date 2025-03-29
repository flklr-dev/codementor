const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');

/**
 * Check and update achievements for a user
 * @param {string} userId - The user's ID
 */
async function updateAchievements(userId) {
  try {
    // Convert userId to string to ensure consistent comparison
    const userIdStr = userId.toString();
    
    const user = await User.findById(userIdStr);
    if (!user) {
      console.log(`User ${userIdStr} not found during achievement update`);
      return;
    }
    
    // Get user progress
    let userProgress = await UserProgress.findOne({ userId: userIdStr });
    if (!userProgress) {
      console.log(`Creating new progress for user ${userIdStr}`);
      userProgress = new UserProgress({ userId: userIdStr });
      await userProgress.save();
    }
    
    // Get all achievements
    const achievements = await Achievement.find();
    console.log(`Checking ${achievements.length} achievements for user ${userIdStr}`);
    
    // Check each achievement
    for (const achievement of achievements) {
      // Skip if already earned
      const existingAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString() && a.earned
      );
      
      if (existingAchievement) continue;
      
      // Calculate current progress based on requirement type
      let progress = 0;
      
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
      
      // Find or create achievement progress entry
      let userAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      if (!userAchievement) {
        userAchievement = {
          achievementId: achievement._id,
          progress: progress,
          earned: false
        };
        userProgress.achievements.push(userAchievement);
      } else {
        userAchievement.progress = progress;
      }
      
      // Check if achievement should be earned
      if (progress >= achievement.targetValue && !userAchievement.earned) {
        userAchievement.earned = true;
        userAchievement.earnedAt = new Date();
        
        // Award XP
        user.xp += achievement.xpReward;
        console.log(`User ${userIdStr} earned achievement ${achievement.title}, +${achievement.xpReward} XP`);
        
        // Check if user should level up
        const levelsGained = user.checkAndLevelUp();
        console.log(`User ${userIdStr} gained ${levelsGained} levels, new level: ${user.level}`);
        
        // Save user changes
        await user.save();
      }
    }
    
    // Save progress changes
    await userProgress.save();
    
  } catch (error) {
    console.error('Error updating achievements:', error);
  }
}

module.exports = { updateAchievements }; 