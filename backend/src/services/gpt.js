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
 * Generate AI response using GPT with enhanced voice-to-voice features
 * @param {string} userMessage - User's transcribed message
 * @param {string} phoneNumber - User's phone number
 * @param {Object} options - Additional options for enhanced chat
 * @returns {Promise<{ success: boolean, response?: string, error?: string, conversationId?: string }>}
 */
async function generateResponse(userMessage, phoneNumber, options = {}) {
  try {
    const { conversationHistory = '', voiceMode = 'voice', userContext = {} } = options;
    
    // Get user context from database or use provided context
    let dbUserContext = null;
    if (!userContext.name) {
      dbUserContext = await getUserContext(phoneNumber);
    }
    
    const finalUserContext = {
      name: userContext.name || dbUserContext?.name || 'User',
      phoneNumber: phoneNumber,
      preferences: dbUserContext?.preferences || {}
    };

    // Build enhanced system prompt for voice-to-voice interaction
    const systemPrompt = `You are SAATHI, an advanced AI voice assistant for CallGenie, designed for natural voice-to-voice conversations.

User Context:
- Name: ${finalUserContext.name}
- Phone: ${finalUserContext.phoneNumber}
- Mode: ${voiceMode === 'voice' ? 'Voice Conversation' : 'Text Chat'}

Instructions for Voice-to-Voice Interaction:
1. Be conversational, friendly, and engaging - like talking to a helpful friend
2. Keep responses natural and spoken (not written text)
3. Use contractions and casual language appropriate for voice
4. Keep responses concise (50-80 words) for comfortable voice interaction
5. Show enthusiasm and personality in your responses
6. Ask follow-up questions to keep the conversation flowing
7. If the user asks about CallGenie services, provide helpful information
8. Use conversational phrases like "That's interesting!", "I'd love to help with that", etc.
9. If unsure, ask clarifying questions in a friendly way
10. Remember context from the conversation history

Previous conversation:
${conversationHistory}

Current user message: "${userMessage}"

Respond naturally as SAATHI in a conversational voice style:`;

    // Generate response using GPT with enhanced settings
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: voiceMode === 'voice' ? 120 : 200, // Shorter for voice
      temperature: 0.8, // Slightly more creative for voice
      presence_penalty: 0.1, // Encourage more engaging responses
      frequency_penalty: 0.1, // Reduce repetition
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      return { 
        success: false, 
        error: 'Failed to generate response' 
      };
    }

    // Save conversation log if user context is available
    if (dbUserContext?.id) {
      await saveConversationLog(dbUserContext.id, userMessage, response);
    }

    return { 
      success: true, 
      response,
      userId: dbUserContext?.id,
      conversationId: Date.now().toString()
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