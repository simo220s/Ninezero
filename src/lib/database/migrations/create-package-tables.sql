-- Package and Bundle System Database Schema
-- Task 11: Develop Package and Bundle System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  description TEXT,
  description_ar TEXT,
  package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('credit_bundle', 'family', 'trial_combo', 'seasonal', 'custom')),
  credits DECIMAL(10,2) NOT NULL CHECK (credits > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_price DECIMAL(10,2) CHECK (discount_price IS NULL OR discount_price < price),
  discount_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN discount_price IS NOT NULL AND price > 0 
      THEN ROUND(((price - discount_price) / price * 100)::numeric, 2)
      ELSE 0
    END
  ) STORED,
  validity_days INTEGER CHECK (validity_days IS NULL OR validity_days > 0),
  max_students INTEGER DEFAULT 1 CHECK (max_students > 0),
  includes_trial BOOLEAN DEFAULT false,
  trial_classes INTEGER DEFAULT 0 CHECK (trial_classes >= 0),
  regular_classes INTEGER DEFAULT 0 CHECK (regular_classes >= 0),
  features JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_seasonal BOOLEAN DEFAULT false,
  seasonal_start TIMESTAMP WITH TIME ZONE,
  seasonal_end TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'coming_soon')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_seasonal_dates CHECK (
    (is_seasonal = false) OR 
    (is_seasonal = true AND seasonal_start IS NOT NULL AND seasonal_end IS NOT NULL AND seasonal_end > seasonal_start)
  ),
  CONSTRAINT valid_trial_combo CHECK (
    (package_type != 'trial_combo') OR 
    (package_type = 'trial_combo' AND includes_trial = true AND trial_classes > 0)
  ),
  CONSTRAINT valid_family_package CHECK (
    (package_type != 'family') OR 
    (package_type = 'family' AND max_students > 1)
  )
);

-- Package Purchases Table
CREATE TABLE IF NOT EXISTS package_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price >= 0),
  original_price DECIMAL(10,2) NOT NULL CHECK (original_price >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  credits_granted DECIMAL(10,2) NOT NULL CHECK (credits_granted > 0),
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_prices CHECK (purchase_price <= original_price),
  CONSTRAINT valid_discount CHECK (discount_amount = original_price - purchase_price)
);

-- Package Usage Tracking Table
CREATE TABLE IF NOT EXISTS package_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_purchase_id UUID NOT NULL REFERENCES package_purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credits_used DECIMAL(10,2) NOT NULL CHECK (credits_used > 0),
  class_id UUID,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Family Package Allocations Table (for distributing credits among family members)
CREATE TABLE IF NOT EXISTS family_package_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_purchase_id UUID NOT NULL REFERENCES package_purchases(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name VARCHAR(100) NOT NULL,
  credits_allocated DECIMAL(10,2) NOT NULL CHECK (credits_allocated > 0),
  credits_used DECIMAL(10,2) DEFAULT 0 CHECK (credits_used >= 0),
  allocated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_credits_used CHECK (credits_used <= credits_allocated),
  UNIQUE(package_purchase_id, student_id)
);

-- Seasonal Package Configurations Table
CREATE TABLE IF NOT EXISTS seasonal_package_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  season_type VARCHAR(20) NOT NULL CHECK (season_type IN ('ramadan', 'back_to_school', 'summer', 'winter', 'eid', 'custom')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  special_features JSONB DEFAULT '[]'::jsonb,
  banner_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_season_dates CHECK (end_date > start_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(package_type);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_featured ON packages(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_packages_bestseller ON packages(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_packages_seasonal ON packages(is_seasonal, seasonal_start, seasonal_end) WHERE is_seasonal = true;
CREATE INDEX IF NOT EXISTS idx_packages_display_order ON packages(display_order, created_at);
CREATE INDEX IF NOT EXISTS idx_package_purchases_user_id ON package_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_package_purchases_package_id ON package_purchases(package_id);
CREATE INDEX IF NOT EXISTS idx_package_purchases_status ON package_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_package_purchases_dates ON package_purchases(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_package_usages_purchase_id ON package_usages(package_purchase_id);
CREATE INDEX IF NOT EXISTS idx_package_usages_user_id ON package_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_family_allocations_purchase_id ON family_package_allocations(package_purchase_id);
CREATE INDEX IF NOT EXISTS idx_family_allocations_student_id ON family_package_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_configs_active ON seasonal_package_configs(is_active, start_date, end_date) WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_package_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for packages table
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_package_updated_at();

-- Function to calculate package price with discount
CREATE OR REPLACE FUNCTION calculate_package_price(
  p_package_id UUID,
  p_coupon_code VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  original_price DECIMAL(10,2),
  discount_price DECIMAL(10,2),
  coupon_discount DECIMAL(10,2),
  final_price DECIMAL(10,2),
  total_discount DECIMAL(10,2),
  coupon_id UUID
) AS $$
DECLARE
  v_package RECORD;
  v_base_price DECIMAL(10,2);
  v_package_discount DECIMAL(10,2);
  v_coupon_discount DECIMAL(10,2) := 0;
  v_coupon_id UUID := NULL;
  v_coupon_validation RECORD;
BEGIN
  -- Get package details
  SELECT * INTO v_package
  FROM packages
  WHERE id = p_package_id
  AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package not found or inactive';
  END IF;

  -- Determine base price
  v_base_price := v_package.price;
  
  -- Apply package discount if available
  IF v_package.discount_price IS NOT NULL THEN
    v_package_discount := v_base_price - v_package.discount_price;
    v_base_price := v_package.discount_price;
  ELSE
    v_package_discount := 0;
  END IF;

  -- Apply coupon if provided
  IF p_coupon_code IS NOT NULL THEN
    -- Validate coupon (assuming user_id will be provided separately in actual purchase)
    SELECT * INTO v_coupon_validation
    FROM validate_coupon(p_coupon_code, NULL, v_base_price)
    LIMIT 1;

    IF v_coupon_validation.is_valid THEN
      v_coupon_discount := v_coupon_validation.discount_amount;
      v_coupon_id := v_coupon_validation.coupon_id;
    END IF;
  END IF;

  -- Return calculated prices
  RETURN QUERY SELECT
    v_package.price,
    v_package.discount_price,
    v_coupon_discount,
    v_base_price - v_coupon_discount,
    v_package_discount + v_coupon_discount,
    v_coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Function to purchase a package
CREATE OR REPLACE FUNCTION purchase_package(
  p_package_id UUID,
  p_user_id UUID,
  p_purchase_price DECIMAL(10,2),
  p_original_price DECIMAL(10,2),
  p_discount_amount DECIMAL(10,2),
  p_credits_granted DECIMAL(10,2),
  p_coupon_id UUID DEFAULT NULL,
  p_payment_method VARCHAR(50) DEFAULT 'credit_card',
  p_validity_days INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_valid_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate validity
  IF p_validity_days IS NOT NULL THEN
    v_valid_until := NOW() + (p_validity_days || ' days')::INTERVAL;
  END IF;

  -- Insert purchase record
  INSERT INTO package_purchases (
    package_id,
    user_id,
    purchase_price,
    original_price,
    discount_amount,
    credits_granted,
    coupon_id,
    payment_method,
    payment_status,
    valid_until,
    activated_at
  ) VALUES (
    p_package_id,
    p_user_id,
    p_purchase_price,
    p_original_price,
    p_discount_amount,
    p_credits_granted,
    p_coupon_id,
    p_payment_method,
    'completed',
    v_valid_until,
    NOW()
  )
  RETURNING id INTO v_purchase_id;

  -- Record coupon usage if applicable
  IF p_coupon_id IS NOT NULL THEN
    PERFORM apply_coupon(
      p_coupon_id,
      p_user_id,
      v_purchase_id,
      p_original_price,
      p_discount_amount
    );
  END IF;

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get package statistics
CREATE OR REPLACE FUNCTION get_package_stats(p_package_id UUID)
RETURNS TABLE (
  total_purchases INTEGER,
  total_revenue DECIMAL(10,2),
  total_credits_sold DECIMAL(10,2),
  total_credits_used DECIMAL(10,2),
  avg_purchase_price DECIMAL(10,2),
  unique_buyers INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pp.id)::INTEGER as total_purchases,
    COALESCE(SUM(pp.purchase_price), 0)::DECIMAL(10,2) as total_revenue,
    COALESCE(SUM(pp.credits_granted), 0)::DECIMAL(10,2) as total_credits_sold,
    COALESCE(SUM(pu.credits_used), 0)::DECIMAL(10,2) as total_credits_used,
    COALESCE(AVG(pp.purchase_price), 0)::DECIMAL(10,2) as avg_purchase_price,
    COUNT(DISTINCT pp.user_id)::INTEGER as unique_buyers
  FROM package_purchases pp
  LEFT JOIN package_usages pu ON pp.id = pu.package_purchase_id
  WHERE pp.package_id = p_package_id
  AND pp.payment_status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active packages
CREATE OR REPLACE FUNCTION get_user_active_packages(p_user_id UUID)
RETURNS TABLE (
  purchase_id UUID,
  package_id UUID,
  package_name VARCHAR(100),
  package_name_ar VARCHAR(100),
  credits_granted DECIMAL(10,2),
  credits_used DECIMAL(10,2),
  credits_remaining DECIMAL(10,2),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_expired BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id as purchase_id,
    pp.package_id,
    p.name as package_name,
    p.name_ar as package_name_ar,
    pp.credits_granted,
    COALESCE(SUM(pu.credits_used), 0)::DECIMAL(10,2) as credits_used,
    (pp.credits_granted - COALESCE(SUM(pu.credits_used), 0))::DECIMAL(10,2) as credits_remaining,
    pp.valid_until,
    (pp.valid_until IS NOT NULL AND pp.valid_until < NOW()) as is_expired
  FROM package_purchases pp
  JOIN packages p ON pp.package_id = p.id
  LEFT JOIN package_usages pu ON pp.id = pu.package_purchase_id
  WHERE pp.user_id = p_user_id
  AND pp.payment_status = 'completed'
  AND (pp.valid_until IS NULL OR pp.valid_until > NOW())
  GROUP BY pp.id, p.id
  HAVING (pp.credits_granted - COALESCE(SUM(pu.credits_used), 0)) > 0
  ORDER BY pp.purchased_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to allocate family package credits
CREATE OR REPLACE FUNCTION allocate_family_credits(
  p_package_purchase_id UUID,
  p_student_id UUID,
  p_student_name VARCHAR(100),
  p_credits_allocated DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_package_type VARCHAR(20);
  v_max_students INTEGER;
  v_current_allocations INTEGER;
  v_total_allocated DECIMAL(10,2);
  v_credits_granted DECIMAL(10,2);
BEGIN
  -- Verify this is a family package
  SELECT p.package_type, p.max_students, pp.credits_granted
  INTO v_package_type, v_max_students, v_credits_granted
  FROM package_purchases pp
  JOIN packages p ON pp.package_id = p.id
  WHERE pp.id = p_package_purchase_id;

  IF v_package_type != 'family' THEN
    RAISE EXCEPTION 'This is not a family package';
  END IF;

  -- Check if max students limit reached
  SELECT COUNT(*) INTO v_current_allocations
  FROM family_package_allocations
  WHERE package_purchase_id = p_package_purchase_id;

  IF v_current_allocations >= v_max_students THEN
    RAISE EXCEPTION 'Maximum number of students reached for this package';
  END IF;

  -- Check if total allocated credits would exceed granted credits
  SELECT COALESCE(SUM(credits_allocated), 0) INTO v_total_allocated
  FROM family_package_allocations
  WHERE package_purchase_id = p_package_purchase_id;

  IF (v_total_allocated + p_credits_allocated) > v_credits_granted THEN
    RAISE EXCEPTION 'Insufficient credits available for allocation';
  END IF;

  -- Insert allocation
  INSERT INTO family_package_allocations (
    package_purchase_id,
    student_id,
    student_name,
    credits_allocated
  ) VALUES (
    p_package_purchase_id,
    p_student_id,
    p_student_name,
    p_credits_allocated
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to expire seasonal packages
CREATE OR REPLACE FUNCTION expire_seasonal_packages()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE packages
  SET status = 'archived'
  WHERE is_seasonal = true
  AND status = 'active'
  AND seasonal_end < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_package_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_package_configs ENABLE ROW LEVEL SECURITY;

-- Packages Policies
CREATE POLICY "Everyone can view active packages"
  ON packages FOR SELECT
  USING (status = 'active' OR status = 'coming_soon');

CREATE POLICY "Admins can view all packages"
  ON packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create packages"
  ON packages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update packages"
  ON packages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete packages"
  ON packages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Package Purchases Policies
CREATE POLICY "Users can view their own purchases"
  ON package_purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all purchases"
  ON package_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can create their own purchases"
  ON package_purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update purchases"
  ON package_purchases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Package Usages Policies
CREATE POLICY "Users can view their own usages"
  ON package_usages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usages"
  ON package_usages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "System can insert usages"
  ON package_usages FOR INSERT
  WITH CHECK (true);

-- Family Package Allocations Policies
CREATE POLICY "Users can view their family allocations"
  ON family_package_allocations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM package_purchases
      WHERE id = family_package_allocations.package_purchase_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their allocations"
  ON family_package_allocations FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can view all allocations"
  ON family_package_allocations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Package owners can manage allocations"
  ON family_package_allocations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM package_purchases
      WHERE id = family_package_allocations.package_purchase_id
      AND user_id = auth.uid()
    )
  );

-- Seasonal Package Configs Policies
CREATE POLICY "Everyone can view active seasonal configs"
  ON seasonal_package_configs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage seasonal configs"
  ON seasonal_package_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON packages TO authenticated;
GRANT ALL ON package_purchases TO authenticated;
GRANT ALL ON package_usages TO authenticated;
GRANT ALL ON family_package_allocations TO authenticated;
GRANT ALL ON seasonal_package_configs TO authenticated;

-- Comments for documentation
COMMENT ON TABLE packages IS 'Credit bundles, family packages, and combo packages for English classes';
COMMENT ON TABLE package_purchases IS 'Record of package purchases by users';
COMMENT ON TABLE package_usages IS 'Tracking of credit usage from purchased packages';
COMMENT ON TABLE family_package_allocations IS 'Credit allocation for family packages among multiple students';
COMMENT ON TABLE seasonal_package_configs IS 'Configuration for seasonal promotional packages';
COMMENT ON COLUMN packages.package_type IS 'Type: credit_bundle, family, trial_combo, seasonal, custom';
COMMENT ON COLUMN packages.credits IS 'Number of class credits included in the package';
COMMENT ON COLUMN packages.validity_days IS 'Number of days the package remains valid after purchase';
COMMENT ON COLUMN packages.max_students IS 'Maximum number of students for family packages';
COMMENT ON FUNCTION calculate_package_price IS 'Calculates final price with package discount and optional coupon';
COMMENT ON FUNCTION purchase_package IS 'Records a package purchase and applies credits to user account';
COMMENT ON FUNCTION get_package_stats IS 'Returns statistics for a specific package';
COMMENT ON FUNCTION get_user_active_packages IS 'Returns all active packages for a user with remaining credits';
COMMENT ON FUNCTION allocate_family_credits IS 'Allocates credits from family package to a student';
