# WhatsApp Cloud API Setup Guide (Free Tier)

Complete guide to set up WhatsApp Cloud API for The Narrow Trail hiking portal - **completely free** for up to 1,000 conversations per month.

---

## Prerequisites

- A Facebook Business Account
- A phone number that can receive SMS/calls for verification
- Admin access to your hiking portal backend

---

## Step 1: Create Meta Business Account

1. **Go to Meta Business Suite**
   - Visit: https://business.facebook.com/
   - Click **"Create Account"** if you don't have one
   - Fill in your business details:
     - Business name: "The Narrow Trail" (or your preferred name)
     - Your name
     - Business email: steyncd@gmail.com

2. **Complete Business Verification** (Optional but recommended)
   - This unlocks higher messaging limits
   - You'll need business documents (registration, tax ID, etc.)
   - Can be done later - start with unverified account

---

## Step 2: Create Meta App for WhatsApp

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Click **"My Apps"** in the top right
   - Click **"Create App"**

2. **Select App Type**
   - Choose: **"Business"**
   - Click **"Next"**

3. **App Details**
   - App name: `Hiking Portal WhatsApp`
   - App contact email: `steyncd@gmail.com`
   - Business Account: Select the one you just created
   - Click **"Create App"**

4. **Add WhatsApp Product**
   - In the app dashboard, scroll down to **"Add Products"**
   - Find **"WhatsApp"** and click **"Set Up"**

---

## Step 3: Get API Credentials

1. **In WhatsApp > Getting Started section:**
   - You'll see a temporary access token (valid for 24 hours)
   - You'll see a Phone Number ID
   - You'll see a WhatsApp Business Account ID

2. **Copy These Values** (we'll need them):
   ```
   Temporary Access Token: EAAxxxxxxxxx (starts with EAA)
   Phone Number ID: 123456789012345
   WhatsApp Business Account ID: 123456789012345
   Test Phone Number: +27 XX XXX XXXX (the Meta test number)
   ```

3. **Generate Permanent Access Token** (Important!)

   **Option A: Using System User (Recommended for Production)**
   - Go to **Business Settings** > **Users** > **System Users**
   - Click **"Add"** to create a new system user
   - Name it: `WhatsApp API User`
   - Role: **Admin**
   - Click **"Create System User"**
   - Click **"Generate New Token"**
   - Select your app: `Hiking Portal WhatsApp`
   - Permissions needed:
     - ✅ `whatsapp_business_messaging`
     - ✅ `whatsapp_business_management`
   - Click **"Generate Token"**
   - **IMPORTANT:** Copy and save this token immediately - you won't see it again!

   **Option B: Using Test Token (For Testing Only)**
   - Use the temporary token for initial testing
   - Replace with permanent token before going live

---

## Step 4: Add Your Phone Number

### Option A: Use Meta's Test Number (Quick Start)
- Meta provides a test phone number
- You can send messages to up to 5 recipients
- Good for testing before getting your own number

### Option B: Add Your Own Business Phone Number (Recommended)

1. **In WhatsApp > API Setup:**
   - Click **"Add Phone Number"**
   - Click **"Add a Phone Number You Own"**

2. **Verify Your Phone Number:**
   - Enter your South African phone number: `+27XXXXXXXXX`
   - Choose verification method (SMS or Voice Call)
   - Enter the 6-digit code you receive
   - Click **"Verify"**

3. **Set Display Name:**
   - Display name: `The Narrow Trail`
   - This is what users will see when they receive messages

4. **Business Profile:**
   - Business description: "Hiking adventures in South Africa"
   - Business website: `https://www.thenarrowtrail.co.za`
   - Business category: "Recreation & Sports"

---

## Step 5: Configure Webhook (For Receiving Messages - Optional)

If you want to receive replies from users:

1. **In WhatsApp > Configuration:**
   - Click **"Webhook"**
   - Callback URL: `https://hiking-portal-backend-554106646136.us-central1.run.app/api/webhooks/whatsapp`
   - Verify Token: Create a random string like: `hiking_portal_webhook_2025`
   - Subscribe to: `messages`

2. **I'll create the webhook endpoint for you** (see implementation section below)

---

## Step 6: Add Environment Variables to Your Backend

Add these to your backend `.env` file:

```bash
# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=hiking_portal_webhook_2025
```

**For Google Cloud Run:**
```bash
# Add these as secrets or environment variables
gcloud run services update backend \
  --region=europe-west1 \
  --update-env-vars="WHATSAPP_ACCESS_TOKEN=YOUR_TOKEN,WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_ID"
```

---

## Step 7: Testing Your Setup

### Test Sending a Message

1. **Using the Meta API Test Tool:**
   - In WhatsApp > API Setup
   - In the "Send a Test Message" section
   - Enter your phone number (must be in E.164 format: +27XXXXXXXXX)
   - Click **"Send Message"**
   - You should receive a test message on WhatsApp!

2. **Using the Portal (after implementation):**
   - Create a test hike
   - Express interest with your user account
   - Check if you receive WhatsApp notification

---

## API Endpoints Reference

### Send Message Endpoint
```
POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
```

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body (Text Message)
```json
{
  "messaging_product": "whatsapp",
  "to": "+27821234567",
  "type": "text",
  "text": {
    "body": "Hello from The Narrow Trail! 🏔️"
  }
}
```

### Request Body (Template Message)
```json
{
  "messaging_product": "whatsapp",
  "to": "+27821234567",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en"
    }
  }
}
```

---

## Free Tier Limits

- **1,000 free conversations per month**
- Conversation = 24-hour messaging window
- Business-initiated: R0.35 per conversation (after free tier)
- User-initiated: Free (replies)

**What counts as a conversation:**
- User sends message → You reply within 24h = 1 conversation
- You send template message → User replies = 1 conversation
- Multiple messages within 24h = Still 1 conversation

**Tips to stay within free tier:**
- Batch notifications (send once per hike)
- Use email as primary, WhatsApp for urgent
- Encourage users to initiate conversations

---

## Message Templates (Required for Business-Initiated Messages)

For sending messages outside 24h window, you need approved templates.

### Create a Template:

1. **Go to WhatsApp Manager:**
   - https://business.facebook.com/wa/manage/message-templates/
   - Click **"Create Template"**

2. **Example Template: New Hike Notification**
   ```
   Name: new_hike_notification
   Category: MARKETING
   Language: English

   Body:
   🏔️ *New Hike Alert!*

   {{1}} is happening on {{2}} at {{3}}!

   Cost: R{{4}}
   Difficulty: {{5}}

   View details: {{6}}

   Reply STOP to unsubscribe.
   ```

3. **Submit for Approval** (usually approved within 24 hours)

---

## Troubleshooting

### Common Issues:

**1. "Invalid phone number" error**
- Ensure phone number is in E.164 format: `+27821234567`
- No spaces, dashes, or parentheses
- Include country code (+27 for South Africa)

**2. "Access token expired"**
- Temporary tokens expire in 24 hours
- Use permanent token from System User

**3. "Template not found"**
- Templates must be approved before use
- Use approved template names exactly
- For testing, use the pre-approved `hello_world` template

**4. "Recipient not available"**
- Test numbers must be added to allowed list during development
- In WhatsApp > API Setup > "Phone Numbers" > Add test recipients

**5. Message not delivered**
- Check phone number has WhatsApp installed
- Verify phone number format
- Check WhatsApp Business Account status

---

## Security Best Practices

1. **Never commit tokens to git**
   - Use environment variables only
   - Add to `.gitignore`

2. **Rotate tokens periodically**
   - Generate new system user token every 6 months
   - Revoke old tokens

3. **Webhook security**
   - Verify webhook signature
   - Use HTTPS only
   - Validate verify token

4. **Rate limiting**
   - Implement rate limiting (80 messages/second)
   - Add retry logic with exponential backoff

---

## Migration from Twilio

Once WhatsApp Cloud API is working:

1. **Test thoroughly** with test phone numbers
2. **Run in parallel** with Twilio for 1 week
3. **Monitor for issues**
4. **Switch completely** once confident
5. **Remove Twilio** credentials from environment
6. **Uninstall** twilio package: `npm uninstall twilio`

---

## Cost Comparison

### Twilio (Current)
- ~R1.00 per message
- 100 messages = R100/month
- No free tier

### WhatsApp Cloud API (Proposed)
- 1,000 conversations FREE
- Then R0.35 per conversation
- 100 messages = R0 (within free tier!)

**Annual Savings:** ~R12,000 if sending 100 messages/month

---

## Next Steps

1. ✅ Complete Steps 1-6 above
2. ✅ Copy the credentials
3. ✅ Add to backend environment variables
4. ✅ Let me implement the code integration
5. ✅ Test with your phone number
6. ✅ Deploy to production

---

## Support Resources

- **Meta Developers Documentation:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Getting Started Guide:** https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- **API Reference:** https://developers.facebook.com/docs/whatsapp/cloud-api/reference
- **WhatsApp Business Platform:** https://business.whatsapp.com/
- **Meta Business Help Center:** https://www.facebook.com/business/help

---

## Questions?

After completing the setup above, I'll implement the code integration to:
- Replace Twilio with WhatsApp Cloud API
- Keep all existing functionality
- Add proper error handling
- Add template message support

Just let me know when you have your credentials ready!
