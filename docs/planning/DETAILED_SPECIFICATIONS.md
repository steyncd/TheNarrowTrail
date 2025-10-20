# Detailed Specifications: Outdoor Adventures Portal

**Date:** October 19, 2025
**Version:** 1.0
**Status:** Reference Document for Full Implementation

---

## Table of Contents

1. [Component Specifications](#component-specifications)
2. [API Specifications](#api-specifications)
3. [Database Schema Reference](#database-schema-reference)
4. [UI/UX Specifications](#uiux-specifications)
5. [Event Type Field Schemas](#event-type-field-schemas)
6. [Implementation Checklist](#implementation-checklist)

---

## Component Specifications

### 1. EventTypeSelector Component

**File:** `frontend/src/components/events/EventTypeSelector.js`

**Purpose:** Allow users to select event type when creating/editing events

**Props:**
```typescript
interface EventTypeSelectorProps {
  value: string;          // Selected event type name
  onChange: (name: string) => void;
  disabled?: boolean;
  showIcons?: boolean;    // Default: true
  layout?: 'grid' | 'list';  // Default: 'grid'
}
```

**Implementation:**
```jsx
import React, { useState, useEffect } from 'react';
import { Mountain, Tent, Truck, Fish, Compass } from 'lucide-react';
import api from '../../services/api';

const EVENT_TYPE_ICONS = {
  hiking: Mountain,
  camping: Tent,
  '4x4': Truck,
  fishing: Fish,
  outdoor: Compass
};

const EventTypeSelector = ({ value, onChange, disabled = false, showIcons = true, layout = 'grid' }) => {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      const response = await api.getEventTypes(true);
      setEventTypes(response.eventTypes || []);
    } catch (error) {
      console.error('Failed to load event types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading event types...</div>;
  }

  return (
    <div className={`event-type-selector ${layout === 'grid' ? 'grid-layout' : 'list-layout'}`}>
      {eventTypes.map(type => {
        const Icon = showIcons ? EVENT_TYPE_ICONS[type.name] || Compass : null;
        const isSelected = value === type.name;

        return (
          <button
            key={type.id}
            type="button"
            className={`event-type-button ${isSelected ? 'selected' : ''}`}
            onClick={() => onChange(type.name)}
            disabled={disabled}
            style={{
              borderColor: isSelected ? type.color : '#ddd',
              backgroundColor: isSelected ? `${type.color}15` : 'white'
            }}
          >
            {Icon && <Icon size={24} color={type.color} />}
            <span className="event-type-label">{type.display_name}</span>
            {type.description && (
              <span className="event-type-desc">{type.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EventTypeSelector;
```

**CSS:**
```css
.event-type-selector.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.event-type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.event-type-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.event-type-button.selected {
  border-width: 3px;
}

.event-type-label {
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.event-type-desc {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}
```

---

### 2. TagSelector Component

**File:** `frontend/src/components/events/TagSelector.js`

**Purpose:** Multi-select tags with category grouping and custom tag creation

**Props:**
```typescript
interface TagSelectorProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  allowCustom?: boolean;    // Default: true
  maxTags?: number;         // Default: unlimited
  categories?: string[];    // Filter by categories
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  category: string;
  color: string;
  icon?: string;
}
```

**Implementation:**
```jsx
import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TagSelector = ({
  selectedTags,
  onChange,
  allowCustom = true,
  maxTags = null,
  categories = null
}) => {
  const { token } = useAuth();
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsByCategory, setTagsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [customTagName, setCustomTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadTags();
  }, [categories]);

  const loadTags = async () => {
    try {
      const response = await api.getTags(null, null);
      const tags = response.tags || [];

      // Filter by categories if specified
      const filteredTags = categories
        ? tags.filter(t => categories.includes(t.category))
        : tags;

      setAvailableTags(filteredTags);

      // Group by category
      const grouped = filteredTags.reduce((acc, tag) => {
        if (!acc[tag.category]) acc[tag.category] = [];
        acc[tag.category].push(tag);
        return acc;
      }, {});
      setTagsByCategory(grouped);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag) => {
    if (maxTags && selectedTags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`);
      return;
    }
    if (!selectedTags.find(t => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId) => {
    onChange(selectedTags.filter(t => t.id !== tagId));
  };

  const createCustomTag = async () => {
    if (!customTagName.trim()) return;
    if (!token) {
      alert('Please log in to create custom tags');
      return;
    }

    setCreatingTag(true);
    try {
      const response = await api.createTag({
        name: customTagName.trim(),
        category: 'custom'
      }, token);

      if (response.success) {
        addTag(response.tag);
        setCustomTagName('');
        await loadTags(); // Refresh tag list
      } else {
        alert(response.error || 'Failed to create tag');
      }
    } catch (error) {
      alert(error.message || 'Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const categoriesToShow = activeCategory === 'all'
    ? Object.keys(tagsByCategory)
    : [activeCategory];

  return (
    <div className="tag-selector">
      {/* Selected Tags */}
      <div className="selected-tags">
        <h4>Selected Tags ({selectedTags.length}{maxTags ? `/${maxTags}` : ''})</h4>
        <div className="tag-badges">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="tag-badge"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="tag-remove"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={activeCategory === 'all' ? 'active' : ''}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {Object.keys(tagsByCategory).map(category => (
          <button
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Available Tags */}
      <div className="available-tags">
        {loading ? (
          <div>Loading tags...</div>
        ) : (
          categoriesToShow.map(category => (
            <div key={category} className="tag-category">
              <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
              <div className="tag-options">
                {tagsByCategory[category]?.map(tag => {
                  const isSelected = selectedTags.some(t => t.id === tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`tag-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => isSelected ? removeTag(tag.id) : addTag(tag)}
                      disabled={isSelected || (maxTags && selectedTags.length >= maxTags)}
                      style={{
                        backgroundColor: isSelected ? tag.color : 'white',
                        borderColor: tag.color,
                        color: isSelected ? 'white' : tag.color
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Tag Creation */}
      {allowCustom && (
        <div className="custom-tag-creator">
          <h5>Create Custom Tag</h5>
          <div className="custom-tag-input">
            <input
              type="text"
              value={customTagName}
              onChange={(e) => setCustomTagName(e.target.value)}
              placeholder="Enter tag name..."
              onKeyPress={(e) => e.key === 'Enter' && createCustomTag()}
              disabled={creatingTag}
            />
            <button
              type="button"
              onClick={createCustomTag}
              disabled={!customTagName.trim() || creatingTag}
              className="btn-create-tag"
            >
              <Plus size={16} />
              {creatingTag ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
```

---

### 3. CampingFields Component

**File:** `frontend/src/components/events/eventTypes/CampingFields.js`

**Purpose:** Camping-specific form fields

**Props:**
```typescript
interface CampingFieldsProps {
  data: CampingData;
  onChange: (data: CampingData) => void;
  errors?: Record<string, string>;
}

interface CampingData {
  site_type: string;
  facilities: string[];
  site_capacity: number;
  camping_fees: string;
  fire_allowed: boolean;
  pets_allowed: boolean;
  vehicle_access: string;
}
```

**Implementation:**
```jsx
import React from 'react';

const SITE_TYPES = [
  { value: 'backcountry', label: 'Backcountry' },
  { value: 'established', label: 'Established Campground' },
  { value: 'glamping', label: 'Glamping' },
  { value: 'rv_park', label: 'RV Park' }
];

const FACILITIES = [
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'showers', label: 'Showers' },
  { value: 'toilets', label: 'Toilets' },
  { value: 'fire_pits', label: 'Fire Pits' },
  { value: 'picnic_tables', label: 'Picnic Tables' }
];

const CampingFields = ({ data, onChange, errors = {} }) => {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const toggleFacility = (facility) => {
    const facilities = data.facilities || [];
    const updated = facilities.includes(facility)
      ? facilities.filter(f => f !== facility)
      : [...facilities, facility];
    updateField('facilities', updated);
  };

  return (
    <div className="camping-fields">
      <h4>Camping Details</h4>

      {/* Site Type */}
      <div className="form-group">
        <label>Site Type *</label>
        <select
          value={data.site_type || ''}
          onChange={(e) => updateField('site_type', e.target.value)}
          className={errors.site_type ? 'error' : ''}
        >
          <option value="">Select site type</option>
          {SITE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.site_type && <span className="error-text">{errors.site_type}</span>}
      </div>

      {/* Facilities */}
      <div className="form-group">
        <label>Facilities Available</label>
        <div className="checkbox-grid">
          {FACILITIES.map(facility => (
            <label key={facility.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={(data.facilities || []).includes(facility.value)}
                onChange={() => toggleFacility(facility.value)}
              />
              {facility.label}
            </label>
          ))}
        </div>
      </div>

      {/* Site Capacity */}
      <div className="form-group">
        <label>Site Capacity</label>
        <input
          type="number"
          value={data.site_capacity || ''}
          onChange={(e) => updateField('site_capacity', parseInt(e.target.value) || 0)}
          placeholder="Maximum number of campers"
          min="1"
        />
      </div>

      {/* Camping Fees */}
      <div className="form-group">
        <label>Camping Fees</label>
        <input
          type="text"
          value={data.camping_fees || ''}
          onChange={(e) => updateField('camping_fees', e.target.value)}
          placeholder="e.g., R150 per night"
        />
      </div>

      {/* Fire Allowed */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={data.fire_allowed || false}
            onChange={(e) => updateField('fire_allowed', e.target.checked)}
          />
          Fire/Braai Allowed
        </label>
      </div>

      {/* Pets Allowed */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={data.pets_allowed || false}
            onChange={(e) => updateField('pets_allowed', e.target.checked)}
          />
          Pets Allowed
        </label>
      </div>

      {/* Vehicle Access */}
      <div className="form-group">
        <label>Vehicle Access</label>
        <select
          value={data.vehicle_access || ''}
          onChange={(e) => updateField('vehicle_access', e.target.value)}
        >
          <option value="">Select access type</option>
          <option value="direct">Direct to Site</option>
          <option value="parking_lot">Parking Lot (Walk-in)</option>
          <option value="no_vehicle">No Vehicle Access</option>
        </select>
      </div>
    </div>
  );
};

export default CampingFields;
```

---

## Event Type Field Schemas

Complete JSON schemas for each event type's `event_type_data` field:

### Hiking
```json
{
  "difficulty": "moderate",
  "distance": "12km",
  "elevation_gain": "450m",
  "elevation_loss": "380m",
  "daily_distances": ["6km", "6km"],
  "overnight_facilities": "Mountain hut with bunks",
  "trail_type": "marked trail",
  "water_sources": true,
  "technical_sections": ["Rocky Pass"]
}
```

### Camping
```json
{
  "site_type": "established",
  "facilities": ["water", "toilets", "fire_pits"],
  "site_capacity": 50,
  "camping_fees": "R150 per night",
  "reservation_required": true,
  "fire_allowed": true,
  "pets_allowed": false,
  "vehicle_access": "direct"
}
```

### 4x4 Excursion
```json
{
  "terrain_difficulty": "moderate",
  "vehicle_requirements": {
    "ground_clearance": "200mm minimum",
    "4x4_required": true,
    "recovery_gear": ["snatch straps", "shackles", "shovel"],
    "spare_tire": "essential"
  },
  "trail_length": "45km",
  "estimated_duration": "6 hours",
  "fuel_stops": ["Graskop", "Sabie"],
  "technical_sections": [
    {"name": "Rocky Pass", "difficulty": "difficult"},
    {"name": "River Crossing", "difficulty": "moderate"}
  ],
  "permits_required": true
}
```

### Fishing
```json
{
  "fishing_type": "freshwater",
  "target_species": ["Trout", "Bass", "Yellowfish"],
  "equipment_required": ["Fly rod", "Waders", "Tackle box"],
  "licenses_needed": true,
  "license_info": "Valid fishing permit required",
  "boat_required": false,
  "guide_available": true,
  "catch_and_release": true,
  "best_season": "Spring and Autumn",
  "accommodation": "Nearby lodge available"
}
```

---

## Implementation Checklist

### Frontend Components (8-10 hours)

- [ ] EventTypeSelector.js (2-3 hours)
  - [ ] Fetch event types from API
  - [ ] Display as button grid with icons
  - [ ] Handle selection
  - [ ] Mobile responsive
  - [ ] Loading and error states

- [ ] TagSelector.js (3-4 hours)
  - [ ] Fetch tags from API
  - [ ] Display by category
  - [ ] Multi-select functionality
  - [ ] Custom tag creation
  - [ ] Search/filter
  - [ ] Badge display
  - [ ] Mobile responsive

- [ ] CampingFields.js (2-3 hours)
  - [ ] Site type selector
  - [ ] Facilities checkboxes
  - [ ] Capacity and fees inputs
  - [ ] Boolean toggles
  - [ ] Validation
  - [ ] Mobile responsive

### Form Integration (3-4 hours)

- [ ] Update AddHikeForm.js
  - [ ] Add EventTypeSelector
  - [ ] Add TagSelector
  - [ ] Conditional event type fields
  - [ ] Save event_type to backend
  - [ ] Save event_type_data to backend
  - [ ] Save tags via addEventTags API
  - [ ] Validation for required fields
  - [ ] Handle edit mode (load existing tags)

### Display Updates (2-3 hours)

- [ ] Update HikeCard.js / EventCard.js
  - [ ] Display event type badge with icon
  - [ ] Display tags as colored badges
  - [ ] Responsive layout

- [ ] Update HikeDetailsPage.js
  - [ ] Show event type prominently
  - [ ] Show tags with category grouping
  - [ ] Render event type-specific fields

### Filtering (3-4 hours)

- [ ] Add event type filter to HikesList
- [ ] Add tag filter to HikesList
- [ ] Update backend hikeController to accept filters
- [ ] Multi-select tag filtering
- [ ] Clear filters button

### Testing (2 hours)

- [ ] Create camping event via UI
- [ ] Add tags to event
- [ ] View event with badges
- [ ] Filter by event type
- [ ] Filter by tags
- [ ] Edit event (change type, update tags)
- [ ] Mobile testing

### Deployment (1 hour)

- [ ] Build frontend
- [ ] Deploy to Firebase
- [ ] Verify in production
- [ ] Smoke test all features

**Total: ~19-24 hours for complete POC + Full Features**

---

## Future Enhancements

### Phase 2
- [ ] 4x4Fields.js component
- [ ] FishingFields.js component
- [ ] GenericOutdoorFields.js component
- [ ] Event type-specific validation rules
- [ ] Event type icons in navigation

### Phase 3
- [ ] Tag management admin panel
- [ ] Bulk tagging
- [ ] Tag analytics dashboard
- [ ] Popular tags widget
- [ ] Tag suggestions based on event type

### Phase 4
- [ ] Rename "Hikes" → "Events" terminology
- [ ] Update all routes
- [ ] Update all UI text
- [ ] Update email templates
- [ ] Update documentation

---

**Document Version:** 1.0
**Last Updated:** October 19, 2025
**Status:** Ready for Implementation
