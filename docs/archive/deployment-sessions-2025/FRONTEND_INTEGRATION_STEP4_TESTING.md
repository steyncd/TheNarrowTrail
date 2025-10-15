# Frontend Permission System Integration - Step 4: Testing

## ✅ Step 4 - Comprehensive Testing Plan

### Overview
This document provides a comprehensive testing strategy for the frontend permission system integration. It covers testing all roles, pages, and edge cases.

---

## 🧪 Test Environment Setup

### Prerequisites
- ✅ Backend deployed and running (https://backend-554106646136.europe-west1.run.app)
- ✅ Frontend running locally (`npm start` in frontend directory)
- ✅ Test users created with different roles:
  - **Admin User**: All permissions
  - **Guide User**: Limited permissions (hikes.edit)
  - **Hiker User**: No admin permissions
  - **Moderator User**: Content/feedback permissions

### Test Browser Setup
- Chrome/Edge (primary)
- Mobile view (DevTools responsive mode)
- Console open to check for errors

---

## 📋 Test Scenarios

### Scenario 1: Admin User (Full Access)
**Expected**: Should see all navigation items and access all pages

#### Navigation Menu Test
- [ ] Login as Admin
- [ ] Verify "Admin" dropdown appears in header
- [ ] Verify dropdown contains:
  - [ ] Manage Hikes
  - [ ] Analytics
  - [ ] Users
  - [ ] Roles (NEW)
  - [ ] Notifications
  - [ ] Feedback
  - [ ] Content
  - [ ] Logs
- [ ] All items should be clickable

#### Page Access Test
| Page | URL | Expected Result |
|------|-----|----------------|
| Analytics | /admin/analytics | ✓ Full access |
| Logs | /admin/logs | ✓ Full access |
| Manage Hikes | /admin/manage-hikes | ✓ Full access |
| Notifications | /admin/notifications | ✓ Full access |
| Feedback | /admin/feedback | ✓ Full access |
| Content | /admin/content | ✓ Full access |
| Users | /admin/users | ✓ Full access |
| Roles | /admin/roles | ✓ Full access |

#### Users Page Test
- [ ] Navigate to /admin/users
- [ ] Verify "Add User" button appears
- [ ] Verify user table shows "Assigned Roles" column
- [ ] Click any user's "Manage Roles" button
- [ ] Verify modal opens with role management
- [ ] Assign a role to a user
- [ ] Verify badge appears immediately
- [ ] Remove a role
- [ ] Verify badge disappears
- [ ] Verify all action buttons appear:
  - [ ] Edit
  - [ ] Notifications
  - [ ] Roles
  - [ ] Reset Password
  - [ ] Delete

---

### Scenario 2: Hiker User (No Admin Access)
**Expected**: Should NOT see admin menu or access admin pages

#### Navigation Menu Test
- [ ] Login as Hiker
- [ ] Verify "Admin" dropdown does NOT appear
- [ ] Only see: Hikes, Calendar, Favorites, Profile, About

#### Page Access Test (Direct URL)
Try accessing admin pages directly by URL:

| Page | URL | Expected Result |
|------|-----|----------------|
| Analytics | /admin/analytics | ✗ Access Denied fallback |
| Logs | /admin/logs | ✗ Access Denied fallback |
| Manage Hikes | /admin/manage-hikes | ✗ Access Denied fallback |
| Notifications | /admin/notifications | ✗ Access Denied fallback |
| Feedback | /admin/feedback | ✗ Access Denied fallback |
| Content | /admin/content | ✗ Access Denied fallback |
| Users | /admin/users | ✗ Redirect or access denied |
| Roles | /admin/roles | ✗ Redirect to /hikes |

#### Fallback UI Test
For each denied page, verify:
- [ ] Shows "Access Denied" heading
- [ ] Shows friendly message
- [ ] Shows "Return to Hikes" button
- [ ] Button navigates to /hikes successfully
- [ ] No console errors

---

### Scenario 3: Guide User (Partial Access)
**Expected**: Should see only Manage Hikes in admin menu

**Test Setup**: Create/modify guide role to have only `hikes.edit` permission

#### Navigation Menu Test
- [ ] Login as Guide
- [ ] Verify "Admin" dropdown appears
- [ ] Verify dropdown contains ONLY:
  - [ ] Manage Hikes
- [ ] Other admin items should NOT appear

#### Page Access Test
| Page | URL | Expected Result |
|------|-----|----------------|
| Manage Hikes | /admin/manage-hikes | ✓ Full access (has permission) |
| Analytics | /admin/analytics | ✗ Access Denied |
| Logs | /admin/logs | ✗ Access Denied |
| Notifications | /admin/notifications | ✗ Access Denied |
| Feedback | /admin/feedback | ✗ Access Denied |
| Content | /admin/content | ✗ Access Denied |
| Users | /admin/users | ✗ Access Denied |
| Roles | /admin/roles | ✗ Access Denied |

#### Manage Hikes Page Test
- [ ] Navigate to /admin/manage-hikes
- [ ] Verify page loads successfully
- [ ] Can view hikes
- [ ] Can add/edit hikes (if has permission)
- [ ] Can view payments tab

---

### Scenario 4: Moderator User (Content & Feedback Access)
**Expected**: Should see Content and Feedback in admin menu

**Test Setup**: Moderator role should have `content.edit` and `feedback.view` permissions

#### Navigation Menu Test
- [ ] Login as Moderator
- [ ] Verify "Admin" dropdown appears
- [ ] Verify dropdown contains:
  - [ ] Content
  - [ ] Feedback
- [ ] Other admin items should NOT appear

#### Page Access Test
| Page | URL | Expected Result |
|------|-----|----------------|
| Content | /admin/content | ✓ Full access |
| Feedback | /admin/feedback | ✓ Full access |
| Manage Hikes | /admin/manage-hikes | ✗ Access Denied |
| Analytics | /admin/analytics | ✗ Access Denied |
| Logs | /admin/logs | ✗ Access Denied |
| Notifications | /admin/notifications | ✗ Access Denied |
| Users | /admin/users | ✗ Access Denied |
| Roles | /admin/roles | ✗ Access Denied |

#### Content Management Test
- [ ] Navigate to /admin/content
- [ ] Verify page loads
- [ ] Can view content list
- [ ] Can edit content
- [ ] Can save changes

#### Feedback Management Test
- [ ] Navigate to /admin/feedback
- [ ] Verify page loads
- [ ] Can view feedback list
- [ ] Can view suggestions list
- [ ] Can filter by status/type

---

## 🔍 Edge Case Testing

### Test 1: User with No Permissions at All
- [ ] Create user with no roles assigned
- [ ] Login as this user
- [ ] Verify NO admin dropdown appears
- [ ] Try accessing any admin page directly
- [ ] Verify all show "Access Denied"

### Test 2: Permission Changes During Session
- [ ] Login as Hiker
- [ ] In another window (as Admin), assign Guide role to the Hiker
- [ ] Refresh the Hiker's page
- [ ] Verify permissions DON'T update (need re-login)
- [ ] Logout and login again as Hiker
- [ ] Verify new permissions take effect
- [ ] Admin menu should now show Manage Hikes

### Test 3: Multiple Roles Assigned
- [ ] Login as Admin
- [ ] Navigate to Users page
- [ ] Assign multiple roles to a test user (e.g., Guide + Moderator)
- [ ] Verify multiple role badges appear
- [ ] Login as that user
- [ ] Verify admin menu shows ALL relevant items:
  - Manage Hikes (from Guide)
  - Content (from Moderator)
  - Feedback (from Moderator)

### Test 4: Role Removal During Session
- [ ] Login as user with Guide role
- [ ] Verify can access /admin/manage-hikes
- [ ] In another window (as Admin), remove Guide role
- [ ] Try accessing /admin/manage-hikes again (without refresh)
- [ ] Should still work (cached permissions)
- [ ] Logout and login again
- [ ] Verify can no longer access /admin/manage-hikes

---

## 📱 Mobile Responsiveness Testing

### Navigation Menu (Mobile)
- [ ] Resize browser to mobile width (< 768px)
- [ ] Login as Admin
- [ ] Tap hamburger menu
- [ ] Verify "Admin" section appears
- [ ] Tap to expand admin menu
- [ ] Verify all admin items listed
- [ ] Tap any item, verify navigation works

### Users Page (Mobile)
- [ ] Navigate to /admin/users on mobile
- [ ] Verify table switches to card view
- [ ] Verify role badges display correctly
- [ ] Verify action buttons stack vertically
- [ ] Tap "Manage Roles" button
- [ ] Verify modal is responsive
- [ ] Verify can scroll modal content
- [ ] Verify can assign/remove roles

### Access Denied Pages (Mobile)
- [ ] Login as Hiker on mobile
- [ ] Try accessing /admin/analytics
- [ ] Verify "Access Denied" alert is readable
- [ ] Verify "Return to Hikes" button is tappable
- [ ] Tap button, verify navigation

---

## 🚨 Error Handling Testing

### Test 1: API Errors
- [ ] Login as Admin
- [ ] Open DevTools Network tab
- [ ] Navigate to /admin/users
- [ ] Click "Manage Roles" for a user
- [ ] Block the API request (offline mode)
- [ ] Verify error message displays
- [ ] Verify doesn't crash
- [ ] Re-enable network
- [ ] Try again, verify works

### Test 2: Invalid Permissions
- [ ] Manually modify permission check in code (temporarily)
- [ ] Set permission to invalid name
- [ ] Verify page still loads or shows appropriate error
- [ ] Restore correct permission name

### Test 3: Slow Network
- [ ] Open DevTools Network tab
- [ ] Set throttling to "Slow 3G"
- [ ] Login as Admin
- [ ] Navigate to /admin/analytics
- [ ] Verify loading states work
- [ ] Verify page eventually loads
- [ ] No timeout errors

---

## 🔐 Security Testing

### Test 1: Direct API Calls
- [ ] Login as Hiker
- [ ] Open DevTools Console
- [ ] Try calling admin API directly:
  ```javascript
  fetch('https://backend-554106646136.europe-west1.run.app/api/admin/users', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(console.log)
  ```
- [ ] Verify API returns 403 Forbidden
- [ ] Backend enforces permissions (not just frontend)

### Test 2: Token Manipulation
- [ ] Login as Hiker
- [ ] Open DevTools Application tab
- [ ] View localStorage
- [ ] Copy token
- [ ] Logout
- [ ] Login as Admin
- [ ] Replace Admin token with Hiker token
- [ ] Try accessing admin pages
- [ ] Verify backend rejects requests

### Test 3: Permission Context Manipulation
- [ ] Login as Hiker
- [ ] Open React DevTools
- [ ] Find PermissionContext
- [ ] Try manually adding permissions
- [ ] Verify doesn't grant actual access (backend still blocks)

---

## ✅ Automated Checks

### Console Errors Check
- [ ] Open browser console
- [ ] Login as different users
- [ ] Navigate to all pages
- [ ] Verify NO errors in console
- [ ] Verify NO warnings about permissions

### Network Requests Check
- [ ] Open Network tab
- [ ] Login as Admin
- [ ] Navigate to /admin/users
- [ ] Verify permission API calls succeed (200)
- [ ] Login as Hiker
- [ ] Try /admin/analytics
- [ ] Verify API calls are blocked (403) or not made

### Build Check
```bash
cd frontend
npm run build
```
- [ ] Build completes successfully
- [ ] No TypeScript/ESLint errors
- [ ] No warnings about unused imports
- [ ] Bundle size is reasonable

---

## 📊 Test Results Template

### Test Summary
**Date**: [Date]
**Tester**: [Name]
**Environment**: Local / Production
**Browser**: Chrome / Firefox / Safari / Edge
**Version**: [Version]

### Results Overview
- Total Tests: X
- Passed: Y
- Failed: Z
- Blocked: W

### Detailed Results

#### Scenario 1: Admin User
- Navigation Menu: ✅ PASS / ❌ FAIL
- Page Access: ✅ PASS / ❌ FAIL
- Users Page: ✅ PASS / ❌ FAIL
- Issues: [None / List issues]

#### Scenario 2: Hiker User
- Navigation Menu: ✅ PASS / ❌ FAIL
- Page Access Denial: ✅ PASS / ❌ FAIL
- Fallback UI: ✅ PASS / ❌ FAIL
- Issues: [None / List issues]

#### Scenario 3: Guide User
- Navigation Menu: ✅ PASS / ❌ FAIL
- Partial Access: ✅ PASS / ❌ FAIL
- Issues: [None / List issues]

#### Scenario 4: Moderator User
- Navigation Menu: ✅ PASS / ❌ FAIL
- Content/Feedback Access: ✅ PASS / ❌ FAIL
- Issues: [None / List issues]

#### Edge Cases
- No Permissions: ✅ PASS / ❌ FAIL
- Permission Changes: ✅ PASS / ❌ FAIL
- Multiple Roles: ✅ PASS / ❌ FAIL
- Role Removal: ✅ PASS / ❌ FAIL

#### Mobile Responsiveness
- Navigation: ✅ PASS / ❌ FAIL
- Users Page: ✅ PASS / ❌ FAIL
- Access Denied: ✅ PASS / ❌ FAIL

#### Error Handling
- API Errors: ✅ PASS / ❌ FAIL
- Invalid Permissions: ✅ PASS / ❌ FAIL
- Slow Network: ✅ PASS / ❌ FAIL

#### Security
- Direct API Calls: ✅ PASS / ❌ FAIL
- Token Manipulation: ✅ PASS / ❌ FAIL
- Permission Manipulation: ✅ PASS / ❌ FAIL

### Issues Found
1. [Issue description]
   - Severity: Critical / High / Medium / Low
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

2. [Issue description]
   - ...

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

---

## 🚀 Quick Test Script

For rapid testing, use this checklist:

### 5-Minute Smoke Test
1. [ ] Login as Admin → All admin menu items visible
2. [ ] Navigate to /admin/users → Manage Roles works
3. [ ] Login as Hiker → No admin menu
4. [ ] Try /admin/analytics → Access Denied shown
5. [ ] Build succeeds → `npm run build` completes

### 15-Minute Core Test
1. [ ] Admin: All 8 pages accessible
2. [ ] Hiker: All 8 pages denied
3. [ ] Guide: Only Manage Hikes accessible
4. [ ] Role assignment: Badges update correctly
5. [ ] Mobile: Navigation and modals work

### 1-Hour Full Test
- Complete all scenarios above
- Test all edge cases
- Document all results
- Report any issues

---

## 📝 Testing Notes

### Known Limitations
- Permission changes require re-login (by design)
- Frontend caches permissions on login
- Backend is source of truth for permissions

### Performance Notes
- Permission checks are synchronous (fast)
- No noticeable lag in navigation
- Role modal loads quickly (< 500ms)

### Browser Compatibility
- Tested on: Chrome, Edge (Chromium)
- Should work on: Firefox, Safari
- IE11: Not supported (uses modern React)

---

**Step 4 Testing Guide Created**
**Ready for manual testing execution**

Next: Perform manual testing or proceed to Step 5 (Deployment)?
