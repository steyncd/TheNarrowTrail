# Event Deadlines and Registration Management Implementation

**Date**: October 19, 2025
**Status**: Partially Complete - Frontend implementation needed

## Requested Features

1. ✅ Registration deadline field
2. ✅ Payment deadline field
3. ✅ Registration closed flag
4. ✅ Pay at venue flag
5. ⏳ "Registration Closed" banner on Events screen
6. ⏳ Display registration closing date on Events screen
7. ⏳ Event status display on Event details screen
8. ⏳ Registration closed banner on Event details screen
9. ⏳ Display deadlines on Event details screen
10. ⏳ Payment reminder notifications

## ✅ Completed Work

### 1. Database Migration (Complete)
- **Migration**: `backend/migrations/027_add_event_deadlines.sql`
- **Script**: `backend/scripts/run-027-migration.js`
- **Status**: Successfully run on production database

**Fields Added**:
- `registration_deadline` (TIMESTAMP) - When registration closes
- `payment_deadline` (TIMESTAMP) - When payment is due
- `registration_closed` (BOOLEAN) - Manual close override
- `pay_at_venue` (BOOLEAN) - Payment at destination

### 2. Backend API (Complete)
- **File**: `backend/controllers/hikeController.js`
- **Functions Updated**:
  - `createHike()` - Lines 136-157
  - `updateHike()` - Lines 236-256

**Changes**: Both functions now accept and store the four new fields in the database.

## ⏳ Frontend Work Needed

### Required Files to Update

#### 1. CreateEventPage.js
**Priority**: HIGH
**Location**: `frontend/src/pages/CreateEventPage.js`

Add form fields:
- Registration Deadline (datetime-local input)
- Payment Deadline (datetime-local input)
- Registration Closed checkbox
- Pay at Venue checkbox

#### 2. EditEventPage.js
**Priority**: HIGH
**Location**: `frontend/src/pages/EditEventPage.js`

Same as CreateEventPage + load existing values

#### 3. HikeCard.js
**Priority**: HIGH
**Location**: `frontend/src/components/hikes/HikeCard.js`

Add:
- "Registration Closed" banner (if closed OR deadline passed)
- "Closing Soon" warning (if deadline within 7 days)
- Display closing date

#### 4. HikeDetailsPage.js
**Priority**: HIGH
**Location**: `frontend/src/pages/HikeDetailsPage.js`

Add sections:
- Event Status banner (closed/open)
- Important Dates section (show deadlines)
- Pay at Venue badge
- Disable registration button if closed

#### 5. Payment Reminder Job
**Priority**: MEDIUM
**Location**: `backend/jobs/paymentReminders.js` (new file)

Create scheduled job to:
- Find events with approaching payment deadlines
- Find unpaid confirmed attendees
- Send email/SMS reminders

## Next Steps

1. Update CreateEventPage and EditEventPage with deadline fields
2. Update HikeCard with closed banners and deadline display
3. Update HikeDetailsPage with status and deadline sections
4. Create payment reminder notification job
5. Test all functionality
6. Deploy to production

## Implementation Guide

### Registration Logic

```javascript
// Check if registration is closed
const isRegistrationClosed = () => {
  if (hike.registration_closed) return true; // Manual override
  if (hike.registration_deadline && new Date(hike.registration_deadline) < new Date()) {
    return true; // Deadline passed
  }
  return false;
};

// Check if closing soon (within 7 days)
const isClosingSoon = () => {
  if (!hike.registration_deadline) return false;
  if (isRegistrationClosed()) return false;

  const daysUntil = (new Date(hike.registration_deadline) - new Date()) / (1000 * 60 * 60 * 24);
  return daysUntil <= 7 && daysUntil > 0;
};
```

### Database State

- Migration: ✅ Run on production
- Fields available in all event API responses
- Ready for frontend integration

## Token Note

This is a large feature requiring multiple file updates. Implementation should continue in stages to avoid context limits.
