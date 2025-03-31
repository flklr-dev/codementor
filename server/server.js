require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentor');
const dashboardRoutes = require('./routes/dashboard');
const coursesRoutes = require('./routes/courses');
const lessonsRoutes = require('./routes/lessons');
const progressRoutes = require('./routes/progress');
const trackingRoutes = require('./routes/tracking');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006'], // Add your client URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api', progressRoutes);
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