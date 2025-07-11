const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple GPT chat endpoint
app.post('/api/gpt/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    console.log('GPT Request:', { message: message.substring(0, 100) + '...' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are SAATHI, a helpful AI assistant. Be friendly and conversational.' },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate response' 
      });
    }

    console.log('GPT Response:', { response: response.substring(0, 100) + '...' });

    res.json({ 
      success: true, 
      response 
    });

  } catch (error) {
    console.error('GPT endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SAATHI Backend API is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 SAATHI Backend API running on port ${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 GPT endpoint: http://localhost:${PORT}/api/gpt/chat`);
}); 