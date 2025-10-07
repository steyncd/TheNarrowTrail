-- Migration 001: Add notification log table
-- Description: Creates notification_log table for tracking email and WhatsApp notifications
-- Date: 2025-10-07

CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'email' or 'whatsapp'
  recipient VARCHAR(255) NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'sent', 'failed', 'skipped'
  error TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);
