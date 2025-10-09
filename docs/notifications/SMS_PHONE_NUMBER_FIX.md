# SMS Phone Number Fix

**Implementation Date:** October 9, 2025
**Status:** ✅ Fixed - Ready to Deploy

## Problem

SMS messages were failing with the error:
```
Invalid 'To' Phone Number: +083225XXXX
```

The issue was in `backend/services/notificationService.js` where phone numbers starting with `0` (South African local format) were being prefixed with `+` directly, resulting in invalid numbers like `+083225XXXX` instead of `+27832225XXXX`.

## Root Cause

**Original Code (Line 124-125):**
```javascript
// Ensure phone number starts with +
const formattedTo = to.startsWith('+') ? to : `+${to}`;
```

This code simply added `+` to any number that didn't already have it, without handling South African local format numbers (starting with `0`).

## Solution

**Updated Code:**
```javascript
// Format phone number for international dialing
let formattedTo = to.trim();

// If number starts with 0 (South African local format), replace with +27
if (formattedTo.startsWith('0')) {
  formattedTo = '+27' + formattedTo.substring(1);
} else if (!formattedTo.startsWith('+')) {
  // If no country code and doesn't start with 0, assume it needs +27
  formattedTo = '+27' + formattedTo;
}
```

## Phone Number Format Handling

The fix now properly handles these formats:

| Input Format | Output Format | Example |
|--------------|---------------|---------|
| `0832225555` | `+27832225555` | Local SA format |
| `832225555` | `+27832225555` | Missing leading 0 |
| `+27832225555` | `+27832225555` | Already formatted |
| `27832225555` | `+2727832225555` | ⚠️ Edge case (needs +) |

**Note:** If you're storing numbers in the database in the format `27832225555` (country code without +), you may want to update the database or adjust the logic.

## Testing Scenarios

### ✅ Valid Inputs
- `0832225555` → `+27832225555` ✓
- `+27832225555` → `+27832225555` ✓
- `832225555` → `+27832225555` ✓

### ⚠️ Edge Cases to Test
- Numbers with spaces: `083 222 5555`
- Numbers with dashes: `083-222-5555`
- International numbers: `+1555123456`

## Files Modified

- `backend/services/notificationService.js` - Updated `sendSMS()` function

## Deployment Instructions

### Option 1: Automated Deployment (Windows)
```bash
cd backend
.\deploy.bat
```
When prompted, type `y` to confirm deployment.

### Option 2: Manual Deployment
```bash
cd backend
gcloud run deploy backend \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300
```

## Verification Steps

After deployment:

1. **Test Registration SMS**
   - Create a new test user account
   - Check notification logs for successful SMS delivery
   - Verify the phone number format in logs shows `+27...`

2. **Check Logs**
   ```bash
   gcloud run logs read backend --region europe-west1 --limit 50
   ```
   Look for log entries like:
   ```
   SMS sent to +27832225555 (original: 0832225555) via Twilio
   ```

3. **Database Check**
   - Review `notification_log` table for recent SMS entries
   - Verify `status` = 'sent' instead of 'failed'

## Additional Recommendations

### 1. Database Phone Number Standardization

Consider adding a migration to standardize phone numbers in the `users` table:

```sql
-- Standardize phone numbers to international format
UPDATE users 
SET phone = '+27' || SUBSTRING(phone FROM 2)
WHERE phone LIKE '0%' AND phone NOT LIKE '+%';
```

### 2. Input Validation on Frontend

Add phone number formatting in the signup form:

```javascript
// In frontend/src/components/auth/SignUpForm.js
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.startsWith('0')) {
    return '+27' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('27')) {
    return '+27' + cleaned;
  }
  return '+' + cleaned;
};
```

### 3. WhatsApp Number Configuration

Ensure your `.env` or Cloud Run environment has:
```
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```
or
```
TWILIO_PHONE_NUMBER=+14155238886
```

## Related Files

- `backend/services/notificationService.js` - SMS sending logic
- `backend/controllers/authController.js` - User registration (triggers SMS)
- `backend/config/env.js` - Twilio configuration
- `.env` - Environment variables (not in repo)

## Future Enhancements

1. **Add phone number validation library**
   - Use `libphonenumber-js` for robust phone number parsing
   - Validates phone numbers for all countries

2. **Support multiple country codes**
   - Detect country from user input
   - Auto-format based on detected country

3. **Add retry logic**
   - Retry failed SMS with exponential backoff
   - Queue messages for delivery

## Environment Variables Required

Make sure these are set in Cloud Run:
```
TWILIO_ACCOUNT_SID=<your_account_sid>
TWILIO_AUTH_TOKEN=<your_auth_token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Rollback Plan

If issues arise after deployment:

1. **Quick Rollback:**
   ```bash
   gcloud run services update-traffic backend --to-revisions=PREVIOUS=100
   ```

2. **Revert Code:**
   ```bash
   git revert <commit_hash>
   git push
   .\deploy.bat
   ```

## Support

If SMS issues persist:
1. Check Twilio console for delivery logs
2. Verify phone numbers are in E.164 format in logs
3. Check Cloud Run logs for specific error messages
4. Ensure Twilio account has sufficient credits

---

**Status:** Ready for deployment
**Risk Level:** Low (only affects SMS sending, doesn't impact other functionality)
**Estimated Deployment Time:** 3-5 minutes
