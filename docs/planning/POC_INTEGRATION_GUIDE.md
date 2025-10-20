# POC Integration Guide - Complete the Outdoor Adventures Expansion

**Date:** October 19, 2025
**Status:** Components Built - Integration Pending
**Completion:** 80% Done

---

## What's Been Completed ✅

### Backend (100% COMPLETE)
- ✅ Database migration 023 (event types + tags system)
- ✅ Event types API (5 types seeded)
- ✅ Tags API (37 tags seeded across 6 categories)
- ✅ Backend deployed to production
- ✅ APIs tested and working

### Frontend Components (100% COMPLETE)
- ✅ EventTypeSelector component
- ✅ TagSelector component
- ✅ CampingFields component
- ✅ CSS files for all components
- ✅ API methods added to api.js

**Files Created:**
- `frontend/src/components/events/EventTypeSelector.js`
- `frontend/src/components/events/EventTypeSelector.css`
- `frontend/src/components/events/TagSelector.js`
- `frontend/src/components/events/TagSelector.css`
- `frontend/src/components/events/eventTypes/CampingFields.js`
- `frontend/src/components/events/eventTypes/CampingFields.css`

---

## What's Remaining (20% - ~3-4 hours)

### 1. Integrate Components into AddHikeForm ⏳

**File to Modify:** `frontend/src/components/hikes/AddHikeForm.js`

**Step-by-step Integration:**

#### Step 1: Import the New Components

Add these imports at the top of AddHikeForm.js:

```javascript
import EventTypeSelector from '../events/EventTypeSelector';
import TagSelector from '../events/TagSelector';
import CampingFields from '../events/eventTypes/CampingFields';
```

#### Step 2: Add State Variables

Find the existing state declarations and add:

```javascript
const [eventType, setEventType] = useState('hiking');
const [eventTypeData, setEventTypeData] = useState({});
const [selectedTags, setSelectedTags] = useState([]);
```

#### Step 3: Load Existing Event Data (for Edit Mode)

In the `useEffect` that loads hike data, add:

```javascript
useEffect(() => {
  if (hikeId && hikeId !== 'new') {
    loadHike();
  }
}, [hikeId]);

const loadHike = async () => {
  try {
    setLoading(true);
    const data = await api.getHikeById(hikeId);

    // Existing field mappings...
    setHikeData({
      // ... existing fields
    });

    // NEW: Load event type and tags
    if (data.event_type) {
      setEventType(data.event_type);
    }
    if (data.event_type_data) {
      setEventTypeData(data.event_type_data);
    }

    // Load tags for this event
    if (hikeId) {
      const tagsResponse = await api.getEventTags(hikeId);
      if (tagsResponse.success && tagsResponse.tags) {
        setSelectedTags(tagsResponse.tags);
      }
    }
  } catch (error) {
    console.error('Failed to load hike:', error);
  } finally {
    setLoading(false);
  }
};
```

#### Step 4: Update Submit Handler

Find the `handleSubmit` function and modify it:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setSubmitting(true);

    const formData = {
      ...hikeData,
      event_type: eventType,              // NEW
      event_type_data: eventTypeData      // NEW
    };

    let response;
    if (hikeId && hikeId !== 'new') {
      response = await api.updateHike(hikeId, formData, token);
    } else {
      response = await api.createHike(formData, token);
    }

    if (response && (response.id || response.hike?.id)) {
      const createdHikeId = response.id || response.hike.id;

      // NEW: Save tags
      if (selectedTags.length > 0) {
        const tagIds = selectedTags.map(tag => tag.id);
        await api.addEventTags(createdHikeId, tagIds, token);
      }

      // Show success message
      alert('Event saved successfully!');

      // Navigate or reset form
      // ... existing navigation logic
    }
  } catch (error) {
    console.error('Failed to save event:', error);
    alert('Failed to save event: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};
```

#### Step 5: Render Event Type Selector

In the JSX, add this section BEFORE the existing form fields (after the form opening tag):

```jsx
<form onSubmit={handleSubmit}>
  {/* NEW: Event Type Section */}
  <div className="form-section">
    <h4>Event Type</h4>
    <EventTypeSelector
      value={eventType}
      onChange={setEventType}
      disabled={submitting}
    />
  </div>

  {/* Existing fields continue here... */}
  <div className="form-group">
    <label>Event Name *</label>
    {/* ... */}
  </div>
```

#### Step 6: Render Event Type-Specific Fields

After the existing "Description" field, add:

```jsx
  {/* Description field */}
  <div className="form-group">
    <label>Description</label>
    <textarea
      name="description"
      value={hikeData.description}
      onChange={handleInputChange}
      rows="4"
      className="form-control"
    />
  </div>

  {/* NEW: Event Type-Specific Fields */}
  {eventType === 'camping' && (
    <CampingFields
      data={eventTypeData}
      onChange={setEventTypeData}
    />
  )}

  {eventType === 'hiking' && (
    <div className="alert alert-info">
      <strong>Hiking Event:</strong> Use the standard fields above (difficulty, distance, etc.)
    </div>
  )}

  {(eventType === '4x4' || eventType === 'fishing' || eventType === 'outdoor') && (
    <div className="alert alert-warning">
      <strong>Coming Soon:</strong> Specific fields for {eventType} events will be added in the next phase.
      For now, use the description field to provide event-specific details.
    </div>
  )}
```

#### Step 7: Render Tag Selector

Add near the end of the form, BEFORE the submit button:

```jsx
  {/* NEW: Tags Section */}
  <div className="form-section">
    <h4>Tags</h4>
    <p className="text-muted">
      Add tags to help users find your event. Select from existing tags or create custom ones.
    </p>
    <TagSelector
      selectedTags={selectedTags}
      onChange={setSelectedTags}
      allowCustom={true}
      maxTags={10}
    />
  </div>

  {/* Submit Button */}
  <div className="form-actions">
    <button
      type="submit"
      className="btn btn-primary"
      disabled={submitting}
    >
      {submitting ? 'Saving...' : (hikeId && hikeId !== 'new' ? 'Update Event' : 'Create Event')}
    </button>
  </div>
</form>
```

---

### 2. Update HikeCard to Show Event Type Badge ⏳

**File to Modify:** `frontend/src/components/hikes/HikeCard.js`

#### Add Imports:

```javascript
import { Mountain, Tent, Truck, Fish, Compass } from 'lucide-react';
```

#### Add Event Type Config:

```javascript
const EVENT_TYPE_CONFIG = {
  hiking: { icon: Mountain, color: '#4CAF50', label: 'Hiking' },
  camping: { icon: Tent, color: '#FF9800', label: 'Camping' },
  '4x4': { icon: Truck, color: '#795548', label: '4x4' },
  fishing: { icon: Fish, color: '#2196F3', label: 'Fishing' },
  outdoor: { icon: Compass, color: '#9C27B0', label: 'Outdoor' }
};
```

#### Update JSX:

At the top of the card, add the event type badge:

```jsx
<div className="hike-card">
  {/* NEW: Event Type Badge */}
  {hike.event_type && hike.event_type !== 'hiking' && (
    <div
      className="event-type-badge"
      style={{
        backgroundColor: EVENT_TYPE_CONFIG[hike.event_type]?.color || '#6c757d'
      }}
    >
      {React.createElement(
        EVENT_TYPE_CONFIG[hike.event_type]?.icon || Compass,
        { size: 16, color: 'white' }
      )}
      <span>{EVENT_TYPE_CONFIG[hike.event_type]?.label || hike.event_type}</span>
    </div>
  )}

  {/* Existing card content */}
  <img src={hike.image_url} alt={hike.name} />
  <h3>{hike.name}</h3>
  {/* ... rest of card */}
</div>
```

#### Add CSS:

Create or update `HikeCard.css`:

```css
.event-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
```

---

### 3. Test the Complete Flow ⏳

#### Test Scenario 1: Create Hiking Event (Existing Flow)
1. Navigate to "Add Hike/Event"
2. Event type should default to "Hiking"
3. Fill in standard hiking fields
4. Add tags: "Family", "Weekend", "Mountains"
5. Submit
6. Verify event created successfully
7. Check event shows hiking icon (should not show badge since it's default)
8. Check tags appear on event card

#### Test Scenario 2: Create Camping Event (NEW Flow)
1. Navigate to "Add Hike/Event"
2. Select "Camping" event type
3. Fill in basic fields (name, date, location, description)
4. Fill in camping-specific fields:
   - Site type: "Established"
   - Facilities: Check "Water", "Toilets", "Fire Pits"
   - Capacity: 50
   - Fees: "R150 per night"
   - Fire allowed: Yes
   - Pets: No
5. Add tags: "Family", "Weekend", "Forest"
6. Submit
7. Verify camping event created
8. Verify event shows orange tent badge
9. Verify tags appear on card

#### Test Scenario 3: Edit Existing Event
1. Click edit on any event
2. Verify event type loads correctly
3. Verify tags load correctly
4. Change event type (e.g., hiking → camping)
5. Update camping fields
6. Add/remove tags
7. Save
8. Verify changes persisted

---

### 4. Deploy Frontend ⏳

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## Complete Code Snippets

### Full AddHikeForm Integration (Key Sections)

```javascript
// At the top of AddHikeForm.js
import EventTypeSelector from '../events/EventTypeSelector';
import TagSelector from '../events/TagSelector';
import CampingFields from '../events/eventTypes/CampingFields';

// In the component
const [eventType, setEventType] = useState('hiking');
const [eventTypeData, setEventTypeData] = useState({});
const [selectedTags, setSelectedTags] = useState([]);

// In the form JSX
return (
  <div className="add-hike-form">
    <h2>{hikeId && hikeId !== 'new' ? 'Edit Event' : 'Create New Event'}</h2>

    <form onSubmit={handleSubmit}>
      {/* Event Type Selection */}
      <div className="mb-4">
        <h4>Event Type</h4>
        <EventTypeSelector
          value={eventType}
          onChange={setEventType}
          disabled={submitting}
        />
      </div>

      {/* Basic Fields (existing) */}
      <div className="row">
        <div className="col-md-6">
          <label>Event Name *</label>
          <input
            type="text"
            name="name"
            value={hikeData.name}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>
        {/* ... other existing fields */}
      </div>

      {/* Event Type-Specific Fields */}
      {eventType === 'camping' && (
        <CampingFields
          data={eventTypeData}
          onChange={setEventTypeData}
        />
      )}

      {/* Tags */}
      <div className="mt-4 mb-4">
        <h4>Tags</h4>
        <TagSelector
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          allowCustom={true}
          maxTags={10}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
      >
        {submitting ? 'Saving...' : 'Save Event'}
      </button>
    </form>
  </div>
);
```

---

## Estimated Completion Time

- **AddHikeForm Integration:** 1.5-2 hours
- **HikeCard Updates:** 30 minutes
- **Testing:** 1 hour
- **Deployment:** 30 minutes

**Total: 3.5-4 hours**

---

## Success Criteria

### POC is Complete When:
- [x] Backend APIs working ✅
- [x] Event types system active ✅
- [x] Tags system active ✅
- [x] EventTypeSelector component built ✅
- [x] TagSelector component built ✅
- [x] CampingFields component built ✅
- [ ] Components integrated into AddHikeForm ⏳
- [ ] Can create camping event via UI ⏳
- [ ] Can add tags to events ⏳
- [ ] Event cards show type badges ⏳
- [ ] Event cards show tags ⏳
- [ ] Can edit events and update type/tags ⏳
- [ ] Frontend deployed ⏳

**Current Progress: 80% Complete**

---

## Next Phase (After POC)

Once POC is validated, the full implementation includes:

### Phase 2: Additional Event Types (10-12 hours)
- Build FourWheelDriveFields component
- Build FishingFields component
- Build GenericOutdoorFields component
- Update AddHikeForm to support all types

### Phase 3: Filtering & Search (6-8 hours)
- Add event type filter to HikesList
- Add tag filter to HikesList
- Multi-select filtering
- Update backend to support filters

### Phase 4: Display Enhancements (4-6 hours)
- Show event type-specific data on details page
- Tag display with category grouping
- Event type statistics dashboard
- Popular tags widget

### Phase 5: Admin Features (4-6 hours)
- Tag management admin panel
- Event type management
- Bulk tagging
- Tag analytics

---

## Troubleshooting

### If Components Don't Show:
Check console for import errors. Make sure the `components/events` directory exists.

### If Tags Don't Save:
Check network tab - ensure `POST /api/tags/events/:id` is being called after event creation.

### If Event Type Badge Doesn't Show:
Check that `hike.event_type` field is present in API response. May need to refresh data.

### If Styles Look Wrong:
Make sure CSS files are imported. May need to restart dev server.

---

## Quick Start

To complete the POC integration right now:

1. Open `frontend/src/components/hikes/AddHikeForm.js`
2. Follow Step 1-7 in "Integrate Components into AddHikeForm" section above
3. Open `frontend/src/components/hikes/HikeCard.js`
4. Follow the "Update HikeCard" instructions
5. Test creating a camping event
6. Deploy!

**You're 80% done - just 3-4 hours of integration work remaining!**

---

**Document Version:** 1.0
**Last Updated:** October 19, 2025
**Status:** Ready for Integration
