# 👥 User Management Enhancement Plan

**Date**: October 13, 2025  
**Status**: 📋 Planning Phase  
**Priority**: HIGH  

---

## 🎯 Goals

Enhance the user management system to be more **performant**, **secure**, **usable**, and feature-rich with proper **role-based access control** and **granular permissions**.

---

## 📊 Current State Assessment

### Strengths ✅
- Basic user management works well
- Admin approval workflow functional
- Role-based routing protection
- Notification preferences per user
- POPIA consent tracking
- Responsive UI (desktop/mobile)

### Weaknesses ⚠️
- **Performance**: All users loaded at once (not paginated on backend)
- **Security**: No password strength requirements, no rate limiting, no 2FA
- **Roles**: Only two roles (admin/hiker), no granular permissions
- **UX**: No bulk operations, no user import/export
- **Search**: Client-side only, slow with many users
- **Audit**: Activity logs exist but no UI to view them

---

## 🚀 Enhancement Phases

### Phase 1: Performance Optimization (Week 1)

#### 1.1 Backend Pagination
**Problem**: Frontend loads ALL users, then paginates client-side
**Impact**: Slow with 100+ users
**Solution**: Server-side pagination

**Backend Changes**:
```javascript
// GET /api/admin/users?page=1&limit=10&search=john&role=hiker&sort=name&order=asc

exports.getUsers = async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    role = 'all',
    sort = 'name',
    order = 'asc'
  } = req.query;
  
  const offset = (page - 1) * limit;
  
  // Build WHERE clause
  let whereConditions = ["status = 'approved'"];
  let params = [];
  let paramCounter = 1;
  
  if (search) {
    whereConditions.push(
      `(name ILIKE $${paramCounter} OR email ILIKE $${paramCounter} OR phone ILIKE $${paramCounter})`
    );
    params.push(`%${search}%`);
    paramCounter++;
  }
  
  if (role !== 'all') {
    whereConditions.push(`role = $${paramCounter}`);
    params.push(role);
    paramCounter++;
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
    params
  );
  const totalUsers = parseInt(countResult.rows[0].count);
  
  // Get paginated users
  const usersResult = await pool.query(
    `SELECT id, name, email, phone, role, 
            notifications_email, notifications_whatsapp, created_at
     FROM users
     WHERE ${whereClause}
     ORDER BY ${sort} ${order}
     LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
    [...params, limit, offset]
  );
  
  res.json({
    users: usersResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit)
    }
  });
};
```

**Frontend Changes**:
```javascript
// Update UserManagement.js to use server-side pagination
const fetchUsers = async () => {
  try {
    setLoading(true);
    const data = await api.getUsers(
      token,
      userCurrentPage,
      usersPerPage,
      userSearchTerm,
      userRoleFilter,
      sortField,
      sortOrder
    );
    setUsers(data.users);
    setPagination(data.pagination);
  } catch (err) {
    console.error('Error fetching users:', err);
  } finally {
    setLoading(false);
  }
};

// Debounce search to avoid too many requests
useEffect(() => {
  const debounce = setTimeout(() => {
    fetchUsers();
  }, 300);
  return () => clearTimeout(debounce);
}, [userSearchTerm, userRoleFilter, userCurrentPage, sortField, sortOrder]);
```

**Benefits**:
- ✅ Fast with any number of users
- ✅ Reduced data transfer
- ✅ Database handles search/filter/sort
- ✅ Better user experience

#### 1.2 Database Indexing
**Add indexes for common queries**:

```sql
-- Already exists
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- New indexes for search/sort
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_status_role ON users(status, role);

-- Full-text search index (optional, for advanced search)
CREATE INDEX IF NOT EXISTS idx_users_search 
ON users USING gin(to_tsvector('english', name || ' ' || email));
```

#### 1.3 Response Caching
**Cache frequently accessed data**:

```javascript
const NodeCache = require('node-cache');
const userStatsCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

exports.getUserStats = async (req, res) => {
  const cacheKey = 'user_stats';
  const cached = userStatsCache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const stats = await calculateUserStats();
  userStatsCache.set(cacheKey, stats);
  res.json(stats);
};
```

### Phase 2: Security Enhancements (Week 2)

#### 2.1 Password Strength Requirements
**Implementation**:

```javascript
// Backend validation
function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Use in registration and password reset
exports.register = async (req, res) => {
  const { password } = req.body;
  
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Password does not meet requirements',
      details: validation.errors
    });
  }
  
  // Continue with registration...
};
```

**Frontend**:
```javascript
// Real-time password strength indicator
const PasswordStrengthIndicator = ({ password }) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  
  return (
    <div className="password-strength">
      <div className={`strength-bar strength-${strength}`}></div>
      <ul className="strength-checks">
        <li className={checks.length ? 'valid' : ''}>At least 8 characters</li>
        <li className={checks.uppercase ? 'valid' : ''}>One uppercase letter</li>
        <li className={checks.lowercase ? 'valid' : ''}>One lowercase letter</li>
        <li className={checks.number ? 'valid' : ''}>One number</li>
        <li className={checks.special ? 'valid' : ''}>One special character</li>
      </ul>
    </div>
  );
};
```

#### 2.2 Rate Limiting
**Install**:
```bash
npm install express-rate-limit
```

**Implementation**:
```javascript
const rateLimit = require('express-rate-limit');

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration rate limiter
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created from this IP, please try again later'
});

// API rate limiter (general)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please slow down'
});

// Apply limiters
app.post('/api/auth/login', loginLimiter, authController.login);
app.post('/api/auth/register', registrationLimiter, authController.register);
app.use('/api/', apiLimiter);
```

#### 2.3 Account Lockout
**Database Migration**:
```sql
ALTER TABLE users 
ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN locked_until TIMESTAMP;
```

**Implementation**:
```javascript
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Get user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const user = result.rows[0];
  
  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const minutesLeft = Math.ceil(
      (new Date(user.locked_until) - new Date()) / 60000
    );
    return res.status(423).json({ 
      error: `Account locked. Try again in ${minutesLeft} minutes` 
    });
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    // Increment failed attempts
    const newAttempts = (user.failed_login_attempts || 0) + 1;
    
    if (newAttempts >= 5) {
      // Lock account for 30 minutes
      await pool.query(
        `UPDATE users 
         SET failed_login_attempts = $1,
             locked_until = NOW() + INTERVAL '30 minutes'
         WHERE id = $2`,
        [newAttempts, user.id]
      );
      
      return res.status(423).json({ 
        error: 'Account locked due to too many failed attempts. Try again in 30 minutes' 
      });
    } else {
      // Just increment counter
      await pool.query(
        'UPDATE users SET failed_login_attempts = $1 WHERE id = $2',
        [newAttempts, user.id]
      );
      
      return res.status(401).json({ 
        error: `Invalid credentials. ${5 - newAttempts} attempts remaining` 
      });
    }
  }
  
  // Successful login - reset counter
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
    [user.id]
  );
  
  // Generate token and respond...
};
```

#### 2.4 Self-Service Password Reset
**Database Migration**:
```sql
ALTER TABLE users 
ADD COLUMN password_reset_token VARCHAR(255),
ADD COLUMN password_reset_expires TIMESTAMP;
```

**Backend Routes**:
```javascript
// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  const result = await pool.query(
    'SELECT id, name, email FROM users WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    // Don't reveal if email exists
    return res.json({ message: 'If email exists, reset link sent' });
  }
  
  const user = result.rows[0];
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour
  
  await pool.query(
    'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
    [resetToken, resetExpires, user.id]
  );
  
  // Send reset email
  const resetUrl = `https://helloliam.web.app/reset-password/${resetToken}`;
  await sendEmail(
    user.email,
    'Password Reset Request',
    emailTemplates.passwordResetEmail(user.name, resetUrl)
  );
  
  res.json({ message: 'If email exists, reset link sent' });
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  // Validate password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Password does not meet requirements',
      details: validation.errors
    });
  }
  
  // Find user with valid token
  const result = await pool.query(
    `SELECT id, name, email FROM users 
     WHERE password_reset_token = $1 
     AND password_reset_expires > NOW()`,
    [token]
  );
  
  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }
  
  const user = result.rows[0];
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update password and clear reset token
  await pool.query(
    `UPDATE users 
     SET password = $1, 
         password_reset_token = NULL, 
         password_reset_expires = NULL
     WHERE id = $2`,
    [hashedPassword, user.id]
  );
  
  // Send confirmation email
  await sendEmail(
    user.email,
    'Password Changed',
    emailTemplates.passwordChangedEmail(user.name)
  );
  
  res.json({ message: 'Password reset successful' });
};
```

### Phase 3: Enhanced Roles & Permissions (Week 3)

#### 3.1 Permission System
**Database Migration**:
```sql
-- Permissions table
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Roles table (replaces simple role VARCHAR)
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- System roles can't be deleted
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role-Permission mapping
CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User-Role mapping (many-to-many for flexibility)
CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by INTEGER REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

-- Seed permissions
INSERT INTO permissions (name, description, category) VALUES
('users.view', 'View user list', 'users'),
('users.create', 'Create new users', 'users'),
('users.edit', 'Edit user details', 'users'),
('users.delete', 'Delete users', 'users'),
('users.approve', 'Approve pending users', 'users'),
('users.promote', 'Promote users to admin', 'users'),
('users.reset_password', 'Reset user passwords', 'users'),

('hikes.view', 'View hikes', 'hikes'),
('hikes.create', 'Create hikes', 'hikes'),
('hikes.edit', 'Edit hikes', 'hikes'),
('hikes.delete', 'Delete hikes', 'hikes'),
('hikes.manage_attendance', 'Manage hike attendance', 'hikes'),

('analytics.view', 'View analytics', 'analytics'),
('analytics.export', 'Export analytics data', 'analytics'),

('notifications.view', 'View notification log', 'notifications'),
('notifications.send', 'Send notifications', 'notifications'),
('notifications.configure', 'Configure notification settings', 'notifications'),

('settings.view', 'View system settings', 'settings'),
('settings.edit', 'Edit system settings', 'settings'),

('reports.view', 'View reports', 'reports'),
('reports.export', 'Export reports', 'reports');

-- Seed roles
INSERT INTO roles (name, description, is_system) VALUES
('admin', 'Full system access', true),
('hiker', 'Standard user', true),
('guide', 'Hike leader with additional permissions', false),
('moderator', 'Can manage users but not system settings', false);

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'admin';

-- Hiker gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'hiker' 
AND p.name IN ('hikes.view');

-- Guide gets hike management permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'guide' 
AND p.name IN ('hikes.view', 'hikes.create', 'hikes.edit', 'hikes.manage_attendance');

-- Moderator gets user management permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'moderator' 
AND p.name IN ('users.view', 'users.approve', 'users.edit', 'hikes.view');
```

#### 3.2 Permission Middleware
**Backend**:
```javascript
// middleware/permissions.js
async function hasPermission(userId, permissionName) {
  const result = await pool.query(
    `SELECT COUNT(*) 
     FROM user_roles ur
     JOIN role_permissions rp ON ur.role_id = rp.role_id
     JOIN permissions p ON rp.permission_id = p.id
     WHERE ur.user_id = $1 AND p.name = $2`,
    [userId, permissionName]
  );
  
  return parseInt(result.rows[0].count) > 0;
}

function requirePermission(permissionName) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasAccess = await hasPermission(req.user.id, permissionName);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissionName
      });
    }
    
    next();
  };
}

module.exports = { hasPermission, requirePermission };
```

**Usage**:
```javascript
const { requirePermission } = require('../middleware/permissions');

// Protect routes with specific permissions
router.get('/admin/users', 
  authenticateToken, 
  requirePermission('users.view'), 
  adminController.getUsers
);

router.post('/admin/users', 
  authenticateToken, 
  requirePermission('users.create'), 
  adminController.createUser
);

router.delete('/admin/users/:id', 
  authenticateToken, 
  requirePermission('users.delete'), 
  adminController.deleteUser
);
```

#### 3.3 Frontend Permission Checks
**Context**:
```javascript
// contexts/PermissionContext.js
const PermissionContext = createContext();

export function PermissionProvider({ children }) {
  const { currentUser, token } = useAuth();
  const [permissions, setPermissions] = useState([]);
  
  useEffect(() => {
    if (currentUser && token) {
      fetchUserPermissions();
    }
  }, [currentUser, token]);
  
  const fetchUserPermissions = async () => {
    try {
      const data = await api.getUserPermissions(token);
      setPermissions(data.permissions);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };
  
  const hasPermission = (permissionName) => {
    return permissions.includes(permissionName);
  };
  
  const hasAnyPermission = (...permissionNames) => {
    return permissionNames.some(p => permissions.includes(p));
  };
  
  const hasAllPermissions = (...permissionNames) => {
    return permissionNames.every(p => permissions.includes(p));
  };
  
  return (
    <PermissionContext.Provider value={{ 
      permissions, 
      hasPermission, 
      hasAnyPermission, 
      hasAllPermissions 
    }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
```

**Components**:
```javascript
// Conditional rendering based on permissions
import { usePermissions } from '../contexts/PermissionContext';

function UserManagement() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {hasPermission('users.view') && (
        <UserList />
      )}
      
      {hasPermission('users.create') && (
        <button onClick={handleAddUser}>Add User</button>
      )}
      
      {hasPermission('users.delete') && (
        <button onClick={handleDeleteUser}>Delete</button>
      )}
    </div>
  );
}
```

### Phase 4: UX Improvements (Week 4)

#### 4.1 Bulk Operations
**Features**:
- Select multiple users
- Bulk delete
- Bulk role assignment
- Bulk notification settings

**Implementation**:
```javascript
// Frontend
const [selectedUsers, setSelectedUsers] = useState([]);

const handleSelectAll = () => {
  if (selectedUsers.length === users.length) {
    setSelectedUsers([]);
  } else {
    setSelectedUsers(users.map(u => u.id));
  }
};

const handleBulkDelete = async () => {
  if (!confirm(`Delete ${selectedUsers.length} users?`)) return;
  
  try {
    await api.bulkDeleteUsers(selectedUsers, token);
    await fetchUsers();
    setSelectedUsers([]);
  } catch (err) {
    setError('Failed to delete users');
  }
};

const handleBulkRoleChange = async (newRole) => {
  try {
    await api.bulkUpdateRole(selectedUsers, newRole, token);
    await fetchUsers();
    setSelectedUsers([]);
  } catch (err) {
    setError('Failed to update roles');
  }
};

// Backend
exports.bulkDeleteUsers = async (req, res) => {
  const { userIds } = req.body;
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'User IDs required' });
  }
  
  // Prevent deleting self
  if (userIds.includes(req.user.id)) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  
  await pool.query(
    'DELETE FROM users WHERE id = ANY($1)',
    [userIds]
  );
  
  res.json({ message: `Deleted ${userIds.length} users` });
};
```

#### 4.2 User Import/Export
**CSV Import**:
```javascript
// Frontend
const handleImportCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const result = await api.importUsers(formData, token);
    alert(`Imported ${result.imported} users, ${result.skipped} skipped`);
    await fetchUsers();
  } catch (err) {
    setError('Failed to import users');
  }
};

// Backend
const multer = require('multer');
const csvParser = require('csv-parser');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/admin/users/import', 
  authenticateToken, 
  requirePermission('users.create'),
  upload.single('file'),
  async (req, res) => {
    const results = [];
    const errors = [];
    
    // Parse CSV
    const stream = Readable.from(req.file.buffer);
    stream
      .pipe(csvParser())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', async () => {
        let imported = 0;
        let skipped = 0;
        
        for (const row of results) {
          try {
            // Validate and create user
            await createUserFromCSV(row);
            imported++;
          } catch (err) {
            skipped++;
            errors.push({ row, error: err.message });
          }
        }
        
        res.json({ imported, skipped, errors });
      });
  }
);
```

**CSV Export**:
```javascript
// Frontend
const handleExportCSV = async () => {
  try {
    const blob = await api.exportUsers(token);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${Date.now()}.csv`;
    a.click();
  } catch (err) {
    setError('Failed to export users');
  }
};

// Backend
exports.exportUsers = async (req, res) => {
  const { Parser } = require('json2csv');
  
  const result = await pool.query(
    `SELECT name, email, phone, role, 
            notifications_email, notifications_whatsapp,
            created_at
     FROM users 
     WHERE status = 'approved' 
     ORDER BY name`
  );
  
  const parser = new Parser();
  const csv = parser.parse(result.rows);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  res.send(csv);
};
```

#### 4.3 Advanced Search
**Features**:
- Search by multiple fields
- Date range filtering
- Advanced filters (consent status, last login, etc.)

```javascript
// Frontend
const [advancedFilters, setAdvancedFilters] = useState({
  dateFrom: '',
  dateTo: '',
  consentStatus: 'all', // all, consented, missing
  lastLogin: 'all', // all, 30days, 60days, never
  emailVerified: 'all' // all, verified, unverified
});

// Backend
exports.getUsers = async (req, res) => {
  const { 
    search, role, 
    dateFrom, dateTo, 
    consentStatus, lastLogin, emailVerified 
  } = req.query;
  
  let whereConditions = ["status = 'approved'"];
  let params = [];
  let paramCounter = 1;
  
  // ... existing search/role filters ...
  
  if (dateFrom) {
    whereConditions.push(`created_at >= $${paramCounter}`);
    params.push(dateFrom);
    paramCounter++;
  }
  
  if (dateTo) {
    whereConditions.push(`created_at <= $${paramCounter}`);
    params.push(dateTo);
    paramCounter++;
  }
  
  if (consentStatus === 'consented') {
    whereConditions.push(
      'privacy_consent_accepted = true AND terms_accepted = true AND data_processing_consent = true'
    );
  } else if (consentStatus === 'missing') {
    whereConditions.push(
      'privacy_consent_accepted = false OR terms_accepted = false OR data_processing_consent = false'
    );
  }
  
  if (emailVerified === 'verified') {
    whereConditions.push('email_verified = true');
  } else if (emailVerified === 'unverified') {
    whereConditions.push('email_verified = false');
  }
  
  // ... continue with query ...
};
```

#### 4.4 Activity Log UI
**Component**:
```javascript
function UserActivityLog({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchActivities();
  }, [userId]);
  
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getUserActivity(userId, token);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="activity-log">
      <h5>Activity Log</h5>
      <div className="timeline">
        {activities.map(activity => (
          <div key={activity.id} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="activity-action">{activity.action}</div>
              <div className="activity-details">{activity.details}</div>
              <div className="activity-time">{formatDate(activity.timestamp)}</div>
              <div className="activity-ip">{activity.ip_address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Week 1: Performance ⚡
- [ ] Backend pagination endpoint
- [ ] Database indexes
- [ ] Frontend pagination updates
- [ ] Search debouncing
- [ ] Response caching
- [ ] Performance testing (aim for <200ms response)

### Week 2: Security 🔒
- [ ] Password strength validation
- [ ] Password strength UI indicator
- [ ] Rate limiting (login, registration, API)
- [ ] Account lockout mechanism
- [ ] Self-service password reset flow
- [ ] Security testing

### Week 3: Roles & Permissions 👥
- [ ] Database schema migration
- [ ] Permission system backend
- [ ] Permission middleware
- [ ] Role management UI
- [ ] Permission assignment UI
- [ ] Frontend permission context
- [ ] Update all protected routes
- [ ] Testing with different roles

### Week 4: UX Improvements ✨
- [ ] Bulk selection UI
- [ ] Bulk operations (delete, role change)
- [ ] CSV import functionality
- [ ] CSV export functionality
- [ ] Advanced search filters
- [ ] Activity log UI
- [ ] User statistics dashboard
- [ ] Mobile responsiveness testing

---

## 📊 Success Metrics

### Performance
- [ ] User list loads in <200ms (target: 100ms)
- [ ] Search returns results in <300ms
- [ ] Page size reduced by 80% (pagination)

### Security
- [ ] 0 brute force attempts succeed
- [ ] 100% password strength compliance
- [ ] Self-service password reset adoption rate >50%

### Usability
- [ ] Time to find user reduced by 60%
- [ ] Bulk operations save 80% time for multi-user tasks
- [ ] Admin user satisfaction score >8/10

### Functionality
- [ ] All permission scenarios tested
- [ ] All roles work correctly
- [ ] Import/export works with 1000+ users

---

## 🔧 Migration Strategy

### Database Migrations
1. Create backup of production database
2. Test migrations on staging
3. Run migrations during low-traffic period
4. Verify data integrity
5. Monitor performance post-migration

### Data Migration
```sql
-- Migrate existing users to new role system
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, 
       CASE WHEN u.role = 'admin' THEN (SELECT id FROM roles WHERE name = 'admin')
            ELSE (SELECT id FROM roles WHERE name = 'hiker')
       END,
       NOW()
FROM users u;
```

### Rollback Plan
- Keep old `role` column until new system verified
- Ability to rollback migrations
- Backup before each phase

---

## 🎯 Next Steps

1. ✅ Review and approve this plan
2. [ ] Set up development branch: `feature/user-management-v2`
3. [ ] Begin Phase 1: Performance optimization
4. [ ] Weekly progress reviews
5. [ ] User testing after each phase

---

**Plan Created**: October 13, 2025  
**Estimated Completion**: November 10, 2025 (4 weeks)  
**Assigned To**: Development Team  
**Status**: 📋 Awaiting Approval

