const express = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const router = express.Router();

// Get lessons for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId });
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get a single lesson
router.get('/:lessonId', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const userId = req.user._id;
    
    // Get all lessons from the course
    const courseLessons = await Lesson.find({ courseId: lesson.courseId }).sort({ order: 1 });
    const currentLessonIndex = courseLessons.findIndex(l => l._id.toString() === req.params.lessonId);
    
    // Get user progress
    const userProgress = await UserProgress.findOne({ userId });
    
    let progress = 0;
    let completed = false;
    let accessible = currentLessonIndex === 0; // First lesson is always accessible
    
    if (userProgress) {
      // Check if lesson is completed
      completed = userProgress.completedLessons.some(
        completedLesson => completedLesson.lessonId.toString() === req.params.lessonId.toString()
      );
      
      // Check if lesson is in progress
      if (userProgress.currentLesson && 
          userProgress.currentLesson.lessonId && 
          userProgress.currentLesson.lessonId.toString() === req.params.lessonId.toString()) {
        progress = userProgress.currentLesson.progress;
      } else if (completed) {
        progress = 1;
      }

      // Check if previous lesson is completed (for accessibility)
      if (currentLessonIndex > 0) {
        const previousLesson = courseLessons[currentLessonIndex - 1];
        accessible = userProgress.completedLessons.some(
          completedLesson => completedLesson.lessonId.toString() === previousLesson._id.toString()
        );
      }
    }
    
    console.log(`Lesson ${req.params.lessonId} - Progress: ${progress}, Completed: ${completed}, Accessible: ${accessible}`);
    
    res.json({
      ...lesson.toObject(),
      progress,
      completed,
      accessible
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Create a new lesson
router.post('/', auth, async (req, res) => {
  try {
    const { title, topic, duration, content, courseId } = req.body;
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const newLesson = new Lesson({
      title,
      topic,
      duration,
      content,
      courseId
    });
    
    await newLesson.save();
    
    // Add lesson to course
    course.lessons.push(newLesson._id);
    await course.save();
    
    res.status(201).json(newLesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson progress
router.post('/:lessonId/progress', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { progress } = req.body;
    const userId = req.user._id;
    
    console.log(`Updating progress for lesson ${lessonId}, user ${userId}: ${progress}`);
    
    if (progress === undefined || progress < 0 || progress > 1) {
      return res.status(400).json({ error: 'Invalid progress value' });
    }
    
    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }
    
    // If progress is 1, this is completed - add to completedLessons if not already there
    if (progress >= 1) {
      const isAlreadyCompleted = userProgress.completedLessons.some(
        lesson => lesson.lessonId.toString() === lessonId
      );
      
      if (!isAlreadyCompleted) {
        userProgress.completedLessons.push({
          lessonId,
          completedAt: new Date()
        });
      }
      
      // Also update currentLesson if it's this lesson
      if (userProgress.currentLesson && 
          userProgress.currentLesson.lessonId && 
          userProgress.currentLesson.lessonId.toString() === lessonId) {
        userProgress.currentLesson.progress = 1;
      }
    } else {
      // Update current lesson progress
      if (userProgress.currentLesson && 
          userProgress.currentLesson.lessonId && 
          userProgress.currentLesson.lessonId.toString() === lessonId) {
        userProgress.currentLesson.progress = progress;
      } else {
        userProgress.currentLesson = {
          lessonId,
          progress
        };
      }
    }
    
    await userProgress.save();
    console.log('Progress updated successfully in database');
    
    res.json({ 
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// When a user completes a lesson:
router.post('/:lessonId/complete', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;
    
    console.log(`Completing lesson ${lessonId} for user ${userId}`);
    
    // Find user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }
    
    // Check if lesson is already completed
    const alreadyCompleted = userProgress.completedLessons.some(
      lesson => lesson.lessonId && lesson.lessonId.toString() === lessonId
    );
    
    console.log(`Lesson already completed: ${alreadyCompleted}`);
    
    let xpEarned = 0;
    let newLevel = 0;
    let newXp = 0;
    
    // If not already completed, add to completed lessons
    if (!alreadyCompleted) {
      userProgress.completedLessons.push({
        lessonId,
        completedAt: new Date()
      });
      
      // Update user XP
      const user = await User.findById(userId);
      const lesson = await Lesson.findById(lessonId);
      
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      
      // Award XP based on lesson duration (2 XP per minute)
      xpEarned = Math.floor((lesson.duration || 5) * 2); 
      console.log(`Awarding ${xpEarned} XP to user ${userId}`);
      
      user.xp += xpEarned;
      newXp = user.xp;
      
      // Check for level up
      const levelsGained = user.checkAndLevelUp();
      newLevel = user.level;
      
      console.log(`User new XP: ${newXp}, new level: ${newLevel}`);
      
      await userProgress.save();
      await user.save();
    } else {
      // Get current user data even if already completed
      const user = await User.findById(userId);
      if (user) {
        newXp = user.xp;
        newLevel = user.level;
      }
    }
    
    res.json({ 
      success: true,
      alreadyCompleted,
      xpEarned,
      newLevel,
      newXp
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ 
      error: 'Failed to complete lesson',
      details: error.message 
    });
  }
});

// Check if lesson is accessible
router.get('/:lessonId/access', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get all lessons from the course
    const courseLessons = await Lesson.find({ courseId: lesson.courseId }).sort({ order: 1 });
    const currentLessonIndex = courseLessons.findIndex(l => l._id.toString() === req.params.lessonId);
    
    // If it's the first lesson, it's always accessible
    if (currentLessonIndex === 0) {
      return res.json({ accessible: true });
    }

    // Get user progress
    const userProgress = await UserProgress.findOne({ userId: req.user._id });
    if (!userProgress) {
      // If no progress found, only first lesson is accessible
      return res.json({ accessible: false });
    }

    // Check if previous lesson is completed
    const previousLesson = courseLessons[currentLessonIndex - 1];
    const isPreviousLessonCompleted = userProgress.completedLessons.some(
      completedLesson => completedLesson.lessonId.toString() === previousLesson._id.toString()
    );

    res.json({ accessible: isPreviousLessonCompleted });
  } catch (error) {
    console.error('Error checking lesson access:', error);
    res.status(500).json({ error: 'Failed to check lesson access' });
  }
});

module.exports = router; 