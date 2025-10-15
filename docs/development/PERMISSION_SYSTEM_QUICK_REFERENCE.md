# Permission System Quick Reference

**Quick guide for using the new permission system**

---

## 🎯 Quick Start

### In Routes
```javascript
const { requirePermission, requireAnyPermission } = require('../middleware/permissions');

// Require single permission
router.get('/users', authenticateToken, requirePermission('users.view'), handler);

// Require any of multiple permissions
router.get('/data', authenticateToken, requireAnyPermission(['users.view', 'users.manage']), handler);

// Require all permissions
router.post('/admin', authenticateToken, requireAllPermissions(['users.manage', 'settings.manage']), handler);
```

### In Controllers
```javascript
const { hasPermission, getUserPermissions } = require('../middleware/permissions');

// Check permission
const canView = await hasPermission(req.user.id, 'users.view');
if (!canView) {
  return res.status(403).json({ error: 'Insufficient permissions' });
}

// Get all user permissions
const permissions = await getUserPermissions(req.user.id);
```

---

## 📋 All Permissions

### Users (8)
- `users.view` - View user list
- `users.create` - Create new users
- `users.edit` - Edit user information
- `users.delete` - Delete users
- `users.approve` - Approve/reject registrations
- `users.manage` - Full user management
- `users.export` - Export user data
- `users.impersonate` - Impersonate users

### Hikes (7)
- `hikes.view` - View hike list
- `hikes.create` - Create hikes
- `hikes.edit` - Edit hikes
- `hikes.delete` - Delete hikes
- `hikes.manage_attendance` - Manage attendance
- `hikes.view_attendance` - View attendance
- `hikes.export` - Export hike data

### Analytics (3)
- `analytics.view` - View dashboards
- `analytics.export` - Export data
- `analytics.advanced` - Advanced features

### Notifications (4)
- `notifications.view` - View notification logs
- `notifications.send` - Send notifications
- `notifications.test` - Send test notifications
- `notifications.manage` - Manage settings

### Settings (3)
- `settings.view` - View system settings
- `settings.edit` - Edit settings
- `settings.manage` - Full settings management

### Compliance (3)
- `compliance.view` - View POPIA data
- `compliance.manage` - Manage data retention
- `compliance.export` - Export compliance reports

### Reports (3)
- `reports.view` - View reports
- `reports.create` - Create reports
- `reports.export` - Export reports

### Feedback (3)
- `feedback.view` - View feedback
- `feedback.respond` - Respond to feedback
- `feedback.manage` - Manage feedback

### Audit (2)
- `audit.view` - View audit logs
- `audit.export` - Export audit logs

---

## 👥 Default Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | ALL | System administrators |
| **Hiker** | hikes.view, analytics.view | Regular hikers |
| **Guide** | hikes.*, users.view, analytics.view, feedback.view | Hike leaders |
| **Moderator** | users.*, hikes.view/edit, feedback.*, notifications.* | Moderators |

---

## 🔌 API Endpoints

### Get All Permissions
```http
GET /api/permissions/permissions
Authorization: Bearer <token>
```

### Get All Roles
```http
GET /api/permissions/roles
Authorization: Bearer <token>
```

### Create Custom Role
```http
POST /api/permissions/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Content Manager",
  "description": "Manages content",
  "permissionIds": [1, 2, 10]
}
```

### Assign Role to User
```http
POST /api/permissions/users/assign-role
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 123,
  "roleId": 3
}
```

### Get User Permissions
```http
GET /api/permissions/user/permissions
Authorization: Bearer <token>
```

---

## 💡 Common Patterns

### Protecting Routes

```javascript
// Single permission
router.get('/users', 
  authenticateToken, 
  requirePermission('users.view'), 
  adminController.getUsers
);

// Multiple permissions (any)
router.get('/dashboard', 
  authenticateToken, 
  requireAnyPermission(['analytics.view', 'analytics.advanced']), 
  handler
);

// Multiple permissions (all)
router.post('/critical', 
  authenticateToken, 
  requireAllPermissions(['users.manage', 'settings.manage']), 
  handler
);
```

### Checking Permissions in Code

```javascript
// Single check
if (await hasPermission(userId, 'users.edit')) {
  // Allow editing
}

// Multiple check (any)
if (await hasAnyPermission(userId, ['users.view', 'users.manage'])) {
  // Allow viewing
}

// Multiple check (all)
if (await hasAllPermissions(userId, ['users.edit', 'users.manage'])) {
  // Allow both
}
```

### Getting User Data

```javascript
// Get all permissions
const permissions = await getUserPermissions(userId);
// Returns: ['users.view', 'hikes.create', ...]

// Get all roles
const roles = await getUserRoles(userId);
// Returns: [{id: 1, name: 'admin', ...}, ...]
```

---

## 🚀 Migration Commands

```bash
# Run index migration
node run-migration.js 015_add_user_management_indexes.sql

# Run permission system migration
node run-migration.js 016_create_permission_system.sql
```

---

## ✅ Testing Checklist

- [ ] Run both migrations successfully
- [ ] Verify 35+ permissions created
- [ ] Verify 4 roles created
- [ ] Verify existing users migrated
- [ ] Test GET /api/permissions/permissions
- [ ] Test GET /api/permissions/roles
- [ ] Test POST /api/permissions/roles (create custom role)
- [ ] Test POST /api/permissions/users/assign-role
- [ ] Test permission checks on admin routes
- [ ] Test requireAdmin() still works

---

## 🔒 Security Notes

### High-Risk Permissions
⚠️ Use sparingly:
- `users.impersonate` - Very dangerous
- `settings.manage` - System configuration
- `users.delete` - Permanent data loss
- `compliance.manage` - Data retention

### Best Practices
✅ DO:
- Assign minimum permissions needed
- Create custom roles for specific needs
- Review permissions regularly
- Use audit trail

❌ DON'T:
- Give impersonate to non-admins
- Delete system roles
- Remove user's last role
- Modify admin role in production

---

## 📚 Full Documentation

- **[PERMISSION_SYSTEM.md](docs/development/PERMISSION_SYSTEM.md)** - Complete guide
- **[USER_MANAGEMENT_IMPLEMENTATION_STATUS.md](docs/planning/USER_MANAGEMENT_IMPLEMENTATION_STATUS.md)** - Status
- **[SECURITY.md](docs/development/SECURITY.md)** - Security guide

---

## 🐛 Common Issues

### Permission Denied
```
Error: User does not have required permission
```
**Solution:** Check user roles and permissions, assign appropriate role

### Migration Failed
```
Error: Table already exists
```
**Solution:** Migration already run or partial failure - check database state

### No Permissions After Login
```
User has empty permissions array
```
**Solution:** User not assigned to any role - assign at least one role

---

**Last Updated:** October 13, 2025  
**Status:** Backend Complete | Frontend Pending
