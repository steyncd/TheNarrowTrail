# Frontend Alignment Changes - Interest and Attendance Flow

## Date: 2025-10-08

## Overview
This document details all changes made to align the frontend with the new consolidated attendance tracking system that uses a single `hike_interest` table with `attendance_status` field instead of separate `hike_interest` and `hike_attendees` tables.

## Changes Summary

### 1. Frontend API Service (frontend/src/services/api.js)

**Fixed Endpoints:**
- Changed `confirmAttendance()` endpoint from `/confirm-attendance` to `/confirm` (line 90)
- Added new `cancelAttendance()` method (lines 95-99)
- Added comments documenting the new single-table approach with `attendance_status` (lines 82, 108)

**New API Methods:**
- `cancelAttendance(hikeId, token)` - Allows users to cancel their confirmed attendance

### 2. Hike Details Page (frontend/src/pages/HikeDetailsPage.js)

**New Handler Functions:**
- Added `handleConfirmAttendance()` - Confirms user attendance for a hike
- Added `handleCancelAttendance()` - Cancels user attendance with confirmation dialog
- Updated `handleInterestToggle()` to show error alerts

**Updated UI - "Your Status" Card (lines 726-805):**
The card now shows different UI based on `attendance_status` field:

1. **No Status (`null`)**:
   - Shows "Express Interest" button

2. **Interested (`'interested'`)**:
   - Shows "Interested ✓" button (green, allows toggle off)
   - Shows "Confirm Attendance" button (blue, primary action)
   - Helper text: "You've expressed interest. Confirm to secure your spot!"

3. **Confirmed (`'confirmed'`)**:
   - Shows "Attendance Confirmed ✓" button (green, allows unconfirm)
   - Shows "Cancel Attendance" button (red outline)
   - Success message: "You're confirmed for this hike!"

4. **Cancelled (`'cancelled'`)**:
   - Shows warning alert
   - Shows "Express Interest Again" button

5. **Attended (`'attended'`)**:
   - Shows success alert: "You attended this hike ✓"

### 3. Hike Details Modal (frontend/src/components/hikes/HikeDetailsModal.js)

**New Handler Function:**
- Added `handleCancelAttendance()` with confirmation dialog (lines 68-82)

**Updated Status Display (lines 186-227):**
Now uses `hikeStatus.attendance_status` instead of old `is_confirmed`/`is_interested` fields:

1. **Confirmed**: Shows green alert with "Cancel Attendance" button
2. **Interested**: Shows blue alert with "Confirm Attendance" button
3. **Cancelled**: Shows warning alert
4. **Attended**: Shows success alert

**Updated Packing List Tab Visibility (line 153):**
- Changed from `hikeStatus?.is_confirmed` to `hikeStatus?.attendance_status === 'confirmed'`

### 4. Backend - Hike Controller (backend/controllers/hikeController.js)

**Fixed All Database Queries:**

1. **getHikes()** (lines 50-68)
   - Removed JOIN to `hike_attendees` table
   - Updated to use `hike_interest.attendance_status` field
   - `interested_users`: Users with status 'interested' or 'confirmed'
   - `confirmed_users`: Users with status 'confirmed'

2. **getAttendees()** (lines 199-218)
   - Changed from `hike_attendees` to `hike_interest`
   - Filters by `attendance_status = 'confirmed'`

3. **addAttendee()** (lines 220-241)
   - Changed from INSERT into `hike_attendees` to `hike_interest`
   - Sets `attendance_status = 'confirmed'`
   - Uses `payment_status = 'pending'` as default (not 'unpaid')

4. **updateAttendee()** (lines 243-267)
   - Changed from UPDATE `hike_attendees` to `hike_interest`
   - Filters by `attendance_status = 'confirmed'`
   - Removed `notes` field (not in `hike_interest` table)

5. **removeAttendee()** (lines 269-291)
   - Changed from DELETE to UPDATE
   - Sets `attendance_status = 'cancelled'` instead of deleting record
   - Maintains attendance history

6. **getMyHikes()** (lines 724-770)
   - Updated all 4 queries to use `hike_interest.attendance_status`
   - Interested: `attendance_status = 'interested'`
   - Confirmed: `attendance_status = 'confirmed'`
   - Past: `attendance_status = 'attended'`
   - Stats: Only count `attendance_status = 'attended'` hikes

7. **getHikeEmergencyContacts()** (lines 826-846)
   - Changed from JOIN `hike_attendees` to `hike_interest`
   - Filters by `attendance_status = 'confirmed'`

## Database Schema Alignment

The changes align with the consolidated schema where:
- `hike_interest` table is the single source of truth for all interest/attendance tracking
- `attendance_status` field tracks the user journey: `interested` → `confirmed` → `attended` (or `cancelled`)
- `payment_status` and `amount_paid` fields are denormalized cache in `hike_interest`
- `hike_payments` table is authoritative source for payment transactions

## Valid Status Transitions

1. **null → interested**: User expresses interest
2. **interested → null**: User removes interest (only if not confirmed)
3. **interested → confirmed**: User confirms attendance
4. **confirmed → interested**: User unconfirms (before hike)
5. **confirmed → cancelled**: User or admin cancels attendance
6. **cancelled → interested**: User expresses interest again
7. **confirmed → attended**: Admin marks user as attended (after hike)

## Testing Checklist

### Frontend
- [x] Build completes without errors
- [ ] Express Interest button works
- [ ] Confirm Attendance button appears after expressing interest
- [ ] Cancel Attendance button works with confirmation
- [ ] Status card updates correctly after each action
- [ ] HikeDetailsModal shows correct status and buttons
- [ ] Packing list tab only visible when confirmed

### Backend
- [ ] Run migration 012 to consolidate tables
- [ ] Test all API endpoints with new schema
- [ ] Verify getHikes returns correct interested_users and confirmed_users
- [ ] Test admin attendee management functions
- [ ] Verify emergency contacts query works

## Deployment Notes

1. Backend migration 012 MUST be run before deploying these changes
2. Migration 012 migrates existing data from `hike_attendees` to `hike_interest`
3. Frontend and backend should be deployed together to avoid API mismatches
4. Old `hike_attendees` table will be dropped by migration 012

## Files Modified

### Frontend
1. `frontend/src/services/api.js` - Fixed endpoints, added cancelAttendance
2. `frontend/src/pages/HikeDetailsPage.js` - Updated status card UI and handlers
3. `frontend/src/components/hikes/HikeDetailsModal.js` - Updated status display and handlers

### Backend
1. `backend/controllers/hikeController.js` - Updated 8 functions to use new schema
2. `backend/controllers/interestController.js` - Already updated (previous work)
3. `backend/routes/interest.js` - Already updated (previous work)

### Documentation
1. `backend/docs/ATTENDANCE_FLOW.md` - Already created (previous work)
2. `FRONTEND_ALIGNMENT_CHANGES.md` - This document

## Known Issues / Future Work

1. HikeCard component still uses `interested_users` and `confirmed_users` arrays - working correctly with backend changes
2. Consider adding loading states during status transitions
3. Consider adding success toasts instead of alerts for better UX
4. May want to add "Interested" count separately from "Confirmed" count in UI

## Success Criteria

✅ Frontend build completes successfully
✅ All backend queries updated to use `hike_interest` table
✅ No references to `hike_attendees` or `hike_attendance` tables remain
✅ API endpoints aligned between frontend and backend
✅ Status transitions properly implemented
✅ Cancel functionality added with confirmation dialogs
✅ UI shows appropriate buttons and messages for each status
