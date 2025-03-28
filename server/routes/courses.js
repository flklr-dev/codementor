const express = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');
const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get a single course with its lessons
router.get('/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const lessons = await Lesson.find({ courseId: req.params.courseId });
    
    res.json({
      ...course.toObject(),
      lessons
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create a new course (admin only in the future)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, difficulty, tags } = req.body;
    
    const newCourse = new Course({
      title,
      description,
      difficulty,
      tags,
      lessons: []
    });
    
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get courses by difficulty
router.get('/difficulty/:difficulty', auth, async (req, res) => {
  try {
    const courses = await Course.find({ 
      difficulty: req.params.difficulty 
    }).sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses by difficulty:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get courses by tag
router.get('/tag/:tag', auth, async (req, res) => {
  try {
    const courses = await Course.find({ 
      tags: req.params.tag 
    }).sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses by tag:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course with lessons
router.get('/:courseId/lessons', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    
    console.log(`Getting course ${courseId} for user ${userId}`);
    
    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get lessons
    const lessons = await Lesson.find({ courseId }).sort('order');
    
    // Get user progress to identify completed lessons
    const userProgress = await UserProgress.findOne({ userId });
    console.log(`User progress found: ${userProgress ? 'Yes' : 'No'}`);
    
    if (userProgress) {
      console.log(`Completed lessons in DB: ${userProgress.completedLessons.length}`);
    }
    
    // Transform lessons to include completion status
    const lessonsWithStatus = lessons.map(lesson => {
      const lessonObj = lesson.toObject();
      
      // Check if this lesson is completed
      if (userProgress && userProgress.completedLessons) {
        lessonObj.completed = userProgress.completedLessons.some(
          completedLesson => completedLesson.lessonId.toString() === lesson._id.toString()
        );
        
        // Check if lesson is in progress
        if (userProgress.currentLesson && 
            userProgress.currentLesson.lessonId && 
            userProgress.currentLesson.lessonId.toString() === lesson._id.toString()) {
          lessonObj.progress = userProgress.currentLesson.progress;
        } else {
          lessonObj.progress = lessonObj.completed ? 1 : 0;
        }
      } else {
        lessonObj.completed = false;
        lessonObj.progress = 0;
      }
      
      return lessonObj;
    });
    
    // Log for debugging
    console.log(`Returning ${lessonsWithStatus.length} lessons with status`);
    console.log(`Lessons completed: ${lessonsWithStatus.filter(l => l.completed).length}`);
    
    const courseWithLessons = {
      ...course.toObject(),
      lessons: lessonsWithStatus
    };
    
    res.json(courseWithLessons);
  } catch (error) {
    console.error('Error fetching course with lessons:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 