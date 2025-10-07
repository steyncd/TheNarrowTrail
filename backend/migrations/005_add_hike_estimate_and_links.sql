-- Migration 005: Add estimate flags and website links to hikes

-- Add price_is_estimate column
ALTER TABLE hikes
ADD COLUMN IF NOT EXISTS price_is_estimate BOOLEAN DEFAULT false;

-- Add date_is_estimate column
ALTER TABLE hikes
ADD COLUMN IF NOT EXISTS date_is_estimate BOOLEAN DEFAULT false;

-- Add location_link column (e.g., Google Maps link)
ALTER TABLE hikes
ADD COLUMN IF NOT EXISTS location_link TEXT;

-- Add destination_website column (e.g., official park/trail website)
ALTER TABLE hikes
ADD COLUMN IF NOT EXISTS destination_website TEXT;
