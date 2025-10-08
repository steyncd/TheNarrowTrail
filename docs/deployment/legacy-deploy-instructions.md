# Deployment Instructions

## Backend Deployment

Unfortunately, due to gcloud Python/grpc module issues, you'll need to deploy the backend manually through the Google Cloud Console:

### Option 1: Fix gcloud and deploy via CLI

1. Try reinstalling gcloud components:
   ```bash
   gcloud components reinstall
   ```

2. If that doesn't work, try setting Python path:
   ```bash
   set CLOUDSDK_PYTHON=C:\Users\Admin\AppData\Local\Programs\Python\Python311\python.exe
   ```

3. Install grpcio for Python:
   ```bash
   "C:\Users\Admin\AppData\Local\Programs\Python\Python311\python.exe" -m pip install grpcio
   ```

4. Then deploy:
   ```bash
   cd backend
   gcloud run deploy hiking-portal-api --source . --region us-central1 --allow-unauthenticated
   ```

### Option 2: Deploy via Google Cloud Console (Recommended)

1. Go to https://console.cloud.google.com/run
2. Click on "hiking-portal-api" service
3. Click "EDIT & DEPLOY NEW REVISION"
4. Under "Container" section, you'll see options to:
   - Upload code directly (ZIP the backend folder)
   - Connect to GitHub repository
   - Use Cloud Build
5. Alternatively, use Cloud Build:
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/helloliam/hiking-portal-api
   gcloud run deploy hiking-portal-api --image gcr.io/helloliam/hiking-portal-api --region us-central1 --allow-unauthenticated
   ```

## What Was Updated in Backend

1. **Email Verification**:
   - Sign-up now generates verification token and sends email
   - New endpoint: `GET /api/auth/verify-email/:token`
   - Users must verify email before admin approval

2. **Bug Fixes**:
   - Fixed SendGrid API key trimming (removes whitespace causing "Invalid character in header" error)
   - Enhanced error logging for email failures

3. **New Database Fields** (schema.sql needs to be run):
   - Users: `email_verified`, `email_verification_token`, `email_verification_expiry`, `emergency_contact_name`, `emergency_contact_phone`, `medical_info`
   - Hikes: `image_url`, `destination_url`, `daily_distances`, `overnight_facilities`
   - New tables: `hike_comments`, `carpool_offers`, `carpool_requests`, `packing_lists`, `user_achievements`

## Database Migration

You need to run the updated schema.sql on your PostgreSQL database:

1. Connect to your Cloud SQL instance
2. Run the updated `schema.sql` file
3. The script is idempotent - safe to run multiple times

## Frontend Deployment

The frontend will be deployed automatically via the deployment script.

## Environment Variables

Make sure these environment variables are set in Cloud Run:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SENDGRID_API_KEY` - SendGrid API key (will be trimmed automatically)
- `SENDGRID_FROM_EMAIL` - Sender email address ⚠️ **MUST BE VERIFIED IN SENDGRID!**
- `TWILIO_ACCOUNT_SID` - Twilio account SID (optional)
- `TWILIO_AUTH_TOKEN` - Twilio auth token (optional)
- `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp number (optional)

### ⚠️ CRITICAL: Verify Your SendGrid Email Address

**The `SENDGRID_FROM_EMAIL` must be verified in SendGrid or all emails will fail!**

**Quick Fix**:
1. Go to: https://app.sendgrid.com/settings/sender_auth
2. Click "Verify a Single Sender"
3. Use your personal email (e.g., steyncd@gmail.com)
4. Check your email for verification link and click it
5. Update Cloud Run env var `SENDGRID_FROM_EMAIL` to the verified email
6. Redeploy the service

**See FIX_EMAIL_ISSUE.md for detailed step-by-step instructions.**

## Testing Email Verification

1. Register a new user
2. Check email for verification link
3. Click link (format: https://helloliam.web.app/verify-email?token=...)
4. Should see success message
5. Admin can then approve the user
