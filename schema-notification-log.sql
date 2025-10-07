-- Add notification log table
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

CREATE INDEX idx_notification_log_sent_at ON notification_log(sent_at DESC);
CREATE INDEX idx_notification_log_status ON notification_log(status);
