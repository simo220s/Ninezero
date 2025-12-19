-- Notification System Database Schema
-- Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  class_reminders BOOLEAN DEFAULT true,
  parent_messages BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT true,
  reminder_timings TEXT[] DEFAULT ARRAY['24h', '1h', '15min'],
  language VARCHAR(2) DEFAULT 'ar',
  whatsapp_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notifications Table (In-App Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  message TEXT NOT NULL,
  message_en TEXT,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  action_label_en TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Scheduled Reminders Table
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timing VARCHAR(10) NOT NULL, -- '24h', '1h', '15min'
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'sent', 'cancelled', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, timing)
);

-- Notification Logs Table (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  channel VARCHAR(20) NOT NULL, -- 'email', 'sms', 'whatsapp', 'in-app'
  type VARCHAR(50) NOT NULL,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_class_id ON scheduled_reminders(class_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_student_id ON scheduled_reminders(student_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_scheduled_time ON scheduled_reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_status ON scheduled_reminders(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when a new profile is created
CREATE TRIGGER create_notification_preferences_on_profile_creation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND read = true;
  
  DELETE FROM notification_logs
  WHERE sent_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id
    AND read = false
  );
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE user_id = p_user_id
  AND read = false;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending reminders (for cron job processing)
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS TABLE (
  id UUID,
  class_id UUID,
  student_id UUID,
  timing VARCHAR(10),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  class_date DATE,
  class_time TIME,
  meeting_link TEXT,
  student_name TEXT,
  teacher_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.class_id,
    sr.student_id,
    sr.timing,
    sr.scheduled_time,
    cs.date AS class_date,
    cs.time AS class_time,
    cs.meeting_link,
    CONCAT(sp.first_name, ' ', sp.last_name) AS student_name,
    CONCAT(tp.first_name, ' ', tp.last_name) AS teacher_name
  FROM scheduled_reminders sr
  JOIN class_sessions cs ON sr.class_id = cs.id
  JOIN profiles sp ON sr.student_id = sp.id
  JOIN profiles tp ON cs.teacher_id = tp.id
  WHERE sr.status = 'scheduled'
  AND sr.scheduled_time <= NOW() + INTERVAL '5 minutes'
  AND sr.scheduled_time >= NOW()
  ORDER BY sr.scheduled_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Notification Preferences Policies
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Scheduled Reminders Policies
CREATE POLICY "Users can view their own scheduled reminders"
  ON scheduled_reminders FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "System can manage scheduled reminders"
  ON scheduled_reminders FOR ALL
  USING (true);

-- Notification Logs Policies (Admin only)
CREATE POLICY "Admins can view all notification logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON scheduled_reminders TO authenticated;
GRANT SELECT ON notification_logs TO authenticated;

-- Comments for documentation
COMMENT ON TABLE notification_preferences IS 'User notification preferences for different channels and types';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE scheduled_reminders IS 'Scheduled class reminders at different time intervals';
COMMENT ON TABLE notification_logs IS 'Audit log of all sent notifications across all channels';
COMMENT ON COLUMN notification_preferences.reminder_timings IS 'Array of reminder timings: 24h, 1h, 15min';
COMMENT ON COLUMN scheduled_reminders.timing IS 'When to send the reminder: 24h, 1h, or 15min before class';
COMMENT ON COLUMN notification_logs.channel IS 'Communication channel: email, sms, whatsapp, or in-app';
