-- Security and Compliance Tables
-- Creates tables for audit logging, user consents, backups, and rate limiting

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  user_id UUID NOT NULL,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  action TEXT NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- User Consents Table
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

-- Create indexes for user consents
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_granted ON user_consents(granted);

-- Backups Table
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  size_bytes BIGINT,
  tables_included TEXT[],
  records_count INTEGER,
  error_message TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for backups
CREATE INDEX IF NOT EXISTS idx_backups_type ON backups(backup_type);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_started_at ON backups(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_created_by ON backups(created_by);

-- Add deletion tracking to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create index for deletion tracking
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_date ON profiles(deletion_date) WHERE deletion_date IS NOT NULL;

-- Row Level Security (RLS) Policies

-- Audit Logs: Only admins and the user themselves can view their logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super-admin'
    )
  );

-- Only system can insert audit logs
CREATE POLICY audit_logs_insert_policy ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- User Consents: Users can only view and update their own consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_consents_select_policy ON user_consents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_consents_insert_policy ON user_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_consents_update_policy ON user_consents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Backups: Only admins can view and manage backups
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY backups_select_policy ON backups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super-admin', 'teacher')
    )
  );

CREATE POLICY backups_insert_policy ON backups
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super-admin', 'teacher')
    )
  );

CREATE POLICY backups_update_policy ON backups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super-admin', 'teacher')
    )
  );

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit trail for all administrative actions and security events';
COMMENT ON TABLE user_consents IS 'User consent records for GDPR compliance';
COMMENT ON TABLE backups IS 'Database backup records and metadata';

COMMENT ON COLUMN audit_logs.event_type IS 'Type of event (e.g., user_login, student_created)';
COMMENT ON COLUMN audit_logs.severity IS 'Event severity: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object containing before/after values for updates';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context and metadata for the event';

COMMENT ON COLUMN user_consents.consent_type IS 'Type of consent (e.g., terms_of_service, marketing_emails)';
COMMENT ON COLUMN user_consents.granted IS 'Whether consent is currently granted';

COMMENT ON COLUMN backups.backup_type IS 'Type of backup: full, incremental, differential, manual';
COMMENT ON COLUMN backups.status IS 'Backup status: pending, in_progress, completed, failed';
COMMENT ON COLUMN backups.tables_included IS 'Array of table names included in the backup';
