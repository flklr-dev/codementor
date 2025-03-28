const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Auth middleware to protect routes
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user data to request - FIXING INCONSISTENT ID REFERENCE
    req.user = user;
    req.userId = user._id; // Add this consistently
    req.user._id = user._id; // Ensure this is always set
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth; 