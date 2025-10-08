-- Create site_content table for storing editable content
CREATE TABLE IF NOT EXISTS site_content (
  id SERIAL PRIMARY KEY,
  content_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default content for Mission & Vision
INSERT INTO site_content (content_key, title, content) VALUES
('mission_vision', 'Our Mission & Vision',
'## Our Mission
We are committed to building character and fostering community through challenging outdoor adventures. Every trail we walk together strengthens our bonds and builds resilience.

## Our Vision
To create a community of adventurers who support each other, grow together, and discover the beauty of God''s creation on the narrow trail that leads to life.'),

('about_us', 'About The Narrow Trail',
'## Who We Are
The Narrow Trail is more than just a hiking group – we''re a community of adventurers who believe that outdoor challenges build character and strengthen friendships.

## What We Do
We organize regular hiking and trekking adventures for all skill levels, from beginner-friendly trails to challenging multi-day expeditions. Our goal is to make the outdoors accessible and enjoyable for everyone.

## Our Values
- **Character Building**: "Dit bou karakter" - Every challenge makes us stronger
- **Community**: Supporting each other on and off the trail
- **Faith**: Finding inspiration in God''s creation
- **Adventure**: Exploring new trails and pushing our limits

## Join Us
Whether you''re an experienced hiker or just starting out, you''re welcome on The Narrow Trail. Check out our upcoming adventures and join us on the journey!')
ON CONFLICT (content_key) DO NOTHING;

-- Create audit log for content changes
CREATE TABLE IF NOT EXISTS site_content_history (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES site_content(id),
  content_key VARCHAR(100),
  title VARCHAR(255),
  content TEXT NOT NULL,
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to track content changes
CREATE OR REPLACE FUNCTION log_content_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO site_content_history (content_id, content_key, title, content, updated_by)
  VALUES (OLD.id, OLD.content_key, OLD.title, OLD.content, OLD.updated_by);

  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log changes
DROP TRIGGER IF EXISTS content_change_trigger ON site_content;
CREATE TRIGGER content_change_trigger
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION log_content_change();
