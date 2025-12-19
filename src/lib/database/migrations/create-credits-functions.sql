-- Database Functions for Credit Management
-- Ensures credits system works properly

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create class_credits table if it doesn't exist
CREATE TABLE IF NOT EXISTS class_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits DECIMAL(10, 2) DEFAULT 0 CHECK (credits >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_class_credits_user_id ON class_credits(user_id);

-- Function to add credits to a user
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  -- Insert or update credits
  INSERT INTO class_credits (user_id, credits, updated_at)
  VALUES (user_id, amount, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    credits = class_credits.credits + amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits from a user
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  -- Update credits, ensuring they don't go below 0
  UPDATE class_credits
  SET 
    credits = GREATEST(0, credits - amount),
    updated_at = NOW()
  WHERE class_credits.user_id = deduct_credits.user_id;
  
  -- If user doesn't exist, insert with 0 credits
  INSERT INTO class_credits (user_id, credits, updated_at)
  VALUES (user_id, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credits
CREATE OR REPLACE FUNCTION get_user_credits(user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  user_credits DECIMAL;
BEGIN
  SELECT credits INTO user_credits
  FROM class_credits
  WHERE class_credits.user_id = get_user_credits.user_id;
  
  -- Return 0 if user doesn't exist
  RETURN COALESCE(user_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to class_credits table
DROP TRIGGER IF EXISTS update_class_credits_updated_at ON class_credits;
CREATE TRIGGER update_class_credits_updated_at
  BEFORE UPDATE ON class_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON class_credits TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_credits(UUID) TO authenticated;

-- Add RLS policies
ALTER TABLE class_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own credits
CREATE POLICY "Users can view own credits" ON class_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Teachers can view all student credits
CREATE POLICY "Teachers can view student credits" ON class_credits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Policy: Teachers can update student credits
CREATE POLICY "Teachers can update student credits" ON class_credits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Policy: Teachers can insert student credits
CREATE POLICY "Teachers can insert student credits" ON class_credits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Create credit_transactions table for audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('add', 'deduct', 'purchase', 'refund', 'gift')),
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Grant permissions for credit_transactions
GRANT ALL ON credit_transactions TO authenticated;

-- Enable RLS for credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Teachers can view all transactions
CREATE POLICY "Teachers can view all transactions" ON credit_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Policy: Teachers can insert transactions
CREATE POLICY "Teachers can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Enhanced add_credits function with transaction logging
CREATE OR REPLACE FUNCTION add_credits_with_log(
  target_user_id UUID, 
  amount DECIMAL,
  description TEXT DEFAULT NULL,
  performed_by_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Add credits
  INSERT INTO class_credits (user_id, credits, updated_at)
  VALUES (target_user_id, amount, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    credits = class_credits.credits + amount,
    updated_at = NOW();
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description, performed_by)
  VALUES (target_user_id, amount, 'add', description, COALESCE(performed_by_id, auth.uid()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_credits_with_log(UUID, DECIMAL, TEXT, UUID) TO authenticated;

-- Comment: This migration creates all necessary functions and tables for credit management
COMMENT ON FUNCTION add_credits IS 'Adds credits to a user account';
COMMENT ON FUNCTION deduct_credits IS 'Deducts credits from a user account';
COMMENT ON FUNCTION get_user_credits IS 'Gets the current credit balance for a user';
COMMENT ON FUNCTION add_credits_with_log IS 'Adds credits and logs the transaction';

