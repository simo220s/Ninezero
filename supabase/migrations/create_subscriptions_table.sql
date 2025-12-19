-- Create subscriptions table
-- This table stores active student subscriptions with their status, credits, and payment information
-- Requirement 9.3: Display all active subscriptions with student details

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  plan_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  renewal_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  credits DECIMAL(10, 2) NOT NULL CHECK (credits > 0),
  used_credits DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (used_credits >= 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  discount_percentage DECIMAL(5, 2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  custom_price DECIMAL(10, 2) CHECK (custom_price > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions(renewal_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Teachers can view all subscriptions
CREATE POLICY "Teachers can view all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Teachers can insert subscriptions
CREATE POLICY "Teachers can create subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Teachers can update subscriptions
CREATE POLICY "Teachers can update subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Teachers can delete subscriptions
CREATE POLICY "Teachers can delete subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Students can view their own subscriptions
CREATE POLICY "Students can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Students can update their own subscriptions (for cancellation)
CREATE POLICY "Students can update their own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Create function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
  AND renewal_date < TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql;

-- Add comment to table
COMMENT ON TABLE subscriptions IS 'Stores active student subscriptions with their status, credits, and payment information';
COMMENT ON COLUMN subscriptions.user_id IS 'Reference to the user who owns this subscription';
COMMENT ON COLUMN subscriptions.plan_id IS 'Reference to the subscription plan (nullable for custom subscriptions)';
COMMENT ON COLUMN subscriptions.plan_name IS 'Name of the subscription plan';
COMMENT ON COLUMN subscriptions.status IS 'Current status of the subscription (active, cancelled, expired)';
COMMENT ON COLUMN subscriptions.start_date IS 'Date when the subscription started';
COMMENT ON COLUMN subscriptions.renewal_date IS 'Date when the subscription will renew or expire';
COMMENT ON COLUMN subscriptions.cancellation_date IS 'Date when the subscription was cancelled (if applicable)';
COMMENT ON COLUMN subscriptions.credits IS 'Total number of class credits in this subscription';
COMMENT ON COLUMN subscriptions.used_credits IS 'Number of credits already used';
COMMENT ON COLUMN subscriptions.price IS 'Base price of the subscription';
COMMENT ON COLUMN subscriptions.discount_percentage IS 'Discount percentage applied to the subscription';
COMMENT ON COLUMN subscriptions.custom_price IS 'Custom price set by teacher (overrides base price)';

