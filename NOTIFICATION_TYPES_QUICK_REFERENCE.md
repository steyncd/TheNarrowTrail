# 🔔 Notification Types - Quick Reference Card

## Access Path
**Admin → User Management → Click 🔔 (bell icon) next to any user**

---

## 14 Notification Types Available

### 👤 USER NOTIFICATIONS (9)

| Type | Description | 📧 Email | 💬 WhatsApp |
|------|-------------|---------|-------------|
| Email Verification | Sent when user registers | ✅ | ❌ |
| Account Approved | Welcome after admin approval | ✅ | ✅ |
| Account Rejected | Registration rejected notice | ✅ | ❌ |
| Password Reset Request | Password reset link | ✅ | ❌ |
| Password Reset Confirmed | Confirmation after reset | ✅ | ❌ |
| Admin Password Reset | Admin-initiated reset | ✅ | ❌ |
| Admin Promotion | Promoted to admin role | ✅ | ❌ |
| New Hike Added | New hike announcements | ✅ | ✅ |
| **Hike Announcement** ⭐NEW | Custom messages to attendees | ✅ | ❌ |

### 👨‍💼 ADMIN NOTIFICATIONS (5)

| Type | Description | 📧 Email | 💬 WhatsApp |
|------|-------------|---------|-------------|
| New Registration | New user registered | ✅ | ✅ |
| Hike Interest | User interested in hike | ✅ | ❌ |
| Attendance Confirmed | User confirmed attendance | ✅ | ❌ |
| New Feedback | Feedback submitted | ✅ | ❌ |
| New Suggestion | Hike suggestion submitted | ✅ | ❌ |

---

## 🚀 Quick Actions

### Enable All Notifications
1. Open preferences modal
2. Enable "Enable All Email Notifications"
3. Enable "Enable All WhatsApp Notifications"
4. Save

### Disable Marketing (Keep Critical Only)
1. Disable: Account Approved, New Hike Added, Hike Announcement
2. Keep enabled: Email Verification, Password Resets
3. Save

### WhatsApp Only for Important Updates
1. For Account Approved & New Hike: Enable WhatsApp, Disable Email
2. Keep Email for: Verification, Password Resets
3. Save

---

## 📍 Deployed Locations

- **Frontend:** https://helloliam.web.app
- **Backend:** https://backend-554106646136.europe-west1.run.app
- **Revision:** backend-00028-z9f

---

## 📚 Documentation

- Full Guide: `ADMIN_NOTIFICATION_CONFIG_GUIDE.md`
- Implementation: `NOTIFICATION_TYPES_UPDATE.md`
- API Reference: `backend/docs/NOTIFICATION_TYPES.md`
- Deployment: `DEPLOYMENT_SUMMARY_NOTIFICATION_TYPES.md`

---

**Status:** ✅ Live in Production
**Last Updated:** October 9, 2025
