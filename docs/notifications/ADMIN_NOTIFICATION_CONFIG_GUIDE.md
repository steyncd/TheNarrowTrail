# Admin User Notification Configuration - User Guide

## Overview
Administrators can now manage granular notification preferences for all users through the User Management interface. This allows fine-tuned control over which notifications each user receives via Email and WhatsApp.

## How to Access

### Step 1: Navigate to User Management
1. Log in as an administrator
2. Click on the **Admin** menu in the navigation bar
3. Select **User Management**

### Step 2: Open Notification Preferences
For any user in the list, you have two options:

**Option A: Bell Icon (Quick Access)**
- Locate the user in the table
- In the "Actions" column, click the **🔔 (bell)** icon
- The notification preferences modal will open

**Option B: More Actions Menu**
- Click the **⋮ (three dots)** menu in the Actions column
- Select **"Notification Preferences"** from the dropdown
- The notification preferences modal will open

## Notification Configuration Interface

### Modal Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Notification Preferences for [User Name]               ✕   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📧 GLOBAL NOTIFICATION SETTINGS                            │
│  ├─ [✓] Enable All Email Notifications                     │
│  └─ [✓] Enable All WhatsApp Notifications                  │
│                                                             │
│  👤 USER NOTIFICATIONS (9 types)                            │
│  ├─ Email Verification                                      │
│  │   Verification email sent when user registers            │
│  │   📧 [✓] Email                                           │
│  │                                                          │
│  ├─ Account Approved                                        │
│  │   Welcome message sent when admin approves registration  │
│  │   📧 [✓] Email    💬 [✓] WhatsApp                        │
│  │                                                          │
│  ├─ Account Rejected                                        │
│  │   Notification sent when registration is rejected        │
│  │   📧 [✓] Email                                           │
│  │                                                          │
│  ├─ Password Reset Request                                  │
│  ├─ Password Reset Confirmed                                │
│  ├─ Admin Password Reset                                    │
│  ├─ Admin Promotion                                         │
│  ├─ New Hike Added                                          │
│  └─ Hike Announcement (to attendees)                  ⭐NEW  │
│                                                             │
│  👨‍💼 ADMIN NOTIFICATIONS (5 types)                           │
│  ├─ New Registration                                        │
│  │   Alert when new user registers (manual approval)        │
│  │   📧 [✓] Email    💬 [✓] WhatsApp                        │
│  │                                                          │
│  ├─ Hike Interest                                           │
│  ├─ Attendance Confirmed                                    │
│  ├─ New Feedback                                            │
│  └─ New Suggestion                                          │
│                                                             │
│                                      [Cancel]  [Save] 💾    │
└─────────────────────────────────────────────────────────────┘
```

## All 14 Notification Types

### User Notifications (Sent to Regular Users)

| # | Type | Description | Email | WhatsApp |
|---|------|-------------|-------|----------|
| 1 | Email Verification | Verification email when user registers | ✅ | ❌ |
| 2 | Account Approved | Welcome message after admin approval | ✅ | ✅ |
| 3 | Account Rejected | Notification when registration rejected | ✅ | ❌ |
| 4 | Password Reset Request | Password reset link | ✅ | ❌ |
| 5 | Password Reset Confirmed | Confirmation after password change | ✅ | ❌ |
| 6 | Admin Password Reset | Admin-initiated password reset | ✅ | ❌ |
| 7 | Admin Promotion | Notification when promoted to admin | ✅ | ❌ |
| 8 | New Hike Added | Announcement of new hikes | ✅ | ✅ |
| 9 | **Hike Announcement** | Custom messages to attendees | ✅ | ❌ |

### Admin Notifications (Sent to Administrators)

| # | Type | Description | Email | WhatsApp |
|---|------|-------------|-------|----------|
| 10 | New Registration | Alert when user registers | ✅ | ✅ |
| 11 | Hike Interest | User expresses interest in hike | ✅ | ❌ |
| 12 | Attendance Confirmed | User confirms hike attendance | ✅ | ❌ |
| 13 | New Feedback | User submits feedback | ✅ | ❌ |
| 14 | New Suggestion | User submits hike suggestion | ✅ | ❌ |

## Usage Examples

### Example 1: Disable Marketing Emails for a User
**Scenario:** User only wants critical notifications (verification, password resets) via email

**Steps:**
1. Open notification preferences for the user
2. Keep Email Verification enabled
3. Keep Password Reset Request enabled
4. Keep Password Reset Confirmed enabled
5. Disable: Account Approved, New Hike Added, Hike Announcement
6. Click Save

### Example 2: WhatsApp-Only Notifications
**Scenario:** User prefers WhatsApp for all non-critical notifications

**Steps:**
1. Open notification preferences
2. Enable Global WhatsApp toggle
3. For Account Approved: Enable WhatsApp, Disable Email
4. For New Hike Added: Enable WhatsApp, Disable Email
5. Keep Email enabled for: Email Verification, Password Resets
6. Click Save

### Example 3: Admin Wants Only Critical Alerts
**Scenario:** Admin only wants to know about new registrations and critical issues

**Steps:**
1. Open admin user's notification preferences
2. In Admin Notifications section:
   - Enable: New Registration (Email + WhatsApp)
   - Enable: New Feedback (Email only)
   - Disable: Hike Interest
   - Disable: Attendance Confirmed
   - Disable: New Suggestion
3. Click Save

### Example 4: Silent User (No Notifications)
**Scenario:** User doesn't want any notifications

**Steps:**
1. Open notification preferences
2. Disable "Enable All Email Notifications" toggle
3. Disable "Enable All WhatsApp Notifications" toggle
4. Click Save
5. **Note:** Critical notifications (email verification) may still be sent

## Features

### Global Toggles
- **Enable All Email**: Master switch for all email notifications
- **Enable All WhatsApp**: Master switch for all WhatsApp notifications
- When disabled, individual notification preferences are overridden

### Channel-Specific Controls
- Each notification type shows available channels
- Email icon (📧) for email channel
- WhatsApp icon (💬) for WhatsApp channel
- Toggle each channel independently

### Visual Indicators
- ✅ Green checkmark when enabled
- ❌ Red X when disabled
- Organized by category (User vs Admin)
- Descriptive text for each notification type

### Responsive Design
- Works on desktop, tablet, and mobile
- Scrollable modal for long lists
- Touch-friendly toggle switches

## Best Practices

### For Administrators

✅ **DO:**
- Review user preferences before bulk communications
- Respect user notification preferences
- Use global toggles for users who opt-out completely
- Enable critical notifications (verification, password reset) for security
- Test notification preferences after changes

❌ **DON'T:**
- Override user preferences without consent
- Disable security-critical notifications (verification, password resets)
- Send marketing communications to users with disabled preferences
- Change preferences frequently without documentation

### For Users (Future Self-Service)

✅ **DO:**
- Keep email verification enabled for account security
- Enable at least one channel (Email or WhatsApp)
- Review preferences periodically
- Enable critical notifications (password resets, account changes)

❌ **DON'T:**
- Disable all notifications (you may miss important updates)
- Disable security notifications
- Forget to update contact information if switching channels

## Technical Details

### How Preferences Are Stored
- Global settings: `users.notifications_email`, `users.notifications_whatsapp`
- Granular preferences: (Future) `notification_preferences` table
- Real-time updates: Changes apply immediately after saving

### How Preferences Are Checked
When the system sends a notification:
1. Check global setting for channel (email/whatsapp)
2. If global enabled, check specific notification type preference
3. If both enabled, send notification
4. If either disabled, skip notification and log

### API Endpoints
- **GET** `/api/admin/users/:id/notification-preferences` - Fetch preferences
- **PUT** `/api/admin/users/:id/notification-preferences` - Update preferences

## Troubleshooting

### Problem: Preferences Not Saving
**Solution:**
- Check browser console for errors
- Verify admin permissions
- Ensure stable internet connection
- Try refreshing the page and reopening modal

### Problem: User Still Receiving Disabled Notifications
**Solution:**
- Verify preferences were saved (check database)
- Check global notification toggles
- Clear browser cache
- Verify notification type code matches in backend

### Problem: Modal Won't Open
**Solution:**
- Check for JavaScript errors in console
- Verify UserNotificationPreferences component is imported
- Ensure user object has valid ID
- Try different browser

### Problem: Missing Notification Types
**Solution:**
- Verify NOTIFICATION_TYPES constant is complete (14 types)
- Check backend documentation matches frontend
- Update component if new types added
- Review backend controller code for type codes

## Future Enhancements

### Planned Features
1. **User Self-Service**: Allow users to manage their own preferences
2. **Email Digest**: Batch notifications into daily/weekly digests
3. **Quiet Hours**: Don't send notifications during specified times
4. **Notification Templates**: Preview email/WhatsApp templates
5. **Bulk Management**: Set preferences for multiple users at once
6. **Notification History**: View sent notifications per user
7. **A/B Testing**: Test different notification strategies
8. **Smart Defaults**: AI-suggested preferences based on user behavior

### Database Migration (Granular Storage)
Future implementation will store per-type preferences:
```sql
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, notification_type)
);
```

## Support

### For Admins
- **Documentation**: `/backend/docs/NOTIFICATION_TYPES.md`
- **API Reference**: Check `notificationPreferencesController.js`
- **Support Email**: Contact system administrator

### For Developers
- **Component**: `frontend/src/components/admin/UserNotificationPreferences.js`
- **Backend Controller**: `backend/controllers/notificationPreferencesController.js`
- **Notification Service**: `backend/services/notificationService.js`
- **Implementation Guide**: `NOTIFICATION_TYPES_UPDATE.md`

---

**Last Updated:** 2024
**Component Version:** 2.0 (14 notification types)
**Status:** ✅ Production Ready
