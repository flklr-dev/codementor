const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['learning', 'challenges', 'streak', 'completion', 'social'],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#6366F1'
  },
  targetValue: {
    type: Number,
    required: true
  },
  xpReward: {
    type: Number,
    default: 50
  },
  requirement: {
    type: String,
    required: true
  }
});

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement; 