require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quiz');
const mentorRoutes = require('./routes/mentor');
const dashboardRoutes = require('./routes/dashboard');
const coursesRoutes = require('./routes/courses');
const lessonsRoutes = require('./routes/lessons');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:5173'], // Add your client URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api', trackingRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('CodeMentor API is running');
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  console.error('Request body:', req.body);
  console.error('Request params:', req.params);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Initialize user data at startup
const initializeData = async () => {
  try {
    console.log('Initializing user data on server startup');
    const { updateAchievements } = require('./utils/achievements');
    const User = require('./models/User');
    const Achievement = require('./models/Achievement');
    
    // Check if any achievements exist
    const achievementsCount = await Achievement.countDocuments();
    if (achievementsCount === 0) {
      console.log('No achievements found, seeding achievements');
      // Import the seed function
      const { seedAchievements } = require('./scripts/seedAchievements');
      await seedAchievements();
      console.log('Successfully seeded achievements');
    } else {
      console.log(`Found ${achievementsCount} achievements in database`);
    }
    
    // Find all users
    const users = await User.find();
    console.log(`Found ${users.length} users to initialize`);
    
    // Update achievements for all users
    for (const user of users) {
      console.log(`Processing user ${user._id} (${user.name})`);
      
      try {
        // Update achievements (this will also sync quiz data)
        await updateAchievements(user._id);
        console.log(`Successfully updated achievements for user ${user.name}`);
      } catch (userError) {
        console.error(`Error processing user ${user.name}:`, userError);
      }
    }
    
    console.log('User data initialization complete');
  } catch (error) {
    console.error('Error initializing user data:', error);
  }
};

// Run initialization
initializeData();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 