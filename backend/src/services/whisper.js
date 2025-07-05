const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio file using OpenAI Whisper
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<{ success: boolean, text?: string, error?: string }>}
 */
async function transcribeAudio(audioFilePath) {
  try {
    // Check if file exists
    if (!await fs.pathExists(audioFilePath)) {
      return { success: false, error: 'Audio file not found' };
    }

    // Create file stream
    const audioFile = fs.createReadStream(audioFilePath);

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
      language: 'en', // Can be made dynamic based on user preference
      response_format: 'text',
    });

    return { 
      success: true, 
      text: transcription.trim(),
      confidence: 0.9 // Whisper doesn't return confidence, but we can estimate
    };

  } catch (error) {
    console.error('Whisper transcription error:', error);
    return { 
      success: false, 
      error: error.message || 'Transcription failed' 
    };
  }
}

/**
 * Transcribe audio from URL (for Exotel webhooks)
 * @param {string} audioUrl - URL to the audio file
 * @param {string} outputPath - Where to save the downloaded file
 * @returns {Promise<{ success: boolean, text?: string, error?: string }>}
 */
async function transcribeFromUrl(audioUrl, outputPath) {
  try {
    const axios = require('axios');
    
    // Download audio file
    const response = await axios({
      method: 'GET',
      url: audioUrl,
      responseType: 'stream',
      timeout: 30000, // 30 second timeout
    });

    // Ensure directory exists
    await fs.ensureDir(path.dirname(outputPath));

    // Save file
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', async () => {
        try {
          const result = await transcribeAudio(outputPath);
          // Clean up downloaded file
          await fs.remove(outputPath);
          resolve(result);
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      });
      
      writer.on('error', (error) => {
        reject({ success: false, error: error.message });
      });
    });

  } catch (error) {
    console.error('Audio download/transcription error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to download and transcribe audio' 
    };
  }
}

module.exports = { transcribeAudio, transcribeFromUrl }; 