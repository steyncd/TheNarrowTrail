-- Migration 008: Add Long-Lived Tokens Table

-- Create long_lived_tokens table
CREATE TABLE IF NOT EXISTS long_lived_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_name VARCHAR(255) NOT NULL,
  token_hash VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_used_at TIMESTAMP,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_long_lived_tokens_user_id ON long_lived_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_long_lived_tokens_token_hash ON long_lived_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_long_lived_tokens_expires_at ON long_lived_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_long_lived_tokens_revoked ON long_lived_tokens(revoked);
