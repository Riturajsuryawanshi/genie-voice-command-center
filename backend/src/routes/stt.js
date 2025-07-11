const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { transcribeAudio } = require('../services/whisper');

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/audio');
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `stt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept common audio formats
    const allowedTypes = /mp3|wav|m4a|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * POST /api/stt/transcribe - Transcribe audio file to text
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    console.log('STT Request:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Transcribe the audio file
    const result = await transcribeAudio(req.file.path);

    // Clean up the uploaded file
    await fs.remove(req.file.path);

    if (result.success) {
      console.log('STT Transcription successful:', {
        textLength: result.text?.length || 0,
        confidence: result.confidence
      });

      return res.json({
        success: true,
        text: result.text,
        confidence: result.confidence
      });
    } else {
      console.error('STT Transcription failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Transcription failed'
      });
    }

  } catch (error) {
    console.error('STT endpoint error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      await fs.remove(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/stt/health - Health check for STT service
 */
router.get('/health', async (req, res) => {
  try {
    return res.json({
      success: true,
      status: 'healthy',
      service: 'STT (Whisper)',
      supportedFormats: ['mp3', 'wav', 'm4a', 'webm', 'ogg']
    });
  } catch (error) {
    console.error('STT Health check failed:', error);
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router; 