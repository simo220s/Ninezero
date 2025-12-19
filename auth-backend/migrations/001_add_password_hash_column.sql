-- Migration: Add password_hash and is_email_verified columns to profiles table
-- Description: Adds authentication-related columns to the existing profiles table
-- Date: 2025-10-24

-- Add password_hash column to store bcrypt hashed passwords
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add is_email_verified column to track email verification status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

-- Add comment to document the columns
COMMENT ON COLUMN profiles.password_hash IS 'Bcrypt hashed password for authentication';
COMMENT ON COLUMN profiles.is_email_verified IS 'Indicates whether the user has verified their email address';

-- Create index on email for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on is_email_verified for filtering verified users
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(is_email_verified);
