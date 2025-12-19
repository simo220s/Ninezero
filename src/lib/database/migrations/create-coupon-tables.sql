-- Coupon and Discount System Database Schema
-- Task 10: Implement Coupon and Discount System

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  name_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  applicable_to VARCHAR(20) DEFAULT 'all' CHECK (applicable_to IN ('all', 'trial', 'regular', 'packages', 'credits')),
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'depleted')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (valid_until > valid_from),
  CONSTRAINT valid_max_uses CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT valid_max_uses_per_user CHECK (max_uses_per_user > 0)
);

-- Coupon Usage Tracking Table
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID,
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, order_id)
);

-- Coupon Categories (for organizing coupons)
CREATE TABLE IF NOT EXISTS coupon_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon to Category Mapping (many-to-many)
CREATE TABLE IF NOT EXISTS coupon_category_mappings (
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  category_id UUID REFERENCES coupon_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (coupon_id, category_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_teacher_id ON coupons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_coupons_applicable_to ON coupons(applicable_to);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_used_at ON coupon_usages(used_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupon_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for coupons table
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_updated_at();

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_purchase_amount DECIMAL(10,2)
)
RETURNS TABLE (
  is_valid BOOLEAN,
  coupon_id UUID,
  discount_amount DECIMAL(10,2),
  error_message TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_calculated_discount DECIMAL(10,2);
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = p_code
  AND status = 'active';

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL(10,2), 'كود الخصم غير صالح'::TEXT;
    RETURN;
  END IF;

  -- Check if coupon is within valid date range
  IF NOW() < v_coupon.valid_from THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL(10,2), 'كود الخصم لم يبدأ بعد'::TEXT;
    RETURN;
  END IF;

  IF NOW() > v_coupon.valid_until THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL(10,2), 'كود الخصم منتهي الصلاحية'::TEXT;
    RETURN;
  END IF;

  -- Check if coupon has reached max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL(10,2), 'تم استخدام كود الخصم بالكامل'::TEXT;
    RETURN;
  END IF;

  -- Check minimum purchase amount
  IF p_purchase_amount < v_coupon.min_purchase_amount THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL(10,2), 
      'الحد الأدنى للشراء هو ' || v_coupon.min_purchase_amount || ' ريال'::TEXT;
    RETURN;
  END IF;

  -- Check user usage limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM coupon_usages
  WHERE coupon_id = v_coupon.id
  AND user_id = p_user_id;

  IF v_user_usage_count >= v_coupon.max_uses_per_user THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL(10,2), 'لقد استخدمت هذا الكود من قبل'::TEXT;
    RETURN;
  END IF;

  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_calculated_discount := (p_purchase_amount * v_coupon.discount_value / 100);
    -- Apply max discount if set
    IF v_coupon.max_discount_amount IS NOT NULL AND v_calculated_discount > v_coupon.max_discount_amount THEN
      v_calculated_discount := v_coupon.max_discount_amount;
    END IF;
  ELSE
    v_calculated_discount := v_coupon.discount_value;
  END IF;

  -- Ensure discount doesn't exceed purchase amount
  IF v_calculated_discount > p_purchase_amount THEN
    v_calculated_discount := p_purchase_amount;
  END IF;

  -- Return valid coupon
  RETURN QUERY SELECT TRUE, v_coupon.id, v_calculated_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to apply coupon (record usage)
CREATE OR REPLACE FUNCTION apply_coupon(
  p_coupon_id UUID,
  p_user_id UUID,
  p_order_id UUID,
  p_original_amount DECIMAL(10,2),
  p_discount_amount DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert usage record
  INSERT INTO coupon_usages (
    coupon_id,
    user_id,
    order_id,
    discount_amount,
    original_amount,
    final_amount
  ) VALUES (
    p_coupon_id,
    p_user_id,
    p_order_id,
    p_discount_amount,
    p_original_amount,
    p_original_amount - p_discount_amount
  );

  -- Increment usage count
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE id = p_coupon_id;

  -- Update status if max uses reached
  UPDATE coupons
  SET status = 'depleted'
  WHERE id = p_coupon_id
  AND max_uses IS NOT NULL
  AND current_uses >= max_uses;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get coupon statistics
CREATE OR REPLACE FUNCTION get_coupon_stats(p_coupon_id UUID)
RETURNS TABLE (
  total_uses INTEGER,
  total_discount_given DECIMAL(10,2),
  total_revenue DECIMAL(10,2),
  unique_users INTEGER,
  avg_discount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_uses,
    SUM(discount_amount)::DECIMAL(10,2) as total_discount_given,
    SUM(final_amount)::DECIMAL(10,2) as total_revenue,
    COUNT(DISTINCT user_id)::INTEGER as unique_users,
    AVG(discount_amount)::DECIMAL(10,2) as avg_discount
  FROM coupon_usages
  WHERE coupon_id = p_coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Function to expire old coupons
CREATE OR REPLACE FUNCTION expire_old_coupons()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE coupons
  SET status = 'expired'
  WHERE status = 'active'
  AND valid_until < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_category_mappings ENABLE ROW LEVEL SECURITY;

-- Coupons Policies
CREATE POLICY "Admins can view all coupons"
  ON coupons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can view their own coupons"
  ON coupons FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR teacher_id IS NULL
  );

CREATE POLICY "Admins can create coupons"
  ON coupons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update their coupons"
  ON coupons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR (role = 'teacher' AND coupons.teacher_id = auth.uid()))
    )
  );

CREATE POLICY "Admins can delete coupons"
  ON coupons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Coupon Usages Policies
CREATE POLICY "Users can view their own coupon usages"
  ON coupon_usages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all coupon usages"
  ON coupon_usages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "System can insert coupon usages"
  ON coupon_usages FOR INSERT
  WITH CHECK (true);

-- Coupon Categories Policies
CREATE POLICY "Everyone can view coupon categories"
  ON coupon_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage coupon categories"
  ON coupon_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON coupons TO authenticated;
GRANT ALL ON coupon_usages TO authenticated;
GRANT ALL ON coupon_categories TO authenticated;
GRANT ALL ON coupon_category_mappings TO authenticated;

-- Comments for documentation
COMMENT ON TABLE coupons IS 'Discount coupons for promotional campaigns and referrals';
COMMENT ON TABLE coupon_usages IS 'Tracking of coupon usage by users';
COMMENT ON TABLE coupon_categories IS 'Categories for organizing coupons';
COMMENT ON COLUMN coupons.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN coupons.applicable_to IS 'What the coupon can be applied to: all, trial, regular, packages, credits';
COMMENT ON COLUMN coupons.max_uses_per_user IS 'Maximum number of times a single user can use this coupon';
COMMENT ON FUNCTION validate_coupon IS 'Validates a coupon code and calculates discount amount';
COMMENT ON FUNCTION apply_coupon IS 'Records coupon usage and updates usage statistics';
COMMENT ON FUNCTION get_coupon_stats IS 'Returns statistics for a specific coupon';
