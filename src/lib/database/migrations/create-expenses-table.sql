-- Create expenses table for financial management
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'أخرى',
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_teacher_id ON expenses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view their own expenses
CREATE POLICY "Teachers can view own expenses" ON expenses
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Policy: Teachers can insert their own expenses
CREATE POLICY "Teachers can insert own expenses" ON expenses
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can update their own expenses
CREATE POLICY "Teachers can update own expenses" ON expenses
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can delete their own expenses
CREATE POLICY "Teachers can delete own expenses" ON expenses
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expenses_updated_at();

-- Add comments
COMMENT ON TABLE expenses IS 'Tracks teacher expenses for financial management';
COMMENT ON COLUMN expenses.teacher_id IS 'Reference to the teacher/user who owns this expense';
COMMENT ON COLUMN expenses.category IS 'Expense category (e.g., materials, software, etc.)';
COMMENT ON COLUMN expenses.amount IS 'Expense amount in SAR';
COMMENT ON COLUMN expenses.receipt IS 'Optional receipt URL or reference';

