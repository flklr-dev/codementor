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
    default: 50,
    required: true
  },
  requirement: {
    type: String,
    required: true
  }
});

// Add pre-save hook to ensure xpReward is set
achievementSchema.pre('save', function(next) {
  if (!this.xpReward) {
    this.xpReward = 50; // Set default if not provided
  }
  next();
});

// Add a console.log to verify the schema
console.log('Achievement schema fields:', Object.keys(achievementSchema.paths));

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement; 