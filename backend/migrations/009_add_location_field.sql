-- Migration 009: Add location field to hikes table for weather forecast
-- This adds a location field (city/landmark name) for weather API lookups

ALTER TABLE hikes
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add comment to document the field
COMMENT ON COLUMN hikes.location IS 'City or landmark name for weather forecast lookups (e.g., "Cape Town", "Table Mountain")';

-- Update existing hikes to have a default location (optional, can be left NULL)
-- UPDATE hikes SET location = 'Cape Town' WHERE location IS NULL;
