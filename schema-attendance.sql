-- Add status field to hikes table
ALTER TABLE hikes ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'gathering_interest';
-- Possible values: gathering_interest, pre_planning, final_planning, trip_booked

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

CREATE INDEX idx_hike_attendees_hike ON hike_attendees(hike_id);
CREATE INDEX idx_hike_attendees_user ON hike_attendees(user_id);
