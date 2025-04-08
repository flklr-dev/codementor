const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [{
    type: Number
  }],
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    default: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, courseId: 1 });

// Add pre-save middleware to ensure completed is set correctly
quizAttemptSchema.pre('save', function(next) {
  // If this is a new quiz attempt, ensure completed is set to true
  if (this.isNew && this.completed !== false) {
    this.completed = true;
  }
  next();
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt; 