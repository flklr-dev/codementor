const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Auth middleware to protect routes
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Please authenticate',
        code: 'AUTH_REQUIRED'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      const user = await User.findOne({ _id: decoded.userId });
      console.log('Found user:', user ? user._id : 'none');

      if (!user) {
        return res.status(401).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Add user data to request - ENSURING CONSISTENT ID REFERENCE
      req.user = user;
      req.token = token;
      req.userId = user._id.toString(); // Add this consistently as string
      req.user._id = user._id; // Keep as ObjectId for any MongoDB operations
      
      console.log('Auth middleware set user ID:', req.userId);
      next();
    } catch (jwtError) {
      let errorMessage = 'Authentication failed';
      let errorCode = 'AUTH_FAILED';

      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
        errorCode = 'TOKEN_EXPIRED';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
        errorCode = 'INVALID_TOKEN';
      }

      return res.status(401).json({ 
        error: errorMessage,
        code: errorCode
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = auth; 