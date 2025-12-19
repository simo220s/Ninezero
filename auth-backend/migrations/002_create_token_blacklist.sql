-- Migration: Create token_blacklist table
-- Description: Creates a table to store blacklisted JWT tokens (for logout functionality)
-- Date: 2025-10-24

-- Create token_blacklist table
CREATE TABLE IF NOT EXISTS token_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to document the table and columns
COMMENT ON TABLE token_blacklist IS 'Stores blacklisted JWT tokens to prevent their reuse after logout';
COMMENT ON COLUMN token_blacklist.token IS 'The JWT token that has been blacklisted';
COMMENT ON COLUMN token_blacklist.user_id IS 'The user who owns this token';
COMMENT ON COLUMN token_blacklist.expires_at IS 'When the token expires (can be cleaned up after this time)';
COMMENT ON COLUMN token_blacklist.created_at IS 'When the token was blacklisted';

-- Create index on token for fast lookup during token validation
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);

-- Create index on expires_at for efficient cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Create index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist(user_id);

-- Create a function to automatically clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM token_blacklist WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comment to the cleanup function
COMMENT ON FUNCTION cleanup_expired_tokens() IS 'Removes expired tokens from the blacklist to keep the table size manageable';
