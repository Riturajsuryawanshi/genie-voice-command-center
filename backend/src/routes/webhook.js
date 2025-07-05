const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { transcribeFromUrl } = require('../services/whisper');
const { generateResponse, saveConversationLog } = require('../services/gpt');
const { generateSpeech, cleanupAudioFile } = require('../services/tts');

/**
 * POST /webhook - Handle incoming call webhook from Exotel
 * Expected payload from Exotel:
 * {
 *   "CallSid": "unique_call_id",
 *   "From": "user_phone_number",
 *   "To": "your_phone_number",
 *   "RecordingUrl": "https://exotel.com/recording.mp3",
 *   "RecordingDuration": "30",
 *   "CallStatus": "completed"
 * }
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('Received webhook:', req.body);
    
    const {
      CallSid,
      From: callerNumber,
      To: calledNumber,
      RecordingUrl,
      RecordingDuration,
      CallStatus
    } = req.body;

    // Validate required fields
    if (!CallSid || !callerNumber || !RecordingUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: CallSid, From, or RecordingUrl'
      });
    }

    // Only process completed calls
    if (CallStatus !== 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Call not completed, skipping processing'
      });
    }

    // Generate unique file paths
    const timestamp = Date.now();
    const audioFileName = `audio_${CallSid}_${timestamp}.mp3`;
    const ttsFileName = `tts_${CallSid}_${timestamp}.mp3`;
    
    const audioPath = path.join(process.env.AUDIO_UPLOAD_PATH || './uploads/audio', audioFileName);
    const ttsPath = path.join(process.env.AUDIO_PROCESSED_PATH || './uploads/processed', ttsFileName);

    console.log('Processing call:', {
      callId: CallSid,
      caller: callerNumber,
      recordingUrl: RecordingUrl,
      duration: RecordingDuration
    });

    // Step 1: Download and transcribe audio
    console.log('Step 1: Transcribing audio...');
    const transcriptionResult = await transcribeFromUrl(RecordingUrl, audioPath);
    
    if (!transcriptionResult.success) {
      console.error('Transcription failed:', transcriptionResult.error);
      return res.status(500).json({
        success: false,
        error: 'Audio transcription failed',
        details: transcriptionResult.error
      });
    }

    const userMessage = transcriptionResult.text;
    console.log('Transcribed text:', userMessage);

    // Step 2: Generate AI response
    console.log('Step 2: Generating AI response...');
    const gptResult = await generateResponse(userMessage, callerNumber);
    
    if (!gptResult.success) {
      console.error('GPT response failed:', gptResult.error);
      return res.status(500).json({
        success: false,
        error: 'AI response generation failed',
        details: gptResult.error
      });
    }

    const aiResponse = gptResult.response;
    console.log('AI Response:', aiResponse);

    // Step 3: Convert response to speech
    console.log('Step 3: Converting to speech...');
    const ttsResult = await generateSpeech(aiResponse, ttsPath, 'nova');
    
    if (!ttsResult.success) {
      console.error('TTS failed:', ttsResult.error);
      return res.status(500).json({
        success: false,
        error: 'Text-to-speech conversion failed',
        details: ttsResult.error
      });
    }

    // Step 4: Save conversation log
    console.log('Step 4: Saving conversation log...');
    const logSaved = await saveConversationLog(
      gptResult.userId,
      userMessage,
      aiResponse
    );

    if (!logSaved) {
      console.warn('Failed to save conversation log');
    }

    // Step 5: Clean up temporary files
    setTimeout(async () => {
      await cleanupAudioFile(audioPath);
      await cleanupAudioFile(ttsPath);
    }, 60000); // Clean up after 1 minute

    // Return success response
    const response = {
      success: true,
      callId: CallSid,
      caller: callerNumber,
      transcription: userMessage,
      aiResponse: aiResponse,
      audioFile: ttsPath,
      duration: ttsResult.duration,
      timestamp: new Date().toISOString()
    };

    console.log('Webhook processing completed successfully');
    res.status(200).json(response);

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * GET /webhook/health - Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SAATHI webhook service is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /webhook/test - Test endpoint for development
 */
router.post('/test', async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;
    
    if (!message || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing message or phoneNumber'
      });
    }

    console.log('Test request:', { message, phoneNumber });

    // Generate AI response
    const gptResult = await generateResponse(message, phoneNumber);
    
    if (!gptResult.success) {
      return res.status(500).json({
        success: false,
        error: gptResult.error
      });
    }

    // Generate speech
    const timestamp = Date.now();
    const ttsPath = `./uploads/test_tts_${timestamp}.mp3`;
    const ttsResult = await generateSpeech(gptResult.response, ttsPath);

    if (!ttsResult.success) {
      return res.status(500).json({
        success: false,
        error: ttsResult.error
      });
    }

    // Save conversation log
    await saveConversationLog(gptResult.userId, message, gptResult.response);

    res.status(200).json({
      success: true,
      userMessage: message,
      aiResponse: gptResult.response,
      audioFile: ttsPath
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 