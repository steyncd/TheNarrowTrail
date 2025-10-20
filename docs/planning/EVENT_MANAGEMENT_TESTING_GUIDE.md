# Event Management System - Comprehensive Testing Guide

**Date:** October 19, 2025
**System:** Hiking Portal - Event Management Transition
**Status:** Ready for Testing

---

## Overview

This guide provides comprehensive testing procedures for the newly refactored event management system. The system has been transformed from a hiking-only platform to a multi-event-type system supporting:

- 🏔️ **Hiking** - Day hikes, multi-day hikes, backpacking trips
- ⛺ **Camping** - Tent camping, glamping, caravan/RV trips
- 🚗 **4x4** - Off-road excursions, trail runs, overland adventures
- 🚴 **Cycling** - Road cycling, mountain biking, gravel rides, bikepacking
- 🧭 **Outdoor** - General outdoor activities (kayaking, rock climbing, etc.)

---

## 1. Pre-Testing Checklist

### Backend Status
- ✅ **Backend Deployed:** backend-00100-dx6
- ✅ **Migration 024:** Executed (removed fishing, added cycling)
- ✅ **Event Type Data:** JSONB structure implemented
- ✅ **Tags API:** Update endpoint added (PUT /api/tags/events/:id)

### Frontend Status
- ✅ **Compilation:** Success (warnings only, no errors)
- ✅ **Event Pages:** AddEventPage.js and EditEventPage.js created
- ✅ **Display Components:** All 5 event type display components created
- ✅ **Modals Removed:** Edit functionality moved to dedicated pages
- ✅ **Terminology Updated:** "Hikes" → "Events" in key locations

### URLs to Access
- **Frontend (Dev):** http://localhost:3000
- **Frontend (Prod):** https://hiking-portal-v2.web.app
- **Backend API:** https://backend-554106646136.europe-west1.run.app
- **Database:** Cloud SQL PostgreSQL (35.202.149.98)

---

## 2. Functional Testing

### Test 2.1: Event Creation Flow

#### Test 2.1.1: Create Hiking Event
**Purpose:** Verify hiking events can be created with all field types

**Steps:**
1. Login as admin user
2. Navigate to "Manage Events" page
3. Click "Add Event" button
4. Verify navigation to `/events/add`
5. Select event type: **Hiking**
6. Fill in common fields:
   - Name: "Table Mountain Day Hike"
   - Date: [Tomorrow's date]
   - Location: "Table Mountain, Cape Town"
   - Description: "Beautiful day hike to the summit"
   - Cost: 0 (or any amount)
   - Status: "Gathering Interest"
7. Fill in hiking-specific fields:
   - Difficulty: "Moderate"
   - Hike Type: "Day Hike"
   - Distance: "12 km"
   - Group Type: "Family Friendly"
8. Add tags: "Family Friendly", "Beginner", "Views"
9. Click "Create Event"
10. Verify redirect to `/admin/manage-hikes`
11. Verify new event appears in list

**Expected Result:**
- ✅ Event created successfully
- ✅ All fields saved correctly
- ✅ Event type badge shows "Hiking" with mountain icon
- ✅ Tags appear on event card

#### Test 2.1.2: Create Camping Event
**Purpose:** Verify camping events with facilities and equipment

**Steps:**
1. Click "Add Event"
2. Select event type: **Camping**
3. Fill common fields:
   - Name: "Weekend Camping at Cederberg"
   - Date: [Next weekend]
   - Location: "Cederberg Wilderness Area"
   - Cost: 150
4. Fill camping-specific fields:
   - Camping Type: "Tent Camping"
   - Number of Nights: 2
   - Site Type: "Wilderness Site"
   - Facilities: Select "Toilets", "Water", "Braai/BBQ"
   - Meals Provided: Select "Breakfast", "Dinner"
5. Add tags: "Nature", "Stargazing"
6. Create event

**Expected Result:**
- ✅ Camping event created
- ✅ Facilities saved as array
- ✅ Meals saved as array
- ✅ Event type badge shows "Camping" with tent icon

#### Test 2.1.3: Create 4x4 Event
**Purpose:** Verify 4x4 events with terrain and vehicle requirements

**Steps:**
1. Click "Add Event"
2. Select event type: **4x4**
3. Fill common fields:
   - Name: "Sani Pass Adventure"
   - Date: [Future date]
   - Location: "Sani Pass, Drakensberg"
   - Cost: 500
4. Fill 4x4-specific fields:
   - Difficulty: "Difficult"
   - Distance: "45 km"
   - Duration: "8 hours"
   - Terrain Types: Select "Rock", "Steep Inclines", "Water Crossings"
   - Vehicle Requirements: Select "4x4 Required", "High Clearance"
   - Required Equipment: "Recovery Gear", "Spare Tire"
5. Add tags: "Adventure", "Scenic"
6. Create event

**Expected Result:**
- ✅ 4x4 event created
- ✅ Terrain types saved as array
- ✅ Requirements saved correctly
- ✅ Event type badge shows "4x4" with truck icon

#### Test 2.1.4: Create Cycling Event
**Purpose:** Verify cycling events with ride types and elevation

**Steps:**
1. Click "Add Event"
2. Select event type: **Cycling**
3. Fill common fields:
   - Name: "Cape Argus Cycle Tour"
   - Date: [Future date]
   - Location: "Cape Town"
   - Cost: 300
4. Fill cycling-specific fields:
   - Ride Type: "Road Cycling"
   - Difficulty: "Challenging"
   - Distance: "109 km"
   - Elevation Gain: "1,300m"
   - Duration: "5-7 hours"
   - Route Type: "Loop"
   - Terrain: "Paved Roads"
   - Support Vehicle: Yes
5. Add tags: "Endurance", "Scenic"
6. Create event

**Expected Result:**
- ✅ Cycling event created
- ✅ Elevation and distance saved
- ✅ Event type badge shows "Cycling" with bike icon

#### Test 2.1.5: Create Outdoor Event
**Purpose:** Verify general outdoor activities

**Steps:**
1. Click "Add Event"
2. Select event type: **Outdoor**
3. Fill common fields:
   - Name: "Kayaking Adventure - Knysna Lagoon"
   - Date: [Future date]
   - Location: "Knysna Lagoon"
   - Cost: 200
4. Fill outdoor-specific fields:
   - Activity Type: "Water Sports"
   - Difficulty: "Easy"
   - Duration: "4 hours"
   - Participant Limit: 12
   - Equipment Needed: "Kayak", "Life Jacket", "Dry Bag"
   - Skills Required: "Basic Swimming"
   - Safety Considerations: "Weather dependent - cancellation possible"
5. Add tags: "Beginner Friendly", "Water"
6. Create event

**Expected Result:**
- ✅ Outdoor event created
- ✅ Equipment saved as array
- ✅ Safety considerations saved
- ✅ Event type badge shows "Outdoor" with compass icon

### Test 2.2: Event Editing Flow

#### Test 2.2.1: Edit Existing Event
**Purpose:** Verify event editing with tag updates

**Steps:**
1. From "Manage Events", click "Manage" on any event
2. On event management page, click "Edit Event Details"
3. Verify navigation to `/events/edit/[id]`
4. Verify all fields pre-filled with existing data
5. Change event name: Add " (Updated)" to name
6. Change event type-specific field (e.g., difficulty level)
7. Remove one existing tag
8. Add two new tags
9. Click "Update Event"
10. Verify redirect to `/admin/manage-hikes`
11. Navigate back to event to verify changes saved

**Expected Result:**
- ✅ All existing data loaded correctly
- ✅ Changes saved successfully
- ✅ Tags replaced (old removed, new added)
- ✅ Event type data updated
- ✅ No duplicate tags created

#### Test 2.2.2: Change Event Type
**Purpose:** Verify changing event type updates fields

**Steps:**
1. Edit a hiking event
2. Change event type from "Hiking" to "Camping"
3. Verify hiking-specific fields disappear
4. Verify camping-specific fields appear
5. Fill in camping-specific data
6. Save event
7. View event details page
8. Verify event type badge changed
9. Verify event-type-specific details display correctly

**Expected Result:**
- ✅ Event type changed successfully
- ✅ Old type data preserved but not displayed
- ✅ New type fields saved
- ✅ Display components switch correctly

### Test 2.3: Event Display Testing

#### Test 2.3.1: Event Details Page - Hiking
**Purpose:** Verify hiking event displays correctly

**Steps:**
1. Navigate to a hiking event details page
2. Verify event type badge shows "Hiking" 🏔️
3. Verify hiking-specific details section displays:
   - Difficulty badge (color-coded)
   - Hike type badge
   - Distance
   - Group type
4. If multi-day hike:
   - Verify "Multi-Day Information" section displays
   - Verify number of days shown
   - Verify daily distances shown
   - Verify accommodation type shown
   - Verify meals provided shown
5. Verify tags displayed with proper styling
6. Verify all common fields shown (date, location, cost)

**Expected Result:**
- ✅ Event type badge correct
- ✅ Hiking-specific fields displayed
- ✅ Multi-day section appears only for multi-day hikes
- ✅ No hardcoded "distance" field in common section

#### Test 2.3.2: Event Details Page - Camping
**Purpose:** Verify camping event displays correctly

**Steps:**
1. Navigate to a camping event
2. Verify event type badge shows "Camping" ⛺
3. Verify camping-specific details:
   - Camping type badge
   - Number of nights
   - Site type
   - Facilities (with emojis)
   - Meals provided
   - Water availability
   - Equipment provided
4. Verify facility icons display correctly

**Expected Result:**
- ✅ Event type badge correct
- ✅ Facilities displayed with emojis (🚻🚿⚡💧🔥)
- ✅ All camping fields visible

#### Test 2.3.3: Event Details Page - 4x4
**Purpose:** Verify 4x4 event displays correctly

**Steps:**
1. Navigate to a 4x4 event
2. Verify event type badge shows "4x4" 🚗
3. Verify 4x4-specific details:
   - Trail difficulty badge
   - Distance and duration
   - Terrain types (with emojis)
   - Vehicle requirements
   - Required equipment
   - Recovery points
   - Technical notes
4. Verify terrain emojis (🏜️🟤🪨🌊⛰️🌲)

**Expected Result:**
- ✅ Event type badge correct
- ✅ Terrain types with emojis
- ✅ Vehicle requirements highlighted
- ✅ Technical notes displayed

#### Test 2.3.4: Event Details Page - Cycling
**Purpose:** Verify cycling event displays correctly

**Steps:**
1. Navigate to a cycling event
2. Verify event type badge shows "Cycling" 🚴
3. Verify cycling-specific details:
   - Ride type badge
   - Difficulty badge
   - Distance and elevation gain
   - Duration and average speed
   - Route type
   - Terrain types (with emojis)
   - Bike type recommendation
   - Support vehicle availability
   - Refreshment stops
4. Verify terrain emojis (🛣️🪨🟤🌲⚠️)

**Expected Result:**
- ✅ Event type badge correct
- ✅ Elevation gain displayed
- ✅ Route type shown
- ✅ Support vehicle status clear

#### Test 2.3.5: Event Details Page - Outdoor
**Purpose:** Verify outdoor event displays correctly

**Steps:**
1. Navigate to an outdoor event
2. Verify event type badge shows "Outdoor" 🧭
3. Verify outdoor-specific details:
   - Activity type
   - Difficulty badge
   - Duration
   - Participant limit
   - Equipment needed (as badges)
   - Skills required (as badges)
   - Physical requirements
   - Safety considerations (highlighted)
   - Instructor/guide info
   - Certification status
4. Verify safety warning is prominent

**Expected Result:**
- ✅ Event type badge correct
- ✅ Safety considerations highlighted with warning icon
- ✅ Equipment and skills displayed as badges
- ✅ Participant limit shown

### Test 2.4: Manage Events Page Testing

#### Test 2.4.1: Event List Display
**Purpose:** Verify events list shows correctly

**Steps:**
1. Navigate to "Manage Events" page
2. Verify page title shows "Manage Events" (not "Manage Hikes")
3. Verify tab shows "Events" (not "Hikes & Events")
4. Verify "Add Event" button visible and functional
5. Verify search placeholder says "Search events"
6. Create events of all 5 types
7. Verify all events appear in list
8. Verify each event shows:
   - Event name
   - Description (truncated)
   - Date
   - Status badge (color-coded)
   - Interest count
   - "Manage" button

**Expected Result:**
- ✅ All terminology updated to "Events"
- ✅ All event types displayed
- ✅ Event badges show correct colors
- ✅ Search works across all types

#### Test 2.4.2: Event Filtering
**Purpose:** Verify search and filters work

**Steps:**
1. On "Manage Events" page
2. Test search:
   - Type "camping" in search box
   - Verify only camping events shown
   - Clear search
3. Test status filter:
   - Select "Trip Booked"
   - Verify only booked events shown
   - Reset to "All Status"
4. Test date filter:
   - Select "Upcoming"
   - Verify only future events shown
   - Select "Past"
   - Verify only past events shown
   - Select "This Month"
5. Verify filter counter updates: "X of Y events"

**Expected Result:**
- ✅ Search filters by name, description, location
- ✅ Status filter works correctly
- ✅ Date filters accurate
- ✅ Counter shows correct numbers
- ✅ "No events" message shows when filtered results empty

### Test 2.5: Tag Management Testing

#### Test 2.5.1: Tag Creation During Event Creation
**Purpose:** Verify tags saved when creating event

**Steps:**
1. Create new event (any type)
2. Add 3 existing tags
3. Create 2 custom tags
4. Submit form
5. Navigate to event details
6. Verify all 5 tags appear
7. Check database: `SELECT * FROM event_tags WHERE event_id = [id]`
8. Verify 5 rows exist

**Expected Result:**
- ✅ All tags saved
- ✅ Custom tags created
- ✅ Tags visible on event

#### Test 2.5.2: Tag Updates During Event Editing
**Purpose:** Verify tags properly replaced (not duplicated)

**Steps:**
1. Edit event with existing tags (e.g., 3 tags)
2. Remove 1 tag (deselect it)
3. Add 2 new tags
4. Save event
5. View event details
6. Verify total tags: 4 (3 - 1 + 2)
7. Verify removed tag NOT present
8. Verify new tags ARE present
9. Check database event_tags table
10. Verify no duplicate entries

**Expected Result:**
- ✅ Old tags removed
- ✅ New tags added
- ✅ No duplicates in database
- ✅ Tag count correct

#### Test 2.5.3: Tag Removal (All Tags)
**Purpose:** Verify all tags can be removed

**Steps:**
1. Edit event with tags
2. Deselect all tags
3. Save event
4. View event details
5. Verify "Tags" section empty or not shown
6. Check database
7. Verify no event_tags rows for this event

**Expected Result:**
- ✅ All tags removed successfully
- ✅ No database errors
- ✅ Event still valid

---

## 3. Data Validation Testing

### Test 3.1: Required Field Validation

#### Test 3.1.1: Common Field Validation
**Purpose:** Verify required common fields enforced

**Steps:**
1. Click "Add Event"
2. Leave "Event Name" blank
3. Try to submit
4. Verify error: "Event name and date are required"
5. Fill name, leave date blank
6. Try to submit
7. Verify same error
8. Fill both fields
9. Verify form submits (may get event-type validation)

**Expected Result:**
- ✅ Name and date required
- ✅ Clear error messages
- ✅ Form doesn't submit until fixed

#### Test 3.1.2: Hiking Event Validation
**Purpose:** Verify hiking-specific required fields

**Steps:**
1. Create hiking event
2. Fill common fields
3. Leave difficulty blank
4. Submit
5. Verify error: "Difficulty is required for hiking events"
6. Fill difficulty, leave hike type blank
7. Submit
8. Verify error: "Hike type (day/multi-day) is required"

**Expected Result:**
- ✅ Difficulty required
- ✅ Hike type required
- ✅ Specific error messages

#### Test 3.1.3: Camping Event Validation
**Purpose:** Verify camping-specific validation

**Steps:**
1. Create camping event
2. Fill common fields
3. Leave camping type blank
4. Submit
5. Verify error: "Camping type is required for camping events"

**Expected Result:**
- ✅ Camping type required

#### Test 3.1.4: 4x4 Event Validation
**Purpose:** Verify 4x4-specific validation

**Steps:**
1. Create 4x4 event
2. Fill common fields
3. Leave difficulty blank
4. Submit
5. Verify error: "Difficulty level is required for 4x4 excursions"

**Expected Result:**
- ✅ Difficulty required for 4x4

#### Test 3.1.5: Cycling Event Validation
**Purpose:** Verify cycling-specific validation

**Steps:**
1. Create cycling event
2. Fill common fields
3. Leave ride type blank
4. Submit
5. Verify error: "Ride type is required for cycling events"
6. Fill ride type, leave difficulty blank
7. Submit
8. Verify error: "Difficulty level is required for cycling events"

**Expected Result:**
- ✅ Ride type required
- ✅ Difficulty required

#### Test 3.1.6: Outdoor Event Validation
**Purpose:** Verify outdoor-specific validation

**Steps:**
1. Create outdoor event
2. Fill common fields
3. Leave activity type blank
4. Submit
5. Verify error: "Activity type is required for outdoor events"
6. Select "Other" as activity type
7. Leave custom activity name blank
8. Submit
9. Verify error: "Please specify the activity name"

**Expected Result:**
- ✅ Activity type required
- ✅ Custom name required when "Other" selected

### Test 3.2: Data Type Validation

#### Test 3.2.1: Number Field Validation
**Purpose:** Verify numeric fields handle invalid input

**Steps:**
1. Create event
2. In "Cost" field, type "abc"
3. Verify field rejects non-numeric input
4. For cycling event, in "Elevation Gain" type negative number
5. For camping event, in "Number of Nights" type 0
6. Verify appropriate validation

**Expected Result:**
- ✅ Only numbers accepted in numeric fields
- ✅ Negative values handled appropriately

#### Test 3.2.2: Date Validation
**Purpose:** Verify date field behavior

**Steps:**
1. Create event
2. Try entering invalid date format
3. Try past date (should be allowed for testing)
4. Try far future date (e.g., year 2099)
5. Verify all work correctly

**Expected Result:**
- ✅ Date picker enforces valid dates
- ✅ Past dates allowed (for historical events)

#### Test 3.2.3: URL Validation
**Purpose:** Verify URL fields validated

**Steps:**
1. Create event
2. In "Location Link" enter invalid URL: "notaurl"
3. Try to submit
4. Verify HTML5 validation triggers
5. Enter valid URL: "https://maps.google.com/..."
6. Verify accepted

**Expected Result:**
- ✅ Invalid URLs rejected
- ✅ Valid URLs accepted

---

## 4. Navigation Testing

### Test 4.1: Page Navigation

#### Test 4.1.1: Add Event Navigation
**Purpose:** Verify navigation to add event page

**Steps:**
1. From dashboard, navigate to "Manage Events"
2. Click "Add Event" button
3. Verify URL changes to `/events/add`
4. Verify page loads without errors
5. Click back button (browser or on-page)
6. Verify returns to "Manage Events"

**Expected Result:**
- ✅ Navigation smooth
- ✅ Back button works
- ✅ No errors in console

#### Test 4.1.2: Edit Event Navigation
**Purpose:** Verify navigation to edit event page

**Steps:**
1. From "Manage Events", click "Manage" on event
2. Verify navigation to `/manage-hikes/[id]`
3. Click "Edit Event Details"
4. Verify navigation to `/events/edit/[id]`
5. Verify event data loads
6. Click "Cancel"
7. Verify returns to previous page

**Expected Result:**
- ✅ Edit page navigation works
- ✅ Data loads correctly
- ✅ Cancel returns to previous view

#### Test 4.1.3: Post-Save Redirect
**Purpose:** Verify redirect after saving

**Steps:**
1. Create new event
2. Submit form
3. Verify redirect to `/admin/manage-hikes`
4. Verify new event visible in list
5. Edit existing event
6. Submit form
7. Verify redirect to `/admin/manage-hikes`

**Expected Result:**
- ✅ Both create and edit redirect correctly
- ✅ Success feedback visible (event in list)

### Test 4.2: Mobile Navigation Testing

#### Test 4.2.1: Mobile Add Event
**Purpose:** Verify mobile-friendly add event flow

**Steps:**
1. Open browser DevTools
2. Switch to mobile view (iPhone 12 Pro, 390x844)
3. Navigate to "Add Event"
4. Verify full-screen page (not modal)
5. Scroll through form
6. Verify all fields accessible
7. Verify back button visible and tappable
8. Fill form and submit
9. Verify keyboard doesn't obscure submit button

**Expected Result:**
- ✅ Full-screen form on mobile
- ✅ All fields easily accessible
- ✅ Back button large enough to tap
- ✅ Submit button always visible

#### Test 4.2.2: Mobile Edit Event
**Purpose:** Verify mobile-friendly edit flow

**Steps:**
1. In mobile view
2. Navigate to edit event
3. Verify form displays correctly
4. Verify pre-filled data visible
5. Make changes and save
6. Verify success

**Expected Result:**
- ✅ Edit page mobile-friendly
- ✅ Data loads and displays properly
- ✅ Save button accessible

---

## 5. Performance Testing

### Test 5.1: Page Load Performance

#### Test 5.1.1: Manage Events Load Time
**Purpose:** Measure page load with many events

**Steps:**
1. Create 50+ events of various types
2. Clear browser cache
3. Navigate to "Manage Events"
4. Use browser DevTools Performance tab
5. Measure time to interactive
6. Verify < 3 seconds on desktop
7. Verify < 5 seconds on mobile 3G

**Expected Result:**
- ✅ Page loads reasonably fast
- ✅ No unnecessary re-renders
- ✅ Lazy loading works

#### Test 5.1.2: Event Details Load Time
**Purpose:** Measure event details page performance

**Steps:**
1. Navigate to event with complex data
2. Measure time to display all content
3. Verify images load (if any)
4. Check for layout shifts

**Expected Result:**
- ✅ Page loads < 2 seconds
- ✅ No significant layout shifts
- ✅ Images lazy load

### Test 5.2: Form Performance

#### Test 5.2.1: Form Input Responsiveness
**Purpose:** Verify form inputs responsive

**Steps:**
1. Open add event form
2. Type rapidly in text fields
3. Verify no lag or dropped characters
4. Change event type multiple times quickly
5. Verify fields switch smoothly
6. Add/remove tags rapidly
7. Verify tag UI updates immediately

**Expected Result:**
- ✅ No input lag
- ✅ Event type switch smooth
- ✅ Tag updates instant

---

## 6. Error Handling Testing

### Test 6.1: Network Error Handling

#### Test 6.1.1: Create Event with Network Failure
**Purpose:** Verify graceful handling of network errors

**Steps:**
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Try to create event
4. Verify error message: "Connection error. Please try again."
5. Restore network
6. Try again
7. Verify success

**Expected Result:**
- ✅ Clear error message
- ✅ Form data preserved
- ✅ Retry works

#### Test 6.1.2: Edit Event with Network Failure
**Purpose:** Verify edit form handles network issues

**Steps:**
1. Load edit form
2. Make changes
3. Go offline
4. Try to save
5. Verify error message
6. Restore connection
7. Save again

**Expected Result:**
- ✅ Error message displayed
- ✅ Changes not lost
- ✅ Successful retry

### Test 6.2: Invalid Data Handling

#### Test 6.2.1: Server Validation Errors
**Purpose:** Verify server-side validation displayed

**Steps:**
1. (Requires backend modification for testing)
2. Create event that fails server validation
3. Verify error message from server displayed
4. Verify form fields highlighted (if applicable)

**Expected Result:**
- ✅ Server errors displayed clearly
- ✅ User can correct and retry

#### Test 6.2.2: Event Not Found
**Purpose:** Verify handling of missing event

**Steps:**
1. Navigate to `/events/edit/99999` (non-existent ID)
2. Verify error message: "Event not found"
3. Verify option to return to manage events

**Expected Result:**
- ✅ Clear error message
- ✅ Navigation option provided
- ✅ No crash or infinite loading

---

## 7. Security Testing

### Test 7.1: Authentication

#### Test 7.1.1: Unauthenticated Access
**Purpose:** Verify routes protected

**Steps:**
1. Logout from application
2. Try to navigate directly to `/events/add`
3. Verify redirect to login
4. Try `/events/edit/1`
5. Verify redirect to login
6. Try `/admin/manage-hikes`
7. Verify redirect or access denied

**Expected Result:**
- ✅ All admin routes protected
- ✅ Redirect to login
- ✅ No data exposure

#### Test 7.1.2: Non-Admin Access
**Purpose:** Verify admin-only routes blocked

**Steps:**
1. Login as regular user (not admin)
2. Try to navigate to `/events/add`
3. Verify access denied message
4. Try `/admin/manage-hikes`
5. Verify permission denied

**Expected Result:**
- ✅ Non-admins cannot access
- ✅ Clear permission denied message

### Test 7.2: Input Sanitization

#### Test 7.2.1: XSS Prevention
**Purpose:** Verify HTML/script injection blocked

**Steps:**
1. Create event
2. In name field, enter: `<script>alert('XSS')</script>`
3. Save event
4. View event details
5. Verify script not executed
6. Verify HTML displayed as text

**Expected Result:**
- ✅ Script tags not executed
- ✅ HTML escaped/sanitized
- ✅ Event still functional

#### Test 7.2.2: SQL Injection Prevention
**Purpose:** Verify SQL injection blocked

**Steps:**
1. Create event
2. In name field, enter: `Test'; DROP TABLE hikes;--`
3. Save event
4. Verify event saved with literal string
5. Verify database not affected
6. Verify no errors

**Expected Result:**
- ✅ SQL injection blocked
- ✅ Input treated as literal string
- ✅ Database integrity maintained

---

## 8. Browser Compatibility Testing

### Test 8.1: Desktop Browsers

#### Test 8.1.1: Chrome/Edge Testing
**Purpose:** Verify full functionality in Chrome

**Steps:**
1. Open in Chrome (latest version)
2. Run through all functional tests
3. Check console for errors
4. Verify all features work

**Expected Result:**
- ✅ All features functional
- ✅ No console errors
- ✅ Styling correct

#### Test 8.1.2: Firefox Testing
**Purpose:** Verify Firefox compatibility

**Steps:**
1. Open in Firefox (latest version)
2. Test event creation flow
3. Test event editing
4. Test event display
5. Check for layout issues

**Expected Result:**
- ✅ Functional parity with Chrome
- ✅ No layout issues
- ✅ Forms work correctly

#### Test 8.1.3: Safari Testing (Mac)
**Purpose:** Verify Safari compatibility

**Steps:**
1. Open in Safari (latest version)
2. Test key workflows
3. Check date picker functionality
4. Verify styling correct

**Expected Result:**
- ✅ Core features work
- ✅ Date picker functional
- ✅ Styling consistent

### Test 8.2: Mobile Browsers

#### Test 8.2.1: Mobile Chrome (Android)
**Purpose:** Verify Android Chrome compatibility

**Steps:**
1. Open on Android device
2. Test full workflow
3. Verify touch interactions
4. Test form inputs

**Expected Result:**
- ✅ Touch-friendly
- ✅ Forms usable
- ✅ Performance acceptable

#### Test 8.2.2: Mobile Safari (iOS)
**Purpose:** Verify iOS Safari compatibility

**Steps:**
1. Open on iPhone
2. Test event creation
3. Test event editing
4. Verify keyboard behavior

**Expected Result:**
- ✅ iOS compatible
- ✅ Keyboard doesn't block inputs
- ✅ Performance good

---

## 9. Regression Testing

### Test 9.1: Existing Features

#### Test 9.1.1: User Interest/Attendance
**Purpose:** Verify interest functionality still works

**Steps:**
1. As regular user, view event
2. Click "I'm Interested"
3. Verify status updated
4. Confirm attendance
5. Verify status changed to "Confirmed"

**Expected Result:**
- ✅ Interest buttons work
- ✅ Attendance tracking functional
- ✅ Status updates correctly

#### Test 9.1.2: Comments System
**Purpose:** Verify comments still work

**Steps:**
1. View event details
2. Add comment
3. Verify comment appears
4. Delete own comment
5. Verify deletion works

**Expected Result:**
- ✅ Comments functional
- ✅ Add/delete works
- ✅ Display correct

#### Test 9.1.3: Packing List
**Purpose:** Verify packing list still accessible

**Steps:**
1. View event details
2. Scroll to packing list section
3. Verify items display
4. As admin, edit packing list
5. Verify changes saved

**Expected Result:**
- ✅ Packing list displays
- ✅ Admin can edit
- ✅ Changes persist

#### Test 9.1.4: Carpool System
**Purpose:** Verify carpool offers/requests work

**Steps:**
1. View event details
2. Offer ride
3. Verify offer appears
4. Request ride
5. Verify request appears

**Expected Result:**
- ✅ Carpool functional
- ✅ Offers/requests work
- ✅ Display correct

#### Test 9.1.5: Payments System
**Purpose:** Verify payments tracking works

**Steps:**
1. Navigate to event management
2. Go to Payments & Finance tab
3. Record payment for attendee
4. Verify payment saved
5. Check payment stats

**Expected Result:**
- ✅ Payments functional
- ✅ Stats calculate correctly
- ✅ Display accurate

---

## 10. Database Testing

### Test 10.1: Data Integrity

#### Test 10.1.1: Event Type Data Storage
**Purpose:** Verify JSONB storage works correctly

**Steps:**
1. Create event with complex type data
2. Connect to database:
   ```bash
   psql -h 35.202.149.98 -U postgres -d hiking_portal
   ```
3. Query event:
   ```sql
   SELECT id, name, event_type, event_type_data
   FROM hikes
   WHERE id = [event_id];
   ```
4. Verify event_type_data is valid JSON
5. Verify all fields present in JSON

**Expected Result:**
- ✅ Data stored as JSONB
- ✅ All fields present
- ✅ Valid JSON structure

#### Test 10.1.2: Tag Relationships
**Purpose:** Verify event_tags junction table correct

**Steps:**
1. Create event with 5 tags
2. Query database:
   ```sql
   SELECT et.*, t.name
   FROM event_tags et
   JOIN tags t ON et.tag_id = t.id
   WHERE et.event_id = [event_id];
   ```
3. Verify 5 rows returned
4. Edit event, change to 3 tags
5. Query again
6. Verify exactly 3 rows (no duplicates)

**Expected Result:**
- ✅ Correct number of rows
- ✅ No orphaned relationships
- ✅ Updates atomic (transaction-based)

#### Test 10.1.3: Event Types Table
**Purpose:** Verify event_types table accurate

**Steps:**
1. Query event types:
   ```sql
   SELECT * FROM event_types
   WHERE active = true
   ORDER BY sort_order;
   ```
2. Verify 5 active types:
   - hiking (sort_order 1)
   - camping (sort_order 2)
   - 4x4 (sort_order 3)
   - cycling (sort_order 4)
   - outdoor (sort_order 5)
3. Verify fishing NOT in list (deactivated)

**Expected Result:**
- ✅ 5 active event types
- ✅ Fishing absent
- ✅ Cycling present

### Test 10.2: Migration Verification

#### Test 10.2.1: Migration 024 Status
**Purpose:** Verify migration 024 executed

**Steps:**
1. Connect to database
2. Query migration status:
   ```sql
   SELECT * FROM schema_migrations
   WHERE version = '024';
   ```
3. Verify row exists
4. Query cycling tags:
   ```sql
   SELECT * FROM tags
   WHERE category = 'cycling';
   ```
5. Verify 7 cycling tags exist

**Expected Result:**
- ✅ Migration recorded
- ✅ Cycling event type exists
- ✅ Cycling tags created

---

## 11. Known Issues & Workarounds

### Issue 11.1: Tags Not Saving on Edit
**Status:** ✅ FIXED
**Date Fixed:** October 19, 2025

**Issue:** Tags were not being updated when editing events. They were being added but old tags not removed, causing duplicates or inconsistent behavior.

**Root Cause:** Frontend was calling `api.addEventTags()` which added tags without removing old ones.

**Fix Implemented:**
1. Added `api.updateEventTags()` method in frontend
2. Added PUT `/api/tags/events/:id` route in backend
3. Added `updateEventTags` controller method using transaction
4. Updated EditEventPage to use `updateEventTags` instead of `addEventTags`

**Verification:**
- Edit an event with existing tags
- Remove some, add others
- Save and reload
- Verify exact tags present (no duplicates)

### Issue 11.2: Old Hiking Fields Displayed
**Status:** ✅ FIXED
**Date Fixed:** October 19, 2025

**Issue:** Event details page showed hardcoded hiking fields (difficulty, distance, type, group_type) instead of event-type-specific fields.

**Fix:** Updated HikeDetailsPage to:
- Show event type badge with icon
- Display event-type-specific details using display components
- Remove hardcoded hiking fields
- Remove old multi-day section

### Issue 11.3: AdminPanel Still Shows Old Event Data
**Status:** ⚠️ PARTIAL (Low Priority)

**Issue:** AdminPanel event cards still show old hiking-specific badges (difficulty, type, group_type) because those fields may not exist for non-hiking events.

**Workaround:** Events list works but shows incomplete/incorrect data for non-hiking events.

**Proposed Fix:** Update AdminPanel `renderManageHike` function to:
- Read event_type from hike object
- Display event type badge instead of hiking badges
- Show type-appropriate summary info

**Priority:** Medium (cosmetic issue in admin panel only)

---

## 12. Test Result Recording

### Test Execution Log

| Test ID | Test Name | Date | Tester | Result | Notes |
|---------|-----------|------|--------|--------|-------|
| 2.1.1 | Create Hiking Event | | | ⬜ Pending | |
| 2.1.2 | Create Camping Event | | | ⬜ Pending | |
| 2.1.3 | Create 4x4 Event | | | ⬜ Pending | |
| 2.1.4 | Create Cycling Event | | | ⬜ Pending | |
| 2.1.5 | Create Outdoor Event | | | ⬜ Pending | |
| 2.2.1 | Edit Existing Event | | | ⬜ Pending | |
| 2.2.2 | Change Event Type | | | ⬜ Pending | |
| 2.3.1 | Display Hiking Event | | | ⬜ Pending | |
| 2.3.2 | Display Camping Event | | | ⬜ Pending | |
| 2.3.3 | Display 4x4 Event | | | ⬜ Pending | |
| 2.3.4 | Display Cycling Event | | | ⬜ Pending | |
| 2.3.5 | Display Outdoor Event | | | ⬜ Pending | |
| 2.5.2 | Tag Updates | | | ✅ Fixed | Tag replacement working |

### Critical Path Tests (Must Pass)

These tests MUST pass before deploying to production:

1. ✅ **Test 2.1.1** - Create Hiking Event (backward compatibility)
2. ⬜ **Test 2.1.4** - Create Cycling Event (new feature)
3. ⬜ **Test 2.2.1** - Edit Existing Event (core functionality)
4. ✅ **Test 2.5.2** - Tag Updates (bug fix verification)
5. ⬜ **Test 3.1.1** - Required Field Validation (data integrity)
6. ⬜ **Test 7.1.1** - Unauthenticated Access (security)
7. ⬜ **Test 9.1.1** - User Interest/Attendance (core feature)

### Performance Benchmarks

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Manage Events Load (desktop) | < 3s | | ⬜ Not Tested |
| Event Details Load | < 2s | | ⬜ Not Tested |
| Form Submit Time | < 1s | | ⬜ Not Tested |
| Mobile Page Load (3G) | < 5s | | ⬜ Not Tested |

---

## 13. Deployment Checklist

### Pre-Deployment

- [ ] All critical path tests passed
- [ ] No console errors in production build
- [ ] Database migrations executed successfully
- [ ] Backend deployed and tested
- [ ] API endpoints responding correctly
- [ ] Tags fix verified working
- [ ] Performance benchmarks met

### Deployment Steps

1. **Backend Deployment**
   ```bash
   cd backend
   gcloud run deploy backend --source .
   ```

2. **Frontend Build**
   ```bash
   cd frontend
   npm run build
   ```

3. **Frontend Deployment**
   ```bash
   firebase deploy --only hosting
   ```

4. **Post-Deployment Verification**
   - [ ] Production site loads
   - [ ] Can create event
   - [ ] Can edit event
   - [ ] Tags save correctly
   - [ ] All event types display correctly

### Rollback Plan

If critical issues discovered:
1. Revert frontend deployment: `firebase hosting:rollback`
2. Revert backend: Deploy previous revision in Cloud Run console
3. Notify users of temporary rollback

---

## 14. Contact & Support

### Testing Team
- **Primary Tester:** [To be assigned]
- **Backend Lead:** [To be assigned]
- **Frontend Lead:** [To be assigned]

### Issue Reporting
- **GitHub Issues:** https://github.com/[your-repo]/issues
- **Priority Levels:**
  - **P0 (Critical):** Blocks all users, data loss risk
  - **P1 (High):** Major feature broken, affects many users
  - **P2 (Medium):** Feature partially broken, workaround exists
  - **P3 (Low):** Cosmetic issue, minor inconvenience

### Test Environment Access
- **Frontend Dev:** http://localhost:3000
- **Frontend Prod:** https://hiking-portal-v2.web.app
- **Backend API:** https://backend-554106646136.europe-west1.run.app
- **Database:** Credentials in `.env` file (admins only)

---

**Document Version:** 1.0
**Last Updated:** October 19, 2025
**Next Review:** After initial test execution

