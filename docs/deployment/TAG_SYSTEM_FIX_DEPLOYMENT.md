# Tag System Fix - Backend Deployment

**Date:** October 19, 2025
**Issue:** Tags not saving when editing events - 404 error on tag update endpoint

## Problem Summary

The tag saving functionality was failing with a **404 Not Found** error because the new `updateEventTags` route was added locally but never deployed to production.

**Error Message:**
```
PUT https://backend-554106646136.europe-west1.run.app/api/tags/events/1 404 (Not Found)
```

## Root Cause

The `updateEventTags` endpoint exists in local backend code but is not deployed to Cloud Run production environment.

## Solution

Deploy the updated backend with the new tag management endpoint.

## Backend Changes to Deploy

### 1. Route Added: `backend/routes/tags.js` (Line 36)
```javascript
// PUT /api/tags/events/:id - Replace all tags for an event
router.put('/events/:id', authenticateToken, requirePermission('hikes.edit'), tagsController.updateEventTags);
```

### 2. Controller Added: `backend/controllers/tagsController.js` (Lines 350-424)
```javascript
exports.updateEventTags = async (req, res) => {
  // Atomic transaction to replace all event tags
  // 1. Verify event exists
  // 2. BEGIN transaction
  // 3. DELETE all existing tags
  // 4. INSERT new tags
  // 5. COMMIT transaction
  // 6. Return updated tags
}
```

### 3. Frontend API Call: `frontend/src/services/api.js` (Lines 994-997)
```javascript
async updateEventTags(eventId, tagIds, token) {
  return this.put(`/api/tags/events/${eventId}`, { tag_ids: tagIds }, token);
}
```

### 4. Frontend Usage: `frontend/src/pages/EditEventPage.js` (Lines 158-173)
```javascript
const tagIds = selectedTags.map(tag => tag.id);
console.log('🏷️ Updating event tags:', { eventId: id, tagIds, selectedTags });
const tagResult = await api.updateEventTags(id, tagIds, token);
console.log('🏷️ Tag update result:', tagResult);
```

## Additional Frontend Changes (Already Live)

### Navigation Menu Updated
- "Hikes" → "Events"
- "My Hikes" → "My Events"
- "Manage Hikes" → "Manage Events"

File: `frontend/src/components/layout/Header.js` (Lines 98, 99, 108)

## Deployment History

### Initial Deployment - backend-00101-jq2 (Failed)
- **Issue:** SQL INSERT error - "INSERT has more target columns than expressions"
- **Root Cause:** INSERT statement included `added_at` column but only provided 3 parameters
- **Status:** ❌ 500 Internal Server Error

### Fix Applied
- Removed `added_at` from INSERT statement (has DEFAULT value in database)
- Updated both `updateEventTags` and `addEventTags` methods
- Column list now matches parameter count: `(event_id, tag_id, added_by)`

### Second Deployment - backend-00102-9hs (Success)
- **Date:** October 19, 2025
- **Revision:** backend-00102-9hs
- **Status:** ✅ Deployed and serving 100% traffic
- **URL:** https://backend-554106646136.europe-west1.run.app

## Deployment Commands

### Backend Deployment
```powershell
cd C:\hiking-portal\backend
.\deploy-to-cloud-run-updated.ps1
```

### Frontend Build (If Needed)
```bash
cd C:\hiking-portal\frontend
npm run build
```

### Frontend Deployment (If Needed)
```bash
firebase deploy --only hosting
```

## Testing After Deployment

1. **Navigate to an event edit page**
   - Example: https://www.thenarrowtrail.co.za/events/edit/1

2. **Open Browser Console** (F12)

3. **Edit tags:**
   - Add new tags
   - Remove existing tags
   - Change tag selection

4. **Click "Update Event"**

5. **Check console for logs:**
   ```
   🏷️ Updating event tags: { eventId: 1, tagIds: [1, 2, 3], selectedTags: [...] }
   🏷️ Tag update result: { success: true, message: "Tags updated successfully", tags: [...] }
   ```

6. **Verify tag persistence:**
   - Refresh the page
   - Navigate away and back
   - Check event details page

## Expected Outcomes

✅ Tags save correctly when editing events
✅ Tag changes persist across sessions
✅ No 404 errors in console
✅ Navigation menu shows "Events" instead of "Hikes"
✅ Console logs show successful tag updates

## Rollback Plan

If issues occur after deployment:

1. **Check Cloud Run logs:**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backend" --limit 50 --format json
   ```

2. **Revert to previous backend revision:**
   ```bash
   gcloud run services update-traffic backend --to-revisions=PREVIOUS_REVISION=100 --region=europe-west1
   ```

3. **Check for migration issues:**
   ```bash
   # Connect to database and verify event_tags table
   psql -h 35.202.149.98 -U postgres -d hiking_portal
   \d event_tags
   ```

## Database Schema (Already Exists)

The `event_tags` junction table already exists:
```sql
CREATE TABLE event_tags (
  event_id INTEGER REFERENCES hikes(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  added_by INTEGER REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, tag_id)
);
```

## Files Modified (This Session)

### Backend (Needs Deployment)
- ✅ `backend/routes/tags.js` - Added PUT route
- ✅ `backend/controllers/tagsController.js` - Added updateEventTags method

### Frontend (Already Running Locally)
- ✅ `frontend/src/components/layout/Header.js` - Updated menu labels
- ✅ `frontend/src/services/api.js` - Added updateEventTags method
- ✅ `frontend/src/pages/EditEventPage.js` - Added debugging & error handling

## Notes

- The backend code is complete and tested locally
- The frontend is running with the updated code via npm start
- Only backend deployment is required to fix the 404 error
- Frontend production deployment can be done separately if needed
- All database tables and schemas already exist in production

## Post-Deployment Verification

After deployment, verify these endpoints work:

1. **GET /api/tags** - List all tags
2. **GET /api/tags/events/:id** - Get tags for specific event
3. **PUT /api/tags/events/:id** - Update tags for event (NEW)
4. **POST /api/tags/events/:id** - Add tags to event
5. **DELETE /api/tags/events/:id/:tagId** - Remove tag from event

---

**Deployment Ready:** ✅
**Testing Plan:** ✅
**Rollback Plan:** ✅
**Documentation:** ✅
