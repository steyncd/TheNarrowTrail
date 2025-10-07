-- Migration 007: Add Suggestions Table

-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  suggestion_type VARCHAR(50) NOT NULL CHECK (suggestion_type IN ('date_only', 'destination_only', 'date_and_destination')),
  suggested_date DATE,
  destination_name TEXT,
  destination_description TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_type ON suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_date ON suggestions(suggested_date);
