# Auto-Approval System for User Registrations

## Overview

The Narrow Trail hiking portal now features an intelligent auto-approval system that automatically approves legitimate user registrations while flagging suspicious ones for manual admin review.

## How It Works

When a user registers:

1. **Validation Checks Run Automatically**
   - The system performs 8 security and quality checks
   - If all checks pass → User is auto-approved ✅
   - If any check fails → User is flagged for manual review 🔍

2. **Auto-Approved Users**
   - Status set to `approved` immediately
   - Welcome email sent automatically
   - Can log in as soon as they verify their email
   - Admins notified of auto-approval with validation details

3. **Flagged Users (Manual Review)**
   - Status set to `pending`
   - Admins notified with specific reason for flagging
   - Admin must manually approve or reject
   - User notified to wait for admin review

## Validation Checks

### ✅ Check 1: Email Format
- Must be valid email format (`user@domain.com`)
- **Fail Reason**: `Invalid email format`

### ✅ Check 2: Phone Number Format
- Must be valid South African number (10 digits starting with 0, or with +27)
- Examples: `0821234567`, `+27821234567`
- **Fail Reason**: `Invalid phone number format`

### ✅ Check 3: Duplicate Email
- Email must not already exist in database
- Case-insensitive check
- **Fail Reason**: `Duplicate email address`

### ✅ Check 4: Duplicate Phone Number
- Phone number must be unique
- **Fail Reason**: `Duplicate phone number`

### ✅ Check 5: Name Pattern
- Must contain only letters, spaces, hyphens, apostrophes, and periods
- Length: 2-100 characters
- **Fail Reason**: `Suspicious name pattern`

### ✅ Check 6: Email Domain Check
- Blocks common temporary/disposable email services:
  - tempmail.com
  - throwaway.email
  - guerrillamail.com
  - 10minutemail.com
  - mailinator.com
  - temp-mail.org
  - trashmail.com
- **Fail Reason**: `Temporary/disposable email address detected`

### ✅ Check 7: Registration Rate
- Monitors for spam/bot behavior (placeholder for future enhancement)
- **Fail Reason**: N/A (future use)

### ✅ Check 8: Recent Rejections
- Checks if similar email was rejected in past 30 days
- Prevents re-registration after rejection
- **Fail Reason**: `Recently rejected registration with similar details`

## Admin Notifications

### Auto-Approved Registrations
Admins receive email with:
- User's name, email, and phone
- All validation check results
- Subject: "New User Auto-Approved"

### Flagged Registrations
Admins receive:
- **Email**: Full details with reason for flagging
- **WhatsApp**: Quick alert with name and reason
- Subject: "New Registration Pending Review"

## User Experience

### Auto-Approved Flow
1. User registers → Receives verification email
2. User verifies email → Receives welcome email
3. User can immediately log in and use the system

### Manual Review Flow
1. User registers → Receives verification email
2. User verifies email → Sees "pending approval" message
3. Admin reviews → Approves or rejects
4. User notified of decision

## Activity Logging

All registrations are logged with:
- **Auto-approved**: `user_auto_approved` action
- **Pending review**: `user_registration` action
- Includes validation details and reasons

## Implementation Files

### Backend Files
- **`backend/utils/registrationValidator.js`**
  - Core validation logic
  - All 8 validation checks
  - Returns approval decision with detailed reasons

- **`backend/controllers/authController.js`**
  - Updated `register` function
  - Calls validation before creating user
  - Sets initial status based on validation
  - Sends appropriate notifications

### Database Impact
- No schema changes required
- Uses existing `status` field (`approved` vs `pending`)
- Leverages existing `activity_log` table

## Testing

### Test Cases

#### Should Auto-Approve ✅
```javascript
{
  name: "John Smith",
  email: "john.smith@gmail.com",
  phone: "0821234567",
  password: "SecurePass123!"
}
```

#### Should Flag for Review 🔍
```javascript
// Disposable email
{
  name: "Test User",
  email: "test@tempmail.com",
  phone: "0821234567",
  password: "SecurePass123!"
}

// Invalid phone
{
  name: "John Smith",
  email: "john@gmail.com",
  phone: "123",
  password: "SecurePass123!"
}

// Suspicious name
{
  name: "xxxxx",
  email: "test@gmail.com",
  phone: "0821234567",
  password: "SecurePass123!"
}

// Duplicate email (if john@gmail.com exists)
{
  name: "Jane Doe",
  email: "john@gmail.com",
  phone: "0829876543",
  password: "SecurePass123!"
}
```

## Security Benefits

1. **Reduces Admin Workload**: Legitimate users auto-approved
2. **Prevents Spam**: Blocks disposable emails and bots
3. **Stops Duplicates**: Prevents multiple accounts
4. **Audit Trail**: All decisions logged with reasons
5. **Transparent**: Admins see why each user was flagged
6. **Safe Default**: On error, defaults to manual review

## Future Enhancements

### Potential Additions
1. **IP-based Rate Limiting**: Track registrations per IP address
2. **Machine Learning**: Learn from admin approve/reject patterns
3. **Geolocation Check**: Validate phone number country code
4. **Social Proof**: Check email domain reputation
5. **Configurable Rules**: Admin panel to adjust validation rules
6. **Whitelist/Blacklist**: Manual override for specific domains or patterns

## Configuration

### Adding/Removing Blocked Domains

Edit `backend/utils/registrationValidator.js`:

```javascript
const suspiciousEmailDomains = [
  'tempmail.com',
  'throwaway.email',
  // Add more here
];
```

### Adjusting Rejection Window

Change the 30-day window for recent rejections:

```javascript
WHERE created_at > NOW() - INTERVAL '30 days'  // Change '30 days' as needed
```

## API Response

### Registration Response (Auto-Approved)
```json
{
  "message": "Registration successful! Please check your email to verify your account. Your account has been approved and you can log in after verification.",
  "user": {
    "id": 123,
    "name": "John Smith",
    "email": "john@gmail.com",
    "phone": "0821234567",
    "status": "approved"
  },
  "autoApproved": true
}
```

### Registration Response (Pending)
```json
{
  "message": "Registration successful! Please check your email to verify your account. Your registration will be reviewed by an admin.",
  "user": {
    "id": 124,
    "name": "Test User",
    "email": "test@tempmail.com",
    "phone": "0821234567",
    "status": "pending"
  },
  "autoApproved": false
}
```

## Deployment

This feature requires:
1. Deploy updated backend code
2. No database migration needed
3. Test with sample registrations
4. Monitor admin notifications

### Deployment Command
```bash
cd backend
.\deploy.bat
```

## Support

For questions or issues:
1. Check validation logs in activity_log table
2. Review admin notification emails for details
3. Manually approve flagged users if validation was too strict
4. Adjust validation rules if needed

---

**Status**: ✅ Ready for production
**Version**: 1.0
**Last Updated**: October 9, 2025
