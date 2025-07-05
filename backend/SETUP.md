# SAATHI Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Copy `test.env` to `.env` and fill in your API keys:

```bash
# Copy the test environment file
cp test.env .env

# Edit .env with your actual API keys
```

### 3. Create Upload Directories

```bash
mkdir uploads
mkdir uploads\audio
mkdir uploads\processed
```

### 4. Test the Server

```bash
# Test basic server functionality
npm run test:server

# Or start the full SAATHI backend
npm run dev
```

## 🔧 Configuration

### Required API Keys

1. **Supabase** (Required)

   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin access

2. **OpenAI** (Required for AI features)

   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OPENAI_MODEL`: GPT model (gpt-4-turbo-preview recommended)
   - `OPENAI_TTS_MODEL`: TTS model (tts-1)
   - `OPENAI_WHISPER_MODEL`: Whisper model (whisper-1)

3. **ElevenLabs** (Optional - Alternative TTS)

   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key
   - `ELEVENLABS_VOICE_ID`: Voice ID for TTS

4. **Exotel** (Required for phone integration)
   - `EXOTEL_API_KEY`: Your Exotel API key
   - `EXOTEL_API_SECRET`: Exotel API secret
   - `EXOTEL_SID`: Exotel SID

## 🗄️ Database Setup

### 1. Run SQL Schema

Copy and run the contents of `supabase-schema.sql` in your Supabase SQL editor.

### 2. Verify Tables

Check that these tables are created:

- `users`
- `phone_pool`
- `conversation_logs`
- `voice_preferences`
- `call_history`

## 🧪 Testing

### Test Basic Server

```bash
npm run test:server
```

Visit: http://localhost:4000/health

### Test Full SAATHI Backend

```bash
npm run dev
```

### Test Webhook Endpoint

```bash
curl -X POST http://localhost:4000/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello SAATHI",
    "phoneNumber": "+91-9876543210"
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **"nodemon not found"**

   ```bash
   npm install nodemon --save-dev
   ```

2. **"Module not found"**

   ```bash
   npm install
   ```

3. **"Permission denied" for uploads**

   ```bash
   # On Windows
   mkdir uploads\audio uploads\processed

   # On Linux/Mac
   mkdir -p uploads/audio uploads/processed
   chmod 755 uploads
   ```

4. **API Key Errors**
   - Check your `.env` file has correct API keys
   - Verify API keys are valid and have sufficient quota
   - Test API keys individually

### Debug Mode

```bash
# Enable detailed logging
DEBUG=* npm run dev

# Or run with Node.js debug
node --inspect src/index.js
```

## 📊 Health Checks

### Server Health

```bash
curl http://localhost:4000/health
```

### Webhook Health

```bash
curl http://localhost:4000/api/webhook/health
```

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Production environment
NODE_ENV=production
PORT=4000
```

### 2. Process Management

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start src/index.js --name "saathi-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Reverse Proxy (Nginx)

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

## 📈 Monitoring

### Logs

```bash
# View PM2 logs
pm2 logs saathi-backend

# View real-time logs
pm2 logs saathi-backend --lines 100
```

### Performance

```bash
# Monitor CPU/Memory
pm2 monit

# Restart if needed
pm2 restart saathi-backend
```

## 🔒 Security Checklist

- [ ] Environment variables are secure
- [ ] API keys have minimal required permissions
- [ ] Webhook endpoints are protected
- [ ] File uploads are validated
- [ ] Error messages don't expose sensitive data
- [ ] Rate limiting is configured
- [ ] SSL/TLS is enabled in production

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs saathi-backend`
2. Verify environment variables
3. Test individual services
4. Check API quotas and limits
5. Review the README.md for detailed documentation

## 🎯 Next Steps

1. **Configure Exotel**: Set up webhook URL in Exotel dashboard
2. **Test Phone Integration**: Make a test call to verify pipeline
3. **Monitor Performance**: Set up monitoring and alerts
4. **Scale Up**: Add load balancing and caching as needed
