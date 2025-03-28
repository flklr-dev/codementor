const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedLessons: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedChallenges: [{
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  currentLesson: {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    progress: {
      type: Number,
      default: 0
    },
    earned: {
      type: Boolean,
      default: false
    },
    earnedAt: {
      type: Date
    }
  }],
  totalCodingTime: {
    type: Number,
    default: 0
  },
  quizScores: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    score: Number,
    maxScore: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress; 