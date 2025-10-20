# Settings Integration Guide

**Date:** October 17, 2025
**Status:** ✅ COMPLETE - Phase 2 Implemented

---

## Overview

This guide documents how system settings are integrated throughout the Hiking Portal application and how they control system behavior.

---

## Table of Contents

1. [Settings Service](#settings-service)
2. [Registration Settings Integration](#registration-settings-integration)
3. [Admin Approval vs Auto-Approval Logic](#admin-approval-vs-auto-approval-logic)
4. [Notification Settings Integration](#notification-settings-integration)
5. [Payment Settings Integration](#payment-settings-integration)
6. [Hike Management Settings](#hike-management-settings)
7. [How to Add New Settings](#how-to-add-new-settings)
8. [Testing Settings](#testing-settings)

---

## Settings Service

### Backend Service: `services/settingsService.js`

The settings service provides a centralized, cached way to access system settings throughout the backend.

**Key Features:**
- ✅ In-memory caching with 5-minute TTL
- ✅ Automatic type parsing (boolean, number, json, string)
- ✅ Helper functions for specific setting categories
- ✅ Quiet hours detection
- ✅ Cache invalidation on updates

**Core Functions:**

```javascript
// Get all settings (cached)
const settings = await getAllSettings();

// Get specific setting with default
const value = await getSetting('notifications_email_enabled', true);

// Update setting
await updateSetting('payment_default_hike_cost', 200, userId);

// Clear cache (after bulk updates)
clearCache();

// Get category-specific settings
const regSettings = await getRegistrationSettings();
const notifSettings = await getNotificationSettings();
const paymentSettings = await getPaymentSettings();
const hikeSettings = await getHikeSettings();

// Check if within quiet hours
const isQuiet = await isQuietHours();
```

### Usage Pattern

```javascript
// In any controller
const { getSetting, getRegistrationSettings } = require('../services/settingsService');

// Get specific setting
const enabled = await getSetting('media_comments_enabled', true);

// Get category settings
const regSettings = await getRegistrationSettings();
if (regSettings.require_admin_approval) {
  // Require manual approval
}
```

---

## Registration Settings Integration

### Settings That Control Registration

| Setting Key | Type | Default | Description |
|------------|------|---------|-------------|
| `registration_allow_self_registration` | boolean | true | Allow users to register themselves |
| `registration_require_admin_approval` | boolean | true | **Require manual admin approval for all registrations** |
| `registration_require_email_verification` | boolean | true | Require email verification |
| `registration_require_phone_verification` | boolean | false | Require phone verification |
| `registration_phone_required` | boolean | true | Phone number required on signup |
| `registration_emergency_contact_required` | boolean | false | Emergency contact required |
| `registration_send_welcome_email` | boolean | true | Send welcome email on approval |
| `registration_show_onboarding_tour` | boolean | true | Show onboarding tour to new users |
| `registration_auto_approve_domains` | json | [] | Email domains to auto-approve |

### How It Works in `authController.js`

```javascript
// Step 1: Get registration settings
const regSettings = await getRegistrationSettings();

// Step 2: Determine if we should check auto-approval rules
let initialStatus = 'pending'; // Default to pending
let validation = null;

if (!regSettings.require_admin_approval) {
  // Setting is FALSE - run auto-approval validation
  validation = await validateRegistrationForAutoApproval(name, email, phone);
  initialStatus = validation.shouldAutoApprove ? 'approved' : 'pending';
} else {
  // Setting is TRUE - skip validation, require manual approval
  console.log('Admin approval required by system setting');
  initialStatus = 'pending'; // Force pending
}

// Step 3: Insert user with determined status
// Step 4: Send appropriate notifications
```

---

## Admin Approval vs Auto-Approval Logic

### The Two-Layer System

**Layer 1: Admin Approval Setting (Master Override)**
- Setting: `registration_require_admin_approval`
- When **TRUE**: ALL registrations go to pending, auto-approval validation is SKIPPED
- When **FALSE**: Auto-approval validation runs

**Layer 2: Auto-Approval Validation (Only if Layer 1 is FALSE)**
- Runs validation checks (email format, phone format, duplicate check, etc.)
- If all checks pass: `status = 'approved'`
- If any check fails: `status = 'pending'`

### Decision Flow

```
New Registration
    ↓
Check: registration_require_admin_approval setting
    ↓
    ├─ TRUE  → Set status = 'pending'
    │          Skip validation
    │          Notify admins: "Admin approval required by system setting"
    │
    └─ FALSE → Run validateRegistrationForAutoApproval()
               ↓
               ├─ Pass all checks → Set status = 'approved'
               │                    Notify user: Welcome!
               │                    Notify admins: Auto-approved
               │
               └─ Fail any check → Set status = 'pending'
                                   Notify admins: "Reason: [validation failure]"
```

### Important Notes

1. **Admin Approval Setting is Master**
   - When enabled, it OVERRIDES all auto-approval logic
   - Even perfect registrations will require manual review

2. **Auto-Approval Only Works When Setting is OFF**
   - Auto-approval validation only runs when `registration_require_admin_approval = false`
   - This allows admins to temporarily disable auto-approval during high-risk periods

3. **Validation Reasons are Clear**
   - When pending due to setting: "Admin approval required by system setting"
   - When pending due to validation: Specific reason (e.g., "Invalid email format", "Duplicate phone number")

### Example Scenarios

**Scenario 1: Admin Approval Required (Default)**
```
Setting: registration_require_admin_approval = true
Registration: John Doe, valid email, valid phone
Result: status = 'pending'
Reason: "Admin approval required by system setting"
Admin Action: Must manually approve via Portal Settings → Users tab
```

**Scenario 2: Auto-Approval Enabled, Valid Registration**
```
Setting: registration_require_admin_approval = false
Registration: Jane Smith, valid email, valid phone, all checks pass
Result: status = 'approved'
Reason: "All validation checks passed"
User: Can log in immediately after email verification
Admin: Notified of auto-approval
```

**Scenario 3: Auto-Approval Enabled, Invalid Registration**
```
Setting: registration_require_admin_approval = false
Registration: Bob Jones, duplicate email
Result: status = 'pending'
Reason: "Duplicate email address"
Admin: Must manually review and decide
```

---

## Notification Settings Integration

### Settings That Control Notifications

| Setting Key | Type | Default | Description |
|------------|------|---------|-------------|
| `notifications_email_enabled` | boolean | true | Enable email notifications globally |
| `notifications_sms_enabled` | boolean | true | Enable SMS notifications |
| `notifications_whatsapp_enabled` | boolean | false | Enable WhatsApp notifications |
| `notifications_quiet_hours_start` | string | '22:00' | Start of quiet hours (no notifications) |
| `notifications_quiet_hours_end` | string | '07:00' | End of quiet hours |
| `notifications_new_hike_enabled` | boolean | true | Send notifications for new hikes |
| `notifications_hike_update_enabled` | boolean | true | Send notifications for hike updates |
| `notifications_payment_reminder_enabled` | boolean | true | Send payment reminders |
| `notifications_hike_reminder_hours` | number | 24 | Hours before hike to send reminder |

### Integration Points

**1. Email Sending (notificationService.js)**
```javascript
const { getSetting, isQuietHours } = require('./settingsService');

async function sendEmail(to, subject, html) {
  // Check if email notifications are enabled
  const enabled = await getSetting('notifications_email_enabled', true);
  if (!enabled) {
    console.log('Email notifications disabled globally');
    return;
  }

  // Check quiet hours
  if (await isQuietHours()) {
    console.log('Within quiet hours, queuing email for later');
    // Queue for later or skip non-urgent emails
    return;
  }

  // Send email...
}
```

**2. Hike Reminders (scheduled job)**
```javascript
const { getSetting } = require('./settingsService');

async function sendHikeReminders() {
  const enabled = await getSetting('notifications_hike_update_enabled', true);
  if (!enabled) return;

  const reminderHours = await getSetting('notifications_hike_reminder_hours', 24);

  // Find hikes starting in `reminderHours` hours
  // Send reminders
}
```

### Quiet Hours Logic

```javascript
async function isQuietHours() {
  const settings = await getNotificationSettings();
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  const [startHour, startMin] = settings.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = settings.quiet_hours_end.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }

  return currentTime >= startTime && currentTime < endTime;
}
```

---

## Payment Settings Integration

### Settings That Control Payments

| Setting Key | Type | Default | Description |
|------------|------|---------|-------------|
| `payment_cash_enabled` | boolean | true | Accept cash payments |
| `payment_bank_transfer_enabled` | boolean | true | Accept bank transfers |
| `payment_online_enabled` | boolean | false | Accept online payments |
| `payment_default_hike_cost` | number | 150 | Default cost per hike (ZAR) |
| `payment_deadline_days` | number | 7 | Payment deadline (days before hike) |
| `payment_cancellation_policy` | string | 'partial' | Refund policy: full/partial/none |
| `payment_bank_name` | string | 'Standard Bank' | Bank name for transfers |
| `payment_account_holder` | string | 'The Narrow Trail' | Account holder name |
| `payment_account_number` | string | '' | Bank account number |
| `payment_branch_code` | string | '' | Bank branch code |

### Integration Points

**1. Payment Deadline Calculation**
```javascript
const { getPaymentSettings } = require('./settingsService');

async function calculatePaymentDeadline(hikeDate) {
  const settings = await getPaymentSettings();
  const deadline = new Date(hikeDate);
  deadline.setDate(deadline.getDate() - settings.deadline_days);
  return deadline;
}
```

**2. Refund Calculation**
```javascript
async function calculateRefund(amount, cancellationDate, hikeDate) {
  const settings = await getPaymentSettings();

  switch (settings.cancellation_policy) {
    case 'full':
      return amount; // 100% refund
    case 'partial':
      // Calculate based on how far in advance they cancelled
      const daysBeforeHike = (hikeDate - cancellationDate) / (1000 * 60 * 60 * 24);
      if (daysBeforeHike > 7) return amount * 0.80; // 80% refund
      if (daysBeforeHike > 3) return amount * 0.50; // 50% refund
      return amount * 0.25; // 25% refund
    case 'none':
      return 0; // No refund
    default:
      return 0;
  }
}
```

**3. Banking Details Display**
```javascript
async function getBankingDetails() {
  const settings = await getPaymentSettings();

  return {
    bankName: settings.bank_name,
    accountHolder: settings.account_holder,
    accountNumber: settings.account_number,
    branchCode: settings.branch_code,
    reference: `HIKE-${hikeId}-${userName}`
  };
}
```

---

## Hike Management Settings

### Settings That Control Hikes

| Setting Key | Type | Default | Description |
|------------|------|---------|-------------|
| `hike_default_capacity` | number | 20 | Default maximum participants |
| `hike_default_difficulty` | string | 'moderate' | Default difficulty level |
| `hike_waitlist_enabled` | boolean | true | Enable waitlist when full |
| `hike_registration_deadline_hours` | number | 24 | Registration deadline (hours before) |
| `hike_cancellation_deadline_hours` | number | 48 | Cancellation deadline (hours before) |
| `hike_auto_mark_no_shows` | boolean | true | Auto-mark no-shows after hike |
| `hike_no_show_threshold` | number | 3 | No-shows before suspension |

### Integration Points

**1. Hike Creation Defaults**
```javascript
const { getHikeSettings } = require('./settingsService');

async function createHike(hikeData) {
  const settings = await getHikeSettings();

  // Apply defaults if not specified
  const hike = {
    ...hikeData,
    capacity: hikeData.capacity || settings.default_capacity,
    difficulty: hikeData.difficulty || settings.default_difficulty,
    waitlist_enabled: hikeData.waitlist_enabled ?? settings.waitlist_enabled
  };

  // Insert hike...
}
```

**2. Registration Deadline Check**
```javascript
async function canRegisterForHike(hikeDate) {
  const settings = await getHikeSettings();
  const deadline = new Date(hikeDate);
  deadline.setHours(deadline.getHours() - settings.registration_deadline_hours);

  return new Date() < deadline;
}
```

**3. No-Show Tracking**
```javascript
async function checkNoShowSuspension(userId) {
  const settings = await getHikeSettings();

  const result = await pool.query(
    'SELECT COUNT(*) as no_shows FROM registrations WHERE user_id = $1 AND attendance_status = $2',
    [userId, 'no-show']
  );

  if (result.rows[0].no_shows >= settings.no_show_threshold) {
    // Suspend user
    await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2',
      ['suspended', userId]
    );
  }
}
```

---

## How to Add New Settings

### Step 1: Add to Database Migration

```sql
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('new_feature_enabled', 'true', 'boolean', 'Enable new feature', 'feature', false),
('new_feature_threshold', '100', 'number', 'Threshold for new feature', 'feature', false)
ON CONFLICT (setting_key) DO NOTHING;
```

### Step 2: Add to Settings Service (Optional)

If creating a new category, add a helper function:

```javascript
async function getFeatureSettings() {
  const settings = await getAllSettings();
  return {
    enabled: settings['new_feature_enabled'] ?? true,
    threshold: settings['new_feature_threshold'] ?? 100
  };
}

module.exports = {
  // ... existing exports
  getFeatureSettings
};
```

### Step 3: Add to Frontend UI

In `frontend/src/components/admin/GeneralSettings.js`:

```javascript
{/* NEW FEATURE SETTINGS */}
<SettingSection id="feature" icon={Zap} title="Feature Settings" color="#ffc107">
  <SettingToggle
    label="Enable New Feature"
    value={getSetting('new_feature_enabled', true)}
    onChange={(val) => updateSetting('new_feature_enabled', val)}
  />
  <SettingNumber
    label="Feature Threshold"
    value={getSetting('new_feature_threshold', 100)}
    onChange={(val) => updateSetting('new_feature_threshold', val)}
    min={1}
    max={1000}
    unit="items"
  />
</SettingSection>
```

### Step 4: Use in Backend Code

```javascript
const { getSetting } = require('../services/settingsService');

async function doSomething() {
  const enabled = await getSetting('new_feature_enabled', true);
  if (!enabled) {
    return { error: 'Feature disabled' };
  }

  const threshold = await getSetting('new_feature_threshold', 100);
  // Use threshold...
}
```

---

## Testing Settings

### Manual Testing Checklist

**1. Test Admin Approval Setting**
```
☐ Set registration_require_admin_approval = true
☐ Register new user with perfect details
☐ Verify status = 'pending'
☐ Verify admin receives "Admin approval required by system setting" notification
☐ Set registration_require_admin_approval = false
☐ Register new user with perfect details
☐ Verify status = 'approved'
☐ Verify admin receives "Auto-approved" notification
```

**2. Test Notification Settings**
```
☐ Set notifications_email_enabled = false
☐ Trigger event that should send email
☐ Verify email is NOT sent
☐ Set notifications_quiet_hours_start = current hour
☐ Trigger notification
☐ Verify notification is queued or skipped
```

**3. Test Payment Settings**
```
☐ Change payment_default_hike_cost to 200
☐ Create new hike without specifying cost
☐ Verify hike cost is 200 ZAR
☐ Change payment_cancellation_policy to 'none'
☐ Cancel registration
☐ Verify no refund offered
```

**4. Test Hike Settings**
```
☐ Change hike_default_capacity to 15
☐ Create new hike without specifying capacity
☐ Verify capacity is 15
☐ Change hike_registration_deadline_hours to 48
☐ Try to register 36 hours before hike
☐ Verify registration is accepted
☐ Try to register 12 hours before hike
☐ Verify registration is rejected
```

### Automated Testing

```javascript
// Test registration with admin approval enabled
describe('Registration with admin approval', () => {
  beforeEach(async () => {
    await pool.query(
      "UPDATE system_settings SET setting_value = 'true' WHERE setting_key = 'registration_require_admin_approval'"
    );
    await clearCache();
  });

  it('should create pending user when admin approval required', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '0821234567'
      });

    expect(response.status).toBe(201);
    expect(response.body.autoApproved).toBe(false);

    const user = await pool.query('SELECT status FROM users WHERE email = $1', ['test@example.com']);
    expect(user.rows[0].status).toBe('pending');
  });
});
```

---

## Settings Caching Strategy

### How Caching Works

1. **First Request**: Fetch all settings from database, parse types, store in memory
2. **Subsequent Requests**: Return cached settings (no database query)
3. **Cache Expiry**: After 5 minutes, cache expires and next request refreshes
4. **Manual Refresh**: When settings are updated via UI, cache is cleared

### Cache Invalidation

```javascript
// When updating settings via admin UI
await api.updateSettingsBatch(updates, token);
// Backend automatically clears cache after update

// When updating programmatically
await updateSetting('key', 'value', userId);
// Cache cleared automatically

// Manual cache clear
clearCache();
```

### Benefits

- ✅ Reduces database load (settings accessed frequently)
- ✅ Fast response times (in-memory lookups)
- ✅ Automatic type conversion (no parsing overhead)
- ✅ Graceful degradation (returns empty object on error)

---

## Best Practices

### 1. Always Provide Defaults

```javascript
// Good
const enabled = await getSetting('feature_enabled', true);

// Bad - could be undefined
const enabled = await getSetting('feature_enabled');
```

### 2. Use Category Helpers for Related Settings

```javascript
// Good - single database query, cached
const regSettings = await getRegistrationSettings();
if (regSettings.require_admin_approval) { ... }

// Less efficient - multiple calls
const requireApproval = await getSetting('registration_require_admin_approval');
const sendWelcome = await getSetting('registration_send_welcome_email');
```

### 3. Document Setting Dependencies

```javascript
// Good - clear comment
// Note: Only sends welcome email if registration_send_welcome_email = true
if (regSettings.send_welcome_email) {
  await sendEmail(...);
}
```

### 4. Validate Setting Values

```javascript
// Good - validate before using
const capacity = await getSetting('hike_default_capacity', 20);
if (capacity < 1 || capacity > 100) {
  console.error('Invalid capacity setting, using default');
  capacity = 20;
}
```

### 5. Log Setting-Based Decisions

```javascript
// Good - helps with debugging
if (regSettings.require_admin_approval) {
  console.log(`Registration for ${email}: Admin approval required (setting enabled)`);
  initialStatus = 'pending';
} else {
  console.log(`Registration for ${email}: Running auto-approval validation`);
  validation = await validateRegistrationForAutoApproval(name, email, phone);
}
```

---

## Troubleshooting

### Problem: Setting Change Not Taking Effect

**Possible Causes:**
1. Cache not cleared after update
2. Old value still in 5-minute cache window
3. Code not actually checking the setting

**Solutions:**
```bash
# Force cache clear via API (if implemented)
curl -X POST https://backend-url/api/admin/clear-settings-cache

# Or wait 5 minutes for cache to expire naturally

# Or restart backend service
gcloud run services update backend --region=europe-west1
```

### Problem: Registration Still Auto-Approving Despite Setting

**Check:**
1. Verify setting in database:
```sql
SELECT setting_key, setting_value FROM system_settings
WHERE setting_key = 'registration_require_admin_approval';
```

2. Check backend logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND textPayload:registration" --limit 50
```

3. Verify backend is using latest code with settings service

### Problem: Setting Not Showing in UI

**Check:**
1. Database migration executed?
```sql
SELECT COUNT(*) FROM system_settings WHERE category = 'your_category';
```

2. Frontend pulling all settings?
```javascript
// In browser console
console.log(settings);
```

3. Setting key matches exactly between frontend and backend?

---

## Migration Checklist

### Migrating Existing Hardcoded Values to Settings

- [ ] Identify hardcoded value
- [ ] Add setting to database migration
- [ ] Run migration on all environments
- [ ] Update code to use `getSetting()`
- [ ] Test with default value
- [ ] Test with changed value
- [ ] Remove hardcoded constant
- [ ] Document in this guide

---

## Summary

### Key Takeaways

1. **Settings Service is Central**: Always use `settingsService.js` to access settings
2. **Admin Approval Overrides Auto-Approval**: The `registration_require_admin_approval` setting is the master switch
3. **Caching is Automatic**: 5-minute TTL, cleared on updates
4. **Defaults are Critical**: Always provide sensible defaults
5. **Type Conversion is Handled**: Service automatically parses boolean/number/json
6. **Category Helpers Exist**: Use `getRegistrationSettings()`, `getNotificationSettings()`, etc.
7. **Test Your Settings**: Manual and automated tests ensure settings work as expected

### Next Steps

1. [ ] Run database migration 021 to add all settings
2. [ ] Deploy backend with settings service
3. [ ] Deploy frontend with all 12 categories
4. [ ] Test registration approval flow
5. [ ] Migrate remaining hardcoded values to settings
6. [ ] Monitor logs for setting-based decisions

---

**Document Version:** 1.0
**Last Updated:** October 17, 2025
**Author:** Claude Code Assistant
