const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number, // Index of the correct option
      required: true
    }
  }],
  xpReward: {
    type: Number,
    default: 100
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 