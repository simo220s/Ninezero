-- Migration: Create admin_settings table
-- Description: Creates a key-value storage table for system-wide configurable settings
-- Date: 2025-10-25

-- Create admin_settings table for storing system configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments to document the table and columns
COMMENT ON TABLE admin_settings IS 'System-wide configuration settings managed by administrators';
COMMENT ON COLUMN admin_settings.key IS 'Unique identifier for the setting (e.g., trial_duration_days)';
COMMENT ON COLUMN admin_settings.value IS 'JSON value of the setting, allows flexible data types';
COMMENT ON COLUMN admin_settings.description IS 'Human-readable description of what the setting controls';
COMMENT ON COLUMN admin_settings.updated_by IS 'Admin user who last updated this setting';

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_by ON admin_settings(updated_by);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Seed default settings
INSERT INTO admin_settings (key, value, description) VALUES
  ('trial_duration_days', '7', 'Number of days for trial period before student must complete trial lesson'),
  ('trial_credits', '0.5', 'Credits allocated for trial assessment lesson (0.5 = half credit)'),
  ('regular_class_credits', '1.0', 'Credits required for regular class session'),
  ('join_window_minutes', '10', 'Minutes before class start when join button becomes active'),
  ('notification_email_enabled', 'true', 'Enable or disable email notifications system-wide'),
  ('notification_timings', '{"24h": true, "1h": true, "15m": true}', 'Notification timing settings for class reminders'),
  ('low_credit_threshold', '2', 'Credit balance threshold for low balance notifications'),
  ('class_duration_default', '60', 'Default class duration in minutes'),
  ('max_file_upload_size_mb', '10', 'Maximum file upload size in megabytes'),
  ('session_timeout_minutes', '60', 'User session timeout in minutes')
ON CONFLICT (key) DO NOTHING;

-- Grant appropriate permissions (adjust based on your RLS policies)
-- Note: These permissions should be configured based on your specific security requirements
COMMENT ON TABLE admin_settings IS 'Requires admin role to modify. Read access may be granted to all authenticated users for certain settings.';

