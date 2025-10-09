# Auto-Approval Validation Criteria & Notification Flow

## 📋 Validation Criteria Summary

The system performs **8 validation checks** on every registration. **ALL checks must pass** for auto-approval.

### ✅ Check 1: Valid Email Format
- **Rule**: Must match standard email pattern `user@domain.com`
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Example Pass**: `john.smith@gmail.com`
- **Example Fail**: `invalid@`, `@domain.com`, `nodomain`
- **Action if Fail**: Manual review required

### ✅ Check 2: Valid South African Phone Number
- **Rule**: Must be 10 digits starting with 0, OR 11 digits starting with 27
- **Regex**: `/^(0\d{9}|27\d{9})$/` (after removing spaces, dashes, +)
- **Example Pass**: 
  - `0821234567`
  - `+27821234567`
  - `27821234567`
  - `082 123 4567`
- **Example Fail**: 
  - `123` (too short)
  - `1234567890` (wrong country)
  - `082` (incomplete)
- **Action if Fail**: Manual review required

### ✅ Check 3: No Duplicate Email
- **Rule**: Email must not already exist in database
- **Check**: Case-insensitive query (`LOWER(email)`)
- **Example Fail**: If `john@gmail.com` exists, registration with `John@Gmail.com` fails
- **Action if Fail**: Manual review required

### ✅ Check 4: No Duplicate Phone Number
- **Rule**: Phone number must be unique in database
- **Check**: Exact match query
- **Example Fail**: If `0821234567` exists, another registration with same number fails
- **Action if Fail**: Manual review required

### ✅ Check 5: Valid Name Pattern
- **Rule**: Only letters, spaces, hyphens, apostrophes, and periods
- **Length**: 2-100 characters
- **Regex**: `/^[a-zA-Z\s\-\'\.]+$/`
- **Example Pass**: 
  - `John Smith`
  - `Mary-Jane O'Connor`
  - `Dr. James Brown`
- **Example Fail**:
  - `John123` (numbers)
  - `User@123` (special chars)
  - `x` (too short)
  - `a`.repeat(101) (too long)
- **Action if Fail**: Manual review required

### ✅ Check 6: No Disposable Email Domains
- **Rule**: Blocks known temporary/disposable email services
- **Blocked Domains**:
  - `tempmail.com`
  - `throwaway.email`
  - `guerrillamail.com`
  - `10minutemail.com`
  - `mailinator.com`
  - `temp-mail.org`
  - `trashmail.com`
- **Example Fail**: `test@tempmail.com`, `spam@mailinator.com`
- **Action if Fail**: Manual review required

### ✅ Check 7: Registration Rate Monitoring
- **Rule**: Prevents rapid-fire bot registrations
- **Current Status**: Placeholder (always passes)
- **Future Enhancement**: Track registrations per IP address per time period
- **Action if Fail**: Manual review required

### ✅ Check 8: No Recent Rejections
- **Rule**: Check if similar email was rejected in past 30 days
- **Check**: Searches `activity_log` for `reject_user` actions containing email
- **Reason**: Prevents immediately re-registering after rejection
- **Example Fail**: User rejected on Oct 1, tries to register again on Oct 15
- **Action if Fail**: Manual review required

---

## 📧 Notification Flow

### When User is AUTO-APPROVED ✅

#### 1. User Receives (Immediately):
- ✉️ **Email Verification**: "Verify Your Email - The Narrow Trail"
  - Contains verification link
  - 24-hour expiry
  
#### 2. User Receives (After Auto-Approval):
- ✉️ **Welcome Email**: "Welcome to The Narrow Trail!"
  - Confirms approval
  - Lists features they can now access
  - Button to login
  
- 📱 **Welcome SMS/WhatsApp**:
  ```
  Welcome [Name]! Your hiking group registration has been approved. 
  You can now log in after verifying your email.
  ```

#### 3. Admins Receive:
- ✉️ **Email Notification**: "New User Auto-Approved"
  - User's name, email, phone
  - All 8 validation checks with ✅ results
  
- 📱 **WhatsApp Notification**:
  ```
  New user auto-approved: [Name] ([email]).
  ```

### When User Requires MANUAL REVIEW 🔍

#### 1. User Receives (Immediately):
- ✉️ **Email Verification**: "Verify Your Email - The Narrow Trail"
  - Contains verification link
  - 24-hour expiry

#### 2. User Receives (After Email Verification):
- 📄 **Status Message**: "Your account is pending admin approval."
  - No welcome email yet
  - No SMS yet
  - Must wait for admin

#### 3. Admins Receive:
- ✉️ **Email Notification**: "New Registration Pending Review"
  - User's name, email, phone
  - **Specific reason** for flagging (e.g., "Disposable email detected")
  - All 8 validation checks showing which failed
  
- 📱 **WhatsApp Notification**:
  ```
  New registration requires review: [Name] ([email]). 
  Reason: [Specific validation failure]
  ```

#### 4. After Admin Approves:
- ✉️ **Welcome Email** (sent by admin approval flow)
- 📱 **Welcome WhatsApp** (sent by admin approval flow)

---

## 🎯 Notification Comparison Table

| Notification Type | Auto-Approved User | Manually Approved User | Flagged User (Pending) |
|-------------------|-------------------|----------------------|----------------------|
| **Email Verification** | ✅ Sent immediately | ✅ Sent immediately | ✅ Sent immediately |
| **Welcome Email** | ✅ Sent immediately | ✅ After admin approves | ❌ Not sent until approved |
| **Welcome SMS** | ✅ Sent immediately | ✅ After admin approves | ❌ Not sent until approved |
| **Admin Email** | ✅ "Auto-Approved" | ✅ "Pending Review" | ✅ "Pending Review" |
| **Admin WhatsApp** | ✅ Success notification | ✅ Review needed | ✅ Review needed |
| **Can Login?** | ✅ After email verification | ✅ After email verification + admin approval | ❌ After email verification + admin approval |

---

## 🔄 Complete User Journey

### Auto-Approved Journey (Happy Path)
```
1. User fills registration form
   ↓
2. System validates (all 8 checks pass)
   ↓
3. User account created with status = 'approved'
   ↓
4. User receives: Email verification + Welcome email + Welcome SMS
   ↓
5. User clicks email verification link
   ↓
6. User can immediately log in ✅
```

### Manual Review Journey
```
1. User fills registration form
   ↓
2. System validates (1+ checks fail, e.g., disposable email)
   ↓
3. User account created with status = 'pending'
   ↓
4. User receives: Email verification only
   ↓
5. Admin receives: Email + WhatsApp with failure reason
   ↓
6. User clicks email verification link
   ↓
7. User sees: "Account pending approval" message
   ↓
8. Admin reviews and approves
   ↓
9. User receives: Welcome email + Welcome SMS
   ↓
10. User can log in ✅
```

---

## 🛡️ Safety Features

### Default to Manual Review
- If **any** validation check fails → Manual review
- If validation **throws an error** → Manual review
- Ensures no risky auto-approvals

### Comprehensive Logging
- All auto-approvals logged with action: `user_auto_approved`
- All pending registrations logged with action: `user_registration`
- Logs include all validation checks and results
- Full audit trail in `activity_log` table

### Transparent to Admins
- Email shows **exactly why** user was flagged
- All 8 checks displayed with ✅/❌
- Specific failure reason highlighted
- Admins make informed decisions

---

## 📊 Expected Auto-Approval Rate

Based on validation criteria:

**High Auto-Approval Likelihood** (90%+):
- User with real email (gmail.com, outlook.com, etc.)
- Valid SA phone number
- Normal name
- First-time registration

**Low Auto-Approval Likelihood** (<10%):
- Disposable email users
- Duplicate registrations
- Invalid phone formats
- Previously rejected users
- Bot/spam attempts

---

## 🔧 Configuration

### Adding Blocked Domains
Edit `backend/utils/registrationValidator.js` line 77:

```javascript
const suspiciousEmailDomains = [
  'tempmail.com',
  'throwaway.email',
  // Add more domains here
  'yopmail.com',
  'fakeinbox.com'
];
```

### Changing Rejection Window
Edit `backend/utils/registrationValidator.js` line 94:

```javascript
// Change from 30 days to 60 days
WHERE created_at > NOW() - INTERVAL '60 days'
```

### Adjusting Name Length
Edit `backend/utils/registrationValidator.js` line 65:

```javascript
if (!namePattern.test(name) || name.length < 2 || name.length > 150) {
  // Changed from 100 to 150 characters
```

---

## 🚀 Deployment Status

✅ **DEPLOYED**: backend-00027-cxn (October 9, 2025)
- Auto-approval validation: ✅ Active
- Email notifications: ✅ Working
- SMS/WhatsApp notifications: ✅ Working
- Admin notifications: ✅ Working

---

## 📝 Testing Checklist

### Test Auto-Approval (Should Pass All Checks)
```json
{
  "name": "John Smith",
  "email": "john.smith@gmail.com",
  "phone": "0821234567",
  "password": "SecurePass123!"
}
```

**Expected Result**:
- ✅ User status = `approved`
- ✅ User receives 3 notifications (verification email, welcome email, welcome SMS)
- ✅ Admin receives 2 notifications (email + WhatsApp)
- ✅ User can log in after email verification

### Test Manual Review (Should Fail Check #6)
```json
{
  "name": "Test User",
  "email": "test@tempmail.com",
  "phone": "0829876543",
  "password": "SecurePass123!"
}
```

**Expected Result**:
- ✅ User status = `pending`
- ✅ User receives 1 notification (verification email only)
- ✅ Admin receives email with reason: "Temporary/disposable email address detected"
- ✅ User sees "pending approval" after verifying email

---

**Last Updated**: October 9, 2025  
**Backend Revision**: backend-00027-cxn  
**Status**: ✅ Production Ready
