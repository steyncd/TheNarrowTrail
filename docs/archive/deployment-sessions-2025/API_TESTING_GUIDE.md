# API Endpoint Testing Guide

## Prerequisites
- ✅ PostgreSQL database running (Docker container: hiking_portal_db)
- ✅ Backend server running on port 5000
- ⏳ Need to test all endpoints

## Manual API Testing Commands

### 1. Health Check
```powershell
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-14T...",
  "database": "connected"
}
```

---

### 2. Login (Get Auth Token)

First, you need credentials. Try these default accounts:
- Admin: `admin@example.com` / `admin123`
- Test user: Check your database for actual users

```powershell
$body = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "admin@example.com",
    ...
  }
}
```

**Save the token for subsequent requests!**

---

### 3. Get Current User's Permissions

Replace `YOUR_TOKEN_HERE` with the token from login:

```powershell
$token = "YOUR_TOKEN_HERE"

curl http://localhost:5000/api/permissions/user/permissions `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "permissions": [
    "view_users",
    "manage_users",
    "view_hikes",
    ...
  ],
  "roles": ["admin"]
}
```

---

### 4. List All Permissions

```powershell
curl http://localhost:5000/api/permissions/permissions `
  -H "Authorization: Bearer $token"
```

**Expected Response:** Array of 35+ permission objects
```json
[
  {
    "permission_id": 1,
    "name": "view_users",
    "description": "View user list and profiles",
    "category": "user_management",
    "created_at": "..."
  },
  ...
]
```

---

### 5. List All Roles

```powershell
curl http://localhost:5000/api/permissions/roles `
  -H "Authorization: Bearer $token"
```

**Expected Response:** Array of 4 roles with permission counts
```json
[
  {
    "role_id": 1,
    "name": "admin",
    "description": "Full system access",
    "permission_count": 35
  },
  {
    "role_id": 2,
    "name": "hiker",
    "description": "Standard hiker permissions",
    "permission_count": 12
  },
  ...
]
```

---

### 6. User Management with Pagination

**Test basic pagination:**
```powershell
curl "http://localhost:5000/api/admin/users?page=1&limit=5" `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "users": [...],
  "pagination": {
    "total": 50,
    "currentPage": 1,
    "totalPages": 10,
    "limit": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Test page 2:**
```powershell
curl "http://localhost:5000/api/admin/users?page=2&limit=5" `
  -H "Authorization: Bearer $token"
```

---

### 7. Advanced Search

**Search by name:**
```powershell
curl "http://localhost:5000/api/admin/users?search=john&limit=10" `
  -H "Authorization: Bearer $token"
```

**Filter by status:**
```powershell
curl "http://localhost:5000/api/admin/users?status=approved&limit=10" `
  -H "Authorization: Bearer $token"
```

**Sort by date:**
```powershell
curl "http://localhost:5000/api/admin/users?sortBy=created_at&sortOrder=desc&limit=10" `
  -H "Authorization: Bearer $token"
```

**Combined filters:**
```powershell
curl "http://localhost:5000/api/admin/users?search=test&status=approved&sortBy=created_at&sortOrder=desc&limit=10" `
  -H "Authorization: Bearer $token"
```

---

### 8. Get User's Roles

```powershell
curl "http://localhost:5000/api/permissions/user/1/roles" `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "userId": 1,
  "roles": [
    {
      "role_id": 1,
      "name": "admin",
      "description": "Full system access",
      "assigned_at": "..."
    }
  ]
}
```

---

### 9. Assign Role to User (Admin only)

```powershell
$body = @{
    roleIds = @(2, 3)
} | ConvertTo-Json

curl -X POST "http://localhost:5000/api/permissions/user/5/roles" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Response:**
```json
{
  "message": "Roles assigned successfully",
  "userId": 5,
  "rolesAssigned": [2, 3]
}
```

---

### 10. Get Role Details

```powershell
curl "http://localhost:5000/api/permissions/roles/1" `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "role_id": 1,
  "name": "admin",
  "description": "Full system access",
  "permissions": [
    {
      "permission_id": 1,
      "name": "view_users",
      "description": "...",
      "category": "user_management"
    },
    ...
  ]
}
```

---

### 11. Update Role Permissions (Admin only)

```powershell
$body = @{
    permissionIds = @(1, 2, 3, 4, 5)
} | ConvertTo-Json

curl -X PUT "http://localhost:5000/api/permissions/roles/2/permissions" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $body
```

---

### 12. Check User Has Permission

```powershell
curl "http://localhost:5000/api/permissions/user/permissions/view_users" `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "hasPermission": true,
  "permission": "view_users"
}
```

---

## Quick Test Script

Run all tests quickly (PowerShell):

```powershell
# 1. Health Check
Write-Host "`n=== Test 1: Health Check ===" -ForegroundColor Cyan
curl http://localhost:5000/health

# 2. Login (REPLACE WITH YOUR ACTUAL CREDENTIALS)
Write-Host "`n=== Test 2: Login ===" -ForegroundColor Cyan
$loginBody = @{ email = "admin@example.com"; password = "admin123" } | ConvertTo-Json
$loginResponse = curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d $loginBody
$token = ($loginResponse | ConvertFrom-Json).token

if ($token) {
    Write-Host "✅ Login successful! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
    
    # 3. Get User Permissions
    Write-Host "`n=== Test 3: User Permissions ===" -ForegroundColor Cyan
    curl http://localhost:5000/api/permissions/user/permissions -H "Authorization: Bearer $token"
    
    # 4. List Permissions
    Write-Host "`n=== Test 4: All Permissions ===" -ForegroundColor Cyan
    curl http://localhost:5000/api/permissions/permissions -H "Authorization: Bearer $token"
    
    # 5. List Roles
    Write-Host "`n=== Test 5: All Roles ===" -ForegroundColor Cyan
    curl http://localhost:5000/api/permissions/roles -H "Authorization: Bearer $token"
    
    # 6. Paginated Users
    Write-Host "`n=== Test 6: Paginated Users ===" -ForegroundColor Cyan
    curl "http://localhost:5000/api/admin/users?page=1&limit=5" -H "Authorization: Bearer $token"
    
    # 7. Search Users
    Write-Host "`n=== Test 7: Search Users ===" -ForegroundColor Cyan
    curl "http://localhost:5000/api/admin/users?search=test&limit=5" -H "Authorization: Bearer $token"
    
    Write-Host "`n✅ All tests completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Login failed - check credentials" -ForegroundColor Red
}
```

---

## Checklist

### Core Functionality
- [ ] Health endpoint responds
- [ ] Login returns valid token
- [ ] Can retrieve user permissions
- [ ] Can list all permissions (35+)
- [ ] Can list all roles (4)

### Pagination
- [ ] Page 1 returns correct number of users
- [ ] Page 2 returns different users
- [ ] Pagination metadata is accurate
- [ ] Respects limit parameter

### Search & Filters
- [ ] Search by name works
- [ ] Filter by status works
- [ ] Sort by date works
- [ ] Combined filters work

### Permission System
- [ ] Can view user's roles
- [ ] Can assign roles (admin only)
- [ ] Can view role details
- [ ] Can update role permissions (admin only)
- [ ] Permission checks block unauthorized access

### Performance
- [ ] Large queries respond < 1 second
- [ ] Filtered searches respond < 1 second
- [ ] Permission lookups respond < 500ms

### Backward Compatibility
- [ ] Old endpoints still work
- [ ] `is_admin` field still present
- [ ] Existing clients not broken

---

## Troubleshooting

### "Cannot connect to server"
```powershell
# Check if server is running
Test-NetConnection -ComputerName localhost -Port 5000

# Start server if needed
cd C:\hiking-portal\backend
npm start
```

### "Unauthorized" or "Invalid token"
- Token may have expired
- Re-login to get fresh token
- Check token is being passed correctly in Authorization header

### "Permission denied"
- User doesn't have required permission
- Check user's roles: `GET /api/permissions/user/permissions`
- Assign appropriate role if needed

### "Database connection failed"
```powershell
# Check if Docker container is running
docker ps | Select-String hiking_portal_db

# Start container if needed
docker start hiking_portal_db
```

---

**Created:** October 14, 2025  
**Purpose:** Manual API endpoint testing for permission system  
**Server:** http://localhost:5000  
**Authentication:** Required for all endpoints except /health
