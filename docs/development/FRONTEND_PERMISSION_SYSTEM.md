# 🎨 Frontend Permission System Implementation Guide

**Date:** October 14, 2025  
**Status:** ✅ COMPLETE  
**Backend Integration:** Production ready

---

## 📋 Overview

The frontend permission system provides React components, hooks, and contexts to seamlessly integrate with the backend permission system. It allows conditional rendering, permission checks, and role-based access control throughout the application.

---

## 🏗️ Architecture

```
frontend/src/
├── contexts/
│   └── PermissionContext.js       # Permission state management
├── components/
│   ├── PermissionGate.js          # Conditional rendering component
│   └── admin/
│       ├── RoleManagement.js      # Role management UI
│       └── RoleManagement.css
├── hooks/
│   └── usePermission.js           # Permission check hook
└── services/
    └── permissionApi.js           # API service for permissions
```

---

## 🔧 Components

### 1. PermissionContext

**Location:** `src/contexts/PermissionContext.js`

**Purpose:** Manages permission state and provides permission check functions

**Features:**
- Automatically fetches user permissions on login
- Caches permissions in React state
- Provides multiple permission check methods
- Integrates with AuthContext

**Usage:**
```javascript
import { PermissionProvider, usePermissions } from './contexts/PermissionContext';

// Wrap your app
<PermissionProvider>
  <App />
</PermissionProvider>

// Use in components
const { permissions, roles, hasPermission, isAdmin } = usePermissions();
```

**API:**
```javascript
{
  // Data
  permissions: [],        // Array of user's permissions
  roles: [],             // Array of user's roles
  loading: false,        // Loading state
  error: null,           // Error state

  // Permission checks
  hasPermission(name),           // Check single permission
  hasAnyPermission([names]),     // Check if has ANY permission
  hasAllPermissions([names]),    // Check if has ALL permissions
  
  // Role checks
  hasRole(name),                 // Check single role
  hasAnyRole([names]),           // Check if has ANY role
  isAdmin(),                     // Check if user is admin
  
  // Utility
  getPermissionsByCategory(cat), // Get permissions by category
  getCategories()                // Get all categories
}
```

---

### 2. PermissionGate Component

**Location:** `src/components/PermissionGate.js`

**Purpose:** Conditionally render children based on permissions or roles

**Props:**
```javascript
{
  permission: string,       // Single permission to check
  permissions: [string],    // Multiple permissions to check
  role: string,            // Single role to check
  roles: [string],         // Multiple roles to check
  requireAll: boolean,     // If true, requires ALL permissions (default: false)
  fallback: ReactNode,     // What to show if access denied (default: null)
  loading: ReactNode       // What to show while loading (default: null)
}
```

**Usage Examples:**

```javascript
import PermissionGate from './components/PermissionGate';

// Show button only if user has permission
<PermissionGate permission="users.edit">
  <button>Edit User</button>
</PermissionGate>

// Show section if user has ANY permission
<PermissionGate permissions={["users.view", "users.edit"]}>
  <UserManagementSection />
</PermissionGate>

// Show section if user has ALL permissions
<PermissionGate 
  permissions={["users.view", "users.edit"]} 
  requireAll={true}
>
  <AdvancedUserEditor />
</PermissionGate>

// Show fallback if no access
<PermissionGate 
  permission="admin.access"
  fallback={<div>You don't have admin access</div>}
>
  <AdminPanel />
</PermissionGate>

// Role-based rendering
<PermissionGate role="admin">
  <AdminDashboard />
</PermissionGate>

// Multiple roles
<PermissionGate roles={["admin", "moderator"]}>
  <ModeratorTools />
</PermissionGate>

// Custom loading state
<PermissionGate 
  permission="users.view"
  loading={<Spinner />}
>
  <UserList />
</PermissionGate>
```

---

### 3. usePermission Hook

**Location:** `src/hooks/usePermission.js`

**Purpose:** Provides easy-to-use permission check functions

**Usage:**
```javascript
import usePermission from '../hooks/usePermission';

function MyComponent() {
  const { can, canAny, canAll, cannot, isAdmin } = usePermission();

  // Simple checks
  if (can('users.edit')) {
    // User can edit
  }

  if (cannot('users.delete')) {
    // User cannot delete
  }

  if (canAny(['users.view', 'users.edit'])) {
    // User can view OR edit
  }

  if (canAll(['users.view', 'users.edit'])) {
    // User can view AND edit
  }

  if (isAdmin()) {
    // User is admin
  }

  return (
    <div>
      {can('users.edit') && <button>Edit</button>}
      {can('users.delete') && <button>Delete</button>}
    </div>
  );
}
```

**API:**
```javascript
{
  // Data
  permissions: [],
  roles: [],
  loading: boolean,
  error: string,

  // Shorthand functions
  can(permission): boolean,           // Check permission
  canAny([permissions]): boolean,     // Has ANY permission
  canAll([permissions]): boolean,     // Has ALL permissions
  cannot(permission): boolean,        // Opposite of can()

  // Original functions (same as context)
  hasPermission(permission): boolean,
  hasAnyPermission([permissions]): boolean,
  hasAllPermissions([permissions]): boolean,
  hasRole(role): boolean,
  hasAnyRole([roles]): boolean,
  isAdmin(): boolean,
  
  // Utility
  getPermissionsByCategory(category): [],
  getCategories(): []
}
```

---

### 4. PermissionService API

**Location:** `src/services/permissionApi.js`

**Purpose:** Handles all permission-related API calls

**Methods:**

```javascript
// User permissions
PermissionService.getUserPermissions(token)
// Returns: { permissions: [], roles: [] }

// Get all permissions (admin only)
PermissionService.getAllPermissions(token)
// Returns: { permissions: [] }

// Get permissions by category (admin only)
PermissionService.getPermissionsByCategory(token, category)
// Returns: { permissions: [] }

// Get all roles (admin only)
PermissionService.getAllRoles(token)
// Returns: { roles: [] }

// Get specific role (admin only)
PermissionService.getRoleById(token, roleId)
// Returns: { role: {..., permissions: []} }

// Assign role to user (admin only)
PermissionService.assignRole(token, userId, roleId)
// Returns: { message: 'Role assigned successfully' }

// Remove role from user (admin only)
PermissionService.removeRole(token, userId, roleId)
// Returns: { message: 'Role removed successfully' }

// Get user's roles (admin only)
PermissionService.getUserRoles(token, userId)
// Returns: { roles: [] }
```

**Usage Example:**
```javascript
import PermissionService from '../services/permissionApi';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const data = await PermissionService.getAllRoles(token);
        setRoles(data.roles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    }
    fetchRoles();
  }, [token]);

  return <RoleList roles={roles} />;
}
```

---

### 5. RoleManagement Component

**Location:** `src/components/admin/RoleManagement.js`

**Purpose:** Admin UI for viewing roles and permissions

**Features:**
- List all roles
- View role details
- See all permissions for each role
- Permissions grouped by category
- Responsive design

**Usage:**
```javascript
import RoleManagement from './components/admin/RoleManagement';

// In admin route
<PermissionGate permission="users.manage_roles">
  <RoleManagement />
</PermissionGate>
```

---

## 🚀 Integration Examples

### Example 1: Protected Navigation Menu

```javascript
import { usePermission } from '../hooks/usePermission';
import PermissionGate from '../components/PermissionGate';

function NavigationMenu() {
  const { can, isAdmin } = usePermission();

  return (
    <nav>
      <Link to="/hikes">Hikes</Link>
      
      <PermissionGate permission="users.view">
        <Link to="/users">Users</Link>
      </PermissionGate>

      <PermissionGate permission="analytics.view">
        <Link to="/analytics">Analytics</Link>
      </PermissionGate>

      <PermissionGate role="admin">
        <Link to="/admin">Admin Panel</Link>
      </PermissionGate>

      {can('logs.view') && <Link to="/logs">Logs</Link>}
    </nav>
  );
}
```

---

### Example 2: Conditional Buttons

```javascript
import usePermission from '../hooks/usePermission';

function UserListItem({ user }) {
  const { can } = usePermission();

  return (
    <div className="user-item">
      <span>{user.name}</span>
      
      {can('users.edit') && (
        <button onClick={() => editUser(user)}>Edit</button>
      )}
      
      {can('users.delete') && (
        <button onClick={() => deleteUser(user)}>Delete</button>
      )}
      
      {can('users.manage_roles') && (
        <button onClick={() => manageRoles(user)}>Manage Roles</button>
      )}
    </div>
  );
}
```

---

### Example 3: Protected Route

```javascript
import { Route } from 'react-router-dom';
import PermissionGate from '../components/PermissionGate';

<Route 
  path="/admin/users" 
  element={
    <PermissionGate 
      permission="users.view"
      fallback={<Navigate to="/unauthorized" />}
    >
      <UsersPage />
    </PermissionGate>
  }
/>
```

---

### Example 4: Role Assignment UI

```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PermissionService from '../services/permissionApi';
import usePermission from '../hooks/usePermission';

function UserRoleEditor({ user }) {
  const { token } = useAuth();
  const { can } = usePermission();
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState(user.roles || []);

  // Only show if user has permission
  if (!can('users.manage_roles')) {
    return null;
  }

  const assignRole = async (roleId) => {
    try {
      await PermissionService.assignRole(token, user.id, roleId);
      // Refresh user roles
      const data = await PermissionService.getUserRoles(token, user.id);
      setUserRoles(data.roles);
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const removeRole = async (roleId) => {
    try {
      await PermissionService.removeRole(token, user.id, roleId);
      // Refresh user roles
      const data = await PermissionService.getUserRoles(token, user.id);
      setUserRoles(data.roles);
    } catch (error) {
      console.error('Failed to remove role:', error);
    }
  };

  return (
    <div className="role-editor">
      <h4>Manage Roles for {user.name}</h4>
      <div className="current-roles">
        <h5>Current Roles:</h5>
        {userRoles.map(role => (
          <span key={role.id} className="badge">
            {role.name}
            <button onClick={() => removeRole(role.id)}>×</button>
          </span>
        ))}
      </div>
      <div className="available-roles">
        <h5>Available Roles:</h5>
        {roles.filter(r => !userRoles.find(ur => ur.id === r.id)).map(role => (
          <button 
            key={role.id}
            onClick={() => assignRole(role.id)}
          >
            Add {role.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 Permission Names Reference

### User Management
- `users.view` - View user list and details
- `users.edit` - Edit user information
- `users.delete` - Delete users
- `users.manage_roles` - Assign/remove user roles
- `users.export` - Export user data

### Hike Management
- `hikes.view` - View hikes
- `hikes.create` - Create new hikes
- `hikes.edit` - Edit hike details
- `hikes.delete` - Delete hikes
- `hikes.manage_attendance` - Manage hike attendance

### Content Management
- `content.view` - View content
- `content.edit` - Edit content
- `content.publish` - Publish content

### Analytics
- `analytics.view` - View analytics dashboard
- `analytics.export` - Export analytics data

### System
- `logs.view` - View system logs
- `logs.export` - Export logs
- `settings.view` - View settings
- `settings.edit` - Edit settings

### Notifications
- `notifications.send` - Send notifications
- `notifications.manage` - Manage notification settings

### Payments
- `payments.view` - View payment information
- `payments.manage` - Manage payments

### Photos
- `photos.upload` - Upload photos
- `photos.moderate` - Moderate photos

### Feedback
- `feedback.view` - View feedback
- `feedback.respond` - Respond to feedback

---

## 🎯 Best Practices

### 1. Always Use PermissionGate for UI Elements

```javascript
// ✅ Good - UI hidden if no permission
<PermissionGate permission="users.delete">
  <button onClick={deleteUser}>Delete</button>
</PermissionGate>

// ❌ Bad - UI visible but might fail on click
<button onClick={deleteUser}>Delete</button>
```

### 2. Backend Always Validates

```javascript
// Frontend checks are for UX only
// Backend ALWAYS validates permissions
// Never rely on frontend checks for security
```

### 3. Use Descriptive Permission Names

```javascript
// ✅ Good - Clear what permission does
can('users.edit')
can('hikes.manage_attendance')

// ❌ Bad - Unclear permission names
can('edit')
can('manage')
```

### 4. Provide Fallbacks

```javascript
// ✅ Good - User knows why they can't access
<PermissionGate 
  permission="admin.access"
  fallback={<div>Admin access required</div>}
>
  <AdminPanel />
</PermissionGate>

// ⚠️ Okay - Just hide
<PermissionGate permission="admin.access">
  <AdminPanel />
</PermissionGate>
```

### 5. Check Loading State

```javascript
const { loading, can } = usePermission();

if (loading) {
  return <LoadingSpinner />;
}

return (
  <div>
    {can('users.edit') && <EditButton />}
  </div>
);
```

---

## 🧪 Testing

### Test Permission Checks

```javascript
import { render, screen } from '@testing-library/react';
import { PermissionProvider } from './contexts/PermissionContext';
import PermissionGate from './components/PermissionGate';

test('shows content when permission granted', () => {
  const mockPermissions = [{ name: 'users.view' }];
  
  render(
    <PermissionProvider value={{ permissions: mockPermissions }}>
      <PermissionGate permission="users.view">
        <div>Content</div>
      </PermissionGate>
    </PermissionProvider>
  );
  
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

---

## 🚨 Troubleshooting

### Issue: Permissions not loading

**Solution:**
1. Check that PermissionProvider wraps your app
2. Verify user is authenticated
3. Check browser console for API errors
4. Verify backend endpoint is working

### Issue: Permission checks not working

**Solution:**
1. Verify permission names match exactly (case-sensitive)
2. Check that permissions were loaded (console.log)
3. Ensure user has been assigned the role with that permission

### Issue: UI flashing before hiding

**Solution:**
Use the loading prop on PermissionGate:

```javascript
<PermissionGate 
  permission="users.edit"
  loading={<Spinner />}
>
  <Content />
</PermissionGate>
```

---

## 📝 Next Steps

1. ✅ **COMPLETE** - Backend permission system deployed
2. ✅ **COMPLETE** - Frontend components created
3. 🔄 **TODO** - Update existing pages with PermissionGate
4. 🔄 **TODO** - Add RoleManagement to admin menu
5. 🔄 **TODO** - Test all permission checks
6. 🔄 **TODO** - Deploy frontend to Firebase

---

## 📞 Support

**Backend API:** https://backend-554106646136.europe-west1.run.app  
**Documentation:** See PERMISSION_SYSTEM.md in docs/development  
**Issues:** Check browser console and backend logs

---

**Status:** ✅ Ready for Integration  
**Last Updated:** October 14, 2025
