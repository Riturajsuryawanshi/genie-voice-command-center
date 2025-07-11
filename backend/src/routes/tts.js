const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { generateSpeech, generateSpeechElevenLabs, getAvailableVoices, cleanupAudioFile } = require('../services/tts');

const router = express.Router();

/**
 * POST /api/tts/synthesize - Convert text to speech
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voice = 'nova', provider = 'openai' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    console.log('TTS Request:', {
      textLength: text.length,
      voice,
      provider
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1E9);
    const filename = `tts-${timestamp}-${randomId}.mp3`;
    const outputPath = path.join(__dirname, '../../uploads/processed', filename);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(outputPath));

    let result;
    
    if (provider === 'elevenlabs') {
      result = await generateSpeechElevenLabs(text, outputPath);
    } else {
      result = await generateSpeech(text, outputPath, voice);
    }

    if (result.success) {
      console.log('TTS Generation successful:', {
        filePath: result.filePath,
        duration: result.duration
      });

      // Read the file and send it as response
      const audioBuffer = await fs.readFile(result.filePath);
      
      // Set appropriate headers
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      });

      // Send the audio file
      res.send(audioBuffer);

      // Clean up the file after sending
      setTimeout(() => {
        cleanupAudioFile(result.filePath).catch(console.error);
      }, 1000);

    } else {
      console.error('TTS Generation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'TTS generation failed'
      });
    }

  } catch (error) {
    console.error('TTS endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/tts/voices - Get available voices
 */
router.get('/voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    
    return res.json({
      success: true,
      voices
    });
  } catch (error) {
    console.error('Error getting voices:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get available voices'
    });
  }
});

/**
 * GET /api/tts/health - Health check for TTS service
 */
router.get('/health', async (req, res) => {
  try {
    return res.json({
      success: true,
      status: 'healthy',
      service: 'TTS',
      providers: ['openai', 'elevenlabs'],
      defaultVoice: 'nova'
    });
  } catch (error) {
    console.error('TTS Health check failed:', error);
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router; 