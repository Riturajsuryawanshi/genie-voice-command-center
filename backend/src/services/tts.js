const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate speech using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @param {string} outputPath - Where to save the audio file
 * @param {string} voice - Voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @returns {Promise<{ success: boolean, filePath?: string, error?: string }>}
 */
async function generateSpeech(text, outputPath, voice = 'nova') {
  try {
    // Ensure directory exists
    await fs.ensureDir(path.dirname(outputPath));

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'tts-1',
      voice: voice,
      input: text,
    });

    // Convert to buffer and save
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(outputPath, buffer);

    return { 
      success: true, 
      filePath: outputPath,
      duration: Math.ceil(text.length / 15) // Rough estimate in seconds
    };

  } catch (error) {
    console.error('TTS generation error:', error);
    return { 
      success: false, 
      error: error.message || 'TTS generation failed' 
    };
  }
}

/**
 * Generate speech using ElevenLabs (alternative TTS)
 * @param {string} text - Text to convert to speech
 * @param {string} outputPath - Where to save the audio file
 * @param {string} voiceId - ElevenLabs voice ID
 * @returns {Promise<{ success: boolean, filePath?: string, error?: string }>}
 */
async function generateSpeechElevenLabs(text, outputPath, voiceId = null) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voice) {
      return { 
        success: false, 
        error: 'ElevenLabs API key or voice ID not configured' 
      };
    }

    // Ensure directory exists
    await fs.ensureDir(path.dirname(outputPath));

    // Generate speech using ElevenLabs
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      data: {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      responseType: 'arraybuffer',
    });

    // Save audio file
    await fs.writeFile(outputPath, response.data);

    return { 
      success: true, 
      filePath: outputPath,
      duration: Math.ceil(text.length / 15) // Rough estimate in seconds
    };

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return { 
      success: false, 
      error: error.message || 'ElevenLabs TTS failed' 
    };
  }
}

/**
 * Get available voices for TTS
 * @returns {Promise<Array>}
 */
async function getAvailableVoices() {
  try {
    // OpenAI voices
    const openaiVoices = [
      { id: 'alloy', name: 'Alloy', provider: 'openai' },
      { id: 'echo', name: 'Echo', provider: 'openai' },
      { id: 'fable', name: 'Fable', provider: 'openai' },
      { id: 'onyx', name: 'Onyx', provider: 'openai' },
      { id: 'nova', name: 'Nova', provider: 'openai' },
      { id: 'shimmer', name: 'Shimmer', provider: 'openai' },
    ];

    // Try to get ElevenLabs voices if configured
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
        });

        const elevenLabsVoices = response.data.voices.map(voice => ({
          id: voice.voice_id,
          name: voice.name,
          provider: 'elevenlabs',
        }));

        return [...openaiVoices, ...elevenLabsVoices];
      } catch (error) {
        console.error('Error fetching ElevenLabs voices:', error);
      }
    }

    return openaiVoices;
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
}

/**
 * Clean up audio files after processing
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>}
 */
async function cleanupAudioFile(filePath) {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error cleaning up audio file:', error);
    return false;
  }
}

module.exports = { 
  generateSpeech, 
  generateSpeechElevenLabs, 
  getAvailableVoices,
  cleanupAudioFile 
}; 