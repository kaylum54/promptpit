-- PRD Builder Database Schema
-- Migration: 002_create_prd_tables.sql

-- =============================================
-- PRDs Table - Main PRD storage
-- =============================================
CREATE TABLE IF NOT EXISTS prds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  mode TEXT DEFAULT 'full' CHECK (mode IN ('quick', 'full')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'review', 'completed', 'archived')),
  current_phase INT DEFAULT 1,
  template_id TEXT,

  -- Phase 1: Idea
  idea_summary JSONB,

  -- Phase 2: Features
  features JSONB,

  -- Phase 3: Technical Architecture
  tech_stack JSONB,
  database_schema TEXT,
  api_structure JSONB,
  file_structure TEXT,

  -- Phase 4: Production Readiness
  security JSONB,
  error_handling JSONB,
  performance JSONB,
  scaling JSONB,
  observability JSONB,
  deployment JSONB,

  -- Phase 5: Costs
  cost_estimate JSONB,

  -- Phase 6: Outputs
  prd_markdown TEXT,
  claude_code_prompt TEXT,

  -- Collaboration
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  collaborators JSONB DEFAULT '[]',

  -- Versioning
  version INT DEFAULT 1,
  parent_prd_id UUID REFERENCES prds(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for PRDs
CREATE INDEX prds_user_id_idx ON prds(user_id, updated_at DESC);
CREATE INDEX prds_status_idx ON prds(user_id, status);
CREATE INDEX prds_share_token_idx ON prds(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX prds_public_idx ON prds(is_public) WHERE is_public = TRUE;

-- =============================================
-- PRD Messages Table - Conversation history
-- =============================================
CREATE TABLE IF NOT EXISTS prd_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  phase INT,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'debate_intro', 'debate_result', 'review')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX prd_messages_prd_id_idx ON prd_messages(prd_id, created_at ASC);

-- =============================================
-- PRD Debates Table - Model comparison debates
-- =============================================
CREATE TABLE IF NOT EXISTS prd_debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  decision_label TEXT NOT NULL,
  context JSONB NOT NULL,

  -- Model responses
  responses JSONB NOT NULL,

  -- Verdict
  verdict JSONB,

  -- User decision
  user_choice TEXT,
  user_rationale TEXT,

  phase INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX prd_debates_prd_id_idx ON prd_debates(prd_id, created_at ASC);

-- =============================================
-- PRD Reviews Table - Final PRD reviews
-- =============================================
CREATE TABLE IF NOT EXISTS prd_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
  model TEXT NOT NULL,

  -- Review content
  strengths TEXT[] NOT NULL,
  concerns JSONB NOT NULL,
  overall_score INT NOT NULL CHECK (overall_score >= 1 AND overall_score <= 10),
  summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX prd_reviews_prd_id_idx ON prd_reviews(prd_id);

-- =============================================
-- PRD Templates Table - Pre-built templates
-- =============================================
CREATE TABLE IF NOT EXISTS prd_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('saas', 'marketplace', 'social', 'tool', 'api', 'extension', 'ai')),

  -- Pre-filled defaults
  default_idea JSONB,
  default_features JSONB,
  default_tech_stack JSONB,
  suggested_integrations TEXT[],
  common_pitfalls TEXT[],
  example_prompts TEXT[],

  -- Metadata
  popularity INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRD Comments Table - Collaboration comments
-- =============================================
CREATE TABLE IF NOT EXISTS prd_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  parent_comment_id UUID REFERENCES prd_comments(id),
  content TEXT NOT NULL,
  section TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX prd_comments_prd_id_idx ON prd_comments(prd_id, created_at DESC);
CREATE INDEX prd_comments_section_idx ON prd_comments(prd_id, section);

-- =============================================
-- PRD Versions Table - Version history
-- =============================================
CREATE TABLE IF NOT EXISTS prd_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prd_id UUID NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
  version INT NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  changes JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(prd_id, version)
);

CREATE INDEX prd_versions_prd_id_idx ON prd_versions(prd_id, version DESC);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE prds ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_versions ENABLE ROW LEVEL SECURITY;

-- PRDs policies
CREATE POLICY "Users can view own PRDs" ON prds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public PRDs" ON prds
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view shared PRDs" ON prds
  FOR SELECT USING (
    collaborators @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()::text))
  );

CREATE POLICY "Users can create own PRDs" ON prds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PRDs" ON prds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own PRDs" ON prds
  FOR DELETE USING (auth.uid() = user_id);

-- PRD Messages policies
CREATE POLICY "Users can view messages for accessible PRDs" ON prd_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_messages.prd_id
      AND (prds.user_id = auth.uid() OR prds.is_public = TRUE)
    )
  );

CREATE POLICY "Users can create messages for own PRDs" ON prd_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_messages.prd_id
      AND prds.user_id = auth.uid()
    )
  );

-- PRD Debates policies
CREATE POLICY "Users can view debates for accessible PRDs" ON prd_debates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_debates.prd_id
      AND (prds.user_id = auth.uid() OR prds.is_public = TRUE)
    )
  );

CREATE POLICY "Users can create debates for own PRDs" ON prd_debates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_debates.prd_id
      AND prds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update debates for own PRDs" ON prd_debates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_debates.prd_id
      AND prds.user_id = auth.uid()
    )
  );

-- PRD Reviews policies
CREATE POLICY "Users can view reviews for accessible PRDs" ON prd_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_reviews.prd_id
      AND (prds.user_id = auth.uid() OR prds.is_public = TRUE)
    )
  );

CREATE POLICY "Users can create reviews for own PRDs" ON prd_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_reviews.prd_id
      AND prds.user_id = auth.uid()
    )
  );

-- Templates are public read
CREATE POLICY "Anyone can view templates" ON prd_templates
  FOR SELECT USING (TRUE);

-- PRD Comments policies
CREATE POLICY "Users can view comments for accessible PRDs" ON prd_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_comments.prd_id
      AND (prds.user_id = auth.uid() OR prds.is_public = TRUE)
    )
  );

CREATE POLICY "Users can create comments for accessible PRDs" ON prd_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON prd_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON prd_comments
  FOR DELETE USING (auth.uid() = user_id);

-- PRD Versions policies
CREATE POLICY "Users can view versions for accessible PRDs" ON prd_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_versions.prd_id
      AND (prds.user_id = auth.uid() OR prds.is_public = TRUE)
    )
  );

CREATE POLICY "Users can create versions for own PRDs" ON prd_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prds
      WHERE prds.id = prd_versions.prd_id
      AND prds.user_id = auth.uid()
    )
  );

-- =============================================
-- Update trigger for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_prd_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prds_updated_at
  BEFORE UPDATE ON prds
  FOR EACH ROW
  EXECUTE FUNCTION update_prd_updated_at();

CREATE TRIGGER prd_comments_updated_at
  BEFORE UPDATE ON prd_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_prd_updated_at();
