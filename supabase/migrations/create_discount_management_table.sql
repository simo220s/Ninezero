-- Migration: Create discount management tables
-- Description: Add support for manual discount application by teachers/admins

-- Ensure subscription_discounts table exists with all required fields
CREATE TABLE IF NOT EXISTS subscription_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('retention', 'promotional', 'custom', 'manual')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reason TEXT,
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_user_id ON subscription_discounts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_subscription_id ON subscription_discounts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_is_active ON subscription_discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_end_date ON subscription_discounts(end_date);
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_discount_type ON subscription_discounts(discount_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_discounts_updated_at ON subscription_discounts;
CREATE TRIGGER trigger_update_subscription_discounts_updated_at
  BEFORE UPDATE ON subscription_discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_discounts_updated_at();

-- Create function to get discount statistics
CREATE OR REPLACE FUNCTION get_discount_statistics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalActiveDiscounts', (
      SELECT COUNT(*)
      FROM subscription_discounts
      WHERE is_active = true
      AND end_date >= NOW()
    ),
    'totalDiscountValue', (
      SELECT COALESCE(SUM(discount_percentage), 0)
      FROM subscription_discounts
      WHERE is_active = true
      AND end_date >= NOW()
    ),
    'avgDiscountPercentage', (
      SELECT COALESCE(AVG(discount_percentage), 0)
      FROM subscription_discounts
      WHERE is_active = true
      AND end_date >= NOW()
    ),
    'discountsByType', (
      SELECT json_object_agg(discount_type, count)
      FROM (
        SELECT discount_type, COUNT(*) as count
        FROM subscription_discounts
        WHERE is_active = true
        AND end_date >= NOW()
        GROUP BY discount_type
      ) subquery
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for subscription_discounts
ALTER TABLE subscription_discounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own discounts
CREATE POLICY "Users can view their own discounts"
  ON subscription_discounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can view all discounts
CREATE POLICY "Admins can view all discounts"
  ON subscription_discounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can insert discounts
CREATE POLICY "Admins can insert discounts"
  ON subscription_discounts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update discounts
CREATE POLICY "Admins can update discounts"
  ON subscription_discounts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete discounts
CREATE POLICY "Admins can delete discounts"
  ON subscription_discounts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add comment to table
COMMENT ON TABLE subscription_discounts IS 'Stores manual and automatic discounts applied to student subscriptions';
COMMENT ON COLUMN subscription_discounts.discount_type IS 'Type of discount: retention (from cancellation flow), promotional, custom, or manual (applied by admin)';
COMMENT ON COLUMN subscription_discounts.reason IS 'Reason for applying the discount, required for manual discounts';
COMMENT ON COLUMN subscription_discounts.applied_by IS 'User ID of admin/teacher who applied the discount';
