-- Migration 012: Consolidate hike_attendees into hike_interest
-- This migration simplifies the data model by using a single table (hike_interest)
-- with attendance_status to track the full journey: interested -> confirmed -> attended
--
-- Business Flow:
-- 1. User expresses interest: INSERT into hike_interest with attendance_status='interested'
-- 2. User confirms: UPDATE attendance_status='confirmed' (stays in same table)
-- 3. After hike: UPDATE attendance_status='attended'
-- 4. Payment tracking: Separate hike_payments table (authoritative source)

-- Step 1: Migrate data from hike_attendees to hike_interest
-- For users in hike_attendees who aren't in hike_interest, create interest record
INSERT INTO hike_interest (hike_id, user_id, attendance_status, payment_status, amount_paid, created_at, updated_at)
SELECT
  ha.hike_id,
  ha.user_id,
  'confirmed' as attendance_status,
  ha.payment_status,
  ha.amount_paid,
  ha.added_at as created_at,
  NOW() as updated_at
FROM hike_attendees ha
WHERE NOT EXISTS (
  SELECT 1 FROM hike_interest hi
  WHERE hi.hike_id = ha.hike_id AND hi.user_id = ha.user_id
);

-- Step 2: For users who are in both tables, update hike_interest to 'confirmed'
UPDATE hike_interest hi
SET
  attendance_status = 'confirmed',
  payment_status = ha.payment_status,
  amount_paid = ha.amount_paid,
  updated_at = NOW()
FROM hike_attendees ha
WHERE hi.hike_id = ha.hike_id
  AND hi.user_id = ha.user_id
  AND hi.attendance_status = 'interested'; -- Only update if still marked as interested

-- Step 3: Drop the hike_attendees table (no longer needed)
DROP TABLE IF EXISTS hike_attendees;

-- Step 4: Update comments to reflect the new simplified model
COMMENT ON TABLE hike_interest IS 'Tracks user interest and attendance for hikes. Uses attendance_status to track the full journey: interested -> confirmed -> attended. Payment details tracked in separate hike_payments table.';
COMMENT ON COLUMN hike_interest.attendance_status IS 'Attendance status: interested (initial), confirmed (will attend), cancelled (no longer attending), attended (after hike completed)';
COMMENT ON COLUMN hike_interest.payment_status IS 'Quick-lookup cache for payment status. Source of truth is hike_payments table.';
COMMENT ON COLUMN hike_interest.amount_paid IS 'Quick-lookup cache for amount paid. Source of truth is hike_payments table.';

-- Note: After this migration:
-- - hike_interest is the single source for interest/attendance tracking
-- - hike_payments is the authoritative source for payment financial records
-- - payment_status/amount_paid in hike_interest are denormalized caches
