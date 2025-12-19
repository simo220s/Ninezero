-- Migration: Create password_reset_tokens table
-- Description: Creates a table to store password reset tokens with expiration
-- Date: 2025-10-24

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to document the table and columns
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens with 1-hour expiration';
COMMENT ON COLUMN password_reset_tokens.user_id IS 'The user requesting password reset';
COMMENT ON COLUMN password_reset_tokens.token IS 'Secure random token for password reset';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration time (1 hour from creation)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Whether the token has been used';
COMMENT ON COLUMN password_reset_tokens.created_at IS 'When the token was created';

-- Create index on token for fast lookup during password reset
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Create index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Create composite index on token and used for efficient validation
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_used ON password_reset_tokens(token, used);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Create a function to automatically clean up expired or used tokens
CREATE OR REPLACE FUNCTION cleanup_password_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add comment to the cleanup function
COMMENT ON FUNCTION cleanup_password_reset_tokens() IS 'Removes expired and used password reset tokens';
