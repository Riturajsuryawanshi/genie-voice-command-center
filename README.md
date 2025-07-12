# CallGenie V2 - AI-Powered Voice Assistant

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-orange?style=for-the-badge&logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Supabase-Database-blue?style=for-the-badge&logo=supabase" alt="Supabase" />
</div>

## 🚀 Overview

CallGenie V2 is a comprehensive AI-powered voice assistant platform that revolutionizes business communication through intelligent voice-to-voice interactions. Built with cutting-edge AI technology, it provides natural conversational experiences for customer service, appointment scheduling, and business automation.

### ✨ Key Features

- **🎤 Voice Recognition**: OpenAI Whisper for accurate speech-to-text conversion
- **🧠 AI Intelligence**: GPT-4/GPT-3.5 for contextual and natural responses
- **🔊 Voice Synthesis**: OpenAI TTS or ElevenLabs for natural text-to-speech
- **📱 Phone Integration**: Exotel webhook support for real phone calls
- **💾 User Memory**: Conversation history and context awareness
- **🎨 Modern UI**: Beautiful React frontend with shadcn/ui components
- **🔐 Authentication**: Google OAuth integration with Supabase
- **📊 Analytics**: Call history and conversation tracking
- **⚡ Real-time Processing**: Low-latency voice AI pipeline

## 🏗️ Architecture

```
CallGenie V2/
├── genie-voice-command-center/     # Main application
│   ├── src/                       # React frontend
│   │   ├── components/            # UI components
│   │   ├── contexts/              # React contexts
│   │   ├── pages/                 # Application pages
│   │   └── integrations/          # External integrations
│   ├── backend/                   # Node.js backend
│   │   ├── src/
│   │   │   ├── routes/            # API endpoints
│   │   │   ├── services/          # Business logic
│   │   │   └── config/            # Configuration
│   │   └── uploads/               # Audio file storage
│   └── public/                    # Static assets
└── backend/                       # Legacy backend (if any)
```

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful components
- **Framer Motion** for animations
- **React Router** for navigation
- **TanStack Query** for data fetching

### Backend

- **Node.js** with Express.js
- **OpenAI API** (GPT-4, Whisper, TTS)
- **Supabase** for database and authentication
- **ElevenLabs** (optional TTS alternative)
- **Exotel** for phone call integration

### Database

- **PostgreSQL** (via Supabase)
- **Real-time subscriptions**
- **Row Level Security (RLS)**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Exotel account (for phone integration)
- ElevenLabs API key (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/callgenie-v2.git
cd callgenie-v2
```

### 2. Frontend Setup

```bash
cd genie-voice-command-center

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Create upload directories
mkdir -p uploads/audio uploads/processed

# Start development server
npm run dev
```

### 4. Environment Configuration

#### Frontend (.env.local)

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (.env)

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TTS_MODEL=tts-1
OPENAI_WHISPER_MODEL=whisper-1

# ElevenLabs Configuration (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id

# Exotel Configuration
EXOTEL_API_KEY=your_exotel_api_key
EXOTEL_API_SECRET=your_exotel_api_secret
EXOTEL_SID=your_exotel_sid

# Server Configuration
PORT=4000
NODE_ENV=development
```

### 5. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Run the contents of backend/supabase-schema.sql
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

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Backend Deployment

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start src/index.js --name "callgenie-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Environment Variables

Set all required environment variables in production:

```bash
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
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
- **Environment Variables**: Secure API key management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Troubleshooting Guide](genie-voice-command-center/TROUBLESHOOTING.md)
2. Review the [Backend Setup Guide](genie-voice-command-center/backend/SETUP.md)
3. Check the logs: `pm2 logs callgenie-backend`
4. Verify environment variables
5. Test individual services

## 📞 Contact

- **Email**: riturajsuryawanshi51@gmail.com
- **Project**: [CallGenie V2](https://github.com/yourusername/callgenie-v2)
- **Documentation**: [Backend README](genie-voice-command-center/backend/README.md)

## 🙏 Acknowledgments

- OpenAI for GPT-4, Whisper, and TTS APIs
- Supabase for database and authentication
- Exotel for phone call integration
- ElevenLabs for alternative TTS
- The React and Node.js communities

---

<div align="center">
  <p>Made with ❤️ by the CallGenie Team</p>
  <p>Transform your business communication with AI</p>
</div>
