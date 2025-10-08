-- Migration: Add Performance Indexes (WITHOUT CONCURRENT)
-- This version uses regular CREATE INDEX which can run in transactions
-- Use this version in DataGrip if CONCURRENT version fails
-- Note: This will briefly lock tables, but should be fine for small datasets

BEGIN;

-- Hike Interest Indexes (for faster joins and lookups)
CREATE INDEX IF NOT EXISTS idx_hike_interest_user_id
  ON hike_interest(user_id);

CREATE INDEX IF NOT EXISTS idx_hike_interest_hike_id
  ON hike_interest(hike_id);

CREATE INDEX IF NOT EXISTS idx_hike_interest_status
  ON hike_interest(attendance_status);

CREATE INDEX IF NOT EXISTS idx_hike_interest_hike_status
  ON hike_interest(hike_id, attendance_status);

-- Hikes Indexes
CREATE INDEX IF NOT EXISTS idx_hikes_date
  ON hikes(date);

CREATE INDEX IF NOT EXISTS idx_hikes_status
  ON hikes(status);

CREATE INDEX IF NOT EXISTS idx_hikes_date_status
  ON hikes(date, status);

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_role
  ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_status
  ON users(status);

CREATE INDEX IF NOT EXISTS idx_users_role_status
  ON users(role, status);

-- Comments Index
CREATE INDEX IF NOT EXISTS idx_hike_comments_hike_id
  ON hike_comments(hike_id);

CREATE INDEX IF NOT EXISTS idx_hike_comments_user_id
  ON hike_comments(user_id);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_hike_payments_hike_id
  ON hike_payments(hike_id);

CREATE INDEX IF NOT EXISTS idx_hike_payments_user_id
  ON hike_payments(user_id);

CREATE INDEX IF NOT EXISTS idx_hike_payments_status
  ON hike_payments(payment_status);

-- Carpool Indexes
CREATE INDEX IF NOT EXISTS idx_carpool_offers_hike_id
  ON carpool_offers(hike_id);

CREATE INDEX IF NOT EXISTS idx_carpool_requests_hike_id
  ON carpool_requests(hike_id);

-- Photos Index
CREATE INDEX IF NOT EXISTS idx_photos_hike_name
  ON photos(hike_name);

CREATE INDEX IF NOT EXISTS idx_photos_user_id
  ON photos(user_id);

-- Activity Logs Index
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id
  ON activity_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
  ON activity_logs(created_at DESC);

-- Feedback and Suggestions Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id
  ON feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_suggestions_user_id
  ON suggestions(user_id);

CREATE INDEX IF NOT EXISTS idx_suggestions_status
  ON suggestions(status);

COMMIT;

-- Note: schema_migrations table doesn't exist in this database
-- No need to record this migration - the indexes themselves are the record
