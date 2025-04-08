const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Define achievement seed data
const achievements = [
  // Learning achievements
  {
    title: 'First Steps',
    description: 'Complete your first lesson',
    category: 'learning',
    icon: 'school-outline',
    color: '#22C55E',
    targetValue: 1,
    xpReward: 25,
    requirement: 'completedLessons'
  },
  {
    title: 'Knowledge Seeker',
    description: 'Complete 10 lessons',
    category: 'learning',
    icon: 'book-outline',
    color: '#3B82F6',
    targetValue: 10,
    xpReward: 100,
    requirement: 'completedLessons'
  },
  {
    title: 'Dedicated Student',
    description: 'Complete 50 lessons',
    category: 'learning',
    icon: 'school-outline',
    color: '#8B5CF6',
    targetValue: 50,
    xpReward: 250,
    requirement: 'completedLessons'
  },
  {
    title: 'Master Learner',
    description: 'Complete 100 lessons',
    category: 'learning',
    icon: 'ribbon-outline',
    color: '#EC4899',
    targetValue: 100,
    xpReward: 500,
    requirement: 'completedLessons'
  },
  
  // Streak achievements
  {
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    category: 'streak',
    icon: 'flame-outline',
    color: '#F59E0B',
    targetValue: 3,
    xpReward: 30,
    requirement: 'streak'
  },
  {
    title: 'Consistency is Key',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    icon: 'flame',
    color: '#F97316',
    targetValue: 7,
    xpReward: 70,
    requirement: 'streak'
  },
  {
    title: 'Dedicated Coder',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    icon: 'bonfire-outline',
    color: '#EF4444',
    targetValue: 30,
    xpReward: 300,
    requirement: 'streak'
  },
  
  // Quiz achievements
  {
    title: 'Quiz Novice',
    description: 'Complete your first quiz',
    category: 'completion',
    icon: 'help-circle-outline',
    color: '#06B6D4',
    targetValue: 1,
    xpReward: 40,
    requirement: 'completedQuizzes'
  },
  {
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    category: 'completion',
    icon: 'help-circle',
    color: '#0EA5E9',
    targetValue: 10,
    xpReward: 150,
    requirement: 'completedQuizzes'
  },
  {
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    category: 'completion',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    targetValue: 1,
    xpReward: 50,
    requirement: 'perfectQuizzes'
  },
  {
    title: 'Consistent Performer',
    description: 'Maintain an average quiz score above 80%',
    category: 'completion',
    icon: 'trending-up-outline',
    color: '#8B5CF6',
    targetValue: 80,
    xpReward: 200,
    requirement: 'quizAverage'
  }
];

async function seedAchievements() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Cleared existing achievements');
    
    // Insert new achievements
    const result = await Achievement.insertMany(achievements);
    console.log(`Seeded ${result.length} achievements`);
  } catch (error) {
    console.error('Error seeding achievements:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

module.exports = { seedAchievements, achievements };

// Run seeding directly if this script is executed directly
if (require.main === module) {
  seedAchievements();
} 