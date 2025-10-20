# Portal Settings - Additional Configuration Options

## Overview
This document outlines additional settings that could be added to the Portal Settings page to make the hiking portal more configurable without requiring code changes or redeployment.

---

## 🎯 Recommended Settings Categories

### 1. 🔔 Notification Settings

**Purpose:** Configure notification behavior, channels, and templates

#### Settings to Add:
```javascript
Notification Preferences
├── Email Settings
│   ├── Enable email notifications (boolean)
│   ├── Default sender name (string)
│   ├── Reply-to email address (string)
│   ├── Email rate limiting (number - max emails per hour)
│   └── Batch notification delay (number - minutes)
│
├── SMS/WhatsApp Settings
│   ├── Enable SMS notifications (boolean)
│   ├── Enable WhatsApp notifications (boolean)
│   ├── SMS rate limiting (number - max SMS per day)
│   └── WhatsApp business account ID (string)
│
├── Notification Types (enable/disable per type)
│   ├── New hike announcements (boolean)
│   ├── Hike updates/changes (boolean)
│   ├── Payment reminders (boolean)
│   ├── Weather alerts (boolean)
│   ├── Carpool updates (boolean)
│   └── Comment notifications (boolean)
│
└── Notification Timing
    ├── Quiet hours start (time - e.g., 22:00)
    ├── Quiet hours end (time - e.g., 07:00)
    ├── Lead time for hike reminders (number - hours before hike)
    └── Payment reminder schedule (json - days before due date)
```

**Database Migration:**
```sql
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
-- Email
('notifications_email_enabled', 'true', 'boolean', 'Enable email notifications globally', 'notifications', false),
('notifications_email_sender_name', 'The Narrow Trail', 'string', 'Default sender name for emails', 'notifications', false),
('notifications_email_rate_limit', '100', 'number', 'Maximum emails per hour (rate limiting)', 'notifications', false),

-- SMS/WhatsApp
('notifications_sms_enabled', 'true', 'boolean', 'Enable SMS notifications', 'notifications', false),
('notifications_whatsapp_enabled', 'false', 'boolean', 'Enable WhatsApp notifications', 'notifications', false),
('notifications_sms_rate_limit', '50', 'number', 'Maximum SMS per day', 'notifications', false),

-- Timing
('notifications_quiet_hours_start', '22:00', 'string', 'Start of quiet hours (no notifications)', 'notifications', false),
('notifications_quiet_hours_end', '07:00', 'string', 'End of quiet hours', 'notifications', false),
('notifications_hike_reminder_hours', '24', 'number', 'Hours before hike to send reminder', 'notifications', false);
```

---

### 2. 💰 Payment & Financial Settings

**Purpose:** Configure payment-related behavior and policies

#### Settings to Add:
```javascript
Payment Configuration
├── Payment Methods
│   ├── Enable cash payments (boolean)
│   ├── Enable bank transfer (boolean)
│   ├── Enable online payments (boolean - future)
│   └── Preferred payment method (dropdown)
│
├── Payment Policies
│   ├── Default hike cost (number - ZAR)
│   ├── Payment deadline (number - days before hike)
│   ├── Late payment penalty (number - percentage)
│   ├── Cancellation refund policy (dropdown: full/partial/none)
│   ├── Cancellation deadline (number - days before hike)
│   └── Partial refund percentage (number - if applicable)
│
├── Banking Details
│   ├── Bank name (string)
│   ├── Account holder (string)
│   ├── Account number (string)
│   ├── Branch code (string)
│   └── Reference format (string - e.g., "HIKE-{ID}-{NAME}")
│
└── Reminders
    ├── Enable payment reminders (boolean)
    ├── First reminder (number - days before deadline)
    ├── Second reminder (number - days before deadline)
    └── Final reminder (number - days before deadline)
```

---

### 3. 🥾 Hike Management Settings

**Purpose:** Configure hike-related defaults and policies

#### Settings to Add:
```javascript
Hike Configuration
├── Default Settings
│   ├── Default hike capacity (number)
│   ├── Default difficulty level (dropdown: easy/moderate/hard/extreme)
│   ├── Auto-publish new hikes (boolean)
│   ├── Require approval for registrations (boolean)
│   └── Waitlist enabled by default (boolean)
│
├── Registration Policies
│   ├── Registration deadline (number - hours before hike)
│   ├── Cancellation deadline (number - hours before hike)
│   ├── Max registrations per user (number - per month)
│   ├── Require emergency contact (boolean)
│   └── Require medical info (boolean)
│
├── Attendance Tracking
│   ├── Auto-mark no-shows (boolean)
│   ├── No-show threshold (number - strikes before suspension)
│   ├── Attendance points system (boolean)
│   └── Minimum attendance for priority (number - percentage)
│
└── Content Requirements
    ├── Require packing list (boolean)
    ├── Require weather forecast (boolean)
    ├── Require route map (boolean)
    └── Minimum description length (number - characters)
```

---

### 4. 📸 Media & Content Settings

**Purpose:** Configure photo uploads, storage, and content policies

#### Settings to Add:
```javascript
Media Configuration
├── Photo Upload Settings
│   ├── Enable photo uploads (boolean)
│   ├── Max file size (number - MB)
│   ├── Max photos per hike (number)
│   ├── Max photos per user (number - per hike)
│   ├── Allowed formats (multi-select: jpg, png, heic)
│   └── Auto-compress images (boolean)
│
├── Photo Moderation
│   ├── Require photo approval (boolean)
│   ├── Auto-moderate with AI (boolean - future)
│   └── Allow user reporting (boolean)
│
├── Storage Management
│   ├── Photo retention period (number - days, 0 = unlimited)
│   ├── Auto-delete after hike (number - days)
│   └── Compress old photos (number - days old)
│
└── Content Policies
    ├── Enable comments (boolean)
    ├── Require moderation (boolean)
    ├── Profanity filter enabled (boolean)
    └── Max comment length (number - characters)
```

---

### 5. 🔒 Privacy & Security Settings

**Purpose:** Configure data protection and security policies

#### Settings to Add:
```javascript
Privacy & Security
├── Data Retention
│   ├── Inactive user threshold (number - months)
│   ├── Auto-delete inactive users (boolean)
│   ├── Log retention period (number - days)
│   ├── Activity log retention (number - days)
│   └── Payment record retention (number - years)
│
├── POPIA Compliance
│   ├── Require consent on signup (boolean)
│   ├── Consent expiry period (number - months)
│   ├── Data export format (dropdown: json/csv/pdf)
│   └── Deletion grace period (number - days)
│
├── Security Policies
│   ├── Password minimum length (number)
│   ├── Require special characters (boolean)
│   ├── Password expiry (number - days, 0 = never)
│   ├── Max login attempts (number)
│   ├── Account lockout duration (number - minutes)
│   └── Session timeout (number - minutes)
│
└── Privacy Settings
    ├── Show user profiles publicly (boolean)
    ├── Show attendance lists (dropdown: public/members/admins)
    ├── Allow profile search (boolean)
    └── Share data with third parties (boolean)
```

---

### 6. 🎨 Branding & Customization

**Purpose:** Configure portal appearance and branding

#### Settings to Add:
```javascript
Branding & UI
├── Portal Information
│   ├── Portal name (string)
│   ├── Portal tagline (string)
│   ├── About text (textarea)
│   ├── Contact email (email)
│   ├── Contact phone (string)
│   └── Social media links (json)
│
├── Visual Settings
│   ├── Primary color (color picker - hex)
│   ├── Secondary color (color picker - hex)
│   ├── Accent color (color picker - hex)
│   ├── Default theme (dropdown: light/dark/auto)
│   ├── Logo URL (string/upload)
│   └── Favicon URL (string/upload)
│
├── Landing Page
│   ├── Hero image URL (string/upload)
│   ├── Hero text (textarea)
│   ├── Show upcoming hikes (boolean)
│   ├── Show statistics (boolean)
│   └── Featured hike ID (number - nullable)
│
└── Footer
    ├── Footer text (textarea)
    ├── Show social links (boolean)
    ├── Show contact info (boolean)
    └── Copyright text (string)
```

---

### 7. 🚗 Carpool & Transport Settings

**Purpose:** Configure carpool coordination features

#### Settings to Add:
```javascript
Carpool Configuration
├── Carpool Features
│   ├── Enable carpooling (boolean)
│   ├── Auto-match by location (boolean)
│   ├── Suggest fuel cost split (boolean)
│   └── Max passengers per car (number)
│
├── Driver Requirements
│   ├── Require driver license info (boolean)
│   ├── Minimum driver age (number)
│   ├── Require vehicle info (boolean)
│   └── Verify insurance (boolean)
│
└── Cost Sharing
    ├── Fuel cost calculation method (dropdown: equal/distance-based)
    ├── Average fuel price (number - ZAR per liter)
    ├── Average consumption (number - liters per 100km)
    └── Include toll fees (boolean)
```

---

### 8. ☁️ Weather & Environmental Settings

**Purpose:** Configure weather data and environmental alerts (Already exists, can be enhanced)

#### Additional Settings:
```javascript
Weather Configuration (Enhanced)
├── Existing Settings
│   ├── Primary API provider
│   ├── Fallback API provider
│   ├── Cache duration
│   └── API enabled
│
├── New Settings
│   ├── Show extended forecast (boolean - 7 days)
│   ├── Weather alert threshold (dropdown: advisory/watch/warning)
│   ├── Auto-cancel on severe weather (boolean)
│   ├── Temperature display (dropdown: celsius/fahrenheit)
│   ├── Wind speed unit (dropdown: km/h/m/s/mph)
│   └── Show UV index (boolean)
│
└── Environmental Data
    ├── Show air quality (boolean)
    ├── Show pollen count (boolean)
    ├── Show sunset/sunrise times (boolean)
    └── Moon phase display (boolean)
```

---

### 9. 📧 Email Templates & Communication

**Purpose:** Customize email and notification templates

#### Settings to Add:
```javascript
Email Templates
├── Template Management
│   ├── Welcome email template (rich text editor)
│   ├── Hike registration confirmation (rich text editor)
│   ├── Payment reminder template (rich text editor)
│   ├── Hike reminder template (rich text editor)
│   ├── Cancellation notification (rich text editor)
│   └── Password reset template (rich text editor)
│
├── Template Variables
│   ├── Available: {user_name}, {hike_name}, {date}, {location}, etc.
│   ├── Preview with sample data (button)
│   └── Reset to default (button per template)
│
└── Email Styling
    ├── Email header color (color picker)
    ├── Email footer text (textarea)
    ├── Include logo in emails (boolean)
    └── Email signature (textarea)
```

---

### 10. 📊 Analytics & Reporting Settings

**Purpose:** Configure data tracking and reporting

#### Settings to Add:
```javascript
Analytics Configuration
├── Data Collection
│   ├── Enable Google Analytics (boolean)
│   ├── Google Analytics ID (string)
│   ├── Track page views (boolean)
│   ├── Track user actions (boolean)
│   └── Anonymize IP addresses (boolean)
│
├── Reporting
│   ├── Weekly report recipients (multi-email)
│   ├── Monthly report recipients (multi-email)
│   ├── Include financial data (boolean)
│   ├── Include user statistics (boolean)
│   └── Report delivery day (dropdown: Monday-Sunday)
│
└── Public Statistics
    ├── Show total hikers on landing page (boolean)
    ├── Show total hikes completed (boolean)
    ├── Show total distance hiked (boolean)
    └── Show member growth chart (boolean)
```

---

### 11. 🔧 System & Maintenance Settings

**Purpose:** Configure system behavior and maintenance

#### Settings to Add:
```javascript
System Configuration
├── Performance
│   ├── Page size for lists (number - items per page)
│   ├── Cache enabled (boolean)
│   ├── Cache duration (number - seconds)
│   ├── Image lazy loading (boolean)
│   └── Compression enabled (boolean)
│
├── Maintenance Mode
│   ├── Maintenance mode enabled (boolean)
│   ├── Maintenance message (textarea)
│   ├── Allowed admin IPs (multi-text)
│   └── Estimated completion time (datetime)
│
├── Backup & Recovery
│   ├── Auto-backup enabled (boolean)
│   ├── Backup frequency (dropdown: daily/weekly/monthly)
│   ├── Backup retention (number - days)
│   └── Backup notification email (email)
│
└── Error Handling
    ├── Error notification email (email)
    ├── Log level (dropdown: error/warn/info/debug)
    ├── Sentry DSN (string - error tracking)
    └── Show detailed errors (boolean - dev mode only)
```

---

### 12. 👥 User Registration & Onboarding

**Purpose:** Configure user signup and onboarding experience

#### Settings to Add:
```javascript
Registration Settings
├── Registration Policy
│   ├── Allow self-registration (boolean)
│   ├── Require admin approval (boolean)
│   ├── Require email verification (boolean)
│   ├── Require phone verification (boolean)
│   └── Auto-approve trusted domains (multi-text - email domains)
│
├── Required Fields
│   ├── Phone number required (boolean)
│   ├── Emergency contact required (boolean)
│   ├── Medical conditions required (boolean)
│   ├── Profile photo required (boolean)
│   └── Bio/introduction required (boolean)
│
├── Welcome Experience
│   ├── Send welcome email (boolean)
│   ├── Show onboarding tour (boolean)
│   ├── Assign default role (dropdown: hiker/guide/etc)
│   └── Auto-subscribe to newsletter (boolean)
│
└── Verification
    ├── Email verification expiry (number - hours)
    ├── Resend verification limit (number - per day)
    ├── Phone verification method (dropdown: sms/call/whatsapp)
    └── ID verification required (boolean - for guides)
```

---

## 🎨 UI Design Recommendations

### New Tab: "General Settings"

Add a 5th tab to Portal Settings for general/system-wide configuration:

```
Portal Settings
├── 👥 Users
├── 🛡️ Roles & Permissions  
├── 📄 Content
├── ☁️ Weather
└── ⚙️ General Settings (NEW)
    ├── Notifications
    ├── Payments
    ├── Hikes
    ├── Media
    ├── Privacy & Security
    ├── Branding
    ├── Carpool
    ├── Analytics
    ├── System
    └── Registration
```

### Settings Component Structure

```javascript
<GeneralSettings>
  <Accordion>
    <AccordionSection title="🔔 Notification Settings">
      <SettingGroup category="notifications" />
    </AccordionSection>
    
    <AccordionSection title="💰 Payment Settings">
      <SettingGroup category="payments" />
    </AccordionSection>
    
    <AccordionSection title="🥾 Hike Settings">
      <SettingGroup category="hikes" />
    </AccordionSection>
    
    // ... more sections
  </Accordion>
</GeneralSettings>
```

---

## 📋 Implementation Priority

### Phase 1: High Impact (Implement First)
1. ✅ **Weather Settings** (Already implemented)
2. 🔔 **Notification Settings** - Most requested feature
3. 💰 **Payment Settings** - Critical for operations
4. 🥾 **Hike Management Settings** - Core functionality

### Phase 2: User Experience
5. 🎨 **Branding & Customization** - Personalization
6. 👥 **Registration Settings** - Streamline onboarding
7. 📧 **Email Templates** - Professional communication
8. 🚗 **Carpool Settings** - Community feature

### Phase 3: Advanced Features
9. 📸 **Media Settings** - Content management
10. 🔒 **Privacy & Security** - Compliance
11. 📊 **Analytics Settings** - Insights
12. 🔧 **System Settings** - Maintenance

---

## 🚀 Benefits of Configurable Settings

### For Administrators
- ✅ **No Code Changes**: Adjust behavior without developer involvement
- ✅ **Instant Updates**: Changes take effect immediately
- ✅ **Risk Reduction**: No need to redeploy application
- ✅ **Experimentation**: Test different configurations easily
- ✅ **Compliance**: Quickly adapt to regulatory changes

### For Users
- ✅ **Customization**: Portal adapts to group preferences
- ✅ **Better UX**: Tailored experience based on settings
- ✅ **Transparency**: Clear policies and expectations
- ✅ **Control**: More user-controlled preferences

### For Developers
- ✅ **Flexibility**: Feature flags and toggles
- ✅ **Maintainability**: Settings separate from code
- ✅ **Scalability**: Easy to add new settings
- ✅ **Testability**: Test different configurations

---

## 💡 Additional Enhancements

### 1. Settings UI Components
```javascript
// Reusable setting input components
<SettingToggle />        // Boolean on/off
<SettingNumber />        // Number input with validation
<SettingText />          // Text input
<SettingTextarea />      // Multi-line text
<SettingColor />         // Color picker
<SettingSelect />        // Dropdown
<SettingMultiSelect />   // Multiple selection
<SettingTime />          // Time picker
<SettingEmail />         // Email input with validation
<SettingJson />          // JSON editor for complex data
```

### 2. Setting Features
- 🔍 **Search/Filter**: Search settings by name or category
- 📝 **Change History**: Track who changed what and when
- ↩️ **Rollback**: Revert to previous values
- 🧪 **Test Mode**: Test settings without affecting production
- 📥 **Import/Export**: Backup/restore settings configuration
- 🔔 **Change Notifications**: Notify admins when critical settings change

### 3. Validation & Safety
- ✅ **Input Validation**: Ensure values are within acceptable ranges
- ⚠️ **Warnings**: Alert when changing critical settings
- 🔒 **Permission Checks**: Restrict certain settings to super-admins
- 📊 **Impact Preview**: Show what will be affected by changes
- 🔄 **Gradual Rollout**: A/B test setting changes

---

## 📚 Related Documentation

- **Weather Settings Implementation**: `WEATHER_API_CACHING.md`
- **Permission System**: `backend/migrations/017_create_permission_system.sql`
- **System Settings Schema**: `backend/migrations/020_add_system_settings.sql`
- **Settings Controller**: `backend/controllers/settingsController.js`

---

## Status
📝 **Proposal Document**

This document outlines potential enhancements. Implementation should be prioritized based on user feedback and business needs.

**Next Steps:**
1. Review with stakeholders
2. Prioritize features (Phase 1, 2, 3)
3. Create database migrations for chosen settings
4. Implement UI components
5. Add backend validation
6. Update documentation
