const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendVerificationEmail } = require('../utils/email');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/email');

// Configure storage for profile pictures
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/profile');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Use userId + timestamp to ensure unique filenames
    const userId = req.userId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}-${timestamp}${ext}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new user with initial streak of 1
    const user = new User({ 
      name, 
      email, 
      password,
      streak: 1,
      level: 1,
      xp: 0,
      lastLogin: new Date(),
      lastEmailChange: new Date(),
      lastNameChange: new Date()
    });
    await user.save();
    
    // Create initial user progress record
    const userProgress = new UserProgress({
      userId: user._id,
      completedLessons: [],
      completedChallenges: [],
      currentLesson: null,
      achievements: [],
      totalCodingTime: 0
    });
    await userProgress.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login and streak
    const now = new Date();
    const lastLogin = user.lastLogin;
    
    if (!lastLogin) {
      // First time login (shouldn't happen normally as it's set during registration)
      user.streak = 1;
    } else {
      const hoursSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60));
      
      // If last login was between 20-28 hours ago (allowing some flexibility around the 24-hour mark)
      if (hoursSinceLastLogin >= 20 && hoursSinceLastLogin <= 28) {
        // Increment streak if user logged in roughly 24 hours later
        user.streak += 1;
        
        // Check for streak achievements and award XP if needed
        await checkAndUpdateAchievements(user._id);
      } else if (hoursSinceLastLogin > 28) {
        // Reset streak if user missed the 24-hour window
        user.streak = 1;
      }
      // Keep current streak if logging in multiple times within the same day
    }
    
    user.lastLogin = now;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to check and update streak achievements
async function checkAndUpdateAchievements(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Get user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
      await userProgress.save();
    }
    
    // Get streak achievements
    const streakAchievements = await Achievement.find({ requirement: 'streak' });
    
    // Check each achievement
    for (const achievement of streakAchievements) {
      // Check if user already has this achievement
      const existingAchievement = userProgress.achievements.find(
        a => a.achievementId && a.achievementId.toString() === achievement._id.toString()
      );
      
      // If already earned, skip
      if (existingAchievement && existingAchievement.earned) continue;
      
      // Check if streak meets or exceeds target
      if (user.streak >= achievement.targetValue) {
        // If existing achievement entry, update it
        if (existingAchievement) {
          existingAchievement.progress = user.streak;
          existingAchievement.earned = true;
          existingAchievement.earnedAt = new Date();
        } else {
          // Add new achievement
          userProgress.achievements.push({
            achievementId: achievement._id,
            progress: user.streak,
            earned: true,
            earnedAt: new Date()
          });
        }
        
        // Award XP
        user.xp += achievement.xpReward;
        
        // Check if user should level up
        const levelsGained = user.checkAndLevelUp();
        await user.save();
      }
    }
    
    // Save progress changes
    await userProgress.save();
    
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    // Always get fresh user data from database (don't use cached req.user)
    const freshUser = await User.findById(req.userId);
    if (!freshUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Force a fresh database query if force=true is in the query
    if (req.query.force === 'true') {
      console.log('Forcing fresh user data from database');
      // This is just to ensure we're not getting cached data from MongoDB
      await User.collection.findOne({ _id: freshUser._id });
    }
    
    console.log('Fresh user data:', {
      id: freshUser._id,
      xp: freshUser.xp,
      level: freshUser.level,
      streak: freshUser.streak,
      pendingEmail: freshUser.pendingEmail,
      hasEmailVerificationToken: !!freshUser.emailVerificationToken
    });
    
    res.json({
      id: freshUser._id,
      name: freshUser.name,
      email: freshUser.email,
      level: freshUser.level,
      xp: freshUser.xp,
      streak: freshUser.streak,
      profilePicture: freshUser.profilePicture,
      pendingEmail: freshUser.pendingEmail,
      emailVerificationToken: freshUser.emailVerificationToken
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile change restrictions
router.get('/restrictions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Initialize restriction dates if they don't exist
    if (!user.lastEmailChange) user.lastEmailChange = new Date(0);
    if (!user.lastNameChange) user.lastNameChange = new Date(0);
    
    const now = new Date();
    const emailChangeAllowed = !user.lastEmailChange || 
      (now - new Date(user.lastEmailChange) > 90 * 24 * 60 * 60 * 1000); // 90 days
    const nameChangeAllowed = !user.lastNameChange || 
      (now - new Date(user.lastNameChange) > 7 * 24 * 60 * 60 * 1000); // 7 days
    
    res.json({
      emailChangeAllowed,
      nameChangeAllowed,
      lastEmailChange: user.lastEmailChange,
      lastNameChange: user.lastNameChange,
      emailNextChangeDate: new Date(new Date(user.lastEmailChange).getTime() + 90 * 24 * 60 * 60 * 1000),
      nameNextChangeDate: new Date(new Date(user.lastNameChange).getTime() + 7 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    console.error('Error fetching user restrictions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Always update name if provided
    if (name) user.name = name;
    
    // Handle profile image upload
    if (req.file) {
      // If user already has a profile image, delete the old one
      if (user.profileImage && user.profileImage.startsWith('uploads/')) {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        // Check if file exists and delete it
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new profile image path
      user.profileImage = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
    }
    
    await user.save();
    
    // Return updated user without sensitive fields
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check and update streak on app open
router.post('/check-streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date();
    const lastLogin = user.lastLogin;
    let streakUpdated = false;
    let newStreak = user.streak;
    
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
      const todayDate = new Date().setHours(0, 0, 0, 0);
      
      // If last login was yesterday or earlier, and not today
      if (lastLoginDate < todayDate) {
        // If last login was yesterday
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (todayDate - lastLoginDate <= oneDayMs) {
          // Increment streak
          user.streak += 1;
          newStreak = user.streak;
          streakUpdated = true;
        } else {
          // Streak broken - more than one day gap
          user.streak = 1;
          newStreak = 1;
          streakUpdated = true;
        }
      }
    }
    
    // Always update last login time
    user.lastLogin = now;
    await user.save();
    
    res.json({
      streakUpdated,
      streak: newStreak
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile with profile picture
router.put('/profile/update', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name } = req.body;
    
    console.log('Profile update request received');
    console.log('File uploaded:', req.file ? req.file.filename : 'No file');
    
    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }
    
    // Process the profile picture if it was uploaded
    if (req.file) {
      console.log('Processing uploaded profile picture:', req.file.filename);
      
      // Create directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../public/uploads/profile');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Construct full path to the old profile picture if it exists
      if (user.profilePicture) {
        try {
          let oldPicturePath;
          if (user.profilePicture.startsWith('/')) {
            // If it starts with a slash, it's a relative path to the server root
            oldPicturePath = path.join(__dirname, '..', user.profilePicture);
          } else {
            // Otherwise might be just a filename in the uploads directory
            oldPicturePath = path.join(__dirname, '../public/uploads/profile', user.profilePicture);
          }
          
          console.log('Checking old picture path:', oldPicturePath);
          
          // Delete the old file if it exists and is not a default avatar
          if (!user.profilePicture.includes('default') && fs.existsSync(oldPicturePath)) {
            console.log('Deleting old profile picture');
            fs.unlinkSync(oldPicturePath);
          }
        } catch (err) {
          console.error('Error deleting old profile picture:', err);
          // Continue even if deletion fails
        }
      }
      
      // Set new profile picture path (relative to server root)
      const relativePath = `/public/uploads/profile/${req.file.filename}`;
      console.log('Setting new profile picture path:', relativePath);
      user.profilePicture = relativePath;
    }
    
    await user.save();
    
    // Get server base URL from request
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:4000';
    const baseUrl = `${protocol}://${host}`;
    
    // Construct both types of URLs that the client might need
    let profilePictureUrl = null;
    let fullProfilePictureUrl = null;
    
    if (user.profilePicture) {
      // Create a URL without the /api prefix for direct file access
      profilePictureUrl = `${baseUrl}${user.profilePicture}`;
      
      // Create a URL with the /api prefix for API-based file access
      fullProfilePictureUrl = user.profilePicture.startsWith('/public') 
        ? `${baseUrl}/api${user.profilePicture}`  // Add /api for public files if needed
        : profilePictureUrl;
      
      console.log('Profile picture URLs:');
      console.log('- Relative path:', user.profilePicture);
      console.log('- Direct URL:', profilePictureUrl);
      console.log('- API URL:', fullProfilePictureUrl);
    }
    
    // Return user data with all URL variants
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      // Return all URL variations to help client handle different server configurations
      profilePicture: user.profilePicture,
      profilePictureUrl: profilePictureUrl,
      fullProfilePictureUrl: fullProfilePictureUrl
    };
    
    console.log('Profile updated successfully');
    
    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password - Request reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address' });
    }
    
    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = Date.now() + 3600000; // 1 hour from now
    
    // Save the code and expiration to the user
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetCodeExpires;
    await user.save();
    
    // Create dummy user object for email compatibility
    const dummyUser = {
      name: user.name || 'User'
    };
    
    // Create verification URL - not used but required by function
    const verificationUrl = `${req.protocol}://${req.get('host')}/reset-password`;
    
    // Send email with the reset code
    const subject = 'CodeMentor Password Reset';
    const text = `Your password reset code is: ${resetCode}. This code will expire in 1 hour.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6366F1; text-align: center;">CodeMentor Password Reset</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>We received a request to reset your password. Please use the following code to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px 15px; border-radius: 5px; letter-spacing: 5px;">${resetCode}</span>
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>The CodeMentor Team</p>
      </div>
    `;
    
    // Send email using the method available in email.js
    const emailResult = await sendEmail({
      to: email,
      subject,
      text,
      html
    });
    
    console.log('Password reset email sent:', emailResult);
    
    res.status(200).json({ message: 'Password reset code has been sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify reset code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    
    if (!email || !resetCode) {
      return res.status(400).json({ message: 'Email and reset code are required' });
    }
    
    const user = await User.findOne({ 
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    res.status(200).json({ message: 'Reset code verified successfully' });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password with code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code and new password are required' });
    }
    
    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const user = await User.findOne({ 
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    // Assign the plain new password; pre('save') hook will hash it
    user.password = newPassword;
    
    // Clear the reset code fields
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 