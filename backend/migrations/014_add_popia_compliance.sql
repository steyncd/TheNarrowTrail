-- Migration: Add POPIA compliance fields
-- Description: Adds fields to track user consent for POPIA compliance
-- Created: 2025-10-09

-- Add consent tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_consent_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_consent_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_processing_consent_date TIMESTAMP;

-- Update existing users to have consents marked as true (retroactive consent)
-- In a real scenario, you might want to prompt existing users to re-consent
UPDATE users 
SET privacy_consent_accepted = TRUE,
    privacy_consent_date = created_at,
    terms_accepted = TRUE,
    terms_accepted_date = created_at,
    data_processing_consent = TRUE,
    data_processing_consent_date = created_at
WHERE privacy_consent_accepted IS NULL OR privacy_consent_accepted = FALSE;

-- Add index for consent queries
CREATE INDEX IF NOT EXISTS idx_users_privacy_consent ON users(privacy_consent_accepted);

-- Add comment to document POPIA compliance
COMMENT ON COLUMN users.privacy_consent_accepted IS 'User consent for privacy policy - POPIA compliance';
COMMENT ON COLUMN users.terms_accepted IS 'User acceptance of terms and conditions';
COMMENT ON COLUMN users.data_processing_consent IS 'User consent for data processing - POPIA compliance';
