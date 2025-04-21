const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const auth = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const { updateAchievements } = require('../utils/achievements');

// Debug route to check quiz data
router.get('/debug/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if quiz exists
    let quiz = await Quiz.findOne({ courseId });
    
    if (!quiz) {
      // Create a sample quiz if none exists
      quiz = new Quiz({
        courseId,
        questions: [
          {
            question: 'What is the main purpose of this course?',
            options: [
              'To learn programming basics',
              'To master advanced concepts',
              'To practice problem-solving',
              'To understand software development'
            ],
            correctAnswer: 0
          },
          {
            question: 'Which approach is best for learning?',
            options: [
              'Memorizing without understanding',
              'Practice and application',
              'Reading without coding',
              'Watching without practicing'
            ],
            correctAnswer: 1
          }
        ],
        xpReward: 100
      });
      
      await quiz.save();
      console.log('Created sample quiz for course:', courseId);
    }
    
    res.json({
      message: 'Quiz debug info',
      quizExists: !!quiz,
      quizId: quiz._id,
      courseId: quiz.courseId,
      questionCount: quiz.questions.length
    });
  } catch (error) {
    console.error('Quiz debug error:', error);
    res.status(500).json({ error: 'Debug route error' });
  }
});

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
    const userId = req.user._id;
    
    console.log('Submitting quiz:', { quizId, courseId, userId });
    
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
      userId,
      quizId,
      courseId,
      answers,
      score,
      maxScore: 100,
      completed: true,
      xpEarned,
      completedAt: new Date()
    });

    await attempt.save();
    console.log('Quiz attempt saved:', attempt._id);

    // Update user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }

    // Add quiz score to user progress
    userProgress.quizScores.push({
      quizId,
      score,
      maxScore: 100,
      completedAt: new Date()
    });

    await userProgress.save();
    console.log('User progress updated with quiz score');

    // If passed, update user XP and check achievements
    if (passed) {
      const user = await User.findById(userId);
      user.xp += xpEarned;
      const levelsGained = user.checkAndLevelUp();
      await user.save();
      
      // Check achievements
      await updateAchievements(userId);
      
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