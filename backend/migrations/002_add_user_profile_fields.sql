-- Migration: Add User Profile Fields
-- Date: 2025-10-07
-- Description: Adds profile photo, bio, experience level, and preferences for user profiles

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hiking_since DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) DEFAULT 'beginner'
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_difficulty VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'members_only', 'private'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON users(experience_level);
CREATE INDEX IF NOT EXISTS idx_users_profile_visibility ON users(profile_visibility);

-- Add comments for documentation
COMMENT ON COLUMN users.profile_photo_url IS 'URL to user profile photo (cloud storage)';
COMMENT ON COLUMN users.bio IS 'Short user biography (max 500 chars recommended)';
COMMENT ON COLUMN users.hiking_since IS 'Date when user started hiking';
COMMENT ON COLUMN users.experience_level IS 'User hiking experience level';
COMMENT ON COLUMN users.preferred_difficulty IS 'User preferred hike difficulty';
COMMENT ON COLUMN users.profile_visibility IS 'Who can view this profile';
