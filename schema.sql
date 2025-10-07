-- PostgreSQL Database Schema for Hiking Portal
-- This script is idempotent and can be run multiple times safely

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) DEFAULT 'hiker' CHECK (role IN ('admin', 'hiker')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expiry TIMESTAMP,
    notifications_email BOOLEAN DEFAULT true,
    notifications_whatsapp BOOLEAN DEFAULT true,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hikes table
CREATE TABLE IF NOT EXISTS hikes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard')),
    distance VARCHAR(50) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'day' CHECK (type IN ('day', 'multi')),
    cost DECIMAL(10, 2) DEFAULT 0,
    group_type VARCHAR(20) DEFAULT 'family' CHECK (group_type IN ('family', 'mens')),
    status VARCHAR(50) DEFAULT 'gathering_interest',
    image_url TEXT,
    destination_url TEXT,
    daily_distances JSONB,
    overnight_facilities TEXT,
    default_packing_list JSONB,
    price_is_estimate BOOLEAN DEFAULT false,
    date_is_estimate BOOLEAN DEFAULT false,
    location_link TEXT,
    destination_website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns if they don't exist (for existing databases)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'hikes' AND column_name = 'status') THEN
        ALTER TABLE hikes ADD COLUMN status VARCHAR(50) DEFAULT 'gathering_interest';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'hikes' AND column_name = 'image_url') THEN
        ALTER TABLE hikes ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'hikes' AND column_name = 'destination_url') THEN
        ALTER TABLE hikes ADD COLUMN destination_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'hikes' AND column_name = 'daily_distances') THEN
        ALTER TABLE hikes ADD COLUMN daily_distances JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'hikes' AND column_name = 'overnight_facilities') THEN
        ALTER TABLE hikes ADD COLUMN overnight_facilities TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'email_verification_token') THEN
        ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'email_verification_expiry') THEN
        ALTER TABLE users ADD COLUMN email_verification_expiry TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE users ADD COLUMN emergency_contact_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE users ADD COLUMN emergency_contact_phone VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'medical_info') THEN
        ALTER TABLE users ADD COLUMN medical_info TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'hikes' AND column_name = 'default_packing_list') THEN
        ALTER TABLE hikes ADD COLUMN default_packing_list JSONB;
    END IF;
END $$;

-- Hike Interest (many-to-many relationship)
CREATE TABLE IF NOT EXISTS hike_interest (
    id SERIAL PRIMARY KEY,
    hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) DEFAULT 'interested' CHECK (attendance_status IN ('interested', 'confirmed', 'cancelled', 'attended')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hike_id, user_id)
);

-- Indexes for hike_interest
CREATE INDEX IF NOT EXISTS idx_hike_interest_attendance_status ON hike_interest(attendance_status);
CREATE INDEX IF NOT EXISTS idx_hike_interest_payment_status ON hike_interest(payment_status);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    hike_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    url TEXT NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification log table
CREATE TABLE IF NOT EXISTS notification_log (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    error TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- Hike attendees table
CREATE TABLE IF NOT EXISTS hike_attendees (
    id SERIAL PRIMARY KEY,
    hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(hike_id, user_id)
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_hikes_date ON hikes(date);
CREATE INDEX IF NOT EXISTS idx_hike_interest_hike_id ON hike_interest(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_interest_user_id ON hike_interest(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);
CREATE INDEX IF NOT EXISTS idx_hike_attendees_hike ON hike_attendees(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_attendees_user ON hike_attendees(user_id);

-- -- Insert default admin user (password: admin123) - only if not exists
-- -- Note: This is a bcrypt hash of 'admin123'
-- INSERT INTO users (name, email, password, phone, role, status, created_at)
-- SELECT
--     'Admin User',
--     'admin@hiking.com',
--     '$2a$10$X7vKZ5Y9kYZK5Y9kYZK5YeJ5Y9kYZK5Y9kYZK5Y9kYZK5Y9kYZK5Y.',
--     '+27123456789',
--     'admin',
--     'approved',
--     NOW()
-- WHERE NOT EXISTS (
--     SELECT 1 FROM users WHERE email = 'admin@hiking.com'
-- );

-- -- Insert sample hiker (password: hiker123) - only if not exists
-- INSERT INTO users (name, email, password, phone, role, status, created_at)
-- SELECT
--     'John Doe',
--     'hiker@hiking.com',
--     '$2a$10$Y8wLZ6A0lAZL6A0lAZL6AeK6A0lAZL6A0lAZL6A0lAZL6A0lAZL6A.',
--     '+27987654321',
--     'hiker',
--     'approved',
--     NOW()
-- WHERE NOT EXISTS (
--     SELECT 1 FROM users WHERE email = 'hiker@hiking.com'
-- );

-- -- Insert sample hikes - only if not exists
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM hikes WHERE name = 'Table Mountain Summit') THEN
--         INSERT INTO hikes (name, date, difficulty, distance, description, type, cost, group_type, status, created_at)
--         VALUES
--         (
--             'Table Mountain Summit',
--             '2025-10-15',
--             'Moderate',
--             '8km',
--             'Classic route to the top of Table Mountain with spectacular views',
--             'day',
--             0,
--             'family',
--             'gathering_interest',
--             NOW()
--         );
--     END IF;

--     IF NOT EXISTS (SELECT 1 FROM hikes WHERE name = 'Lions Head Sunset Hike') THEN
--         INSERT INTO hikes (name, date, difficulty, distance, description, type, cost, group_type, status, created_at)
--         VALUES
--         (
--             'Lions Head Sunset Hike',
--             '2025-10-22',
--             'Easy',
--             '5km',
--             'Beautiful sunset views from Lions Head',
--             'day',
--             0,
--             'family',
--             'gathering_interest',
--             NOW()
--         );
--     END IF;

--     IF NOT EXISTS (SELECT 1 FROM hikes WHERE name = 'Drakensberg 3-Day Trek') THEN
--         INSERT INTO hikes (name, date, difficulty, distance, description, type, cost, group_type, status, created_at)
--         VALUES
--         (
--             'Drakensberg 3-Day Trek',
--             '2025-11-05',
--             'Hard',
--             '45km',
--             'Multi-day adventure through the Drakensberg mountains',
--             'multi',
--             1500,
--             'mens',
--             'gathering_interest',
--             NOW()
--         );
--     END IF;
-- END $$;

-- Insert sample interest - only if not exists
-- INSERT INTO hike_interest (hike_id, user_id, created_at)
-- SELECT 1, 2, NOW()
-- WHERE EXISTS (SELECT 1 FROM users WHERE id = 2)
--   AND EXISTS (SELECT 1 FROM hikes WHERE id = 1)
--   AND NOT EXISTS (SELECT 1 FROM hike_interest WHERE hike_id = 1 AND user_id = 2);

-- Hike Comments table
CREATE TABLE IF NOT EXISTS hike_comments (
    id SERIAL PRIMARY KEY,
    hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hike_comments_hike ON hike_comments(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_comments_created ON hike_comments(created_at DESC);

-- Carpooling table
CREATE TABLE IF NOT EXISTS carpool_offers (
    id SERIAL PRIMARY KEY,
    hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    departure_location VARCHAR(255) NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    departure_time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carpool_hike ON carpool_offers(hike_id);

-- Carpool requests table
CREATE TABLE IF NOT EXISTS carpool_requests (
    id SERIAL PRIMARY KEY,
    hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_location VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hike_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_carpool_requests_hike ON carpool_requests(hike_id);

-- Packing lists table
CREATE TABLE IF NOT EXISTS packing_lists (
    id SERIAL PRIMARY KEY,
    hike_id INTEGER NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hike_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_packing_lists_hike_user ON packing_lists(hike_id, user_id);

-- Hiking achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_data JSONB,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at - drop and recreate to ensure they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hikes_updated_at ON hikes;
CREATE TRIGGER update_hikes_updated_at BEFORE UPDATE ON hikes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sign-in Log Table
CREATE TABLE IF NOT EXISTS signin_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  signin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for logs
CREATE INDEX IF NOT EXISTS idx_signin_log_user_id ON signin_log(user_id);
CREATE INDEX IF NOT EXISTS idx_signin_log_signin_time ON signin_log(signin_time DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('suggestion', 'bug', 'feature', 'compliment', 'complaint', 'other')),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
