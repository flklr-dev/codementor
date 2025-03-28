const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Challenge = require('../models/Challenge');
const UserProgress = require('../models/UserProgress');
const router = express.Router();

// Get user dashboard data
router.get('/', auth, async (req, res) => {
  try {
    // Get user with progress data
    const user = await User.findById(req.user._id);
    
    // Get in-progress lesson or recommend a new one
    const userProgress = await UserProgress.findOne({ userId: req.user._id })
      .populate({
        path: 'currentLesson.lessonId',
        model: 'Lesson'
      });
    
    let nextLesson = null;
    if (userProgress?.currentLesson?.lessonId) {
      nextLesson = {
        title: userProgress.currentLesson.lessonId.title,
        topic: userProgress.currentLesson.lessonId.topic,
        duration: `${userProgress.currentLesson.lessonId.duration} mins`,
        progress: userProgress.currentLesson.progress
      };
    } else {
      // Get a recommended lesson if user has no current lesson
      const recommendedLesson = await Lesson.findOne({ 
        difficulty: 'Beginner' 
      });
      
      if (recommendedLesson) {
        nextLesson = {
          title: recommendedLesson.title,
          topic: recommendedLesson.topic,
          duration: `${recommendedLesson.duration} mins`,
          progress: 0
        };
      }
    }
    
    // Get recommended challenges
    const completedChallengeIds = userProgress?.completedChallenges.map(c => c.challengeId) || [];
    const recommendedChallenges = await Challenge.find({
      _id: { $nin: completedChallengeIds }
    }).limit(2);
    
    res.json({
      userProgress: {
        streak: user.streak,
        todayMinutes: user.todayMinutes || 0,
        completedChallenges: userProgress?.completedChallenges.length || 0,
        level: user.level
      },
      nextLesson,
      recommendedChallenges: recommendedChallenges.map(c => ({
        id: c._id,
        title: c.title,
        difficulty: c.difficulty,
        xp: c.xp,
        tags: c.tags
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 