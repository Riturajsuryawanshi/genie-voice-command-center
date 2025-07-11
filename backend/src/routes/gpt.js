const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/gpt');

/**
 * POST /api/gpt/chat - Enhanced chat endpoint for voice-to-voice conversations
 */
router.post('/chat', async (req, res) => {
  try {
    const { 
      message, 
      conversationHistory = '', 
      voiceMode = 'voice',
      userContext = {}
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log('GPT Chat Request:', {
      message: message.substring(0, 100) + '...',
      voiceMode,
      userContext: userContext.name || 'Unknown'
    });

    // Generate enhanced response using GPT
    const result = await generateResponse(message, userContext.phoneNumber || '+91-9876543210', {
      conversationHistory,
      voiceMode,
      userContext
    });

    if (result.success) {
      console.log('GPT Response generated successfully');
      return res.json({
        success: true,
        response: result.response,
        conversationId: result.conversationId
      });
    } else {
      console.error('GPT Response failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate response'
      });
    }

  } catch (error) {
    console.error('GPT Chat endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/gpt/health - Health check for GPT service
 */
router.get('/health', async (req, res) => {
  try {
    // Test GPT connection with a simple prompt
    const testResult = await generateResponse('Hello', '+91-9876543210', {
      conversationHistory: '',
      voiceMode: 'chat',
      userContext: { name: 'Test User' }
    });

    return res.json({
      success: true,
      status: 'healthy',
      gptWorking: testResult.success
    });
  } catch (error) {
    console.error('GPT Health check failed:', error);
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router; 