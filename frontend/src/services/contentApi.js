import { API_URL } from './api';

// Fetch content by key (public endpoint - no auth required)
export const getContent = async (key) => {
  try {
    const response = await fetch(`${API_URL}/api/public-content/${key}`);
    if (!response.ok) {
      throw new Error('Content not found');
    }
    return await response.json();
  } catch (err) {
    console.error(`Error fetching content ${key}:`, err);
    // Return default fallback content
    return getFallbackContent(key);
  }
};

// Update content (admin only)
export const updateContent = async (key, data, token) => {
  try {
    const response = await fetch(`${API_URL}/api/content/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update content');
    }

    return await response.json();
  } catch (err) {
    console.error('Update content error:', err);
    throw err;
  }
};

// Get all content (admin only)
export const getAllContent = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/content/admin/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch content list');
    }

    return await response.json();
  } catch (err) {
    console.error('Get all content error:', err);
    throw err;
  }
};

// Fallback content if API fails
const getFallbackContent = (key) => {
  const fallbacks = {
    'mission_vision': {
      content_key: 'mission_vision',
      title: 'Our Mission & Vision',
      content: `## Our Mission
We are committed to building character and fostering community through challenging outdoor adventures. Every trail we walk together strengthens our bonds and builds resilience.

## Our Vision
To create a community of adventurers who support each other, grow together, and discover the beauty of God's creation on the narrow trail that leads to life.`
    },
    'about_us': {
      content_key: 'about_us',
      title: 'About The Narrow Trail',
      content: `## Who We Are
The Narrow Trail is more than just a hiking group – we're a community of adventurers who believe that outdoor challenges build character and strengthen friendships.

## What We Do
We organize regular hiking and trekking adventures for all skill levels, from beginner-friendly trails to challenging multi-day expeditions. Our goal is to make the outdoors accessible and enjoyable for everyone.

## Our Values
- **Character Building**: "Dit bou karakter" - Every challenge makes us stronger
- **Community**: Supporting each other on and off the trail
- **Faith**: Finding inspiration in God's creation
- **Adventure**: Exploring new trails and pushing our limits

## Join Us
Whether you're an experienced hiker or just starting out, you're welcome on The Narrow Trail. Check out our upcoming adventures and join us on the journey!`
    }
  };

  return fallbacks[key] || { content_key: key, title: 'Content', content: 'Content not found' };
};
