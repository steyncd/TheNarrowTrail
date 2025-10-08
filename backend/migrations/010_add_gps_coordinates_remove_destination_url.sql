-- Migration 010: Add GPS coordinates field and remove destination_url field
-- This adds a gps_coordinates field for accurate map location display
-- and removes the duplicate destination_url field (keeping destination_website)

-- Add gps_coordinates column
ALTER TABLE hikes
ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(50);

-- Add comment to document the field
COMMENT ON COLUMN hikes.gps_coordinates IS 'GPS coordinates in "latitude, longitude" format (e.g., "-33.9249, 18.4241") for accurate map display';

-- Remove destination_url column (duplicate of destination_website)
ALTER TABLE hikes
DROP COLUMN IF EXISTS destination_url;
