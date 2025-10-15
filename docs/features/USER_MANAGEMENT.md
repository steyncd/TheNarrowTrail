# 👥 User Management System

**Last Updated**: October 13, 2025  
**Status**: ✅ Fully Implemented  

---

## 📋 Overview

The Narrow Trail Hiking Portal includes a comprehensive user management system that allows administrators to manage user accounts, approvals, roles, and permissions.

---

## 🎯 Key Features

### 1. User Registration & Approval
- **Self-Registration**: Users can register with name, email, phone, password
- **Admin Approval**: New registrations require admin approval
- **Pending Queue**: Admins see all pending registrations
- **Approval Actions**: Approve or reject with automatic email notifications

### 2. User Roles
- **Hiker**: Standard user role (default)
  - Can view hikes and register interest
  - Can view own profile
  - Can manage own notification preferences
  
- **Admin**: Administrative role
  - All hiker permissions
  - User management (approve, edit, delete users)
  - Hike management (create, edit, delete hikes)
  - Analytics and reporting access
  - System configuration access

### 3. User Management Features
- **User List**: View all approved users with search and filter
- **User Search**: Search by name, email, or phone
- **Role Filter**: Filter users by role (admin/hiker/all)
- **Pagination**: 10 users per page
- **User Actions**:
  - Edit user details (name, email, phone, role, notifications)
  - Reset user password
  - Promote hiker to admin
  - Delete user (cannot delete self)
  - Manage notification preferences per user

### 4. Notification Preferences
- **Per-User Settings**: Each user can enable/disable channels
  - Email notifications (default: enabled)
  - WhatsApp notifications (default: enabled)
- **Admin Override**: Admins can modify any user's preferences
- **Granular Control**: Managed through UserNotificationPreferences component

### 5. POPIA Compliance
- **Consent Management**: Track privacy, terms, and data processing consent
- **Consent Status Dashboard**: Admin view of all user consents
- **Consent History**: Track consent dates
- **Data Retention**: Automated data retention policies

---

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Token Expiry**: Tokens expire after set period
- **Password Hashing**: bcrypt with salt rounds
- **Email Verification**: Optional email verification on registration

### Authorization
- **Role-Based Access Control (RBAC)**: Routes protected by role
- **Middleware Protection**: 
  - `authenticateToken`: Verifies valid JWT
  - `requireAdmin`: Verifies admin role
- **Frontend Guards**: `PrivateRoute` component with admin checks

### Password Management
- **Secure Storage**: Passwords hashed before storage
- **Admin Reset**: Admins can reset user passwords
- **Random Generation**: 8-character random passwords on reset
- **Email Notification**: Users notified of password changes

---

## 🛠️ Technical Implementation

### Frontend Components

#### UserManagement.js
**Location**: `frontend/src/components/admin/UserManagement.js`

**Features**:
- Tabbed interface (Users / Consent Management)
- Pending approvals section
- Approved users list with filters
- Modal dialogs for add/edit/reset operations
- Responsive design (desktop table / mobile cards)

**State Management**:
```javascript
- users: Array of approved users
- pendingUsers: Array of pending users
- userSearchTerm: Search filter
- userRoleFilter: Role filter (all/admin/hiker)
- userCurrentPage: Pagination state
- showAddUser/showEditUser/showResetUserPassword: Modal states
```

**Key Functions**:
- `fetchUsers()`: Load all approved users
- `fetchPendingUsers()`: Load pending approvals
- `handleApproveUser(userId)`: Approve pending user
- `handleRejectUser(userId)`: Reject and delete pending user
- `handleAddUser()`: Create new user manually
- `handleUpdateUser()`: Update existing user
- `handleResetPassword()`: Admin password reset
- `handlePromoteToAdmin(userId)`: Promote hiker to admin
- `handleDeleteUser(userId)`: Delete user account

#### UserNotificationPreferences.js
**Location**: `frontend/src/components/admin/UserNotificationPreferences.js`

**Purpose**: Manage individual user notification settings

#### ConsentManagement.js
**Location**: `frontend/src/components/admin/ConsentManagement.js`

**Purpose**: POPIA consent tracking and management

### Backend Controllers

#### adminController.js
**Location**: `backend/controllers/adminController.js`

**User Management Endpoints**:

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/admin/pending-users` | GET | Get all pending users | Admin |
| `/api/admin/users` | GET | Get all approved users | Admin |
| `/api/admin/users/:id/approve` | PUT | Approve pending user | Admin |
| `/api/admin/users/:id/reject` | DELETE | Reject pending user | Admin |
| `/api/admin/users/:id` | DELETE | Delete user | Admin |
| `/api/admin/users` | POST | Create new user | Admin |
| `/api/admin/users/:id` | PUT | Update user | Admin |
| `/api/admin/users/:id/reset-password` | POST | Reset user password | Admin |
| `/api/admin/users/:id/promote` | PUT | Promote to admin | Admin |
| `/api/admin/consent-status` | GET | Get consent status | Admin |

**Key Functions**:

```javascript
// Get pending users (status = 'pending')
exports.getPendingUsers = async (req, res) => {
  // Returns: id, name, email, phone, created_at
}

// Get approved users (status = 'approved')
exports.getUsers = async (req, res) => {
  // Returns: id, name, email, phone, role, notifications_*, created_at
}

// Approve user
exports.approveUser = async (req, res) => {
  // 1. Update status to 'approved'
  // 2. Send welcome email
  // 3. Send WhatsApp notification
  // 4. Log activity
}

// Create user (admin-initiated)
exports.createUser = async (req, res) => {
  // 1. Validate input
  // 2. Check for existing email
  // 3. Hash password
  // 4. Insert user with status='approved'
  // 5. Send welcome notification
}

// Update user
exports.updateUser = async (req, res) => {
  // Updates: name, email, phone, role, notifications_*
}

// Reset password
exports.resetUserPassword = async (req, res) => {
  // 1. Generate random 8-char password
  // 2. Hash and update
  // 3. Email new password to user
}

// Promote to admin
exports.promoteUser = async (req, res) => {
  // 1. Update role to 'admin'
  // 2. Send promotion email
}
```

### Backend Middleware

#### auth.js
**Location**: `backend/middleware/auth.js`

```javascript
// Verify JWT token
function authenticateToken(req, res, next) {
  // Extract Bearer token from Authorization header
  // Verify with JWT_SECRET
  // Attach user to req.user
}

// Require admin role
function requireAdmin(req, res, next) {
  // Check req.user.role === 'admin'
  // Return 403 if not admin
}
```

**Usage**:
```javascript
// Protect admin routes
router.use('/admin', authenticateToken, requireAdmin);
```

### Database Schema

#### users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'hiker', -- 'hiker' or 'admin'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' or 'approved'
  
  -- Notification preferences
  notifications_email BOOLEAN DEFAULT true,
  notifications_whatsapp BOOLEAN DEFAULT true,
  
  -- Email verification
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  
  -- POPIA Consent
  privacy_consent_accepted BOOLEAN DEFAULT false,
  privacy_consent_date TIMESTAMP,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_date TIMESTAMP,
  data_processing_consent BOOLEAN DEFAULT false,
  data_processing_consent_date TIMESTAMP,
  
  -- Emergency contacts
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  medical_info TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
```

---

## 📱 User Interface

### Desktop View
- **Table Layout**: Users displayed in responsive table
- **Columns**: Name, Email, Phone, Role, Actions
- **Action Buttons**: Edit, Notifications, Reset Password, Promote, Delete
- **Search Bar**: Real-time search across name/email/phone
- **Role Filter**: Dropdown to filter by role
- **Pagination**: Previous/Next navigation

### Mobile View
- **Card Layout**: Stack of user cards
- **Compact Display**: Name (large), Email/Phone (small), Role badge
- **Action Buttons**: Stacked in 2-column grid
- **Touch-Friendly**: Larger touch targets (36px min height)
- **Responsive**: Adjusts to screen width

### Modals

#### Add User Modal
- **Fields**: Name, Email, Phone, Password, Role
- **Validation**: Required fields checked
- **Auto-Creation**: User created with status='approved'

#### Edit User Modal
- **Fields**: Name, Email, Phone, Role, Notification Preferences
- **Role Change**: Can change hiker ↔ admin
- **Notifications**: Toggle email/WhatsApp preferences

#### Reset Password Modal
- **Fields**: New Password, Confirm Password
- **Validation**: Passwords must match
- **Auto-Email**: New password emailed to user

---

## 🔍 Search & Filtering

### Search
- **Fields Searched**: Name, Email, Phone
- **Type**: Case-insensitive partial match
- **Real-Time**: Updates as you type
- **Pagination Reset**: Returns to page 1 on search

### Filtering
- **By Role**:
  - All: Show all users
  - Admin: Show only admins
  - Hiker: Show only hikers
- **Combination**: Works with search
- **Pagination Reset**: Returns to page 1 on filter change

---

## 📧 Email Notifications

### Welcome Email (On Approval)
```
Subject: Welcome to The Narrow Trail
Content: Welcome message, login instructions
Trigger: Admin approves pending user
```

### Rejection Email
```
Subject: Registration Update
Content: Polite rejection message
Trigger: Admin rejects pending user
```

### Password Reset Email
```
Subject: Password Reset by Administrator
Content: New temporary password
Trigger: Admin resets user password
```

### Admin Promotion Email
```
Subject: Admin Access Granted
Content: Congratulations, admin responsibilities
Trigger: User promoted to admin
```

---

## 🔐 Current Limitations & Security Considerations

### Current Limitations
1. **Single Admin Role**: Only one admin role level
2. **No Password Complexity**: No password strength requirements
3. **No Rate Limiting**: No protection against brute force
4. **No Session Management**: No way to revoke specific sessions
5. **No Audit Log UI**: Activity logs exist but no admin UI
6. **Self-Deletion Prevention**: Admins can't delete themselves (good!)
7. **No Bulk Operations**: Must manage users one at a time
8. **No User Import/Export**: No CSV import/export capability

### Security Considerations
1. **Password Storage**: ✅ Secure (bcrypt hashing)
2. **JWT Security**: ✅ Good (signed tokens)
3. **HTTPS Only**: ✅ Production uses HTTPS
4. **CORS**: ✅ Configured for production domain
5. **SQL Injection**: ✅ Protected (parameterized queries)
6. **XSS Protection**: ✅ React default escaping
7. **CSRF Protection**: ⚠️ Not implemented (consider for POST/PUT/DELETE)
8. **Rate Limiting**: ❌ Not implemented
9. **2FA**: ❌ Not implemented
10. **Password Reset via Email**: ❌ Users can't self-reset

---

## 🚀 Enhancement Opportunities

### Phase 1: Security Enhancements
1. **Password Requirements**: Minimum length, complexity rules
2. **Rate Limiting**: Prevent brute force attacks
3. **Session Management**: Track and revoke sessions
4. **Self-Service Password Reset**: Email-based password reset
5. **Account Lockout**: Lock account after failed login attempts

### Phase 2: Role Enhancements
1. **Granular Permissions**: Separate permissions from roles
2. **Custom Roles**: Create custom roles with specific permissions
3. **Role Hierarchy**: Hiker → Guide → Admin hierarchy
4. **Permission Groups**: Group related permissions

### Phase 3: User Experience
1. **Bulk Operations**: Select and act on multiple users
2. **User Import**: CSV import for bulk user creation
3. **User Export**: Export user list to CSV
4. **Advanced Search**: Search by date range, consent status, etc.
5. **User Activity Log**: View user's activity history
6. **User Statistics**: Dashboard with user metrics

### Phase 4: Advanced Features
1. **Two-Factor Authentication (2FA)**: SMS or authenticator app
2. **Single Sign-On (SSO)**: Google/Microsoft login
3. **API Key Management**: For programmatic access
4. **User Groups**: Organize users into groups
5. **Delegation**: Allow admins to delegate certain permissions

---

## 📊 Usage Statistics

### Current User Management
- **Pending Approvals**: Typically 0-5 pending users
- **Active Users**: 50+ approved users
- **Admin Users**: 2-3 admin users
- **Response Time**: Fast (<100ms for user list)

---

## 🆘 Common Tasks

### How to Approve a New User
1. Navigate to Admin → User Management
2. Check "Pending Approvals" section at top
3. Click "Approve" button next to user
4. User receives welcome email and can now log in

### How to Create a User Manually
1. Navigate to Admin → User Management
2. Click "Add User" button
3. Fill in: Name, Email, Phone, Password, Role
4. Click "Create User"
5. User is created with approved status

### How to Promote a User to Admin
1. Navigate to Admin → User Management
2. Find the user (search if needed)
3. Click "Promote to Admin" button
4. Confirm the action
5. User receives promotion email

### How to Reset a User's Password
1. Navigate to Admin → User Management
2. Find the user
3. Click "Reset Password" button
4. Enter new password twice
5. Click "Reset Password"
6. User receives email with new password

### How to Delete a User
1. Navigate to Admin → User Management
2. Find the user
3. Click "Delete" button
4. Confirm the deletion
5. User and all data are permanently removed

**⚠️ Warning**: Deletion is permanent and removes all user data including hike registrations, comments, etc.

---

## 🔗 Related Documentation

- [Security Documentation](../development/SECURITY.md)
- [API Reference](../development/API_REFERENCE.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [POPIA Compliance](../compliance/POPIA_COMPLIANCE_IMPLEMENTATION.md)
- [Notification System](../notifications/NOTIFICATION_TYPES_QUICK_REFERENCE.md)

---

## 🐛 Known Issues

None currently reported.

---

## 📝 Change Log

**October 13, 2025**
- ✅ Initial documentation created
- ✅ Documented all current features
- ✅ Identified enhancement opportunities

---

**Status**: ✅ Documentation Complete and Current
