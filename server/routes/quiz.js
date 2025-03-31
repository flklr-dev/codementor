const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const auth = require('../middleware/auth');

// Get quiz for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    console.log('Fetching quiz for course:', req.params.courseId);
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });
    console.log('Quiz found:', quiz ? 'Yes' : 'No');
    
    if (!quiz) {
      console.log('No quiz found for course:', req.params.courseId);
      return res.status(404).json({ 
        message: 'Quiz not found',
        courseId: req.params.courseId
      });
    }
    
    // Remove correct answers from the response
    const quizWithoutAnswers = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options
      }))
    };
    
    res.json(quizWithoutAnswers);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Submit quiz attempt
router.post('/submit', auth, async (req, res) => {
  try {
    const { quizId, courseId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= 70; // Pass threshold is 70%
    const xpEarned = passed ? quiz.xpReward : 0;

    // Create quiz attempt
    const attempt = new QuizAttempt({
      userId: req.user._id,
      quizId,
      courseId,
      answers,
      score,
      completed: true,
      xpEarned,
      completedAt: new Date()
    });

    await attempt.save();

    // If passed, update user XP
    if (passed) {
      req.user.xp += xpEarned;
      const levelsGained = req.user.checkAndLevelUp();
      await req.user.save();

      return res.json({
        success: true,
        score,
        xpEarned,
        levelsGained,
        message: 'Quiz completed successfully!'
      });
    }

    res.json({
      success: false,
      score,
      message: 'Quiz completed, but score was too low to pass. Try again!'
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz status for a course
router.get('/status/:courseId', auth, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Find the latest quiz attempt for this course
    const latestAttempt = await QuizAttempt.findOne({
      userId,
      courseId
    }).sort({ createdAt: -1 });

    if (!latestAttempt) {
      return res.json({
        completed: false,
        passed: false
      });
    }

    res.json({
      completed: true,
      passed: latestAttempt.score >= 70 // Pass threshold is 70%
    });
  } catch (error) {
    console.error('Error checking quiz status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 