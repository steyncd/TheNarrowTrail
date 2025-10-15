# 🔒 Security Architecture & Best Practices

**Last Updated**: October 13, 2025  
**Status**: ✅ Current Implementation Documented  

---

## 📋 Overview

This document outlines the security architecture, authentication/authorization mechanisms, and security best practices for The Narrow Trail Hiking Portal.

---

## 🎯 Security Layers

### 1. Network Security
- **HTTPS Only**: All production traffic over TLS/SSL
- **Cloud Run**: Google Cloud Run provides DDoS protection
- **Private Database**: PostgreSQL instance not publicly accessible
- **VPC**: Backend communicates with database via private network

### 2. Application Security
- **Authentication**: JWT-based token authentication
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: React's built-in escaping

### 3. Data Security
- **Password Hashing**: bcrypt with salt
- **Encrypted Connections**: TLS for all external communications
- **Secure Secrets**: Google Secret Manager for sensitive data
- **Data Retention**: POPIA-compliant data retention policies

---

## 🔐 Authentication System

### JWT Token-Based Authentication

#### Token Generation
**Location**: `backend/controllers/authController.js`

```javascript
// On successful login
const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email, 
    role: user.role 
  },
  JWT_SECRET,
  { expiresIn: '24h' } // Token expires in 24 hours
);
```

#### Token Payload
```javascript
{
  id: 123,           // User ID
  email: "user@example.com",
  role: "admin",     // or "hiker"
  iat: 1697000000,   // Issued at timestamp
  exp: 1697086400    // Expiration timestamp
}
```

#### Token Storage
- **Frontend**: Stored in AuthContext state (memory)
- **Not in LocalStorage**: Reduces XSS attack surface
- **Sent in Headers**: `Authorization: Bearer <token>`

#### Token Verification
**Location**: `backend/middleware/auth.js`

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
```

#### Token Expiration
- **Default**: 24 hours
- **Behavior**: User must log in again after expiration
- **No Refresh**: Current implementation doesn't support refresh tokens

---

## 🛡️ Authorization System

### Role-Based Access Control (RBAC)

#### Roles
1. **Hiker** (default)
   - View hikes
   - Register interest in hikes
   - View/edit own profile
   - Manage own notification preferences

2. **Admin**
   - All hiker permissions
   - User management
   - Hike management (create/edit/delete)
   - Analytics access
   - System configuration

#### Backend Authorization

**Middleware**: `requireAdmin`
```javascript
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
```

**Route Protection**:
```javascript
// All admin routes require authentication AND admin role
router.use('/admin', authenticateToken, requireAdmin);

// Example protected routes
router.get('/admin/users', adminController.getUsers);
router.post('/admin/users', adminController.createUser);
router.delete('/admin/users/:id', adminController.deleteUser);
```

#### Frontend Authorization

**PrivateRoute Component**:
**Location**: `frontend/src/components/auth/PrivateRoute.js`

```javascript
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  
  // Wait for auth to load
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Redirect if not authenticated
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  // Redirect if admin required but user is not admin
  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/hikes" replace />;
  }
  
  return children;
};
```

**Usage**:
```javascript
// Admin-only route
<Route 
  path="/admin/users" 
  element={
    <PrivateRoute requireAdmin={true}>
      <UsersPage />
    </PrivateRoute>
  } 
/>

// Authenticated user route
<Route 
  path="/profile" 
  element={
    <PrivateRoute>
      <ProfilePage />
    </PrivateRoute>
  } 
/>
```

---

## 🔑 Password Security

### Password Hashing

**Algorithm**: bcrypt
**Salt Rounds**: 10
**Location**: `backend/controllers/authController.js`, `adminController.js`

```javascript
const bcrypt = require('bcryptjs');

// Registration - hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Login - compare password
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### Password Storage
- ✅ **Never stored in plaintext**
- ✅ **Hashed before database insert**
- ✅ **Salt included in hash** (bcrypt auto-generates)
- ✅ **One-way hashing** (cannot be reversed)

### Password Reset

**Current Implementation**: Admin-initiated only

```javascript
// Generate random 8-character password
const newPassword = Math.random().toString(36).substring(2, 10);
const hashedPassword = await bcrypt.hash(newPassword, 10);

// Update in database
await pool.query(
  'UPDATE users SET password = $1 WHERE id = $2',
  [hashedPassword, userId]
);

// Email plain password to user
await sendEmail(user.email, 'Password Reset', `New password: ${newPassword}`);
```

**⚠️ Limitation**: No self-service password reset for users

---

## 🌐 API Security

### CORS Configuration

**Location**: `backend/server.js`

```javascript
const cors = require('cors');

// Development: Allow localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://helloliam.web.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
```

### Request Validation

#### Backend Validation
**Example**: Create user endpoint

```javascript
exports.createUser = async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  
  // 1. Required field validation
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ 
      error: 'Name, email, password, and phone are required' 
    });
  }
  
  // 2. Email uniqueness check
  const existingUser = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // 3. Proceed with creation
  // ...
};
```

#### Frontend Validation
**Example**: Add user form

```javascript
const handleAddUser = async () => {
  // Client-side validation
  if (!newUser.name || !newUser.email || !newUser.password) {
    setError('Name, email, and password are required');
    return;
  }
  
  // Additional validation could include:
  // - Email format validation
  // - Password strength requirements
  // - Phone number format
  
  // Make API call
  const result = await api.addUser(newUser, token);
  // ...
};
```

### SQL Injection Protection

**All queries use parameterized statements**:

✅ **Safe** (Parameterized):
```javascript
await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

❌ **Unsafe** (String concatenation - NOT USED):
```javascript
// NEVER DO THIS
await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

---

## 🚫 Protection Against Common Attacks

### 1. SQL Injection
**Status**: ✅ Protected
**Method**: Parameterized queries everywhere
**Example**:
```javascript
// SAFE - parameters are escaped
await pool.query(
  'UPDATE users SET role = $1 WHERE id = $2',
  ['admin', userId]
);
```

### 2. XSS (Cross-Site Scripting)
**Status**: ✅ Protected (mostly)
**Method**: React's built-in escaping
**Considerations**:
- React escapes all user input in JSX by default
- Avoid `dangerouslySetInnerHTML`
- Sanitize user input before storing

### 3. CSRF (Cross-Site Request Forgery)
**Status**: ⚠️ Not specifically protected
**Mitigation**: SameSite cookies (not currently used)
**Risk**: Medium (JWT in Authorization header reduces risk)
**Recommendation**: Consider CSRF tokens for state-changing operations

### 4. Brute Force Attacks
**Status**: ❌ Not protected
**Current**: No rate limiting on login attempts
**Risk**: High
**Recommendation**: Implement rate limiting (see Enhancement Plan)

### 5. Session Hijacking
**Status**: ⚠️ Partially protected
**Mitigation**: 
- HTTPS (encrypted transmission)
- JWT expiration (24 hours)
- No localStorage (reduces XSS risk)
**Missing**: 
- No session revocation
- No device tracking
- No concurrent session limits

### 6. Man-in-the-Middle (MITM)
**Status**: ✅ Protected in production
**Method**: HTTPS/TLS for all communications
**Certificate**: Managed by Google Cloud Run / Firebase

### 7. DDoS (Distributed Denial of Service)
**Status**: ✅ Protected
**Method**: Google Cloud Run built-in DDoS protection
**Additional**: Cloud Load Balancing distributes traffic

---

## 🔒 Secret Management

### Google Secret Manager

**Secrets Stored**:
1. `db-password` - PostgreSQL password
2. `jwt-secret` - JWT signing key
3. `sendgrid-key` - Email service API key
4. `sendgrid-from-email` - Verified sender email
5. `openweather-api-key` - Weather API key
6. `twilio-sid` - Twilio account SID
7. `twilio-token` - Twilio auth token
8. `twilio-whatsapp-number` - Twilio WhatsApp number

**Access**:
- Secrets accessed at runtime via Secret Manager API
- Not stored in code or environment files
- Cloud Run service account has read access

**Local Development**:
- Developers use `.env.local` file (gitignored)
- Never commit secrets to Git
- Each developer has own development credentials

---

## 📝 Activity Logging

### Security-Related Logging

**Location**: `backend/utils/activityLogger.js`

**Logged Activities**:
```javascript
// User approval
await logActivity(
  adminUserId,
  'approve_user',
  'user',
  targetUserId,
  JSON.stringify({ user_name, user_email }),
  ipAddress
);

// User deletion
await logActivity(
  adminUserId,
  'delete_user',
  'user',
  targetUserId,
  JSON.stringify({ user_name, user_email }),
  ipAddress
);

// Login attempts
await logActivity(
  userId,
  'login',
  'auth',
  null,
  JSON.stringify({ success: true }),
  ipAddress
);
```

**Database Table**: `activity_logs`
```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details TEXT,
  ip_address VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Security Best Practices (Current)

### ✅ What We Do Well

1. **Password Hashing**: bcrypt with proper salt rounds
2. **Parameterized Queries**: All database queries use parameters
3. **HTTPS**: Production traffic encrypted
4. **Secret Management**: Secrets in Google Secret Manager
5. **JWT Security**: Tokens signed and verified
6. **Role-Based Access**: Admin routes protected
7. **CORS Configuration**: Origin whitelist in place
8. **Input Validation**: Backend validates all inputs
9. **Private Database**: Database not publicly accessible
10. **Activity Logging**: Security events logged

### ⚠️ Areas for Improvement

1. **Rate Limiting**: No protection against brute force
2. **CSRF Protection**: No CSRF tokens
3. **Password Complexity**: No password strength requirements
4. **Account Lockout**: No automatic lockout after failed attempts
5. **Session Management**: No session revocation capability
6. **2FA**: No two-factor authentication
7. **Password Reset**: No self-service password reset
8. **Security Headers**: Missing some security headers
9. **API Rate Limiting**: No API request throttling
10. **Audit Log UI**: Logs exist but no admin interface

---

## 🚀 Security Enhancement Plan

### Phase 1: Critical Security (High Priority)

#### 1. Rate Limiting
**Goal**: Prevent brute force attacks
**Implementation**:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, authController.login);
```

#### 2. Password Strength Requirements
**Goal**: Enforce strong passwords
**Rules**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Implementation**:
```javascript
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  return password.length >= minLength && 
         hasUppercase && hasLowercase && 
         hasNumber && hasSpecial;
}
```

#### 3. Account Lockout
**Goal**: Lock account after failed login attempts
**Implementation**:
- Add `failed_login_attempts` and `locked_until` to users table
- Increment counter on failed login
- Lock account for 30 minutes after 5 attempts
- Reset counter on successful login

#### 4. Security Headers
**Goal**: Add security-related HTTP headers
**Implementation**:
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Phase 2: Enhanced Security (Medium Priority)

#### 5. Self-Service Password Reset
**Goal**: Allow users to reset their own passwords
**Flow**:
1. User clicks "Forgot Password"
2. Enter email address
3. System sends reset link to email
4. Link contains time-limited token
5. User clicks link, enters new password
6. Password updated, old token invalidated

#### 6. Session Management
**Goal**: Track and revoke active sessions
**Features**:
- Store session ID with JWT
- Database table for active sessions
- Endpoint to revoke session
- UI to view active sessions
- Option to "Log out all devices"

#### 7. Two-Factor Authentication (2FA)
**Goal**: Add second authentication factor
**Methods**:
- SMS code (via Twilio)
- Authenticator app (TOTP)
- Email code (backup method)

**Implementation**:
- Add `2fa_enabled` and `2fa_secret` to users table
- Generate QR code for setup
- Verify code on login

#### 8. CSRF Protection
**Goal**: Prevent cross-site request forgery
**Implementation**:
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply to state-changing routes
app.post('/api/admin/users', csrfProtection, adminController.createUser);
app.put('/api/admin/users/:id', csrfProtection, adminController.updateUser);
app.delete('/api/admin/users/:id', csrfProtection, adminController.deleteUser);
```

### Phase 3: Advanced Security (Lower Priority)

#### 9. API Rate Limiting
**Goal**: Prevent API abuse
**Implementation**:
- Different limits for authenticated vs anonymous
- Per-endpoint rate limits
- IP-based and user-based limiting

#### 10. Security Audit Log UI
**Goal**: Admin interface for security events
**Features**:
- View all login attempts
- Filter by user, action, date
- Export audit logs
- Alert on suspicious activity

#### 11. Database Encryption at Rest
**Goal**: Encrypt sensitive data in database
**Current**: Cloud SQL encryption at rest (Google-managed)
**Enhancement**: Application-level encryption for PII

#### 12. Content Security Policy (CSP)
**Goal**: Prevent XSS attacks
**Implementation**:
- Define strict CSP headers
- Whitelist approved script sources
- Report CSP violations

---

## 📋 Security Checklist

### Deployment Security
- [x] HTTPS enabled
- [x] Secrets in Secret Manager
- [x] Database not publicly accessible
- [x] CORS properly configured
- [ ] Security headers configured (helmet)
- [ ] Rate limiting enabled
- [ ] API monitoring enabled

### Code Security
- [x] Parameterized SQL queries
- [x] Password hashing (bcrypt)
- [x] JWT token verification
- [x] Input validation
- [ ] Password strength requirements
- [ ] CSRF protection
- [ ] Security linting (eslint-plugin-security)

### Authentication Security
- [x] JWT expiration
- [x] Role-based access control
- [ ] Account lockout
- [ ] Password reset flow
- [ ] 2FA option
- [ ] Session management

### Monitoring
- [x] Activity logging
- [ ] Failed login alerts
- [ ] Suspicious activity detection
- [ ] Security audit log UI
- [ ] Automated security scanning

---

## 🔗 Related Documentation

- [User Management](../features/USER_MANAGEMENT.md)
- [API Reference](API_REFERENCE.md) (to be created)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md)

---

## 📞 Security Contacts

**Report Security Issues**:
- Email: security@thenarrowtrail.org (if configured)
- Contact admin directly
- Create private GitHub issue

**Response Time**: 24 hours for critical issues

---

## 📝 Change Log

**October 13, 2025**
- ✅ Initial security documentation created
- ✅ Documented current security measures
- ✅ Identified enhancement opportunities
- ✅ Created phased enhancement plan

---

**Status**: ✅ Documentation Complete  
**Next Review**: November 13, 2025  
**Security Level**: ⚠️ Adequate for current use, enhancements recommended
