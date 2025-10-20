# Portal Settings Permission Fix

## Issue
Admin users were seeing "Access Denied" when trying to access the Portal Settings page at `/admin/portal-settings`.

## Root Cause
The Portal Settings page and navigation were using a non-existent permission `manage_settings` instead of the correct permissions from the database schema:
- `settings.view` (for page access)
- `settings.edit` (for weather settings tab)

## Database Permissions
According to `backend/migrations/017_create_permission_system.sql`, the Settings permissions are:
```sql
INSERT INTO permissions (name, description, category) VALUES
('settings.view', 'View system settings', 'settings'),
('settings.edit', 'Edit system settings', 'settings'),
('settings.advanced', 'Access advanced system settings', 'settings')
```

The `manage_settings` permission does not exist in the database.

## Changes Made

### 1. PortalSettingsPage.js
**File:** `frontend/src/pages/PortalSettingsPage.js`

**Before:**
```javascript
<PermissionGate permission="manage_settings" fallback={...}>
  // ...
  { id: 'weather', label: 'Weather Settings', permission: 'manage_settings' }
</PermissionGate>
```

**After:**
```javascript
<PermissionGate permission="settings.view" fallback={...}>
  // ...
  { id: 'weather', label: 'Weather Settings', permission: 'settings.edit' }
</PermissionGate>
```

### 2. Header.js Navigation
**File:** `frontend/src/components/layout/Header.js`

**Before:**
```javascript
{ path: '/admin/portal-settings', label: 'Portal Settings', icon: Settings, permission: 'manage_settings' }
```

**After:**
```javascript
{ path: '/admin/portal-settings', label: 'Portal Settings', icon: Settings, permission: 'settings.view' }
```

### 3. Documentation
**File:** `PORTAL_SETTINGS_CONSOLIDATION.md`

Updated all references from `manage_settings` to `settings.view` and `settings.edit`.

## Permission Logic

### Page Access
- **Required:** `settings.view`
- **Granted to:** Admin role (gets ALL permissions)

### Tab Visibility
| Tab | Permission Required |
|-----|-------------------|
| Users & Roles | `users.view` |
| Content Management | `feedback.view` |
| Weather Settings | `settings.edit` |

### Admin Role Permissions
From the migration:
```sql
-- Admin gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'admin'
```

This means admin users automatically have:
- ✅ `settings.view` - Can access Portal Settings page
- ✅ `settings.edit` - Can edit weather settings
- ✅ `users.view` - Can see Users & Roles tab
- ✅ `feedback.view` - Can see Content Management tab
- ✅ All other permissions

## Deployment

**Built:** October 17, 2025
**Deployed to:** https://helloliam.web.app

**Build stats:**
- Main bundle: 158.53 kB (gzipped)
- Build: Success with warnings (non-critical React hooks)

## Testing Checklist

- [x] Portal Settings menu item visible in Admin menu
- [x] Portal Settings page accessible (no "Access Denied")
- [x] All 3 tabs visible for admin users
- [x] Users & Roles tab functional
- [x] Content Management tab functional
- [x] Weather Settings tab functional

## Related Files

- `frontend/src/pages/PortalSettingsPage.js` - Page component (FIXED)
- `frontend/src/components/layout/Header.js` - Navigation (FIXED)
- `backend/migrations/017_create_permission_system.sql` - Permission definitions (reference)
- `PORTAL_SETTINGS_CONSOLIDATION.md` - Documentation (updated)

## Status
✅ **FIXED AND DEPLOYED**

The Portal Settings page is now accessible to admin users and the menu item appears correctly in the navigation.
