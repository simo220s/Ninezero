-- Create subscription_plans table
-- This table stores subscription plan configurations that teachers can create and manage
-- Requirement 9.1: Interface to create and modify subscription plans

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  credits DECIMAL(10, 2) NOT NULL CHECK (credits > 0),
  duration VARCHAR(20) NOT NULL CHECK (duration IN ('monthly', 'quarterly', 'annual')),
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for active plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- Create index for duration
CREATE INDEX IF NOT EXISTS idx_subscription_plans_duration ON subscription_plans(duration);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Teachers can view all plans
CREATE POLICY "Teachers can view all subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Teachers can insert plans
CREATE POLICY "Teachers can create subscription plans"
  ON subscription_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Teachers can update plans
CREATE POLICY "Teachers can update subscription plans"
  ON subscription_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Teachers can delete plans
CREATE POLICY "Teachers can delete subscription plans"
  ON subscription_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'selem.vet@gmail.com'
    )
  );

-- Students can view active plans
CREATE POLICY "Students can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscription_plans_updated_at_trigger
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_plans_updated_at();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, name_ar, price, credits, duration, features, is_active)
VALUES
  ('8 Classes Package', 'باقة 8 حصص', 800.00, 8.0, 'monthly', ARRAY['8 classes', 'Flexible scheduling', 'Cancel anytime'], true),
  ('16 Classes Package', 'باقة 16 حصة', 1440.00, 16.0, 'monthly', ARRAY['16 classes', 'Priority booking', '20% discount', 'Flexible scheduling'], true),
  ('24 Classes Package', 'باقة 24 حصة', 2040.00, 24.0, 'monthly', ARRAY['24 classes', 'Priority booking', '30% discount', 'Flexible scheduling', 'Dedicated support'], true)
ON CONFLICT DO NOTHING;

-- Add comment to table
COMMENT ON TABLE subscription_plans IS 'Stores subscription plan configurations that teachers can create and manage';
COMMENT ON COLUMN subscription_plans.name IS 'English name of the subscription plan';
COMMENT ON COLUMN subscription_plans.name_ar IS 'Arabic name of the subscription plan';
COMMENT ON COLUMN subscription_plans.price IS 'Price of the subscription plan in SAR';
COMMENT ON COLUMN subscription_plans.credits IS 'Number of class credits included in the plan';
COMMENT ON COLUMN subscription_plans.duration IS 'Duration of the subscription plan (monthly, quarterly, annual)';
COMMENT ON COLUMN subscription_plans.features IS 'Array of features included in the plan';
COMMENT ON COLUMN subscription_plans.is_active IS 'Whether the plan is currently active and available for purchase';
