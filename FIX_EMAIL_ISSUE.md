# Fix Email Issue: "Invalid from email address"

## Problem
SendGrid is rejecting emails because the "from" email address is not verified in your SendGrid account.

## Solution: Verify Your Sender Email in SendGrid

### Step 1: Log into SendGrid
Go to: https://app.sendgrid.com/

### Step 2: Navigate to Sender Authentication
- Click on "Settings" in the left sidebar
- Click on "Sender Authentication"
- Or go directly to: https://app.sendgrid.com/settings/sender_auth

### Step 3: Verify a Single Sender Email

#### Option A: Use Your Personal Email (Easiest)
1. Click "Verify a Single Sender"
2. Fill in the form:
   - **From Name**: Hiking Portal (or your preferred name)
   - **From Email Address**: YOUR_EMAIL@gmail.com (use your actual email)
   - **Reply To**: Same as from email
   - **Company Address**: Your address
   - **Company City, State, ZIP**: Your location
   - **Country**: Your country
3. Click "Create"
4. Check your email for verification link
5. Click the verification link

#### Option B: Use a Custom Domain Email (Advanced)
1. Click "Authenticate Your Domain"
2. Follow the DNS setup instructions
3. This allows you to send from any email @yourdomain.com

### Step 4: Update Environment Variable in Cloud Run

1. Go to Google Cloud Console: https://console.cloud.google.com/run
2. Click on your "hiking-portal-api" service
3. Click "EDIT & DEPLOY NEW REVISION"
4. Scroll down to "Variables & Secrets"
5. Find or add `SENDGRID_FROM_EMAIL`
6. Set it to the email you just verified (e.g., `steyncd@gmail.com`)
7. Click "DEPLOY"

### Step 5: Test Email Sending

After deployment:
1. Try registering a new user
2. Check if verification email is sent
3. Or use the "Test Notification" feature in the admin panel

---

## Quick Check: Is Your Email Verified?

1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Look for your email in the list
3. Status should show "Verified" (green checkmark)

If not verified:
- Check your email inbox for verification email from SendGrid
- Check spam folder
- Click "Resend Verification Email" button

---

## Code Updates Made

I've updated `server.js` to:
1. Trim whitespace from `SENDGRID_FROM_EMAIL` environment variable
2. Add validation to check if from email is set
3. Add helpful error logging when email address is not verified
4. Show the exact email address that needs verification in logs

**You need to redeploy the backend** for these changes to take effect.

---

## Alternative: Disable Email (Temporary)

If you want to test without email for now:

### In Cloud Run Environment Variables:
1. Set `SENDGRID_API_KEY=placeholder`
2. Or remove the `SENDGRID_API_KEY` variable entirely

This will cause all emails to be skipped (logged as "skipped" in notification_log table).

---

## Common Mistakes

❌ **Using an unverified email**: SendGrid requires verification
❌ **Typo in email address**: Double-check spelling
❌ **Using noreply@localhost.com**: Use a real email domain
❌ **Not deploying after env var change**: Must redeploy Cloud Run service

✅ **Correct setup**:
1. Verify email in SendGrid first
2. Set env var to exact verified email
3. Redeploy backend
4. Test

---

## Environment Variable Example

```bash
# In Cloud Run environment variables:
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=steyncd@gmail.com  # Must be verified in SendGrid!
```

---

## Need Help?

If emails still fail after verification:
1. Check Cloud Run logs for detailed error messages
2. Verify SendGrid API key is correct
3. Check SendGrid account status (not suspended)
4. Make sure you have SendGrid credits (free tier: 100 emails/day)
5. Look at notification_log table in database for error details

---

## Testing Without Actual Email Sending

For development/testing, you can:
1. Check the `notification_log` table in your database
2. See what emails would have been sent
3. Verify the content/recipients are correct
4. Even if emails fail, the log will show what was attempted

```sql
SELECT * FROM notification_log
ORDER BY sent_at DESC
LIMIT 10;
```
