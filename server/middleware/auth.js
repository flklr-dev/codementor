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
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId);
    console.log('Found user:', user ? user._id : 'none');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user data to request - ENSURING CONSISTENT ID REFERENCE
    req.user = user;
    req.userId = user._id.toString(); // Add this consistently as string
    req.user._id = user._id; // Keep as ObjectId for any MongoDB operations
    
    console.log('Auth middleware set user ID:', req.userId);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth; 