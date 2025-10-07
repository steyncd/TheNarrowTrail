-- Migration 002: Add hike attendees tracking
-- Description: Creates hike_attendees table for tracking confirmed attendees and payments
-- Date: 2025-10-07

-- Add status field to hikes table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hikes' AND column_name = 'status'
    ) THEN
        ALTER TABLE hikes ADD COLUMN status VARCHAR(50) DEFAULT 'gathering_interest';
    END IF;
END $$;

-- Create attendees table for tracking confirmed attendees and payments
CREATE TABLE IF NOT EXISTS hike_attendees (
  id SERIAL PRIMARY KEY,
  hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, partial, paid
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hike_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hike_attendees_hike ON hike_attendees(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_attendees_user ON hike_attendees(user_id);
