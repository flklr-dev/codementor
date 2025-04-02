const express = require('express');
const auth = require('../middleware/auth');
const { generateAIResponse } = require('../services/ai');
const router = express.Router();

// AI mentor response endpoint
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, context);
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI mentor error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

module.exports = router; 