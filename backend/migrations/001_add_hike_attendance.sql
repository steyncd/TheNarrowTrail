-- Migration: Add hike_attendance table for tracking confirmed attendance
-- This is different from hike_attendees which tracks admin-added attendees with payment

CREATE TABLE IF NOT EXISTS hike_attendance (
    id SERIAL PRIMARY KEY,
    hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(hike_id, user_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_hike_attendance_hike ON hike_attendance(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_attendance_user ON hike_attendance(user_id);

-- Optional: Migrate existing data from hike_attendees if needed
-- This is commented out - only run if you want to copy payment-confirmed attendees to attendance table
-- INSERT INTO hike_attendance (hike_id, user_id, confirmed_at, notes)
-- SELECT hike_id, user_id, added_at, notes
-- FROM hike_attendees
-- WHERE payment_status != 'unpaid'
-- ON CONFLICT (hike_id, user_id) DO NOTHING;
