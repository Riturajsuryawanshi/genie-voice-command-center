const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'SAATHI Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SAATHI Backend API is running',
    timestamp: new Date().toISOString(),
    services: {
      auth: 'active',
      webhook: 'active',
      whisper: 'active',
      gpt: 'active',
      tts: 'active'
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 SAATHI Test Server running on port ${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
}); 