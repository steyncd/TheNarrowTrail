-- Migration: Add Performance Indexes
-- This migration adds database indexes to improve query performance
-- All indexes are created CONCURRENTLY to avoid locking tables in production


-- Hike Interest Indexes (for faster joins and lookups)
-- These improve performance for getHikes(), getMyHikes(), and interest toggles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_interest_user_id
  ON hike_interest(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_interest_hike_id
  ON hike_interest(hike_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_interest_status
  ON hike_interest(attendance_status);

-- Composite index for common queries filtering by hike and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_interest_hike_status
  ON hike_interest(hike_id, attendance_status);

-- Hikes Indexes (for date filtering and status queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hikes_date
  ON hikes(date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hikes_status
  ON hikes(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hikes_date_status
  ON hikes(date, status);

-- Users Indexes (for role-based queries and admin lookups)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role
  ON users(role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status
  ON users(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status
  ON users(role, status);

-- Comments Index (for fetching comments by hike)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_comments_hike_id
  ON hike_comments(hike_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_comments_user_id
  ON hike_comments(user_id);

-- Payments Indexes (for payment tracking and queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_payments_hike_id
  ON hike_payments(hike_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_payments_user_id
  ON hike_payments(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hike_payments_status
  ON hike_payments(payment_status);

-- Carpool Indexes (for carpool offers and requests)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carpool_offers_hike_id
  ON carpool_offers(hike_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carpool_requests_hike_id
  ON carpool_requests(hike_id);

-- Photos Index (for photo gallery)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_hike_name
  ON photos(hike_name);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_user_id
  ON photos(user_id);

-- Activity Logs Index (for admin activity monitoring)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_id
  ON activity_logs(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_created_at
  ON activity_logs(created_at DESC);

-- Feedback and Suggestions Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_user_id
  ON feedback(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suggestions_user_id
  ON suggestions(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suggestions_status
  ON suggestions(status);


-- Record migration (separate statement - can be run separately if needed)
INSERT INTO schema_migrations (version, executed_at)
VALUES ('999_add_performance_indexes', NOW())
ON CONFLICT (version) DO NOTHING;
