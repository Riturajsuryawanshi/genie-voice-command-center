-- SAATHI Voice AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends existing auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  phone_number TEXT UNIQUE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phone pool for assigning numbers
CREATE TABLE IF NOT EXISTS phone_pool (
  id SERIAL PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  assigned BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation logs for AI memory
CREATE TABLE IF NOT EXISTS conversation_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  call_id TEXT,
  recording_url TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice preferences for users
CREATE TABLE IF NOT EXISTS voice_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL,
  voice_name TEXT,
  provider TEXT DEFAULT 'openai', -- 'openai' or 'elevenlabs'
  speed FLOAT DEFAULT 1.0,
  pitch FLOAT DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call history for analytics
CREATE TABLE IF NOT EXISTS call_history (
  id SERIAL PRIMARY KEY,
  call_sid TEXT UNIQUE,
  user_id UUID REFERENCES users(id),
  from_number TEXT,
  to_number TEXT,
  duration INTEGER,
  status TEXT,
  recording_url TEXT,
  transcription TEXT,
  ai_response TEXT,
  audio_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Service role can access all data (for backend)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON phone_pool
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON conversation_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON voice_preferences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON call_history
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_user_id ON conversation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_created_at ON conversation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_call_history_user_id ON call_history(user_id);
CREATE INDEX IF NOT EXISTS idx_call_history_call_sid ON call_history(call_sid);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_preferences_updated_at BEFORE UPDATE ON voice_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for phone pool (replace with your actual numbers)
-- IMPORTANT: Replace these with your real phone numbers from Exotel or your phone service provider
-- Example format: INSERT INTO phone_pool (number) VALUES 
--   ('+91-9876543210'),
--   ('+91-9876543211'),
--   ('+91-9876543212'),
--   ('+91-9876543213'),
--   ('+91-9876543214')
-- ON CONFLICT (number) DO NOTHING;

-- For now, using sample numbers for testing
INSERT INTO phone_pool (number) VALUES 
  ('+91-9876543210'),
  ('+91-9876543211'),
  ('+91-9876543212'),
  ('+91-9876543213'),
  ('+91-9876543214')
ON CONFLICT (number) DO NOTHING;

-- Function to get user by phone number
CREATE OR REPLACE FUNCTION get_user_by_phone(phone_num TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  phone_number TEXT,
  preferences JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.name, u.phone_number, u.preferences
  FROM users u
  WHERE u.phone_number = phone_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 