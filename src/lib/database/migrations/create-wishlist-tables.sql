-- Wishlist and Favorites System Database Schema
-- Task 13: Implement Wishlist and Favorites System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wishlists Table (main wishlist items)
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('teacher', 'package', 'timeslot', 'course')),
  item_id UUID NOT NULL,
  item_name VARCHAR(200),
  item_name_ar VARCHAR(200),
  notes TEXT,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
  is_gift BOOLEAN DEFAULT false,
  gift_recipient_name VARCHAR(100),
  gift_recipient_email VARCHAR(255),
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Favorite Teachers Table
CREATE TABLE IF NOT EXISTS favorite_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_name VARCHAR(100) NOT NULL,
  teacher_specialization VARCHAR(100),
  notes TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, teacher_id),
  CONSTRAINT no_self_favorite CHECK (user_id != teacher_id)
);

-- Saved Time Slots Table
CREATE TABLE IF NOT EXISTS saved_timeslots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
  is_recurring BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Wishlist Shares Table (for sharing wishlists with others)
CREATE TABLE IF NOT EXISTS wishlist_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  share_token VARCHAR(100) UNIQUE NOT NULL,
  share_name VARCHAR(100),
  share_name_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist Share Items Table (items in a shared wishlist)
CREATE TABLE IF NOT EXISTS wishlist_share_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID NOT NULL REFERENCES wishlist_shares(id) ON DELETE CASCADE,
  wishlist_item_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(share_id, wishlist_item_id)
);

-- Wishlist Notifications Table
CREATE TABLE IF NOT EXISTS wishlist_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_item_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('reminder', 'price_drop', 'availability', 'expiring_soon')),
  notification_message TEXT NOT NULL,
  notification_message_ar TEXT NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist Conversions Table (tracking wishlist to purchase conversions)
CREATE TABLE IF NOT EXISTS wishlist_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_item_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  item_id UUID NOT NULL,
  purchase_id UUID,
  conversion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  days_in_wishlist INTEGER,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_item_type ON wishlists(item_type);
CREATE INDEX IF NOT EXISTS idx_wishlists_item_id ON wishlists(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_priority ON wishlists(priority DESC);
CREATE INDEX IF NOT EXISTS idx_wishlists_is_gift ON wishlists(is_gift) WHERE is_gift = true;
CREATE INDEX IF NOT EXISTS idx_wishlists_reminder ON wishlists(reminder_enabled, reminder_date) WHERE reminder_enabled = true;
CREATE INDEX IF NOT EXISTS idx_favorite_teachers_user_id ON favorite_teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_teachers_teacher_id ON favorite_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_saved_timeslots_user_id ON saved_timeslots(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_timeslots_teacher_id ON saved_timeslots(teacher_id);
CREATE INDEX IF NOT EXISTS idx_saved_timeslots_day ON saved_timeslots(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_token ON wishlist_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_user_id ON wishlist_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_public ON wishlist_shares(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_wishlist_share_items_share_id ON wishlist_share_items(share_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_notifications_item_id ON wishlist_notifications(wishlist_item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_notifications_pending ON wishlist_notifications(is_sent, scheduled_for) WHERE is_sent = false;
CREATE INDEX IF NOT EXISTS idx_wishlist_conversions_user_id ON wishlist_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_conversions_item ON wishlist_conversions(item_type, item_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_updated_at();

CREATE TRIGGER update_wishlist_shares_updated_at
  BEFORE UPDATE ON wishlist_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_updated_at();

-- Function to add item to wishlist
CREATE OR REPLACE FUNCTION add_to_wishlist(
  p_user_id UUID,
  p_item_type VARCHAR(20),
  p_item_id UUID,
  p_item_name VARCHAR(200) DEFAULT NULL,
  p_item_name_ar VARCHAR(200) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_priority INTEGER DEFAULT 0,
  p_is_gift BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_wishlist_id UUID;
BEGIN
  -- Insert or update wishlist item
  INSERT INTO wishlists (
    user_id,
    item_type,
    item_id,
    item_name,
    item_name_ar,
    notes,
    priority,
    is_gift
  ) VALUES (
    p_user_id,
    p_item_type,
    p_item_id,
    p_item_name,
    p_item_name_ar,
    p_notes,
    p_priority,
    p_is_gift
  )
  ON CONFLICT (user_id, item_type, item_id)
  DO UPDATE SET
    notes = COALESCE(EXCLUDED.notes, wishlists.notes),
    priority = COALESCE(EXCLUDED.priority, wishlists.priority),
    is_gift = COALESCE(EXCLUDED.is_gift, wishlists.is_gift),
    updated_at = NOW()
  RETURNING id INTO v_wishlist_id;

  RETURN v_wishlist_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove item from wishlist
CREATE OR REPLACE FUNCTION remove_from_wishlist(
  p_user_id UUID,
  p_item_type VARCHAR(20),
  p_item_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM wishlists
  WHERE user_id = p_user_id
  AND item_type = p_item_type
  AND item_id = p_item_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check if item is in wishlist
CREATE OR REPLACE FUNCTION is_in_wishlist(
  p_user_id UUID,
  p_item_type VARCHAR(20),
  p_item_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM wishlists
    WHERE user_id = p_user_id
    AND item_type = p_item_type
    AND item_id = p_item_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to add favorite teacher
CREATE OR REPLACE FUNCTION add_favorite_teacher(
  p_user_id UUID,
  p_teacher_id UUID,
  p_teacher_name VARCHAR(100),
  p_teacher_specialization VARCHAR(100) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_favorite_id UUID;
BEGIN
  -- Prevent self-favoriting
  IF p_user_id = p_teacher_id THEN
    RAISE EXCEPTION 'Cannot add yourself as favorite teacher';
  END IF;

  -- Insert or update favorite teacher
  INSERT INTO favorite_teachers (
    user_id,
    teacher_id,
    teacher_name,
    teacher_specialization,
    notes
  ) VALUES (
    p_user_id,
    p_teacher_id,
    p_teacher_name,
    p_teacher_specialization,
    p_notes
  )
  ON CONFLICT (user_id, teacher_id)
  DO UPDATE SET
    teacher_name = EXCLUDED.teacher_name,
    teacher_specialization = COALESCE(EXCLUDED.teacher_specialization, favorite_teachers.teacher_specialization),
    notes = COALESCE(EXCLUDED.notes, favorite_teachers.notes)
  RETURNING id INTO v_favorite_id;

  RETURN v_favorite_id;
END;
$$ LANGUAGE plpgsql;

-- Function to save time slot
CREATE OR REPLACE FUNCTION save_timeslot(
  p_user_id UUID,
  p_teacher_id UUID DEFAULT NULL,
  p_day_of_week INTEGER,
  p_start_time TIME,
  p_end_time TIME,
  p_timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
  p_is_recurring BOOLEAN DEFAULT true,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_timeslot_id UUID;
BEGIN
  -- Validate time range
  IF p_end_time <= p_start_time THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  -- Validate day of week
  IF p_day_of_week < 0 OR p_day_of_week > 6 THEN
    RAISE EXCEPTION 'Day of week must be between 0 (Sunday) and 6 (Saturday)';
  END IF;

  -- Insert time slot
  INSERT INTO saved_timeslots (
    user_id,
    teacher_id,
    day_of_week,
    start_time,
    end_time,
    timezone,
    is_recurring,
    notes
  ) VALUES (
    p_user_id,
    p_teacher_id,
    p_day_of_week,
    p_start_time,
    p_end_time,
    p_timezone,
    p_is_recurring,
    p_notes
  )
  RETURNING id INTO v_timeslot_id;

  RETURN v_timeslot_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create wishlist share
CREATE OR REPLACE FUNCTION create_wishlist_share(
  p_user_id UUID,
  p_share_name VARCHAR(100),
  p_share_name_ar VARCHAR(100),
  p_description TEXT DEFAULT NULL,
  p_description_ar TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT false,
  p_expires_days INTEGER DEFAULT NULL
)
RETURNS TABLE (
  share_id UUID,
  share_token VARCHAR(100),
  share_url TEXT
) AS $$
DECLARE
  v_share_id UUID;
  v_share_token VARCHAR(100);
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate unique share token
  v_share_token := encode(gen_random_bytes(32), 'hex');

  -- Calculate expiration
  IF p_expires_days IS NOT NULL THEN
    v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;
  END IF;

  -- Insert share
  INSERT INTO wishlist_shares (
    user_id,
    share_token,
    share_name,
    share_name_ar,
    description,
    description_ar,
    is_public,
    expires_at
  ) VALUES (
    p_user_id,
    v_share_token,
    p_share_name,
    p_share_name_ar,
    p_description,
    p_description_ar,
    p_is_public,
    v_expires_at
  )
  RETURNING id INTO v_share_id;

  -- Return share details
  RETURN QUERY SELECT
    v_share_id,
    v_share_token,
    '/wishlist/shared/' || v_share_token AS share_url;
END;
$$ LANGUAGE plpgsql;

-- Function to record wishlist conversion
CREATE OR REPLACE FUNCTION record_wishlist_conversion(
  p_wishlist_item_id UUID,
  p_purchase_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversion_id UUID;
  v_wishlist_item RECORD;
  v_days_in_wishlist INTEGER;
BEGIN
  -- Get wishlist item details
  SELECT * INTO v_wishlist_item
  FROM wishlists
  WHERE id = p_wishlist_item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wishlist item not found';
  END IF;

  -- Calculate days in wishlist
  v_days_in_wishlist := EXTRACT(DAY FROM NOW() - v_wishlist_item.created_at)::INTEGER;

  -- Insert conversion record
  INSERT INTO wishlist_conversions (
    wishlist_item_id,
    user_id,
    item_type,
    item_id,
    purchase_id,
    days_in_wishlist
  ) VALUES (
    p_wishlist_item_id,
    v_wishlist_item.user_id,
    v_wishlist_item.item_type,
    v_wishlist_item.item_id,
    p_purchase_id,
    v_days_in_wishlist
  )
  RETURNING id INTO v_conversion_id;

  -- Optionally remove from wishlist after conversion
  DELETE FROM wishlists WHERE id = p_wishlist_item_id;

  RETURN v_conversion_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get wishlist statistics
CREATE OR REPLACE FUNCTION get_wishlist_stats(p_user_id UUID)
RETURNS TABLE (
  total_items INTEGER,
  items_by_type JSONB,
  gift_items INTEGER,
  high_priority_items INTEGER,
  items_with_reminders INTEGER,
  avg_days_in_wishlist DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_items,
    jsonb_object_agg(
      item_type,
      type_count
    ) as items_by_type,
    COUNT(*) FILTER (WHERE is_gift = true)::INTEGER as gift_items,
    COUNT(*) FILTER (WHERE priority >= 4)::INTEGER as high_priority_items,
    COUNT(*) FILTER (WHERE reminder_enabled = true)::INTEGER as items_with_reminders,
    AVG(EXTRACT(DAY FROM NOW() - created_at))::DECIMAL(10,2) as avg_days_in_wishlist
  FROM (
    SELECT 
      item_type,
      COUNT(*)::INTEGER as type_count,
      is_gift,
      priority,
      reminder_enabled,
      created_at
    FROM wishlists
    WHERE user_id = p_user_id
    GROUP BY item_type, is_gift, priority, reminder_enabled, created_at
  ) subquery;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending wishlist reminders
CREATE OR REPLACE FUNCTION get_pending_wishlist_reminders()
RETURNS TABLE (
  notification_id UUID,
  user_id UUID,
  wishlist_item_id UUID,
  item_type VARCHAR(20),
  item_name VARCHAR(200),
  notification_message TEXT,
  notification_message_ar TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wn.id as notification_id,
    wn.user_id,
    wn.wishlist_item_id,
    w.item_type,
    w.item_name,
    wn.notification_message,
    wn.notification_message_ar,
    wn.scheduled_for
  FROM wishlist_notifications wn
  JOIN wishlists w ON wn.wishlist_item_id = w.id
  WHERE wn.is_sent = false
  AND wn.scheduled_for <= NOW()
  ORDER BY wn.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_timeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_share_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_conversions ENABLE ROW LEVEL SECURITY;

-- Wishlists Policies
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own wishlist"
  ON wishlists FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all wishlists"
  ON wishlists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Favorite Teachers Policies
CREATE POLICY "Users can view their own favorites"
  ON favorite_teachers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can see who favorited them"
  ON favorite_teachers FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Users can manage their own favorites"
  ON favorite_teachers FOR ALL
  USING (user_id = auth.uid());

-- Saved Timeslots Policies
CREATE POLICY "Users can view their own timeslots"
  ON saved_timeslots FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own timeslots"
  ON saved_timeslots FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view timeslots for their classes"
  ON saved_timeslots FOR SELECT
  USING (teacher_id = auth.uid());

-- Wishlist Shares Policies
CREATE POLICY "Users can view their own shares"
  ON wishlist_shares FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Everyone can view public shares"
  ON wishlist_shares FOR SELECT
  USING (is_public = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can manage their own shares"
  ON wishlist_shares FOR ALL
  USING (user_id = auth.uid());

-- Wishlist Share Items Policies
CREATE POLICY "Users can view items in their shares"
  ON wishlist_share_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlist_shares
      WHERE id = wishlist_share_items.share_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view items in public shares"
  ON wishlist_share_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlist_shares
      WHERE id = wishlist_share_items.share_id
      AND is_public = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

CREATE POLICY "Users can manage items in their shares"
  ON wishlist_share_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM wishlist_shares
      WHERE id = wishlist_share_items.share_id
      AND user_id = auth.uid()
    )
  );

-- Wishlist Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON wishlist_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can manage notifications"
  ON wishlist_notifications FOR ALL
  USING (true);

-- Wishlist Conversions Policies
CREATE POLICY "Users can view their own conversions"
  ON wishlist_conversions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all conversions"
  ON wishlist_conversions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "System can record conversions"
  ON wishlist_conversions FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON wishlists TO authenticated;
GRANT ALL ON favorite_teachers TO authenticated;
GRANT ALL ON saved_timeslots TO authenticated;
GRANT ALL ON wishlist_shares TO authenticated;
GRANT ALL ON wishlist_share_items TO authenticated;
GRANT ALL ON wishlist_notifications TO authenticated;
GRANT ALL ON wishlist_conversions TO authenticated;

-- Comments for documentation
COMMENT ON TABLE wishlists IS 'User wishlist items for teachers, packages, timeslots, and courses';
COMMENT ON TABLE favorite_teachers IS 'User favorite teachers for quick access and notifications';
COMMENT ON TABLE saved_timeslots IS 'Saved preferred time slots for booking classes';
COMMENT ON TABLE wishlist_shares IS 'Shared wishlists for gift giving and collaboration';
COMMENT ON TABLE wishlist_share_items IS 'Items included in shared wishlists';
COMMENT ON TABLE wishlist_notifications IS 'Notifications and reminders for wishlist items';
COMMENT ON TABLE wishlist_conversions IS 'Tracking of wishlist items converted to purchases';
COMMENT ON COLUMN wishlists.item_type IS 'Type: teacher, package, timeslot, course';
COMMENT ON COLUMN wishlists.priority IS 'Priority level 0-5, where 5 is highest';
COMMENT ON COLUMN wishlists.is_gift IS 'Whether this item is intended as a gift';
COMMENT ON COLUMN saved_timeslots.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON FUNCTION add_to_wishlist IS 'Adds or updates an item in user wishlist';
COMMENT ON FUNCTION remove_from_wishlist IS 'Removes an item from user wishlist';
COMMENT ON FUNCTION is_in_wishlist IS 'Checks if an item is in user wishlist';
COMMENT ON FUNCTION add_favorite_teacher IS 'Adds a teacher to user favorites';
COMMENT ON FUNCTION save_timeslot IS 'Saves a preferred time slot for booking';
COMMENT ON FUNCTION create_wishlist_share IS 'Creates a shareable wishlist link';
COMMENT ON FUNCTION record_wishlist_conversion IS 'Records when a wishlist item is purchased';
COMMENT ON FUNCTION get_wishlist_stats IS 'Returns statistics about user wishlist';
COMMENT ON FUNCTION get_pending_wishlist_reminders IS 'Gets pending wishlist reminder notifications';
