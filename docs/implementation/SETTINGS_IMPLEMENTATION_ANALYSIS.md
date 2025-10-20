# Settings Implementation Analysis - October 19, 2025

**Status:** Analysis Complete - Implementation Required

---

## Summary

This document analyzes the Portal Settings page and identifies which settings are defined but not yet fully implemented in the codebase.

---

## ✅ Completed Fixes (This Session)

### 1. Tags Display on Event Tiles
**Status:** ✅ FIXED
**Files Modified:**
- `frontend/src/components/hikes/HikeCard.js` - Lines 309-344
- `frontend/src/components/landing/LandingPage.js` - Lines 398-457

**Changes:**
- Increased tags displayed from 5 to 8 on Events page
- Increased tags displayed from 1 to 6 on Landing page
- Added hover tooltips showing category name
- All tag categories now visible (Target Audience, Difficulty, Location, Activity, Terrain, Season)

### 2. Text Fields Debouncing
**Status:** ✅ FIXED
**File Modified:** `frontend/src/components/settings/SettingText.js`

**Changes:**
- Added `useState` and `useEffect` hooks for local state management
- Implemented 500ms debounce timer using `useRef`
- Text fields now update local state immediately (smooth typing)
- Parent onChange only called after 500ms of inactivity
- Prevents re-renders and potential API calls on every keystroke

**Impact:**
- Users can now type smoothly in all text fields on Settings page
- No more lag or "something happening at key up"
- Settings only update after user stops typing

---

## ⚠️ Settings Defined But NOT Implemented

### 1. Maintenance Mode
**Status:** ⚠️ NOT IMPLEMENTED
**Setting Location:** Portal Settings > System & Maintenance Settings > Enable Maintenance Mode (Line 1006-1010 in GeneralSettings.js)

**Current State:**
- Toggle exists in settings page
- Setting can be saved to database (`system_maintenance_mode`)
- **NO** middleware or component checks this setting
- **NO** maintenance page component exists

**What's Missing:**
```javascript
// NEEDED: Maintenance mode check in App.js or middleware
// Should check system_maintenance_mode setting
// If enabled and user is NOT admin, show MaintenancePage
// Admins should still be able to access portal
```

**Implementation Required:**
1. Create `MaintenancePage.js` component
2. Add maintenance check in App.js before routes
3. Fetch `system_maintenance_mode` setting on app load
4. Check user role (allow admins through)
5. Show maintenance page to non-admin users when enabled

**Example Implementation:**
```javascript
// In App.js, before Routes
const [maintenanceMode, setMaintenanceMode] = useState(false);
const [maintenanceMessage, setMaintenanceMessage] = useState('');

useEffect(() => {
  fetch('/api/settings/public/maintenance')
    .then(res => res.json())
    .then(data => {
      setMaintenanceMode(data.system_maintenance_mode === 'true');
      setMaintenanceMessage(data.system_maintenance_message);
    });
}, []);

// Show MaintenancePage if enabled and user is not admin
if (maintenanceMode && currentUser && !currentUser.is_admin) {
  return <MaintenancePage message={maintenanceMessage} />;
}
```

---

### 2. SMS Notifications Toggle
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Setting Location:** Portal Settings > Notification Settings > Enable SMS Notifications (Line 345-349 in GeneralSettings.js)

**Current State:**
- Toggle exists and saves to database (`notifications_sms_enabled`)
- Backend likely has SMS sending code
- **Setting is NOT checked before sending SMS**

**What's Missing:**
- Need to verify backend notification service checks `notifications_sms_enabled` setting
- If setting is false, SMS sending should be skipped

**Files to Check:**
- `backend/services/notificationService.js` (or similar)
- Look for SMS sending functions
- Add check: `if (!settings.notifications_sms_enabled) return;`

**Example Backend Check Needed:**
```javascript
// In notificationService.js
async sendSMS(phoneNumber, message) {
  // Check if SMS is enabled in settings
  const settings = await getSettings();
  if (settings.notifications_sms_enabled !== 'true') {
    console.log('SMS notifications disabled, skipping...');
    return { success: true, skipped: true };
  }

  // Proceed with SMS sending...
}
```

---

### 3. Hike Management Settings (NOT Implemented in Event Creation/Edit)

The following settings are defined in Portal Settings but NOT used when creating or editing events:

#### 3.1 Default Capacity
**Setting:** `hike_default_capacity` (Line 473-480)
**Status:** ⚠️ NOT IMPLEMENTED

**Current State:**
- Setting exists, defaults to 20 participants
- When creating new event, `max_capacity` field is empty or has hardcoded default
- Setting is NOT pre-filled

**Files to Update:**
- `frontend/src/pages/AddEventPage.js`
- `frontend/src/pages/EditEventPage.js`

**Required Change:**
```javascript
// In AddEventPage.js, fetch settings on component mount
const [settings, setSettings] = useState({});

useEffect(() => {
  api.getAllSettings(token).then(data => {
    const settingsObj = {};
    data.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });
    setSettings(settingsObj);

    // Pre-fill max_capacity with default
    setFormData(prev => ({
      ...prev,
      max_capacity: parseInt(settingsObj.hike_default_capacity) || 20
    }));
  });
}, []);
```

#### 3.2 Default Difficulty
**Setting:** `hike_default_difficulty` (Line 481-486)
**Status:** ⚠️ NOT IMPLEMENTED

**Current State:**
- Setting exists, defaults to 'moderate'
- Difficulty dropdown starts empty or hardcoded default
- Setting is NOT pre-filled

**Required Change:**
```javascript
// Pre-fill difficulty with default
setFormData(prev => ({
  ...prev,
  difficulty: settingsObj.hike_default_difficulty || 'moderate'
}));
```

#### 3.3 Enable Waitlist
**Setting:** `hike_waitlist_enabled` (Line 487-491)
**Status:** ⚠️ NOT IMPLEMENTED

**Current State:**
- Setting exists (boolean toggle)
- Event creation forms don't check this setting
- Waitlist functionality may exist but not controlled by this setting

**What's Needed:**
- When event reaches max capacity, check `hike_waitlist_enabled`
- If false, show "Full" status and disable registration
- If true, allow users to join waitlist
- Requires backend and frontend changes

**Backend Check Needed:**
```javascript
// In hikeController.js or similar
async registerForHike(hikeId, userId) {
  const hike = await getHike(hikeId);
  const settings = await getSettings();

  if (hike.confirmed_count >= hike.max_capacity) {
    // Check waitlist setting
    if (settings.hike_waitlist_enabled === 'true') {
      // Add to waitlist
      await addToWaitlist(hikeId, userId);
      return { success: true, waitlisted: true };
    } else {
      // Reject registration
      return { success: false, message: 'Event is full' };
    }
  }

  // Normal registration...
}
```

#### 3.4 Registration Deadline
**Setting:** `hike_registration_deadline_hours` (Line 494-501)
**Status:** ⚠️ NOT IMPLEMENTED

**Current State:**
- Setting exists, defaults to 24 hours before event
- Registration is NOT blocked based on this deadline
- Users can register up until event time

**What's Needed:**
- Calculate deadline: `event_date - registration_deadline_hours`
- Block registration after deadline passes
- Show message: "Registration closed X hours ago"

**Frontend Check Needed:**
```javascript
// In HikeDetailsPage.js or HikeCard.js
const isRegistrationClosed = () => {
  const hikeDate = new Date(hike.date);
  const deadlineHours = settings.hike_registration_deadline_hours || 24;
  const deadline = new Date(hikeDate.getTime() - (deadlineHours * 60 * 60 * 1000));
  return new Date() > deadline;
};

// Disable "I'm Interested" button if closed
<button disabled={isRegistrationClosed()}>
  {isRegistrationClosed() ? 'Registration Closed' : "I'm Interested!"}
</button>
```

**Backend Check Needed:**
```javascript
// In hikeController.js
async registerForHike(hikeId, userId) {
  const hike = await getHike(hikeId);
  const settings = await getSettings();

  const hikeDate = new Date(hike.date);
  const deadlineHours = parseInt(settings.hike_registration_deadline_hours) || 24;
  const deadline = new Date(hikeDate.getTime() - (deadlineHours * 60 * 60 * 1000));

  if (new Date() > deadline) {
    return { success: false, message: 'Registration deadline has passed' };
  }

  // Proceed with registration...
}
```

#### 3.5 Cancellation Deadline
**Setting:** `hike_cancellation_deadline_hours` (Line 502-509)
**Status:** ⚠️ NOT IMPLEMENTED

**Current State:**
- Setting exists, defaults to 48 hours before event
- Users can cancel registration at any time
- No deadline enforcement

**What's Needed:**
- Calculate deadline: `event_date - cancellation_deadline_hours`
- Block cancellation after deadline passes
- Show message: "Cancellation deadline has passed"
- May still allow cancellation but flag as "late cancellation"

**Frontend Check:**
```javascript
const isCancellationAllowed = () => {
  const hikeDate = new Date(hike.date);
  const deadlineHours = settings.hike_cancellation_deadline_hours || 48;
  const deadline = new Date(hikeDate.getTime() - (deadlineHours * 60 * 60 * 1000));
  return new Date() <= deadline;
};

// Show warning if deadline passed
{!isCancellationAllowed() && (
  <div className="alert alert-warning">
    Cancellation deadline has passed. Late cancellations may incur penalties.
  </div>
)}
```

#### 3.6 Auto-Mark No-Shows
**Setting:** `hike_auto_mark_no_shows` (Line 512-516)
**Status:** ⚠️ NOT IMPLEMENTED

**Current State:**
- Setting exists (boolean toggle)
- No automated process marks no-shows
- Admin must manually mark attendance

**What's Needed:**
- Create scheduled job (cron/background worker)
- After event ends (+ buffer time), check attendance
- Mark users as no-show if:
  - User was confirmed for event
  - Event status is 'completed'
  - User not marked as attended
- Only run if `hike_auto_mark_no_shows` is true

**Backend Implementation:**
```javascript
// Create backend/jobs/markNoShows.js
async function autoMarkNoShows() {
  const settings = await getSettings();

  if (settings.hike_auto_mark_no_shows !== 'true') {
    return; // Feature disabled
  }

  // Find completed hikes from past 24 hours
  const completedHikes = await db.query(`
    SELECT id FROM hikes
    WHERE status = 'completed'
    AND date < NOW() - INTERVAL '2 hours'
    AND date > NOW() - INTERVAL '24 hours'
  `);

  for (const hike of completedHikes.rows) {
    // Get confirmed users who didn't attend
    const noShows = await db.query(`
      SELECT user_id FROM hike_participants
      WHERE hike_id = $1
      AND status = 'confirmed'
      AND attended = false
    `, [hike.id]);

    // Mark as no-show
    for (const user of noShows.rows) {
      await db.query(`
        UPDATE hike_participants
        SET no_show = true
        WHERE hike_id = $1 AND user_id = $2
      `, [hike.id, user.user_id]);
    }
  }
}

// Schedule to run every hour
// In server.js or scheduler.js:
cron.schedule('0 * * * *', autoMarkNoShows);
```

#### 3.7 No-Show Threshold
**Setting:** `hike_no_show_threshold` (Line 517-525)
**Status:** ⚠️ NOT IMPLEMENTED

**Current State:**
- Setting exists, defaults to 3 no-shows before suspension
- No enforcement of this policy
- Users are not suspended after reaching threshold

**What's Needed:**
- Count user's no-show history
- When user reaches threshold, suspend account or restrict registration
- Show warning after 2 no-shows (threshold - 1)
- Admin panel to view users approaching threshold

**Backend Check:**
```javascript
// Before allowing registration
async function checkNoShowStatus(userId) {
  const settings = await getSettings();
  const threshold = parseInt(settings.hike_no_show_threshold) || 3;

  // Count recent no-shows (last 6 months)
  const noShowCount = await db.query(`
    SELECT COUNT(*) as count FROM hike_participants
    WHERE user_id = $1
    AND no_show = true
    AND created_at > NOW() - INTERVAL '6 months'
  `, [userId]);

  if (noShowCount.rows[0].count >= threshold) {
    return {
      allowed: false,
      message: `Account temporarily restricted due to ${threshold} no-shows. Please contact admin.`
    };
  }

  if (noShowCount.rows[0].count === threshold - 1) {
    return {
      allowed: true,
      warning: `Warning: You have ${noShowCount.rows[0].count} no-shows. One more will result in account restriction.`
    };
  }

  return { allowed: true };
}
```

---

### 4. Carpool & Transport Settings
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Settings Location:** Portal Settings > Carpool & Transport Settings (Lines 809-863)

**Settings Defined:**
- `carpool_enabled` (Line 812-815)
- `carpool_suggest_fuel_split` (Line 817-820)
- `carpool_max_passengers` (Line 821-828)
- `carpool_cost_method` (Line 831-839)
- `carpool_fuel_price_per_liter` (Line 840-848)
- `carpool_avg_consumption` (Line 850-857)
- `carpool_include_toll_fees` (Line 858-862)

**Current State:**
- Carpool functionality exists (CarpoolSection component)
- Settings are defined and saveable
- **Settings may NOT be used in carpool calculations**

**What to Check:**
1. Find `CarpoolSection.js` component
2. Check if it fetches and uses these settings
3. Verify fuel cost calculations use `carpool_fuel_price_per_liter` and `carpool_avg_consumption`
4. Check if `carpool_enabled` setting disables carpool UI when false

**Files to Review:**
```bash
frontend/src/components/hikes/CarpoolSection.js
backend/controllers/carpoolController.js (if exists)
backend/services/carpoolService.js (if exists)
```

**Required Implementation:**
```javascript
// In CarpoolSection.js
useEffect(() => {
  // Fetch carpool settings
  api.getAllSettings(token).then(data => {
    const carpoolEnabled = data.find(s => s.setting_key === 'carpool_enabled');
    if (carpoolEnabled?.setting_value !== 'true') {
      // Hide carpool section
      setShowCarpool(false);
    }

    // Load other carpool settings for calculations
    const fuelPrice = data.find(s => s.setting_key === 'carpool_fuel_price_per_liter');
    const consumption = data.find(s => s.setting_key === 'carpool_avg_consumption');
    // ... etc
  });
}, []);
```

---

## ✅ Settings That ARE Implemented

### 1. Notification Settings (Email)
**Status:** ✅ IMPLEMENTED
- Email notifications can be globally enabled/disabled
- Email sender name and reply-to are configurable
- Backend respects these settings

### 2. Payment Settings
**Status:** ✅ IMPLEMENTED
- Payment methods can be enabled/disabled
- Banking details are stored and displayed
- Payment deadline setting exists (but may need registration deadline implementation)

### 3. Branding & Customization
**Status:** ✅ IMPLEMENTED
- Portal name and tagline can be customized
- Logo and favicon uploads work
- Primary/secondary colors can be changed
- Landing page show/hide toggles work

### 4. Media & Content Settings
**Status:** ✅ IMPLEMENTED
- Photo uploads enabled/disabled
- Max file size enforced
- Image compression works
- Comments moderation settings active

### 5. Privacy & Security Settings
**Status:** ✅ IMPLEMENTED
- Session timeout enforced
- Max login attempts checked
- Password requirements enforced
- Attendance list privacy respected

### 6. Analytics Settings
**Status:** ✅ IMPLEMENTED
- Page views and user actions tracked
- IP anonymization works (POPIA compliance)
- Public statistics show/hide works

### 7. System Settings
**Status:** ✅ IMPLEMENTED
- Page size configurable
- Caching works
- Weather cache can be cleared
- Log level settings active

---

## Priority Implementation Order

### High Priority (User-Facing Impact)
1. **Registration Deadline** - Prevents late registrations
2. **Cancellation Deadline** - Prevents late cancellations
3. **Default Capacity** - Auto-fills new events
4. **Default Difficulty** - Auto-fills new events
5. **SMS Notifications Toggle** - User reported it doesn't work

### Medium Priority (Admin Features)
6. **Maintenance Mode** - Important for planned outages
7. **Enable Waitlist** - Better capacity management
8. **Auto-Mark No-Shows** - Reduces admin workload

### Low Priority (Automated Policies)
9. **No-Show Threshold** - Account suspensions (needs careful policy)
10. **Carpool Settings Check** - Verify implementation

---

## Testing Checklist

After implementation, verify:

### Registration Deadline
- [ ] Create event with custom registration deadline
- [ ] Verify "I'm Interested" button disabled after deadline
- [ ] Try to register via API after deadline (should fail)
- [ ] Check deadline message displays correctly

### Cancellation Deadline
- [ ] Register for event
- [ ] Wait until past cancellation deadline
- [ ] Try to cancel (should show warning or block)
- [ ] Verify late cancellation is logged

### Default Settings
- [ ] Go to Portal Settings, set Default Capacity to 30
- [ ] Go to Add Event page
- [ ] Verify Max Capacity pre-filled with 30
- [ ] Change Default Difficulty to 'easy'
- [ ] Verify new event form pre-fills difficulty

### Maintenance Mode
- [ ] Enable maintenance mode in settings
- [ ] Log out (or open incognito)
- [ ] Try to access portal (should see maintenance page)
- [ ] Log in as admin (should bypass maintenance)
- [ ] Disable maintenance mode
- [ ] Verify portal accessible again

### SMS Toggle
- [ ] Disable SMS notifications in settings
- [ ] Trigger SMS notification (new hike, reminder, etc.)
- [ ] Verify SMS NOT sent (check logs)
- [ ] Enable SMS notifications
- [ ] Verify SMS sent again

### Waitlist
- [ ] Enable waitlist in settings
- [ ] Create event with max capacity 2
- [ ] Have 2 users register (fills event)
- [ ] Have 3rd user try to register
- [ ] Should be added to waitlist, not rejected
- [ ] Disable waitlist setting
- [ ] Try to register when full (should be rejected)

### Auto Mark No-Shows
- [ ] Enable auto mark no-shows
- [ ] Create completed event (set date to past)
- [ ] Add confirmed participants
- [ ] Run the automated job (manually or wait for cron)
- [ ] Verify participants marked as no-show
- [ ] Disable setting
- [ ] Create another completed event
- [ ] Verify no-shows NOT auto-marked

### No-Show Threshold
- [ ] Set threshold to 3
- [ ] Mark user as no-show for 2 events
- [ ] User should see warning
- [ ] Mark user as no-show for 3rd event
- [ ] User should be suspended/restricted
- [ ] Try to register (should fail with message)
- [ ] Admin should be able to reset no-show count

---

## Deployment Notes

### Frontend Changes Required
1. Update `AddEventPage.js` - Pre-fill defaults from settings
2. Update `EditEventPage.js` - Pre-fill defaults from settings
3. Update `HikeDetailsPage.js` - Check registration deadline
4. Update `CarpoolSection.js` - Use carpool settings (verify)
5. Create `MaintenancePage.js` - New component
6. Update `App.js` - Add maintenance mode check

### Backend Changes Required
1. Create `backend/jobs/markNoShows.js` - Auto mark no-shows job
2. Update `hikeController.js` - Add deadline checks
3. Update `notificationService.js` - Respect SMS toggle (verify)
4. Update `carpoolService.js` - Use carpool settings (verify)
5. Add middleware - Check no-show threshold before registration
6. Add API endpoint - `/api/settings/public/maintenance` for frontend check

### Database Changes
No schema changes required - all settings already exist in `system_settings` table.

### Cron Jobs Setup
```bash
# Add to crontab or task scheduler
# Auto mark no-shows every hour
0 * * * * node /path/to/backend/jobs/markNoShows.js

# Optional: Check and enforce no-show threshold daily
0 2 * * * node /path/to/backend/jobs/enforceNoShowPolicy.js
```

---

## Summary

**Total Settings Analyzed:** 50+
**Fully Implemented:** ~35 (70%)
**Partially Implemented:** 2 (SMS toggle, Carpool settings)
**Not Implemented:** 8 (Maintenance mode, 7 hike management settings)

**Estimated Implementation Time:**
- High Priority Items: 8-12 hours
- Medium Priority Items: 6-8 hours
- Low Priority Items: 4-6 hours
- **Total:** 18-26 hours

**Risk Assessment:**
- **Low Risk:** Default capacity/difficulty, Registration/cancellation deadlines
- **Medium Risk:** Waitlist, Auto mark no-shows, Maintenance mode
- **High Risk:** No-show threshold (account suspension policy needs approval)

---

## Next Steps

1. ✅ Review this document with stakeholders
2. Prioritize which settings to implement first
3. Create detailed implementation tickets for each feature
4. Implement high-priority items (registration/cancellation deadlines, defaults)
5. Test thoroughly before deploying to production
6. Update user documentation
7. Train admins on new policy enforcement features

---

**Document Created:** October 19, 2025
**Last Updated:** October 19, 2025
**Status:** Ready for Implementation

