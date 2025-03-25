const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateAIResponse = async (message, context = []) => {
  try {
    // Format conversation history for OpenAI
    const messages = [
      { role: 'system', content: 'You are a helpful coding mentor. Your task is to guide the user in learning to code, provide helpful feedback, and answer programming questions in a clear, friendly manner.' },
      ...context,
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

module.exports = { generateAIResponse }; 