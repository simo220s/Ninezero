-- Migration: Create email_verification_tokens table
-- Description: Creates a table to store email verification tokens with 24-hour expiration
-- Date: 2025-10-24

-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to document the table and columns
COMMENT ON TABLE email_verification_tokens IS 'Stores email verification tokens with 24-hour expiration';
COMMENT ON COLUMN email_verification_tokens.user_id IS 'The user who needs to verify their email';
COMMENT ON COLUMN email_verification_tokens.token IS 'Secure random token for email verification';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Token expiration time (24 hours from creation)';
COMMENT ON COLUMN email_verification_tokens.used IS 'Whether the token has been used';
COMMENT ON COLUMN email_verification_tokens.created_at IS 'When the token was created';

-- Create index on token for fast lookup during email verification
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);

-- Create index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Create composite index on token and used for efficient validation
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_used ON email_verification_tokens(token, used);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Create a function to automatically clean up expired or used tokens
CREATE OR REPLACE FUNCTION cleanup_email_verification_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_tokens 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add comment to the cleanup function
COMMENT ON FUNCTION cleanup_email_verification_tokens() IS 'Removes expired and used email verification tokens';
