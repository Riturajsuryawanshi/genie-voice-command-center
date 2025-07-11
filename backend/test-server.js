const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test GPT chat endpoint (without OpenAI for now)
app.post('/api/gpt/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    console.log('Received message:', message);

    // Simulate AI response for testing
    const responses = [
      `I understand you said: "${message}". That's interesting! How can I help you with that?`,
      `You mentioned: "${message}". I'd love to help you with that. What specific information are you looking for?`,
      `Great question about: "${message}". Let me think about the best way to help you with this.`,
      `Thank you for sharing: "${message}". How can I assist you further with this topic?`,
      `I caught that you said: "${message}". This sounds important. What would you like to know more about?`
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];

    console.log('Sending response:', response);

    res.json({ 
      success: true, 
      response 
    });

  } catch (error) {
    console.error('Error:', error);
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
    message: 'Test Backend API is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Test Backend API running on port ${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 GPT endpoint: http://localhost:${PORT}/api/gpt/chat`);
}); 