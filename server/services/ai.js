const axios = require('axios');
require('dotenv').config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2'; // More stable model

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Sleep function for retry delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Query type detection
function detectQueryType(message) {
  const queryTypes = {
    greeting: {
      patterns: ['hi', 'hello', 'hey', 'greetings'],
      response: "Hey there! 👋 I'm your coding mentor. What would you like to learn about today? I can help with:\n• Code explanations\n• Debugging\n• Best practices\n• Project ideas\n• Learning paths"
    },
    unclear: {
      patterns: [/^[^a-zA-Z0-9\s]+$/, /^[?]+$/, /^[a-zA-Z]{1,3}$/],
      response: "I'm not sure what you mean. Try asking me about:\n• How to write code\n• Debugging issues\n• Learning programming\n• Project ideas\n• Best practices"
    },
    nonCoding: {
      patterns: ['joke', 'name', 'who are you', 'tell me about yourself'],
      response: "I'm CodeMentor AI, your coding tutor! While I can chat, I'm best at helping you with programming. Need help with:\n• JavaScript, Python, or other languages\n• Debugging code\n• Building projects\n• Learning new frameworks"
    },
    codeExplanation: {
      patterns: ['what is', 'explain', 'how does', 'tell me about', 'meaning of'],
      type: 'explanation'
    },
    debugging: {
      patterns: ['error', 'bug', 'not working', 'undefined', 'failed', 'exception'],
      type: 'debugging'
    },
    codeGeneration: {
      patterns: ['generate', 'create', 'write', 'make', 'build', 'show me'],
      type: 'generation'
    },
    projectGuidance: {
      patterns: ['structure', 'architecture', 'design', 'best practice', 'recommend'],
      type: 'guidance'
    },
    careerAdvice: {
      patterns: ['learn', 'career', 'path', 'roadmap', 'portfolio', 'interview'],
      type: 'career'
    }
  };

  const messageLower = message.toLowerCase();
  
  // Check for greeting patterns
  if (queryTypes.greeting.patterns.some(pattern => messageLower.includes(pattern))) {
    return queryTypes.greeting;
  }

  // Check for unclear patterns
  if (queryTypes.unclear.patterns.some(pattern => pattern.test(messageLower))) {
    return queryTypes.unclear;
  }

  // Check for non-coding patterns
  if (queryTypes.nonCoding.patterns.some(pattern => messageLower.includes(pattern))) {
    return queryTypes.nonCoding;
  }

  // Check for other query types
  for (const [type, data] of Object.entries(queryTypes)) {
    if (data.patterns && data.type) {
      if (data.patterns.some(pattern => messageLower.includes(pattern))) {
        return data;
      }
    }
  }

  // Default to code explanation if no specific type is detected
  return queryTypes.codeExplanation;
}

// Determine user skill level based on context
function determineSkillLevel(context) {
  if (!context) return 'beginner';
  
  const indicators = {
    beginner: ['basic', 'simple', 'explain', 'what is', 'how do i', 'start', 'beginner'],
    intermediate: ['optimize', 'improve', 'better', 'alternative', 'best practice'],
    advanced: ['advanced', 'complex', 'performance', 'architecture', 'scaling', 'production']
  };

  const contextLower = context.toLowerCase();
  let skillLevel = 'beginner';
  let maxMatches = 0;

  for (const [level, keywords] of Object.entries(indicators)) {
    const matches = keywords.filter(keyword => contextLower.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      skillLevel = level;
    }
  }

  return skillLevel;
}

// Generate appropriate prompt based on query type and skill level
function generatePrompt(message, context, skillLevel, queryType) {
  const basePrompt = `You are an expert coding mentor. Provide clear, concise, and helpful responses with code examples in markdown blocks.

Previous context: ${context}
Current question: ${message}

Guidelines:
- Keep responses under 3-4 sentences for basic concepts
- Use markdown code blocks with language specification
- Focus on the most important information
- Be direct and to the point
- Include only one code example when relevant
- Avoid lengthy explanations unless specifically asked`;

  const queryTypeGuidelines = {
    explanation: `
Additional guidelines for code explanation:
- Provide a brief, clear definition
- Include one simple code example
- Focus on key concepts only
- Avoid lengthy analogies
- Keep it under 2-3 paragraphs`,
    
    debugging: `
Additional guidelines for debugging:
- Identify the root cause quickly
- Provide a concise solution
- Include one code example if needed
- Focus on the most common fixes
- Keep explanations brief`,
    
    generation: `
Additional guidelines for code generation:
- Provide one complete, working example
- Include essential comments only
- Focus on the main functionality
- Keep code concise and readable
- Avoid unnecessary complexity`,
    
    guidance: `
Additional guidelines for project guidance:
- Provide key points only
- Focus on essential decisions
- Include one example if relevant
- Keep recommendations brief
- Prioritize most important aspects`,
    
    career: `
Additional guidelines for career advice:
- Provide key steps only
- Focus on essential resources
- Keep recommendations concise
- Include one practical example
- Prioritize most important tips`
  };

  const skillSpecificGuidelines = {
    beginner: `
Additional guidelines for beginner:
- Use simple language
- Include one basic example
- Focus on core concepts
- Keep explanations short
- Avoid technical jargon`,
    
    intermediate: `
Additional guidelines for intermediate:
- Focus on key concepts
- Include one practical example
- Keep explanations concise
- Use technical terms appropriately
- Focus on best practices`,
    
    advanced: `
Additional guidelines for advanced:
- Focus on key insights
- Include one advanced example
- Keep explanations brief
- Use precise technical terms
- Focus on optimization`
  };

  // If it's a special response type (greeting, unclear, nonCoding), return the predefined response
  if (queryType.response) {
    return queryType.response;
  }

  return `${basePrompt}${queryTypeGuidelines[queryType.type]}${skillSpecificGuidelines[skillLevel]}

Response:`;
}

async function makeAPIRequest(prompt, retryCount = 0) {
  try {
    const response = await axios.post(
      'https://api.together.xyz/inference',
      {
        model: MODEL_ID,
        prompt: prompt,
        max_tokens: 500, // Reduced for more concise responses
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: 1.1,
        stop: ['</s>', 'Human:', 'Assistant:', '\n\n\n'], // Added extra stop token
      },
      {
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES && 
        (error.response?.status === 429 || error.response?.status === 500)) {
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return makeAPIRequest(prompt, retryCount + 1);
    }
    throw error;
  }
}

async function generateAIResponse(message, context = '') {
  try {
    // Detect query type
    const queryType = detectQueryType(message);
    console.log('Detected query type:', queryType);

    // If it's a special response type, return the predefined response
    if (queryType.response) {
      return queryType.response;
    }

    // Determine user skill level
    const skillLevel = determineSkillLevel(context);
    console.log('Determined skill level:', skillLevel);

    // Generate appropriate prompt
    const prompt = generatePrompt(message, context, skillLevel, queryType);

    // Make API request with retry logic
    const response = await makeAPIRequest(prompt);

    // Log the response for debugging
    console.log('Together AI API Response:', JSON.stringify(response.data, null, 2));

    // Check for API errors
    if (response.data.error) {
      console.error('Together AI API error:', response.data.error);
      throw new Error(response.data.error);
    }

    // Extract and clean the generated response
    let generatedText = '';
    
    // Handle different response formats
    if (response.data.output && response.data.output.choices && response.data.output.choices[0]) {
      generatedText = response.data.output.choices[0].text;
    } else if (response.data.output && response.data.output.text) {
      generatedText = response.data.output.text;
    } else if (response.data.choices && response.data.choices[0]) {
      generatedText = response.data.choices[0].text;
    } else if (response.data.text) {
      generatedText = response.data.text;
    } else {
      throw new Error('Unexpected API response format');
    }
    
    // Remove the prompt from the response
    generatedText = generatedText.replace(prompt, '').trim();
    
    // Clean up any remaining artifacts
    generatedText = generatedText
      .replace(/^Assistant:|^Human:|^System:/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    // Ensure code blocks are properly formatted
    generatedText = generatedText.replace(/```(\w+)?\n/g, (match, lang) => {
      return `\`\`\`${lang || 'javascript'}\n`;
    });

    // If the response is too short or empty, provide a fallback
    if (!generatedText || generatedText.length < 10) {
      generatedText = "I apologize, but I couldn't generate a proper response. Please try rephrasing your question or ask something more specific.";
    }
    
    return generatedText;
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Log the full error details
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    
    // Provide more specific error messages
    if (error.response?.status === 402) {
      throw new Error('API quota exceeded. Please try again later or contact support.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your Together AI API key configuration.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    } else if (error.response?.status === 500) {
      throw new Error('Together AI service is currently unavailable. Please try again later.');
    } else {
      throw new Error('Failed to generate AI response. Please try again later.');
    }
  }
}

module.exports = {
  generateAIResponse,
}; 