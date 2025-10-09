# Notification Types

This document lists all notification types sent by The Narrow Tr### 12. Attendance Confirmed
- **Type Code:** `attendance_confirmed`
- **Trigger:** User confirms attendance for a hike
- **Recipients:** All admins with email notifications enabled
- **Subject:** "Attendance Confirmed"
- **Template:** `attendanceConfirmedAdminEmail()`

### 13. New Feedback
- **Type Code:** `new_feedback`
- **Trigger:** User submits feedback
- **Recipients:** All admins with email notifications enabled
- **Subject:** "New Feedback Received"
- **Template:** `feedbackAdminEmail()`

### 14. New Suggestional.

## User Notifications (Sent to Users)

### 1. Email Verification
- **Type Code:** `email_verification`
- **Trigger:** User registers for an account
- **Recipients:** New user
- **Subject:** "Verify Your Email - The Narrow Trail"
- **Template:** `verificationEmail()`

### 2. Account Approval
- **Type Code:** `account_approved`
- **Trigger:** Admin approves a pending user
- **Recipients:** Approved user
- **Subject:** "Welcome to The Narrow Trail"
- **Template:** `welcomeEmail()`

### 3. Account Rejection
- **Type Code:** `account_rejected`
- **Trigger:** Admin rejects a pending user
- **Recipients:** Rejected user
- **Subject:** "Registration Update"
- **Template:** `rejectionEmail()`

### 4. Password Reset Request
- **Type Code:** `password_reset_request`
- **Trigger:** User requests password reset
- **Recipients:** User who requested reset
- **Subject:** "Password Reset Request"
- **Template:** `passwordResetEmail()`

### 5. Password Reset Confirmation
- **Type Code:** `password_reset_confirmed`
- **Trigger:** User successfully resets password
- **Recipients:** User who reset password
- **Subject:** "Password Reset Successful"
- **Template:** `passwordResetConfirmationEmail()`

### 6. Admin Password Reset
- **Type Code:** `admin_password_reset`
- **Trigger:** Admin resets user's password
- **Recipients:** User whose password was reset
- **Subject:** "Password Reset by Administrator"
- **Template:** `adminPasswordResetEmail()`

### 7. Admin Promotion
- **Type Code:** `admin_promotion`
- **Trigger:** Admin promotes user to admin role
- **Recipients:** Promoted user
- **Subject:** "Admin Access Granted"
- **Template:** `adminPromotionEmail()`

### 8. New Hike Announcement
- **Type Code:** `new_hike_added`
- **Trigger:** Admin creates a new hike
- **Recipients:** All approved users with email notifications enabled
- **Subject:** "New Hike Added!"
- **Template:** `newHikeEmail()`

### 9. Hike Announcement (to Attendees)
- **Type Code:** `hike_announcement`
- **Trigger:** Admin sends custom announcement to hike attendees
- **Recipients:** Confirmed attendees of specific hike with email notifications enabled
- **Subject:** Custom (admin-defined)
- **Template:** `hikeAnnouncementEmail()`
- **Channels:** Email only

## Admin Notifications (Sent to Admins Only)

### 10. New Registration
- **Type Code:** `new_registration`
- **Trigger:** New user registers
- **Recipients:** All admins with email notifications enabled
- **Subject:** "New Registration Pending"
- **Template:** `newRegistrationAdminEmail()`

### 11. Hike Interest
- **Type Code:** `hike_interest`
- **Trigger:** User expresses interest in a hike
- **Recipients:** All admins with email notifications enabled
- **Subject:** "Hike Interest"
- **Template:** `hikeInterestAdminEmail()`

### 12. Attendance Confirmed
- **Type Code:** `attendance_confirmed`
- **Trigger:** User confirms attendance for a hike
- **Recipients:** All admins with email notifications enabled
- **Subject:** "Hike Attendance Confirmed"
- **Template:** `attendanceConfirmedAdminEmail()`

### 12. New Feedback
- **Type Code:** `new_feedback`
- **Trigger:** User submits feedback
- **Recipients:** All admins with email notifications enabled
- **Subject:** "New Feedback: {type}"
- **Template:** `feedbackAdminEmail()`

### 14. New Hike Suggestion
- **Type Code:** `new_suggestion`
- **Trigger:** User submits hike suggestion
- **Recipients:** All admins with email notifications enabled
- **Subject:** "New Hike Suggestion Received"
- **Template:** Custom inline template

## Summary

**Total Notification Types:** 14
- **User Notifications:** 9 (sent to end users)
- **Admin Notifications:** 5 (sent to administrators)

## Notification Channels

Each notification type can be sent via:
- **Email** (via SendGrid)
- **WhatsApp** (via Twilio) - for select notifications

## Database Schema

### Current Implementation
Currently stored in `users` table:
- `notifications_email` (BOOLEAN) - Enable/disable all email notifications
- `notifications_whatsapp` (BOOLEAN) - Enable/disable all WhatsApp notifications

### Proposed Enhancement
Add `notification_preferences` table for granular control:
```sql
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);
```

## Default Settings

### For Regular Users:
- All user-facing notifications: **Enabled by default**
- Admin notifications: **Not applicable**

### For Admins:
- All user-facing notifications: **Enabled by default**
- All admin notifications: **Enabled by default**

## Notes

- Users can disable notifications globally via `notifications_email` and `notifications_whatsapp` flags
- With granular preferences, users can customize which specific notification types they want to receive
- System-critical notifications (email verification, password resets) should not be disableable for security reasons
