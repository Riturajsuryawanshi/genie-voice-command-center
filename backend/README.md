# SAATHI Backend API

Complete voice-to-voice AI system for CallGenie with OpenAI Whisper, GPT, and TTS integration.

## 🚀 Features

- **Voice Recognition**: OpenAI Whisper for speech-to-text
- **AI Intelligence**: GPT-4/GPT-3.5 for contextual responses
- **Voice Synthesis**: OpenAI TTS or ElevenLabs for text-to-speech
- **User Memory**: Conversation history and context awareness
- **Webhook Support**: Exotel integration for phone calls
- **Real-time Processing**: Low-latency voice AI pipeline

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Exotel account (for phone integration)
- ElevenLabs API key (optional, for alternative TTS)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TTS_MODEL=tts-1
OPENAI_WHISPER_MODEL=whisper-1

# ElevenLabs Configuration (Alternative TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id

# Exotel Configuration
EXOTEL_API_KEY=your_exotel_api_key
EXOTEL_API_SECRET=your_exotel_api_secret
EXOTEL_SID=your_exotel_sid

# Server Configuration
PORT=4000
NODE_ENV=development

# File Storage
AUDIO_UPLOAD_PATH=./uploads/audio
AUDIO_PROCESSED_PATH=./uploads/processed

# Webhook Security
WEBHOOK_SECRET=your_webhook_secret
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Run supabase-schema.sql in Supabase
```

### 4. Create Upload Directories

```bash
mkdir -p uploads/audio uploads/processed
```

## 🚀 Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## 📡 API Endpoints

### Webhook Endpoints

- `POST /api/webhook/webhook` - Main Exotel webhook handler
- `POST /api/webhook/test` - Test endpoint for development
- `GET /api/webhook/health` - Health check

### Auth Endpoints

- `POST /api/auth/onboard` - Phone number assignment

### Health Check

- `GET /health` - Overall system health

## 🔄 Voice AI Pipeline

1. **Call Reception**: Exotel sends webhook with audio URL
2. **Audio Download**: Download recording from Exotel
3. **Speech Recognition**: OpenAI Whisper transcribes audio
4. **User Context**: Fetch user data and conversation history
5. **AI Response**: GPT generates contextual response
6. **Voice Synthesis**: Convert response to speech
7. **Logging**: Save conversation to database
8. **Cleanup**: Remove temporary files

## 🧪 Testing

### Test the Webhook

```bash
curl -X POST http://localhost:4000/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello SAATHI, how are you?",
    "phoneNumber": "+91-9876543210"
  }'
```

### Test Health Check

```bash
curl http://localhost:4000/health
```

## 🔧 Configuration

### Voice Settings

- **OpenAI TTS Voices**: alloy, echo, fable, onyx, nova, shimmer
- **ElevenLabs**: Custom voice IDs from your account
- **Speech Rate**: Configurable speed and pitch

### AI Settings

- **Model**: GPT-4-turbo-preview (default) or GPT-3.5
- **Max Tokens**: 150 for concise responses
- **Temperature**: 0.7 for balanced creativity
- **Memory**: Last 5 conversations for context

## 📊 Monitoring

### Logs

- Console logs for each processing step
- Error handling with detailed messages
- Performance metrics for latency tracking

### Health Checks

- Database connectivity
- OpenAI API status
- File system access
- Memory usage

## 🔒 Security

- **Webhook Validation**: Verify Exotel signatures
- **Rate Limiting**: Prevent abuse
- **File Cleanup**: Automatic temporary file removal
- **Error Handling**: Graceful failure recovery

## 🚀 Deployment

### Environment Variables

Set all required environment variables in production:

```bash
# Production example
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### Process Management

Use PM2 for production:

```bash
npm install -g pm2
pm2 start src/index.js --name "saathi-backend"
pm2 save
pm2 startup
```

### Reverse Proxy

Configure Nginx for SSL termination:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **OpenAI API Errors**: Check API key and quota
2. **Supabase Connection**: Verify URL and service role key
3. **File Permissions**: Ensure upload directories are writable
4. **Memory Issues**: Monitor Node.js memory usage

### Debug Mode

Enable detailed logging:

```bash
DEBUG=* npm run dev
```

## 📈 Performance Optimization

### Latency Reduction

- **Parallel Processing**: Run transcription and context fetch in parallel
- **Caching**: Cache user context and voice preferences
- **Streaming**: Stream audio processing for real-time response
- **CDN**: Use CDN for audio file delivery

### Scalability

- **Load Balancing**: Multiple server instances
- **Database Optimization**: Proper indexing and query optimization
- **File Storage**: Use cloud storage (S3, GCS) for audio files
- **Queue System**: Redis for job queuing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details
