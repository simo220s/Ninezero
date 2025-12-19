-- Migration: Create Subscription Cancellation Tables
-- Description: Creates tables for managing subscription cancellations, feedback, and retention discounts
-- Date: 2024-11-12

-- ============================================================================
-- Table: cancellation_feedback
-- Purpose: Store user feedback when they initiate subscription cancellation
-- ============================================================================
CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reasons TEXT[] NOT NULL, -- Array of cancellation reason IDs
  additional_comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT cancellation_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_created_at ON cancellation_feedback(created_at DESC);

-- ============================================================================
-- Table: subscription_discounts
-- Purpose: Track retention discounts applied to subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  discount_type VARCHAR(50) NOT NULL DEFAULT 'retention', -- 'retention', 'promotional', 'custom'
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT cancellation_discount_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_discounts_user_id ON subscription_discounts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_subscription_id ON subscription_discounts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_active ON subscription_discounts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_dates ON subscription_discounts(start_date, end_date);

-- ============================================================================
-- Table: cancellation_requests
-- Purpose: Track subscription cancellation requests with 24-hour delay
-- ============================================================================
CREATE TABLE IF NOT EXISTS cancellation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL,
  reasons TEXT[] NOT NULL,
  discount_offered BOOLEAN NOT NULL DEFAULT FALSE,
  discount_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_date TIMESTAMPTZ NOT NULL, -- 24 hours after requested_at
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_by_user_at TIMESTAMPTZ, -- If user cancels the cancellation request
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_effective_date CHECK (effective_date > requested_at),
  CONSTRAINT cancellation_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_cancellation_requests_user_id ON cancellation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_subscription_id ON cancellation_requests(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_status ON cancellation_requests(status);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_effective_date ON cancellation_requests(effective_date);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_pending ON cancellation_requests(status, effective_date) WHERE status = 'pending';

-- ============================================================================
-- Function: Update updated_at timestamp
-- Purpose: Automatically update the updated_at column on row updates
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_discounts_updated_at
  BEFORE UPDATE ON subscription_discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cancellation_requests_updated_at
  BEFORE UPDATE ON cancellation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Function: Process pending cancellations
-- Purpose: Automatically process cancellation requests after 24-hour delay
-- ============================================================================
CREATE OR REPLACE FUNCTION process_pending_cancellations()
RETURNS void AS $$
BEGIN
  -- Update cancellation requests that have passed their effective date
  UPDATE cancellation_requests
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE 
    status = 'pending'
    AND effective_date <= NOW()
    AND cancelled_by_user_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Purpose: Ensure users can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_requests ENABLE ROW LEVEL SECURITY;

-- Policies for cancellation_feedback
CREATE POLICY "Users can view their own cancellation feedback"
  ON cancellation_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cancellation feedback"
  ON cancellation_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for subscription_discounts
CREATE POLICY "Users can view their own subscription discounts"
  ON subscription_discounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscription discounts"
  ON subscription_discounts FOR ALL
  USING (auth.role() = 'service_role');

-- Policies for cancellation_requests
CREATE POLICY "Users can view their own cancellation requests"
  ON cancellation_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cancellation requests"
  ON cancellation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending cancellation requests"
  ON cancellation_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE cancellation_feedback IS 'Stores user feedback when initiating subscription cancellation';
COMMENT ON TABLE subscription_discounts IS 'Tracks retention and promotional discounts applied to subscriptions';
COMMENT ON TABLE cancellation_requests IS 'Manages subscription cancellation requests with 24-hour delay mechanism';
COMMENT ON FUNCTION process_pending_cancellations() IS 'Processes cancellation requests that have passed their 24-hour delay period';

-- ============================================================================
-- Grant permissions
-- ============================================================================
GRANT SELECT, INSERT ON cancellation_feedback TO authenticated;
GRANT SELECT ON subscription_discounts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON cancellation_requests TO authenticated;
