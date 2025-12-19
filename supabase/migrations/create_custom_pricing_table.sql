-- Custom Pricing Table Migration
-- Requirement 9.2: Database schema for custom pricing

-- Create custom_pricing table
CREATE TABLE IF NOT EXISTS custom_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_price DECIMAL(10, 2) NOT NULL CHECK (custom_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one custom price per student-teacher pair
  UNIQUE(student_id, teacher_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_pricing_student ON custom_pricing(student_id);
CREATE INDEX IF NOT EXISTS idx_custom_pricing_teacher ON custom_pricing(teacher_id);

-- Enable Row Level Security
ALTER TABLE custom_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view their own custom pricing records
CREATE POLICY "Teachers can view their custom pricing"
  ON custom_pricing
  FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR student_id = auth.uid()
  );

-- Policy: Teachers can insert custom pricing for their students
CREATE POLICY "Teachers can insert custom pricing"
  ON custom_pricing
  FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'teacher'
    )
  );

-- Policy: Teachers can update their own custom pricing records
CREATE POLICY "Teachers can update their custom pricing"
  ON custom_pricing
  FOR UPDATE
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Policy: Teachers can delete their own custom pricing records
CREATE POLICY "Teachers can delete their custom pricing"
  ON custom_pricing
  FOR DELETE
  USING (teacher_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_custom_pricing_timestamp
  BEFORE UPDATE ON custom_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_pricing_updated_at();

-- Add comments for documentation
COMMENT ON TABLE custom_pricing IS 'Stores custom pricing set by teachers for individual students';
COMMENT ON COLUMN custom_pricing.student_id IS 'Reference to the student user';
COMMENT ON COLUMN custom_pricing.teacher_id IS 'Reference to the teacher who set the custom price';
COMMENT ON COLUMN custom_pricing.custom_price IS 'Custom price in SAR (Saudi Riyal)';
