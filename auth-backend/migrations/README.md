# Database Migrations

This directory contains SQL migration scripts for the authentication backend.

## Migration Files

1. `001_add_password_hash_column.sql` - Adds password_hash and is_email_verified columns to profiles table
2. `002_create_token_blacklist.sql` - Creates token_blacklist table for logout functionality
3. `003_create_password_reset_tokens.sql` - Creates password_reset_tokens table with 1-hour expiration
4. `004_create_email_verification_tokens.sql` - Creates email_verification_tokens table with 24-hour expiration
5. `005_create_admin_settings.sql` - Creates admin_settings table for system configuration

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each migration file content in order (001, 002, 003, 004)
4. Execute each migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Run all migrations
supabase db push

# Or run individual migrations
psql $DATABASE_URL -f migrations/001_add_password_hash_column.sql
psql $DATABASE_URL -f migrations/002_create_token_blacklist.sql
psql $DATABASE_URL -f migrations/003_create_password_reset_tokens.sql
psql $DATABASE_URL -f migrations/004_create_email_verification_tokens.sql
psql $DATABASE_URL -f migrations/005_create_admin_settings.sql
```

## Migration Details

### 001_add_password_hash_column.sql
- Adds `password_hash` column to store bcrypt hashed passwords
- Adds `is_email_verified` column to track email verification status
- Creates indexes on email and is_email_verified for performance

### 002_create_token_blacklist.sql
- Creates `token_blacklist` table for storing invalidated JWT tokens
- Includes indexes on token, expires_at, and user_id
- Provides `cleanup_expired_tokens()` function for maintenance

### 003_create_password_reset_tokens.sql
- Creates `password_reset_tokens` table with 1-hour expiration
- Includes indexes for efficient token validation
- Provides `cleanup_password_reset_tokens()` function for maintenance

### 004_create_email_verification_tokens.sql
- Creates `email_verification_tokens` table with 24-hour expiration
- Includes indexes for efficient token validation
- Provides `cleanup_email_verification_tokens()` function for maintenance

### 005_create_admin_settings.sql
- Creates `admin_settings` table for system-wide configuration
- Uses JSONB for flexible value storage
- Includes automatic updated_at timestamp trigger
- Seeds default settings (trial duration, credits, join window, notifications)
- Tracks which admin user last updated each setting

## Maintenance

To clean up expired tokens, you can run the cleanup functions periodically:

```sql
-- Clean up expired tokens
SELECT cleanup_expired_tokens();
SELECT cleanup_password_reset_tokens();
SELECT cleanup_email_verification_tokens();
```

Consider setting up a cron job or scheduled function to run these cleanup functions daily.
