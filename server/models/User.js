const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastEmailChange: {
    type: Date,
    default: Date.now
  },
  lastNameChange: {
    type: Date,
    default: Date.now
  },
  pendingEmail: {
    type: String,
    default: null
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Method to check password validity
userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Add a method to calculate XP needed for next level
userSchema.methods.getXpForNextLevel = function() {
  return this.level * 1000;
};

// Add a method to check if user can level up
userSchema.methods.checkAndLevelUp = function() {
  let levelsGained = 0;
  while (this.xp >= this.getXpForNextLevel()) {
    this.xp -= this.getXpForNextLevel();
    this.level += 1;
    levelsGained += 1;
  }
  return levelsGained;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 