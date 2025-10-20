# POC Remaining Tasks - Event System Updates

**Date:** October 19, 2025
**Status:** Backend Deployed - Frontend Updates Needed

## ✅ Completed So Far

1. ✅ Created 5 event-type-specific field components (Hiking, Camping, 4x4, Cycling, Outdoor)
2. ✅ Refactored AddHikeForm with new common + event-specific field structure
3. ✅ Updated backend createHike and updateHike functions to use event_type and event_type_data
4. ✅ Created and ran database migration 024 (removed fishing, added cycling)
5. ✅ Updated EventTypeSelector component (fishing → cycling)
6. ✅ Updated HikeCard component (fishing → cycling)
7. ✅ Backend deployed to Cloud Run

## ⏳ Remaining Tasks

### 1. Update HikeDetailsPage to Use New Event Structure

**File:** `frontend/src/pages/HikeDetailsPage.js`

**Current Issues:**
- Still displays old hiking-specific fields: `difficulty`, `distance`, `type` (day/multi), `group_type`
- Hard-coded for hiking events only
- Doesn't handle `event_type` or `event_type_data`

**Required Changes:**
- Read `event_type` and `event_type_data` from hike object
- Display event-type-specific fields based on event_type:
  - Hiking: Show difficulty, hike_type, distance, multi-day details
  - Camping: Show camping_type, facilities, number_of_nights
  - 4x4: Show difficulty, terrain, vehicle_requirements
  - Cycling: Show ride_type, difficulty, distance, elevation_gain
  - Outdoor: Show activity_type, difficulty, duration
- Remove references to `group_type` (no longer used)
- Update packing list logic to work with event types (currently checks `hike.type === 'multi'`)

**Code Sections to Update:**
- Lines 265-269: `difficultyColors` object (move to event-type-specific rendering)
- Lines 343-360: Badge display section (difficulty, type, group_type)
- Lines 362-387: Info cards (Date, Cost, Distance) - Distance should be event-specific
- Lines 451-471: Multi-day details section - Should be hiking-specific only
- Lines 588-632: Packing list default logic - Update to use event_type

### 2. Update ManageHikes Page to Use New Event Structure

**Files to Check:**
- `frontend/src/pages/ManageHikesPage.js` or similar
- Admin management screens

**Required Changes:**
- Display event_type badge for each event
- Show event-type-specific fields in management view
- Update edit functionality to work with new structure

### 3. Terminology Updates (Hike → Event/Adventure)

**User's Requirements:**
- "Hikes" page → "Adventures" page
- "Manage Hikes" → "Manage Events"
- General references to "hike" → "event" (unless specifically a hiking event)
- Keep backend code backwards compatible

**Files to Update:**

#### Navigation/Menu Files:
- `frontend/src/components/layout/Header.js` or Navigation component
- `frontend/src/components/layout/Sidebar.js` (if exists)

#### Page Files:
- `frontend/src/pages/HikesPage.js` → Rename "Hikes" to "Adventures"
- `frontend/src/pages/ManageHikesPage.js` → Rename "Manage Hikes" to "Manage Events"
- `frontend/src/pages/HikeDetailsPage.js` → Update "Hike Details" to "Event Details"

#### Component Files:
- `frontend/src/components/hikes/HikeCard.js` → Update card title/text
- `frontend/src/components/hikes/AddHikeForm.js` → Update form title to "Add Event" / "Edit Event"
- `frontend/src/components/hikes/HikeList.js` (if exists)

#### Text to Replace:
- "Hike" → "Event" or "Adventure" (context-dependent)
- "hike" → "event" or "adventure"
- "Hiking" → Keep as event type name
- Page titles: "Hikes" → "Adventures", "Manage Hikes" → "Manage Events"

### 4. Backend Compatibility

**Keep These Names:**
- Table name: `hikes` (don't rename)
- API endpoints: `/api/hikes` (don't change)
- Controller file: `hikeController.js` (don't rename)
- Function names: `createHike`, `updateHike`, etc. (keep for backwards compatibility)

**Why:** Renaming database tables and API endpoints would break existing integrations and require complex migrations. The frontend can display "Events" while the backend uses "hikes" internally.

### 5. Testing Checklist

After all updates:

#### Event Creation:
- [ ] Can create Hiking event with difficulty, hike_type, distance
- [ ] Can create Camping event with camping_type, facilities
- [ ] Can create 4x4 event with difficulty, terrain, vehicle_requirements
- [ ] Can create Cycling event with ride_type, difficulty, distance
- [ ] Can create Outdoor event with activity_type, difficulty

#### Event Display:
- [ ] HikeDetailsPage shows correct fields for each event type
- [ ] Event cards display correct event type badge
- [ ] Packing lists work for all event types
- [ ] Event type badges show: Hiking (none), Camping (orange tent), 4x4 (brown truck), Cycling (blue bike), Outdoor (purple compass)

#### Terminology:
- [ ] Main page says "Adventures" not "Hikes"
- [ ] Admin page says "Manage Events" not "Manage Hikes"
- [ ] Form says "Add Event" / "Edit Event" not "Add Hike" / "Edit Hike"
- [ ] Event-specific text uses correct term (e.g., "This camping event..." not "This hike...")

#### Navigation:
- [ ] All navigation menus updated
- [ ] Breadcrumbs updated
- [ ] Page titles updated

### 6. Deployment Steps

1. **Test Locally First:**
   - Run `npm start` in frontend directory
   - Test all event types
   - Verify terminology changes
   - Test event details page for each type

2. **Deploy Frontend:**
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

3. **Verify Production:**
   - Visit production site
   - Test creating each event type
   - Test viewing event details
   - Verify no console errors

---

## Implementation Priority

### High Priority (Complete First):
1. ✅ Backend updates (DONE)
2. ✅ Database migration (DONE)
3. ⏳ HikeDetailsPage event-type display logic
4. ⏳ AddHikeForm terminology ("Add Event" vs "Add Hike")

### Medium Priority:
5. ⏳ ManageHikes page updates
6. ⏳ Navigation terminology updates
7. ⏳ HikeCard terminology

### Low Priority:
8. ⏳ Additional page terminology updates
9. ⏳ Documentation updates

---

## Estimated Time Remaining

- HikeDetailsPage updates: 1-2 hours
- ManageHikes page updates: 30-45 minutes
- Terminology updates: 45-60 minutes
- Testing: 30-45 minutes
- **Total: 3-4 hours**

---

## Notes

- Frontend is currently compiling successfully
- Backend is deployed and running (backend-deploy running in background)
- Database migration 024 completed successfully
- Local frontend at localhost:3000 has new form structure
- Event type selector now shows cycling (blue bike), no fishing

---

## Next Immediate Step

**Start with HikeDetailsPage** - This is the most complex update and affects user experience directly. Once this is working, the terminology updates will be straightforward find-and-replace operations.

**Command to run:**
- Continue editing `frontend/src/pages/HikeDetailsPage.js`
- Focus on lines 343-471 (badge display and event-specific details)
- Create event-type-specific detail sections similar to AddHikeForm structure
