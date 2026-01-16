-- =============================================
-- Pro Dashboard: Chats & Messages Tables
-- Run this migration in Supabase SQL Editor
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CHATS TABLE
-- Stores chat sessions for Pro users
-- =============================================
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,

  -- For quick filtering
  message_count INTEGER DEFAULT 0,

  -- Store the primary category detected across messages
  primary_category TEXT DEFAULT 'general'
);

-- Index for fast user chat list queries
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_last_message ON chats(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_archived ON chats(user_id, archived);

-- =============================================
-- CHAT_MESSAGES TABLE
-- Stores individual messages within chats
-- (Named chat_messages to avoid conflict with other tables)
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- AI routing information (for assistant messages)
  model TEXT,                    -- e.g., 'claude', 'gpt4o', 'gemini', 'llama'
  category TEXT,                 -- e.g., 'writing', 'code', 'research', 'analysis', 'general'
  routing_reason TEXT,           -- e.g., "You prefer Claude for writing (73% win rate)"

  -- Performance metrics (for assistant messages)
  metadata JSONB DEFAULT '{}',   -- { latency_ms, tokens, cost_estimate, etc. }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast message retrieval within a chat
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_created ON chat_messages(chat_id, created_at ASC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on both tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chats policies: Users can only see their own chats
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chats" ON chats;
CREATE POLICY "Users can insert own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chats" ON chats;
CREATE POLICY "Users can update own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chats" ON chats;
CREATE POLICY "Users can delete own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies: Users can access messages in their own chats
DROP POLICY IF EXISTS "Users can view messages in own chats" ON chat_messages;
CREATE POLICY "Users can view messages in own chats" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = chat_messages.chat_id AND chats.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in own chats" ON chat_messages;
CREATE POLICY "Users can insert messages in own chats" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = chat_messages.chat_id AND chats.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update messages in own chats" ON chat_messages;
CREATE POLICY "Users can update messages in own chats" ON chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = chat_messages.chat_id AND chats.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete messages in own chats" ON chat_messages;
CREATE POLICY "Users can delete messages in own chats" ON chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = chat_messages.chat_id AND chats.user_id = auth.uid()
    )
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update chat metadata when a message is added
CREATE OR REPLACE FUNCTION update_chat_on_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats
  SET
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    -- Update title from first user message if still "New Chat"
    title = CASE
      WHEN title = 'New Chat' AND NEW.role = 'user'
      THEN LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END
      ELSE title
    END
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update chat when messages are inserted
DROP TRIGGER IF EXISTS trigger_update_chat_on_chat_message ON chat_messages;
CREATE TRIGGER trigger_update_chat_on_chat_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_on_chat_message();

-- Function to decrement message count when a message is deleted
CREATE OR REPLACE FUNCTION update_chat_on_chat_message_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats
  SET message_count = GREATEST(0, message_count - 1)
  WHERE id = OLD.chat_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message deletion
DROP TRIGGER IF EXISTS trigger_update_chat_on_chat_message_delete ON chat_messages;
CREATE TRIGGER trigger_update_chat_on_chat_message_delete
  AFTER DELETE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_on_chat_message_delete();

-- =============================================
-- GRANT SERVICE ROLE ACCESS
-- For server-side operations that bypass RLS
-- =============================================
GRANT ALL ON chats TO service_role;
GRANT ALL ON chat_messages TO service_role;
