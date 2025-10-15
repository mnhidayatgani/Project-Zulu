-- MCP Supabase Schema
-- Tables for MCP favorites, searches, and execution history with cross-device sync

-- ============================================================================
-- 1. MCP Favorites Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mcp_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tool info
  tool_name TEXT NOT NULL,
  server_id TEXT NOT NULL,
  server_name TEXT NOT NULL,
  
  -- Metadata
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Quick access
  is_quick_access BOOLEAN DEFAULT false,
  quick_access_order INTEGER,
  
  -- Custom fields
  notes TEXT,
  custom_tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, server_id, tool_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mcp_favorites_user_id ON mcp_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_favorites_server_id ON mcp_favorites(server_id);
CREATE INDEX IF NOT EXISTS idx_mcp_favorites_quick_access ON mcp_favorites(user_id, is_quick_access, quick_access_order);
CREATE INDEX IF NOT EXISTS idx_mcp_favorites_last_used ON mcp_favorites(user_id, last_used_at DESC);

-- Enable Row Level Security
ALTER TABLE mcp_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorites"
  ON mcp_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON mcp_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON mcp_favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON mcp_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. MCP Favorite Collections Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mcp_favorite_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Collection info
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  
  -- Sharing
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mcp_collections_user_id ON mcp_favorite_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_collections_share_code ON mcp_favorite_collections(share_code) WHERE share_code IS NOT NULL;

-- Enable RLS
ALTER TABLE mcp_favorite_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own collections"
  ON mcp_favorite_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own collections"
  ON mcp_favorite_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON mcp_favorite_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON mcp_favorite_collections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. MCP Collection Items Junction Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mcp_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES mcp_favorite_collections(id) ON DELETE CASCADE,
  favorite_id UUID NOT NULL REFERENCES mcp_favorites(id) ON DELETE CASCADE,
  
  -- Order
  item_order INTEGER DEFAULT 0,
  
  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(collection_id, favorite_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mcp_collection_items_collection ON mcp_collection_items(collection_id, item_order);
CREATE INDEX IF NOT EXISTS idx_mcp_collection_items_favorite ON mcp_collection_items(favorite_id);

-- Enable RLS
ALTER TABLE mcp_collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from collections)
CREATE POLICY "Users can view items in their collections"
  ON mcp_collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mcp_favorite_collections
      WHERE id = collection_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can manage items in their collections"
  ON mcp_collection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM mcp_favorite_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. MCP Saved Searches Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mcp_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Search info
  name TEXT NOT NULL,
  query TEXT,
  
  -- Filters (stored as JSONB for flexibility)
  filters JSONB DEFAULT '{}'::jsonb,
  
  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mcp_saved_searches_user_id ON mcp_saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_saved_searches_last_used ON mcp_saved_searches(user_id, last_used_at DESC);

-- Enable RLS
ALTER TABLE mcp_saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own searches"
  ON mcp_saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
  ON mcp_saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own searches"
  ON mcp_saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches"
  ON mcp_saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. MCP Search History Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mcp_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Search data
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  result_count INTEGER DEFAULT 0,
  
  -- Timestamp
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mcp_search_history_user_id ON mcp_search_history(user_id, searched_at DESC);

-- Enable RLS
ALTER TABLE mcp_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own search history"
  ON mcp_search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
  ON mcp_search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
  ON mcp_search_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. MCP Execution History Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mcp_execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tool execution info
  tool_name TEXT NOT NULL,
  server_id TEXT NOT NULL,
  server_name TEXT NOT NULL,
  
  -- Execution data (JSONB for flexibility)
  input JSONB NOT NULL,
  output JSONB,
  error TEXT,
  
  -- Execution metrics
  duration INTEGER, -- milliseconds
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending', 'cancelled')),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamp
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mcp_execution_history_user_id ON mcp_execution_history(user_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_execution_history_server ON mcp_execution_history(server_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_execution_history_tool ON mcp_execution_history(tool_name, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_execution_history_status ON mcp_execution_history(status, executed_at DESC);

-- Enable RLS
ALTER TABLE mcp_execution_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own execution history"
  ON mcp_execution_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own execution history"
  ON mcp_execution_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own execution history"
  ON mcp_execution_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. Updated At Trigger Function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_mcp_favorites_updated_at
  BEFORE UPDATE ON mcp_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_collections_updated_at
  BEFORE UPDATE ON mcp_favorite_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_saved_searches_updated_at
  BEFORE UPDATE ON mcp_saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Helper Functions
-- ============================================================================

-- Function to increment favorite use count
CREATE OR REPLACE FUNCTION increment_favorite_use_count(
  p_user_id UUID,
  p_server_id TEXT,
  p_tool_name TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE mcp_favorites
  SET 
    use_count = use_count + 1,
    last_used_at = NOW()
  WHERE 
    user_id = p_user_id AND
    server_id = p_server_id AND
    tool_name = p_tool_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old search history (keep last 100 per user)
CREATE OR REPLACE FUNCTION clean_old_search_history()
RETURNS void AS $$
BEGIN
  DELETE FROM mcp_search_history
  WHERE id IN (
    SELECT id
    FROM mcp_search_history
    WHERE id NOT IN (
      SELECT id
      FROM mcp_search_history
      ORDER BY searched_at DESC
      LIMIT 100
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old execution history (keep last 500 per user)
CREATE OR REPLACE FUNCTION clean_old_execution_history()
RETURNS void AS $$
BEGIN
  DELETE FROM mcp_execution_history
  WHERE id IN (
    SELECT id
    FROM mcp_execution_history
    WHERE id NOT IN (
      SELECT id
      FROM mcp_execution_history
      ORDER BY executed_at DESC
      LIMIT 500
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. Grant Permissions
-- ============================================================================

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION increment_favorite_use_count(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_search_history() TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_execution_history() TO authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
