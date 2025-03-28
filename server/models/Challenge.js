const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  xp: {
    type: Number,
    required: true
  },
  tags: [{
    type: String
  }]
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge; 