# Permission System Implementation Guide

**Last Updated:** October 13, 2025  
**Status:** ✅ Backend Complete | 🟡 Frontend Pending  
**Related Documents:** 
- [User Management Enhancement Plan](USER_MANAGEMENT_ENHANCEMENT_PLAN.md)
- [Security Documentation](SECURITY.md)
- [User Management](../features/USER_MANAGEMENT.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Permission Categories](#permission-categories)
5. [Default Roles](#default-roles)
6. [Backend Implementation](#backend-implementation)
7. [API Endpoints](#api-endpoints)
8. [Frontend Integration](#frontend-integration)
9. [Migration Guide](#migration-guide)
10. [Testing](#testing)
11. [Security Considerations](#security-considerations)

---

## Overview

The new permission system replaces the simple two-role (admin/hiker) system with a flexible, granular Role-Based Access Control (RBAC) implementation. This allows for:

- **35+ granular permissions** across 8 categories
- **Custom roles** with specific permission sets
- **Multiple roles per user** for complex scenarios
- **Backward compatibility** with existing admin checks
- **Audit trail** for all permission changes

### Key Benefits

- ✅ Fine-grained access control
- ✅ Easier role management (no code changes for new roles)
- ✅ Better security through principle of least privilege
- ✅ Scalable for future feature additions
- ✅ Complete audit trail
- ✅ Backward compatible with existing code

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Authentication                      │
│                     (JWT + bcrypt)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Permission Middleware                           │
│   • requirePermission('permission.name')                    │
│   • requireAnyPermission(['perm1', 'perm2'])               │
│   • requireAllPermissions(['perm1', 'perm2'])              │
│   • requireAdmin() (backward compatible)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Permission Resolution                           │
│   User → user_roles → role_permissions → permissions       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Route Protection                             │
│   Allow/Deny based on permission check result              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables

#### 1. `permissions` - All available permissions
```sql
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,        -- e.g., 'users.view', 'hikes.create'
    description TEXT,
    category VARCHAR(50) NOT NULL,             -- e.g., 'users', 'hikes', 'analytics'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `roles` - Role definitions
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,         -- e.g., 'admin', 'hiker', 'guide'
    description TEXT,
    is_system BOOLEAN DEFAULT false,           -- System roles cannot be deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `role_permissions` - Mapping between roles and permissions
```sql
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
```

#### 4. `user_roles` - Mapping between users and roles
```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);
```

### Indexes

```sql
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_roles_name ON roles(name);
```

### Views

#### role_permissions_view - Quick role permission lookup
```sql
CREATE VIEW role_permissions_view AS
SELECT 
    r.id as role_id,
    r.name as role_name,
    p.id as permission_id,
    p.name as permission_name,
    p.category as permission_category
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id;
```

#### user_permissions_view - Quick user permission lookup
```sql
CREATE VIEW user_permissions_view AS
SELECT DISTINCT
    ur.user_id,
    p.id as permission_id,
    p.name as permission_name,
    p.category as permission_category
FROM user_roles ur
JOIN role_permissions rp ON ur.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id;
```

---

## Permission Categories

### 1. **Users** (8 permissions)
- `users.view` - View user list and details
- `users.create` - Create new users
- `users.edit` - Edit user information
- `users.delete` - Delete users
- `users.approve` - Approve/reject pending registrations
- `users.manage` - Full user management (includes password reset, role changes)
- `users.export` - Export user data
- `users.impersonate` - Impersonate other users (for support)

### 2. **Hikes** (7 permissions)
- `hikes.view` - View hike list
- `hikes.create` - Create new hikes
- `hikes.edit` - Edit existing hikes
- `hikes.delete` - Delete hikes
- `hikes.manage_attendance` - Manage hike attendance/check-ins
- `hikes.view_attendance` - View attendance records
- `hikes.export` - Export hike data

### 3. **Analytics** (3 permissions)
- `analytics.view` - View analytics dashboards
- `analytics.export` - Export analytics data
- `analytics.advanced` - Access advanced analytics features

### 4. **Notifications** (4 permissions)
- `notifications.view` - View notification logs
- `notifications.send` - Send notifications
- `notifications.test` - Send test notifications
- `notifications.manage` - Manage notification settings

### 5. **Settings** (3 permissions)
- `settings.view` - View system settings
- `settings.edit` - Edit system settings
- `settings.manage` - Full settings management (includes dangerous operations)

### 6. **Compliance** (3 permissions)
- `compliance.view` - View POPIA compliance data
- `compliance.manage` - Manage data retention and compliance
- `compliance.export` - Export compliance reports

### 7. **Reports** (3 permissions)
- `reports.view` - View reports
- `reports.create` - Create custom reports
- `reports.export` - Export reports

### 8. **Feedback** (3 permissions)
- `feedback.view` - View feedback submissions
- `feedback.respond` - Respond to feedback
- `feedback.manage` - Manage feedback (delete, categorize)

### 9. **Audit** (2 permissions)
- `audit.view` - View audit logs
- `audit.export` - Export audit logs

---

## Default Roles

### 1. **Admin** (System Role)
- **Description:** Full system access
- **Permissions:** ALL 35+ permissions
- **Cannot be:** Deleted or modified
- **Use case:** System administrators

### 2. **Hiker** (System Role)
- **Description:** Standard hiker with basic access
- **Permissions:**
  - `hikes.view`
  - `analytics.view`
- **Cannot be:** Deleted (but can be modified)
- **Use case:** Regular hikers

### 3. **Guide** (System Role)
- **Description:** Hike leader/organizer
- **Permissions:**
  - `hikes.view`
  - `hikes.create`
  - `hikes.edit`
  - `hikes.manage_attendance`
  - `hikes.view_attendance`
  - `users.view`
  - `analytics.view`
  - `feedback.view`
- **Cannot be:** Deleted (but can be modified)
- **Use case:** Hike leaders who organize and manage hikes

### 4. **Moderator** (System Role)
- **Description:** User management and moderation
- **Permissions:**
  - `users.view`
  - `users.edit`
  - `users.approve`
  - `hikes.view`
  - `hikes.edit`
  - `analytics.view`
  - `feedback.view`
  - `feedback.respond`
  - `notifications.view`
  - `notifications.send`
- **Cannot be:** Deleted (but can be modified)
- **Use case:** Community moderators who manage users and content

---

## Backend Implementation

### Middleware Functions

Located in `backend/middleware/permissions.js`:

#### Core Permission Checking

```javascript
// Check if user has a specific permission
async function hasPermission(userId, permissionName)
// Returns: true/false

// Check if user has any of the specified permissions
async function hasAnyPermission(userId, permissionNames)
// Returns: true/false

// Check if user has all specified permissions
async function hasAllPermissions(userId, permissionNames)
// Returns: true/false

// Get all permissions for a user
async function getUserPermissions(userId)
// Returns: ['permission1', 'permission2', ...]

// Get all roles for a user
async function getUserRoles(userId)
// Returns: [{id, name, description}, ...]
```

#### Route Protection Middleware

```javascript
// Require specific permission
function requirePermission(permission)
// Usage: router.get('/route', authenticateToken, requirePermission('users.view'), handler)

// Require any of multiple permissions
function requireAnyPermission(permissions)
// Usage: router.get('/route', authenticateToken, requireAnyPermission(['users.view', 'users.manage']), handler)

// Require all of multiple permissions
function requireAllPermissions(permissions)
// Usage: router.post('/route', authenticateToken, requireAllPermissions(['users.edit', 'users.manage']), handler)

// Backward compatible admin check
function requireAdmin()
// Usage: router.get('/route', authenticateToken, requireAdmin(), handler)
```

### Controllers

Located in `backend/controllers/permissionController.js`:

#### Permission Management
- `getAllPermissions()` - List all available permissions
- `getPermissionsByCategory()` - Get permissions grouped by category
- `getPermissionStats()` - Get permission statistics

#### Role Management
- `getAllRoles()` - List all roles with user/permission counts
- `getRoleById(id)` - Get role details with permissions
- `createRole()` - Create custom role
- `updateRole(id)` - Update role (name, description, permissions)
- `deleteRole(id)` - Delete custom role (not system roles)

#### User Permission Management
- `getUserPermissions(userId)` - Get user's permissions and roles
- `assignRoleToUser()` - Assign role to user
- `removeRoleFromUser()` - Remove role from user

### Route Examples

```javascript
// Permission routes (backend/routes/permissions.js)
router.get('/permissions', authenticateToken, requireAnyPermission(['users.manage', 'settings.manage']), permissionController.getAllPermissions);
router.get('/roles', authenticateToken, requireAnyPermission(['users.view', 'users.manage']), permissionController.getAllRoles);
router.post('/roles', authenticateToken, requirePermission('users.manage'), permissionController.createRole);

// Updated admin routes (backend/routes/admin.js)
router.get('/users', authenticateToken, requirePermission('users.view'), adminController.getUsers);
router.post('/users', authenticateToken, requirePermission('users.create'), adminController.createUser);
router.put('/users/:id', authenticateToken, requirePermission('users.edit'), adminController.updateUser);
router.delete('/users/:id', authenticateToken, requirePermission('users.delete'), adminController.deleteUser);
```

---

## API Endpoints

### Permission Endpoints

#### GET `/api/permissions/permissions`
Get all permissions (flat list).

**Required Permission:** `users.manage` OR `settings.manage`

**Response:**
```json
[
  {
    "id": 1,
    "name": "users.view",
    "description": "View user list and details",
    "category": "users"
  },
  ...
]
```

#### GET `/api/permissions/permissions/by-category`
Get permissions grouped by category.

**Required Permission:** `users.manage` OR `settings.manage`

**Response:**
```json
[
  {
    "category": "users",
    "permissions": [
      {"id": 1, "name": "users.view", "description": "..."},
      ...
    ]
  },
  ...
]
```

#### GET `/api/permissions/permissions/stats`
Get permission statistics.

**Required Permission:** `users.manage`

**Response:**
```json
{
  "total_permissions": 35,
  "total_roles": 4,
  "total_assignments": 150,
  "permission_categories": 8
}
```

### Role Endpoints

#### GET `/api/permissions/roles`
Get all roles with counts.

**Required Permission:** `users.view` OR `users.manage`

**Response:**
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Full system access",
    "is_system": true,
    "user_count": 3,
    "permission_count": 35,
    "created_at": "2025-01-01T00:00:00.000Z"
  },
  ...
]
```

#### GET `/api/permissions/roles/:id`
Get role details with permissions.

**Required Permission:** `users.view` OR `users.manage`

**Response:**
```json
{
  "id": 2,
  "name": "guide",
  "description": "Hike leader/organizer",
  "is_system": true,
  "created_at": "2025-01-01T00:00:00.000Z",
  "permissions": [
    {"id": 10, "name": "hikes.view", "description": "...", "category": "hikes"},
    ...
  ]
}
```

#### POST `/api/permissions/roles`
Create new custom role.

**Required Permission:** `users.manage`

**Request Body:**
```json
{
  "name": "Content Manager",
  "description": "Manages website content",
  "permissionIds": [1, 2, 10, 11]
}
```

**Response:**
```json
{
  "message": "Role created successfully",
  "role": {
    "id": 5,
    "name": "Content Manager",
    ...
  }
}
```

#### PUT `/api/permissions/roles/:id`
Update role (custom roles only).

**Required Permission:** `users.manage`

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "permissionIds": [1, 2, 3]
}
```

#### DELETE `/api/permissions/roles/:id`
Delete custom role (not system roles, not if assigned to users).

**Required Permission:** `users.manage`

### User Permission Endpoints

#### GET `/api/permissions/user/permissions`
Get current user's permissions and roles.

**Required Permission:** Authenticated user (any)

**Response:**
```json
{
  "userId": 123,
  "permissions": ["users.view", "hikes.create", ...],
  "roles": [
    {"id": 3, "name": "guide", "description": "..."},
    ...
  ]
}
```

#### GET `/api/permissions/users/:userId/permissions`
Get specific user's permissions and roles.

**Required Permission:** `users.view`

**Response:** Same as above

#### POST `/api/permissions/users/assign-role`
Assign role to user.

**Required Permission:** `users.manage`

**Request Body:**
```json
{
  "userId": 123,
  "roleId": 3
}
```

#### POST `/api/permissions/users/remove-role`
Remove role from user.

**Required Permission:** `users.manage`

**Request Body:**
```json
{
  "userId": 123,
  "roleId": 3
}
```

---

## Frontend Integration

### 🟡 STATUS: PENDING IMPLEMENTATION

### Step 1: Create Permission Context

Create `frontend/src/contexts/PermissionContext.js`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PermissionContext = createContext();

export function usePermissions() {
  return useContext(PermissionContext);
}

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/permissions/user/permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(response.data.permissions);
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(p => permissions.includes(p));
  };

  const hasRole = (roleName) => {
    return roles.some(r => r.name === roleName);
  };

  const value = {
    permissions,
    roles,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    refresh: fetchPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}
```

### Step 2: Wrap App with Provider

Update `frontend/src/App.js`:

```javascript
import { PermissionProvider } from './contexts/PermissionContext';

function App() {
  return (
    <PermissionProvider>
      {/* Existing app content */}
    </PermissionProvider>
  );
}
```

### Step 3: Create Permission Components

Create `frontend/src/components/PermissionGate.js`:

```javascript
import { usePermissions } from '../contexts/PermissionContext';

export function PermissionGate({ permission, anyOf, allOf, children, fallback = null }) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyOf) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf) {
    hasAccess = hasAllPermissions(allOf);
  }

  return hasAccess ? children : fallback;
}

// Usage examples:
// <PermissionGate permission="users.view"><UserList /></PermissionGate>
// <PermissionGate anyOf={['users.view', 'users.manage']}><UserList /></PermissionGate>
// <PermissionGate allOf={['users.edit', 'users.manage']}><EditForm /></PermissionGate>
```

### Step 4: Update Navigation

Update navigation to show/hide items based on permissions:

```javascript
import { usePermissions } from '../contexts/PermissionContext';

function Navigation() {
  const { hasPermission } = usePermissions();

  return (
    <nav>
      {hasPermission('hikes.view') && <NavItem to="/hikes">Hikes</NavItem>}
      {hasPermission('users.view') && <NavItem to="/admin/users">Users</NavItem>}
      {hasPermission('analytics.view') && <NavItem to="/analytics">Analytics</NavItem>}
    </nav>
  );
}
```

### Step 5: Create Role Management UI

Create `frontend/src/components/admin/RoleManagement.js`:

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePermissions } from '../../contexts/PermissionContext';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/permissions/roles', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRoles(response.data);
  };

  const fetchPermissions = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/permissions/permissions/by-category', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPermissions(response.data);
  };

  // Render role management UI...
}
```

### Step 6: Update User Management

Update `frontend/src/components/admin/UserManagement.js` to include role assignment:

```javascript
// Add role selection to user edit form
<FormControl>
  <FormLabel>Roles</FormLabel>
  <CheckboxGroup value={selectedRoles} onChange={setSelectedRoles}>
    {roles.map(role => (
      <Checkbox key={role.id} value={role.id}>
        {role.name}
      </Checkbox>
    ))}
  </CheckboxGroup>
</FormControl>
```

---

## Migration Guide

### Running the Migrations

#### Step 1: Run the Permission System Migration

```bash
# From backend directory
node run-migration.js 016_create_permission_system.sql
```

This will:
1. Create 4 new tables (permissions, roles, role_permissions, user_roles)
2. Insert 35+ permissions
3. Create 4 default roles (admin, hiker, guide, moderator)
4. Assign permissions to roles
5. Migrate existing users from old role VARCHAR to new system
6. Create indexes and views

#### Step 2: Verify Migration

Check the migration results:

```sql
-- Check permissions created
SELECT category, COUNT(*) as count 
FROM permissions 
GROUP BY category;

-- Check roles created
SELECT name, is_system, 
  (SELECT COUNT(*) FROM role_permissions WHERE role_id = roles.id) as permission_count
FROM roles;

-- Check user migrations
SELECT 
  u.email,
  u.role as old_role,
  STRING_AGG(r.name, ', ') as new_roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.role
LIMIT 10;
```

#### Step 3: Run the Index Migration

```bash
node run-migration.js 015_add_user_management_indexes.sql
```

This will create 6 indexes for improved query performance.

### Backward Compatibility

The system maintains backward compatibility:

1. **Old `role` column preserved** - The VARCHAR `role` column in `users` table is not dropped
2. **requireAdmin() still works** - Uses new permission system but provides same functionality
3. **Existing users migrated** - All users automatically assigned to appropriate roles

### Breaking Changes

⚠️ **None** - The implementation is fully backward compatible.

---

## Testing

### Unit Tests (Recommended)

Create `backend/tests/permissions.test.js`:

```javascript
const { hasPermission, hasAnyPermission, hasAllPermissions } = require('../middleware/permissions');

describe('Permission System', () => {
  test('hasPermission returns true for user with permission', async () => {
    const result = await hasPermission(1, 'users.view');
    expect(result).toBe(true);
  });

  test('hasAnyPermission returns true if user has any permission', async () => {
    const result = await hasAnyPermission(1, ['users.view', 'users.delete']);
    expect(result).toBe(true);
  });

  test('hasAllPermissions returns false if user missing permission', async () => {
    const result = await hasAllPermissions(2, ['users.view', 'users.manage']);
    expect(result).toBe(false);
  });
});
```

### Manual Testing Checklist

#### Permission Checking
- [ ] Admin user has all permissions
- [ ] Hiker user has only basic permissions
- [ ] Guide user can manage hikes
- [ ] Moderator user can manage users but not settings

#### Role Management
- [ ] Can create custom role
- [ ] Can assign permissions to custom role
- [ ] Can update custom role
- [ ] Cannot delete system roles
- [ ] Cannot delete role assigned to users

#### User Management
- [ ] Can assign role to user
- [ ] Can assign multiple roles to user
- [ ] Cannot remove user's last role
- [ ] User permissions update immediately after role change

#### Route Protection
- [ ] Routes with `requirePermission` block unauthorized users
- [ ] Routes with `requireAnyPermission` allow users with any listed permission
- [ ] Routes with `requireAllPermissions` require all listed permissions
- [ ] `requireAdmin()` still works as before

#### API Endpoints
- [ ] GET /api/permissions/permissions returns all permissions
- [ ] GET /api/permissions/roles returns all roles
- [ ] POST /api/permissions/roles creates role successfully
- [ ] PUT /api/permissions/roles/:id updates role
- [ ] DELETE /api/permissions/roles/:id deletes custom role
- [ ] POST /api/permissions/users/assign-role assigns role
- [ ] POST /api/permissions/users/remove-role removes role

### Performance Testing

Test with 100+ users:

```sql
-- Test permission lookup performance
EXPLAIN ANALYZE
SELECT DISTINCT p.name
FROM user_roles ur
JOIN role_permissions rp ON ur.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ur.user_id = 1;

-- Should use indexes and complete in < 5ms
```

---

## Security Considerations

### Best Practices

1. **Principle of Least Privilege**
   - Assign minimum permissions needed
   - Use specific permissions instead of admin role when possible
   - Review role permissions regularly

2. **Sensitive Operations**
   - `users.impersonate` - Very dangerous, assign sparingly
   - `settings.manage` - Can change system configuration
   - `users.delete` - Permanent data loss
   - `compliance.manage` - Affects data retention

3. **Audit Trail**
   - All permission changes logged with `granted_by` and `assigned_by`
   - Track who made changes and when
   - Review audit logs regularly

4. **System Roles**
   - Cannot be deleted
   - Can be modified (but discouraged)
   - Admin role should always have all permissions

5. **Role Separation**
   - Don't give users more permissions than needed
   - Consider creating specialized roles for specific tasks
   - Review user roles quarterly

### Common Pitfalls

❌ **DON'T:**
- Assign `users.impersonate` to non-admin users
- Delete system roles
- Remove user's last role (system prevents this)
- Modify admin role permissions in production

✅ **DO:**
- Create custom roles for specific needs
- Use `requireAnyPermission` for flexible access
- Test permission changes in development first
- Document custom roles and their purpose

---

## Next Steps

### Backend ✅ COMPLETE
- [x] Database migration created
- [x] Middleware functions implemented
- [x] Controllers created
- [x] Routes configured
- [x] Admin routes updated

### Frontend 🟡 TODO
- [ ] Create PermissionContext
- [ ] Create PermissionGate component
- [ ] Update navigation with permission checks
- [ ] Create RoleManagement component
- [ ] Update UserManagement with role assignment
- [ ] Test permission-based UI rendering

### Testing 🟡 TODO
- [ ] Run database migrations
- [ ] Test all API endpoints
- [ ] Test permission middleware
- [ ] Test role creation/modification
- [ ] Test user role assignment
- [ ] Performance test with 100+ users

### Documentation ✅ COMPLETE
- [x] API documentation
- [x] Implementation guide
- [x] Migration guide

---

## Support

For questions or issues with the permission system:

1. Check this documentation first
2. Review [User Management Enhancement Plan](USER_MANAGEMENT_ENHANCEMENT_PLAN.md)
3. Check [Security Documentation](SECURITY.md)
4. Review migration logs for errors
5. Check audit logs for permission changes

---

**Document Version:** 1.0  
**Created:** October 13, 2025  
**Last Updated:** October 13, 2025  
**Author:** AI Assistant  
**Status:** Backend Complete | Frontend Pending
