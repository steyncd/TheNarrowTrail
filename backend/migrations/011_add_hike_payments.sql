-- Migration 011: Add hike payments tracking table
-- This adds a payments table to track user payments for hikes
-- Note: Payments are expenses for hikes, not revenue for the organization
--
-- Design Decision: Separate table from hike_interest for better domain separation
-- - Payments are financial transactions with their own lifecycle
-- - Attendance can change without affecting payment history
-- - Enables better audit trail and payment history tracking
-- - The existing payment_status/amount_paid in hike_interest can be kept for quick reference
--   but the hike_payments table is the source of truth for financial records

-- Create payments table
CREATE TABLE IF NOT EXISTS hike_payments (
  id SERIAL PRIMARY KEY,
  hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- e.g., 'cash', 'bank_transfer', 'card', 'other'
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'refunded'
  payment_date TIMESTAMP,
  notes TEXT,
  created_by INTEGER REFERENCES users(id), -- Admin who recorded the payment
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hike_id, user_id) -- One payment record per user per hike
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hike_payments_hike_id ON hike_payments(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_payments_user_id ON hike_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_hike_payments_status ON hike_payments(payment_status);

-- Add comments to document the table and fields
COMMENT ON TABLE hike_payments IS 'Tracks user payments for hikes - these are expenses to pay for hike costs, not organizational revenue. This is the authoritative source for payment records, separate from attendance tracking in hike_interest.';
COMMENT ON COLUMN hike_payments.amount IS 'Amount paid by user for the hike';
COMMENT ON COLUMN hike_payments.payment_method IS 'Method of payment: cash, bank_transfer, card, other';
COMMENT ON COLUMN hike_payments.payment_status IS 'Payment status: pending, paid, partial, refunded';
COMMENT ON COLUMN hike_payments.payment_date IS 'Date when payment was received';
COMMENT ON COLUMN hike_payments.created_by IS 'Admin user who recorded this payment';

-- Note: The hike_interest table also has payment_status and amount_paid fields.
-- These can be used as a denormalized cache for quick lookups, but hike_payments
-- is the authoritative source of truth for financial records.
