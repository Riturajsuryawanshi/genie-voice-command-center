const OpenAI = require('openai');
const supabase = require('../config/supabase');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get user conversation history from Supabase
 * @param {string} userId - User ID
 * @param {number} limit - Number of recent messages to fetch
 * @returns {Promise<Array>}
 */
async function getUserHistory(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('conversation_logs')
      .select('user_message, ai_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user history:', error);
    return [];
  }
}

/**
 * Get user context from Supabase
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<Object>}
 */
async function getUserContext(phoneNumber) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone_number, preferences')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) {
      console.error('Error fetching user context:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return null;
  }
}

/**
 * Generate AI response using GPT with context and memory
 * @param {string} userMessage - User's transcribed message
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<{ success: boolean, response?: string, error?: string }>}
 */
async function generateResponse(userMessage, phoneNumber) {
  try {
    // Get user context
    const userContext = await getUserContext(phoneNumber);
    if (!userContext) {
      return { 
        success: false, 
        error: 'User not found' 
      };
    }

    // Get conversation history
    const history = await getUserHistory(userContext.id, 5);
    
    // Build conversation context
    let conversationContext = '';
    if (history.length > 0) {
      conversationContext = history.reverse().map(log => 
        `User: ${log.user_message}\nSAATHI: ${log.ai_response}`
      ).join('\n\n');
    }

    // Build system prompt with user context
    const systemPrompt = `You are SAATHI, an AI voice assistant for CallGenie. 

User Context:
- Name: ${userContext.name || 'Unknown'}
- Phone: ${userContext.phone_number}

Instructions:
1. Be conversational, friendly, and helpful
2. Keep responses concise (under 100 words) for voice interaction
3. Use natural, spoken language
4. If this is a new conversation, introduce yourself briefly
5. Remember previous context from the conversation history
6. If the user asks about CallGenie services, provide relevant information
7. If unsure, ask clarifying questions

Previous conversation:
${conversationContext}

Current user message: "${userMessage}"

Respond naturally as SAATHI:`;

    // Generate response using GPT
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      return { 
        success: false, 
        error: 'Failed to generate response' 
      };
    }

    return { 
      success: true, 
      response,
      userId: userContext.id
    };

  } catch (error) {
    console.error('GPT response generation error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate response' 
    };
  }
}

/**
 * Save conversation log to Supabase
 * @param {string} userId - User ID
 * @param {string} userMessage - User's message
 * @param {string} aiResponse - AI's response
 * @returns {Promise<boolean>}
 */
async function saveConversationLog(userId, userMessage, aiResponse) {
  try {
    const { error } = await supabase
      .from('conversation_logs')
      .insert({
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving conversation log:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving conversation log:', error);
    return false;
  }
}

module.exports = { 
  generateResponse, 
  saveConversationLog, 
  getUserContext,
  getUserHistory 
}; 