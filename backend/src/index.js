const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const webhookRoutes = require('./routes/webhook');
const gptRoutes = require('./routes/gpt');
const sttRoutes = require('./routes/stt');
const ttsRoutes = require('./routes/tts');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/gpt', gptRoutes);
app.use('/api/stt', sttRoutes);
app.use('/api/tts', ttsRoutes);

// Health check endpoint
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 SAATHI Backend API running on port ${PORT}`);
  console.log(`📞 Webhook endpoint: http://localhost:${PORT}/api/webhook/webhook`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/webhook/test`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
}); 