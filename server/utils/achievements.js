const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');
const QuizAttempt = require('../models/QuizAttempt');

/**
 * Sync quiz attempts with user progress
 * @param {string} userId - The user's ID
 */
async function syncQuizData(userId) {
  try {
    console.log(`Syncing quiz data for user: ${userId}`);
    
    // Find user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
      await userProgress.save();
    }
    
    // Get all quiz attempts for user
    const quizAttempts = await QuizAttempt.find({ 
      userId, 
      completed: true 
    }).sort({ completedAt: 1 });
    
    console.log(`Found ${quizAttempts.length} quiz attempts for user ${userId}`);
    
    if (quizAttempts.length === 0) {
      console.log('No quiz attempts found, returning existing progress');
      return userProgress;
    }
    
    // Clear existing quiz scores and rebuild from attempts
    userProgress.quizScores = quizAttempts.map(attempt => ({
      quizId: attempt.quizId,
      score: attempt.score,
      maxScore: attempt.maxScore || 100,
      completedAt: attempt.completedAt
    }));
    
    console.log(`Synced quiz scores:`, userProgress.quizScores.map(q => ({
      score: q.score,
      completedAt: q.completedAt
    })));
    
    await userProgress.save();
    console.log(`Updated user progress with ${userProgress.quizScores.length} quiz scores`);
    
    return userProgress;
  } catch (error) {
    console.error('Error syncing quiz data:', error);
    throw error;
  }
}

/**
 * Check and update achievements for a user
 * @param {string} userId - The user's ID
 */
async function updateAchievements(userId) {
  try {
    // Convert userId to string to ensure consistent comparison
    const userIdStr = userId.toString();
    
    console.log(`Updating achievements for user ${userIdStr}`);
    
    const user = await User.findById(userIdStr);
    if (!user) {
      console.log(`User ${userIdStr} not found during achievement update`);
      return;
    }
    
    // Get user progress
    let userProgress = await UserProgress.findOne({ userId: userIdStr });
    if (!userProgress) {
      userProgress = new UserProgress({ userId: userIdStr });
      await userProgress.save();
    }
    
    // Get user quiz attempts independently (don't rely on userProgress.quizScores)
    const quizAttempts = await QuizAttempt.find({ 
      userId: userIdStr, 
      completed: true 
    });
    
    console.log(`Found ${quizAttempts.length} quiz attempts for user ${userIdStr}`);
    
    // Update quizScores in userProgress (this is the source of truth)
    userProgress.quizScores = quizAttempts.map(attempt => ({
      quizId: attempt.quizId,
      score: attempt.score,
      maxScore: attempt.maxScore || 100,
      completedAt: attempt.completedAt
    }));
    
    // Get all achievements
    const achievements = await Achievement.find();
    console.log(`Checking ${achievements.length} achievements for user ${userIdStr}`);
    
    let achievementsUpdated = false;
    
    // Check each achievement
    for (const achievement of achievements) {
      // Calculate current progress based on requirement type
      let progress = 0;
      
      switch(achievement.requirement) {
        case 'completedLessons':
          progress = userProgress.completedLessons.length;
          console.log(`Lessons completed: ${progress}/${achievement.targetValue}`);
          break;
        case 'streak':
          progress = user.streak;
          console.log(`Current streak: ${progress}/${achievement.targetValue}`);
          break;
        case 'completedQuizzes':
          // Use the actual quiz attempts count
          progress = quizAttempts.length;
          console.log(`Quizzes completed: ${progress}/${achievement.targetValue}`);
          break;
        case 'perfectQuizzes':
          // Count perfect quizzes (100% score)
          progress = quizAttempts.filter(attempt => 
            Math.round(attempt.score) === 100
          ).length;
          console.log(`Perfect quizzes: ${progress}/${achievement.targetValue}`);
          break;
        case 'quizAverage':
          if (quizAttempts.length > 0) {
            // Calculate average score across all quiz attempts
            const totalScore = quizAttempts.reduce((acc, attempt) => acc + attempt.score, 0);
            progress = Math.round(totalScore / quizAttempts.length);
          } else {
            progress = 0;
          }
          console.log(`Quiz average: ${progress}/${achievement.targetValue}`);
          break;
        default:
          console.log(`Unknown requirement type: ${achievement.requirement}`);
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
        achievementsUpdated = true;
        console.log(`Added new achievement progress for ${achievement.title}: ${progress}/${achievement.targetValue}`);
      } else {
        // Always update progress, even if it hasn't changed
        console.log(`Updating progress for ${achievement.title}: ${userAchievement.progress} -> ${progress}`);
        userAchievement.progress = progress;
        achievementsUpdated = true;
      }
      
      // Check if achievement should be earned
      const shouldBeEarned = progress >= achievement.targetValue;
      if (shouldBeEarned && !userAchievement.earned) {
        console.log(`✅ ACHIEVEMENT EARNED: "${achievement.title}" - Progress ${progress}/${achievement.targetValue}`);
        userAchievement.earned = true;
        userAchievement.earnedAt = new Date();
        achievementsUpdated = true;
        
        console.log(`User ${userIdStr} earned achievement: ${achievement.title}`);
        
        // Award XP
        user.xp += achievement.xpReward;
        console.log(`User ${userIdStr} earned achievement ${achievement.title}, +${achievement.xpReward} XP`);
        
        // Check if user should level up
        const levelsGained = user.checkAndLevelUp();
        console.log(`User ${userIdStr} gained ${levelsGained} levels, new level: ${user.level}`);
        
        // Save user changes
        await user.save();
      } else if (shouldBeEarned && userAchievement.earned) {
        console.log(`Achievement already earned: "${achievement.title}"`);
      } else {
        console.log(`Achievement not yet earned: "${achievement.title}" - Progress ${progress}/${achievement.targetValue}`);
      }
    }
    
    // Always save updates to ensure quiz scores and achievement progress are synced
    if (achievementsUpdated) {
      await userProgress.save();
      console.log(`Saved updated achievements for user ${userIdStr}`);
    } else {
      console.log(`No achievement updates needed for user ${userIdStr}`);
    }
    
    return userProgress;
  } catch (error) {
    console.error('Error updating achievements:', error);
    throw error;
  }
}

module.exports = { updateAchievements, syncQuizData }; 