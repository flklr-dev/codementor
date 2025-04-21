const axios = require('axios');
require('dotenv').config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2'; // More stable model

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Sleep function for retry delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced query type detection using more sophisticated patterns
function detectQueryType(message) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      type: 'unclear',
      response: "I'm not sure I understand your question. Could you please provide more details?"
    };
  }

  const messageLower = message.toLowerCase().trim();
  
  // NLU-inspired pattern detection with context awareness
  const patterns = {
    // Special categories with direct responses
    greeting: {
      // More precise greeting detection to avoid false positives
      exactPhrases: ['^hi$', '^hey$', '^hello$', '^hi there$', '^hey there$', '^hello there$'],
      startPhrases: ['^hi\\s', '^hey\\s', '^hello\\s', '^greetings\\s'],
      response: "I can assist you with:\n\n• Code explanations and concepts\n• Debugging and troubleshooting\n• Best practices and design patterns\n• Learning paths and resources\n• Project architecture and implementation\n\nWhat would you like to learn about today?"
    },
    unclear: {
      patterns: [/^[^a-zA-Z0-9\s]+$/, /^[?]+$/, /^[a-zA-Z]{1,3}$/],
      response: "I'm not sure I understand your question. Could you please rephrase it? I can help with:\n\n• Programming concepts and languages\n• Code debugging and optimization\n• Software architecture and design\n• Learning resources and tutorials\n• Best practices and coding standards"
    },
    nonCoding: {
      keywords: ['joke', 'name', 'who are you', 'tell me about yourself', 'how are you'],
      response: "I'm CodeMentor, your programming assistant focused on helping with code-related questions rather than general conversation. I can assist with:\n\n• Programming languages and frameworks\n• Debugging and troubleshooting\n• Design patterns and best practices\n• Learning resources for developers\n• Software architecture and implementation"
    },
    
    // Classification categories for specialized responses
    codeExplanation: {
      keywords: ['what is', 'explain', 'how does', 'tell me about', 'meaning of', 'concept of', 'understand'],
      patternWeight: 1.5,
      type: 'explanation'
    },
    debugging: {
      keywords: ['error', 'bug', 'not working', 'undefined', 'failed', 'exception', 'fix', 'problem', 'issue', 'debug', 'troubleshoot'],
      patternWeight: 2.0,
      type: 'debugging'
    },
    codeGeneration: {
      keywords: ['generate', 'create', 'write', 'make', 'build', 'show me', 'implement', 'code', 'develop', 'how to'],
      patternWeight: 1.8,
      type: 'generation'
    },
    projectGuidance: {
      keywords: ['structure', 'architecture', 'design', 'best practice', 'recommend', 'organize', 'pattern', 'approach'],
      patternWeight: 1.3,
      type: 'guidance'
    },
    careerAdvice: {
      keywords: ['learn', 'career', 'path', 'roadmap', 'portfolio', 'interview', 'job', 'skill', 'study'],
      patternWeight: 1.0,
      type: 'career'
    }
  };

  // Check for exact greeting matches with more precise logic
  // Only detect greetings if they are standalone or start the message
  let isSimpleGreeting = false;
  
  // Check exact phrases like "hi", "hey", "hello"
  if (patterns.greeting.exactPhrases.some(phrase => {
    const regex = new RegExp(phrase);
    return regex.test(messageLower);
  })) {
    isSimpleGreeting = true;
  }
  
  // Check start phrases like "hi ", "hey ", "hello "
  if (!isSimpleGreeting && patterns.greeting.startPhrases.some(phrase => {
    const regex = new RegExp(phrase);
    return regex.test(messageLower);
  })) {
    // Make sure it's not a coding question that happens to start with a greeting
    if (!messageLower.includes('code') && 
        !messageLower.includes('program') && 
        !messageLower.includes('function') && 
        !messageLower.includes('write') && 
        !messageLower.includes('create') &&
        !messageLower.includes('implement') &&
        !messageLower.includes('develop')) {
      isSimpleGreeting = true;
    }
  }
  
  if (isSimpleGreeting) {
    return patterns.greeting;
  }
  
  // Check for unclear patterns
  if (patterns.unclear.patterns.some(pattern => pattern.test(messageLower))) {
    return patterns.unclear;
  }

  // Check for non-coding queries
  if (patterns.nonCoding.keywords.some(keyword => messageLower.includes(keyword)) && 
      !messageLower.includes('code') && 
      !messageLower.includes('program')) {
    return patterns.nonCoding;
  }

  // Score-based categorization for other query types
  const scores = {};
  for (const [category, data] of Object.entries(patterns)) {
    if (data.keywords && data.type) {
      scores[category] = data.keywords.filter(keyword => 
        messageLower.includes(keyword)
      ).length * (data.patternWeight || 1);
    }
  }

  // Add some context-awareness for specific programming tasks
  if (messageLower.includes('write') || messageLower.includes('create') || messageLower.includes('implement')) {
    scores.codeGeneration += 2.0;
  }
  
  if (messageLower.includes('explain') || messageLower.includes('what is')) {
    scores.codeExplanation += 1.5;
  }
  
  if (messageLower.includes('fix') || messageLower.includes('error') || messageLower.includes('bug')) {
    scores.debugging += 2.0;
  }

  // Find the category with the highest score
  let highestCategory = 'codeExplanation'; // Default
  let highestScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      highestCategory = category;
    }
  }
  
  return patterns[highestCategory];
}

// Enhanced skill level detection with better context awareness
function determineSkillLevel(context) {
  if (!context || typeof context !== 'string' || context.trim().length === 0) {
    return 'beginner';
  }
  
  const contextLower = context.toLowerCase();
  
  // Define indicator keywords with weights
  const indicators = {
    beginner: {
      keywords: ['basic', 'simple', 'explain', 'what is', 'how do i', 'start', 'beginner', 'new to', 'learning', 'fundamentals'],
      weight: 1.0
    },
    intermediate: {
      keywords: ['optimize', 'improve', 'better', 'alternative', 'best practice', 'efficient', 'refactor', 'pattern', 'clean code'],
      weight: 1.2
    },
    advanced: {
      keywords: ['advanced', 'complex', 'performance', 'architecture', 'scaling', 'production', 'enterprise', 'security', 'concurrency', 'optimization'],
      weight: 1.5
    }
  };

  // Calculate weighted scores for each level
  const scores = {};
  
  for (const [level, data] of Object.entries(indicators)) {
    const matches = data.keywords.filter(keyword => contextLower.includes(keyword)).length;
    scores[level] = matches * data.weight;
  }

  // Find the level with the highest score
  let highestLevel = 'beginner';
  let highestScore = 0;
  
  for (const [level, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      highestLevel = level;
    }
  }

  return highestLevel;
}

// Dynamic prompt generation with optimized length based on query type
function generatePrompt(message, context, skillLevel, queryType) {
  // Core instructions that apply to all prompts
  const basePrompt = `You are a professional coding mentor. Provide concise, helpful responses.

Question: ${message}`;

  // Skip detailed prompt for special response types
  if (queryType.response) {
    return queryType.response;
  }

  // Define specific prompt additions based on query type
  const queryGuidelines = {
    explanation: `Provide brief, clear explanations with minimal examples. Focus only on essential concepts.`,
    debugging: `Identify key issues and suggest fixes with minimal explanation. Be direct and to the point.`,
    generation: `Write clean, minimal code that solves the request. Include only essential comments. Do not explain how to run the code unless specifically asked. Provide only the code with minimal surrounding text.`,
    guidance: `Provide concise, actionable advice focusing on crucial points. Avoid lengthy explanations.`,
    career: `Give direct, practical advice without unnecessary elaboration.`
  };

  // Adjust prompt based on skill level
  const skillGuidelines = {
    beginner: `Keep explanations simple and minimal. Avoid unnecessary details.`,
    intermediate: `Skip basic explanations. Focus on the core solution.`,
    advanced: `Provide expert-level solutions with minimal explanation.`
  };

  // Build a concise but effective prompt
  const prompt = `${basePrompt}

Key requirements:
- ${queryGuidelines[queryType.type]}
- ${skillGuidelines[skillLevel]}
- Use code blocks with appropriate language specification
- BE CONCISE. Avoid detailed explanations about running the code or how it works unless explicitly asked
- For code generation, provide ONLY the code solution with minimal introduction
- Minimize code comments to only what's absolutely necessary
- No need to explain the obvious parts of the code
- Skip explanations about compiling, running, or installing unless specifically asked

Response:`;

  return prompt;
}

// Improved API request with enhanced error handling
async function makeAPIRequest(prompt, retryCount = 0) {
  try {
    console.log(`Making API request with ${prompt.length} characters`);
    
    const response = await axios.post(
      'https://api.together.xyz/inference',
      {
        model: MODEL_ID,
        prompt: prompt,
        max_tokens: 600,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: 1.1,
        stop: ['</s>', 'Human:', 'Assistant:', '\n\n\n'],
      },
      {
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response;
  } catch (error) {
    // Enhanced error handling with more specific retry logic
    if (retryCount < MAX_RETRIES) {
      if (error.response?.status === 429) {
        console.log(`Rate limit exceeded, retrying (${retryCount + 1}/${MAX_RETRIES}) after delay...`);
        await sleep(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
        return makeAPIRequest(prompt, retryCount + 1);
      } else if (error.response?.status === 500 || error.response?.status === 503) {
        console.log(`Server error, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return makeAPIRequest(prompt, retryCount + 1);
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.log(`Request timeout, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await sleep(RETRY_DELAY * (retryCount +.5));
        return makeAPIRequest(prompt, retryCount + 1);
      }
    }
    
    // Log the error for debugging
    console.error('API request error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    });
    
    throw error;
  }
}

// Main response generation function with improved error handling
async function generateAIResponse(message, context = '') {
  try {
    // Input validation and length limits
    if (!message || typeof message !== 'string') {
      return "Please provide a valid question or request.";
    }
    
    // Handle excessive message length (limit to ~300 lines or ~10000 chars)
    const MAX_CHARS = 10000;
    const MAX_LINES = 300;
    let processedMessage = message;
    
    // Check if message exceeds line limit
    const lineCount = (message.match(/\n/g) || []).length + 1;
    if (lineCount > MAX_LINES) {
      console.log(`Message too long (${lineCount} lines). Trimming to ${MAX_LINES} lines...`);
      const lines = message.split('\n');
      // Keep first 2/3 and last 1/3 of allowed lines to maintain context
      const keepStart = Math.floor(MAX_LINES * 0.67);
      const keepEnd = MAX_LINES - keepStart;
      processedMessage = [
        ...lines.slice(0, keepStart),
        `\n[... ${lineCount - MAX_LINES} more lines omitted for length ...]\n`,
        ...lines.slice(-keepEnd)
      ].join('\n');
    }
    
    // Check if processed message still exceeds character limit
    if (processedMessage.length > MAX_CHARS) {
      console.log(`Message too long (${processedMessage.length} chars). Trimming to ${MAX_CHARS} chars...`);
      const keepStart = Math.floor(MAX_CHARS * 0.67);
      const keepEnd = MAX_CHARS - keepStart - 50; // 50 chars for the indicator
      processedMessage = 
        processedMessage.substring(0, keepStart) + 
        `\n[... ${processedMessage.length - MAX_CHARS} characters omitted for length ...]\n` + 
        processedMessage.substring(processedMessage.length - keepEnd);
    }
    
    // Detect query type with improved detection
    const queryType = detectQueryType(processedMessage);
    console.log('Detected query type:', queryType.type || 'special response');
    console.log(`Processing message [${processedMessage.length} chars, ~${(processedMessage.match(/\n/g) || []).length + 1} lines]`);

    // Handle special response cases
    if (queryType.response) {
      return queryType.response;
    }

    // Determine user skill level
    const skillLevel = determineSkillLevel(context);
    console.log('Determined skill level:', skillLevel);

    // Generate optimized prompt
    const prompt = generatePrompt(processedMessage, context, skillLevel, queryType);

    // Make API request with retry logic
    const response = await makeAPIRequest(prompt);

    // Process the response
    let generatedText = '';
    
    // Handle different response formats
    if (response.data.output?.choices?.[0]) {
      generatedText = response.data.output.choices[0].text;
    } else if (response.data.output?.text) {
      generatedText = response.data.output.text;
    } else if (response.data.choices?.[0]) {
      generatedText = response.data.choices[0].text;
    } else if (response.data.text) {
      generatedText = response.data.text;
    } else {
      throw new Error('Unexpected API response format');
    }
    
    // Clean up the response
    generatedText = generatedText
      .replace(prompt, '')
      .replace(/^Assistant:|^Human:|^System:/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    // Ensure code blocks have language specification without hardcoding javascript
    generatedText = generatedText.replace(/```(\s*)(?!\w+)/g, (match) => {
      // Detect language from context if possible
      const languageHints = {
        python: /python|django|flask|numpy|pandas|scipy/i,
        javascript: /javascript|js|node|react|vue|angular/i,
        typescript: /typescript|ts|angular|react|vue/i,
        java: /java|spring|hibernate|android/i,
        ruby: /ruby|rails/i,
        csharp: /c#|csharp|\.net|asp\.net/i,
        php: /php|laravel|symfony/i,
        go: /golang|go lang/i,
        rust: /rust|cargo/i,
        swift: /swift|ios|xcode/i,
        kotlin: /kotlin|android/i,
        html: /html|markup/i,
        css: /css|scss|sass|style/i,
        sql: /sql|database|query/i,
      };
      
      let detectedLanguage = '';
      
      for (const [lang, pattern] of Object.entries(languageHints)) {
        if (pattern.test(processedMessage) || pattern.test(context || '')) {
          detectedLanguage = lang;
          break;
        }
      }
      
      return `\`\`\`${detectedLanguage || 'code'}\n`;
    });

    // Fallback for empty responses
    if (!generatedText || generatedText.length < 10) {
      generatedText = "I apologize, but I couldn't generate a proper response. Please try rephrasing your question or ask something more specific.";
    }
    
    return generatedText;
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    
    // Enhanced error handling with more specific error messages
    if (error.response?.status === 400) {
      throw new Error('The request was invalid. This might be due to an issue with your input or the API configuration.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please check your API key configuration.');
    } else if (error.response?.status === 402) {
      throw new Error('API quota exceeded. Please check your API usage limits.');
    } else if (error.response?.status === 429) {
      throw new Error('You\'ve sent too many requests in a short period. Please try again in a few moments.');
    } else if (error.response?.status >= 500) {
      throw new Error('The AI service is currently experiencing issues. Please try again later.');
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('The request timed out. This might be due to high server load or connectivity issues.');
    } else {
      throw new Error(`Failed to generate a response: ${error.message}`);
    }
  }
}

module.exports = {
  generateAIResponse,
  // Export internal functions for testing
  _internal: {
    detectQueryType,
    determineSkillLevel,
    generatePrompt
  }
}; 