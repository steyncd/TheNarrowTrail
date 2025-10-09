# SMS Notification Implementation Guide

## Overview
The hiking portal now uses **SMS** instead of WhatsApp for text notifications via Twilio.

## Why SMS Instead of WhatsApp?
- **Simpler setup** - No template approval needed
- **More reliable** - Works immediately after Twilio configuration
- **No restrictions** - Can send any message format
- **Better for automation** - No 24-hour window or business-initiated template requirements

## Twilio Setup for SMS

### Step 1: Create Twilio Account
1. Sign up at https://www.twilio.com/try-twilio
2. Verify your email and phone number
3. You'll get $15 trial credit

### Step 2: Get a Phone Number
1. Go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose your country (South Africa: +27)
3. Select SMS capability
4. Purchase number (~$1/month)

### Step 3: Get Your Credentials
From the Twilio Console dashboard:
- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token**: Click "Show" to reveal
- **Phone Number**: The number you just purchased (e.g., `+12345678900`)

### Step 4: Configure Backend

Add to `backend/.env`:
```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678900
```

**Important:**
- Include the `+` and country code in the phone number
- Don't add quotes around the values
- Restart your backend after updating

### Step 5: Test
Once configured, the system will automatically send SMS notifications for:
- New user registrations (to admins)
- New hikes added (to users with notifications enabled)
- Hike interest confirmations (to admins)
- Attendance confirmations (to admins)
- Password resets
- And more...

## SMS Costs (Twilio)
- **Outbound SMS**: ~$0.0075 per message to South African numbers
- **Phone Number**: ~$1/month
- **No minimum spend** - Pay only for what you use

## Database Schema
The database still uses `notifications_whatsapp` column names for backward compatibility, but they now control SMS notifications instead of WhatsApp.

**Users table:**
- `notifications_email` - Enable/disable email notifications
- `notifications_whatsapp` - Enable/disable SMS notifications (despite the column name)

**Notification Preferences table:**
- `email_enabled` - Email preference per notification type
- `whatsapp_enabled` - SMS preference per notification type (despite the column name)

## Code Implementation

### Backend (Already Implemented)
- `sendSMS()` function in `notificationService.js`
- Automatic phone number formatting (adds `+` if missing)
- Notification preference checking
- Logging to `notification_log` table

### Frontend Labels
Updated UI labels from "WhatsApp" to "SMS" in:
- User Management edit modal
- Notification preferences panels
- (More updates in progress...)

## Testing

### Test with Trial Account
1. Add your verified phone number in Twilio console
2. Configure .env with credentials
3. Trigger a notification (e.g., create a new hike)
4. Check if you receive SMS

### Trial Limitations
- Can only send to verified phone numbers
- Add numbers at: **Phone Numbers** → **Verified Caller IDs**
- Upgrade to paid account to send to any number

### Production
- Upgrade account (add payment method)
- No need to verify recipient numbers
- SMS sent to any valid phone number

## Migration Notes
- No database migration needed - using existing columns
- UI labels updated from "WhatsApp" to "SMS"
- `sendWhatsApp()` still works (alias for `sendSMS()`)
- Backward compatible with existing code

## Support
- Twilio Docs: https://www.twilio.com/docs/sms
- Twilio Console: https://console.twilio.com/
- SMS Logs: Check Twilio console for delivery status
