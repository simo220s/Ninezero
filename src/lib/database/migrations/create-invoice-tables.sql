-- Invoice and Payment History System Database Schema
-- Task 12: Build Invoice and Payment History System
-- 
-- This migration creates tables for invoice management, payment history,
-- receipts, and tax documentation for the English teaching business

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id UUID,
  invoice_type VARCHAR(30) NOT NULL DEFAULT 'package_purchase',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00, -- Saudi VAT is 15%
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  notes_ar TEXT,
  payment_method VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_invoice_type CHECK (invoice_type IN ('package_purchase', 'class_booking', 'credit_purchase', 'subscription', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('paid', 'pending', 'cancelled', 'refunded', 'overdue')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash', 'wallet', 'package_credits') OR payment_method IS NULL),
  CONSTRAINT positive_amounts CHECK (total_amount >= 0 AND discount_amount >= 0 AND tax_amount >= 0 AND final_amount >= 0),
  CONSTRAINT valid_dates CHECK (due_date >= invoice_date)
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_type ON invoices(invoice_type);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- =====================================================
-- PAYMENT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100),
  payment_gateway VARCHAR(50),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT valid_payment_method_history CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash', 'wallet', 'package_credits')),
  CONSTRAINT positive_payment_amount CHECK (amount >= 0)
);

-- Create indexes for payment history
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_invoice_id ON payment_history(invoice_id);
CREATE INDEX idx_payment_history_payment_status ON payment_history(payment_status);
CREATE INDEX idx_payment_history_payment_date ON payment_history(payment_date DESC);
CREATE INDEX idx_payment_history_transaction_id ON payment_history(transaction_id);

-- =====================================================
-- RECEIPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_receipt_payment_method CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash', 'wallet', 'package_credits')),
  CONSTRAINT positive_receipt_amount CHECK (amount_paid > 0)
);

-- Create indexes for receipts
CREATE INDEX idx_receipts_invoice_id ON receipts(invoice_id);
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_payment_date ON receipts(payment_date DESC);

-- =====================================================
-- TAX DOCUMENTATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_documentation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  tax_period VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  invoice_count INTEGER NOT NULL DEFAULT 0,
  document_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_tax_year CHECK (tax_year >= 2020 AND tax_year <= 2100),
  CONSTRAINT positive_tax_amounts CHECK (total_amount >= 0 AND total_tax >= 0),
  CONSTRAINT positive_invoice_count CHECK (invoice_count >= 0),
  UNIQUE(user_id, tax_year, tax_period)
);

-- Create indexes for tax documentation
CREATE INDEX idx_tax_documentation_user_id ON tax_documentation(user_id);
CREATE INDEX idx_tax_documentation_tax_year ON tax_documentation(tax_year);
CREATE INDEX idx_tax_documentation_generated_at ON tax_documentation(generated_at DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_part TEXT;
  next_sequence INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  month_part := TO_CHAR(CURRENT_DATE, 'MM');
  
  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_sequence
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || month_part || '%';
  
  sequence_part := LPAD(next_sequence::TEXT, 4, '0');
  
  RETURN 'INV-' || year_part || month_part || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_part TEXT;
  next_sequence INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  month_part := TO_CHAR(CURRENT_DATE, 'MM');
  
  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_sequence
  FROM receipts
  WHERE receipt_number LIKE 'RCP-' || year_part || month_part || '%';
  
  sequence_part := LPAD(next_sequence::TEXT, 4, '0');
  
  RETURN 'RCP-' || year_part || month_part || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_invoice_number();

-- Trigger to auto-generate receipt number
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_receipt_number
BEFORE INSERT ON receipts
FOR EACH ROW
EXECUTE FUNCTION set_receipt_number();

-- Trigger to update invoice status to overdue
CREATE OR REPLACE FUNCTION check_invoice_overdue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.due_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_invoice_overdue
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION check_invoice_overdue();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_history_updated_at
BEFORE UPDATE ON payment_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Create invoice with automatic calculations
CREATE OR REPLACE FUNCTION create_invoice(
  p_user_id UUID,
  p_invoice_type VARCHAR,
  p_items JSONB,
  p_discount_amount DECIMAL DEFAULT 0,
  p_tax_rate DECIMAL DEFAULT 15.00,
  p_payment_method VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_notes_ar TEXT DEFAULT NULL,
  p_due_days INTEGER DEFAULT 7
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_total_amount DECIMAL;
  v_tax_amount DECIMAL;
  v_final_amount DECIMAL;
  v_due_date DATE;
BEGIN
  -- Calculate total from items
  SELECT COALESCE(SUM((item->>'total')::DECIMAL), 0)
  INTO v_total_amount
  FROM jsonb_array_elements(p_items) AS item;
  
  -- Calculate tax
  v_tax_amount := (v_total_amount - p_discount_amount) * (p_tax_rate / 100);
  
  -- Calculate final amount
  v_final_amount := v_total_amount - p_discount_amount + v_tax_amount;
  
  -- Calculate due date
  v_due_date := CURRENT_DATE + p_due_days;
  
  -- Insert invoice
  INSERT INTO invoices (
    user_id,
    invoice_type,
    total_amount,
    discount_amount,
    tax_amount,
    tax_rate,
    final_amount,
    due_date,
    items,
    payment_method,
    notes,
    notes_ar,
    status
  ) VALUES (
    p_user_id,
    p_invoice_type,
    v_total_amount,
    p_discount_amount,
    v_tax_amount,
    p_tax_rate,
    v_final_amount,
    v_due_date,
    p_items,
    p_payment_method,
    p_notes,
    p_notes_ar,
    'pending'
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Mark invoice as paid
CREATE OR REPLACE FUNCTION mark_invoice_paid(
  p_invoice_id UUID,
  p_payment_method VARCHAR,
  p_transaction_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_amount DECIMAL;
BEGIN
  -- Get invoice details
  SELECT user_id, final_amount
  INTO v_user_id, v_amount
  FROM invoices
  WHERE id = p_invoice_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update invoice
  UPDATE invoices
  SET status = 'paid',
      paid_date = CURRENT_DATE,
      payment_method = p_payment_method,
      updated_at = NOW()
  WHERE id = p_invoice_id;
  
  -- Create payment history record
  INSERT INTO payment_history (
    user_id,
    invoice_id,
    amount,
    payment_method,
    payment_status,
    transaction_id,
    payment_date
  ) VALUES (
    v_user_id,
    p_invoice_id,
    v_amount,
    p_payment_method,
    'completed',
    p_transaction_id,
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Get invoice statistics for a user
CREATE OR REPLACE FUNCTION get_invoice_stats(p_user_id UUID)
RETURNS TABLE (
  total_invoices BIGINT,
  total_amount DECIMAL,
  total_paid DECIMAL,
  total_pending DECIMAL,
  total_overdue DECIMAL,
  avg_invoice_amount DECIMAL,
  payment_success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(SUM(final_amount), 0),
    COALESCE(SUM(CASE WHEN status = 'paid' THEN final_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'pending' THEN final_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'overdue' THEN final_amount ELSE 0 END), 0),
    COALESCE(AVG(final_amount), 0),
    CASE 
      WHEN COUNT(*) > 0 THEN
        (COUNT(CASE WHEN status = 'paid' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0
    END
  FROM invoices
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Update overdue invoices (should be run daily)
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE invoices
  SET status = 'overdue',
      updated_at = NOW()
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Generate tax documentation for a period
CREATE OR REPLACE FUNCTION generate_tax_documentation(
  p_user_id UUID,
  p_tax_year INTEGER,
  p_tax_period VARCHAR,
  p_from_date DATE,
  p_to_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_doc_id UUID;
  v_total_amount DECIMAL;
  v_total_tax DECIMAL;
  v_invoice_count INTEGER;
BEGIN
  -- Calculate totals
  SELECT
    COALESCE(SUM(final_amount), 0),
    COALESCE(SUM(tax_amount), 0),
    COUNT(*)
  INTO v_total_amount, v_total_tax, v_invoice_count
  FROM invoices
  WHERE user_id = p_user_id
    AND status = 'paid'
    AND invoice_date BETWEEN p_from_date AND p_to_date;
  
  -- Insert or update tax documentation
  INSERT INTO tax_documentation (
    user_id,
    tax_year,
    tax_period,
    total_amount,
    total_tax,
    invoice_count
  ) VALUES (
    p_user_id,
    p_tax_year,
    p_tax_period,
    v_total_amount,
    v_total_tax,
    v_invoice_count
  )
  ON CONFLICT (user_id, tax_year, tax_period)
  DO UPDATE SET
    total_amount = EXCLUDED.total_amount,
    total_tax = EXCLUDED.total_tax,
    invoice_count = EXCLUDED.invoice_count,
    generated_at = NOW()
  RETURNING id INTO v_doc_id;
  
  RETURN v_doc_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_documentation ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment history"
  ON payment_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Receipts policies
CREATE POLICY "Users can view their own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tax documentation policies
CREATE POLICY "Users can view their own tax documentation"
  ON tax_documentation FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax documentation"
  ON tax_documentation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE invoices IS 'Stores invoice records for package purchases, class bookings, and credit purchases';
COMMENT ON TABLE payment_history IS 'Tracks all payment transactions and their status';
COMMENT ON TABLE receipts IS 'Stores receipt information for completed payments';
COMMENT ON TABLE tax_documentation IS 'Stores tax documentation and reports for users';

COMMENT ON COLUMN invoices.invoice_number IS 'Unique invoice number in format INV-YYYYMM####';
COMMENT ON COLUMN invoices.tax_rate IS 'Tax rate percentage (Saudi VAT is 15%)';
COMMENT ON COLUMN invoices.items IS 'JSON array of invoice line items';
COMMENT ON COLUMN receipts.receipt_number IS 'Unique receipt number in format RCP-YYYYMM####';
