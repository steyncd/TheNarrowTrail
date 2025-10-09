-- Migration 013: Add notification preferences table for granular notification control
-- This allows users to enable/disable specific notification types

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(notification_type);

-- Add comment
COMMENT ON TABLE notification_preferences IS 'Stores per-user, per-notification-type preferences for email and WhatsApp notifications';

-- Populate default preferences for existing users
-- Only add preferences for admin notifications to existing admin users
INSERT INTO notification_preferences (user_id, notification_type, email_enabled, whatsapp_enabled)
SELECT
  u.id,
  nt.type_code,
  u.notifications_email,
  u.notifications_whatsapp
FROM users u
CROSS JOIN (
  VALUES
    ('new_registration'),
    ('hike_interest'),
    ('attendance_confirmed'),
    ('new_feedback'),
    ('new_suggestion')
) AS nt(type_code)
WHERE u.role = 'admin' AND u.status = 'approved'
ON CONFLICT (user_id, notification_type) DO NOTHING;

-- Note: User-facing notifications (like new_hike_added, password_reset, etc.)
-- will be controlled by the global notifications_email and notifications_whatsapp flags
-- unless the user explicitly sets a preference

COMMIT;
