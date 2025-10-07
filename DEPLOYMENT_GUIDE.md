# Hiking Portal Deployment Guide

## Overview
This guide helps you deploy both the backend (Google Cloud Run) and frontend (Firebase Hosting) for the Hiking Portal application.

## Prerequisites
- Google Cloud SDK (gcloud) installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Docker Desktop running (optional, for local testing)

## Deployment Status

✅ **Frontend Build**: Completed - The React app has been built with the updated password reset functionality
⏳ **Backend Deployment**: Ready to deploy
⏳ **Frontend Deployment**: Ready to deploy

---

## Backend Deployment (Google Cloud Run)

### Step 1: Fix gcloud Python Issue (if needed)

If you encounter "No module named 'grpc'" error, run:

```bash
# Open PowerShell as Administrator and run:
setx CLOUDSDK_PYTHON "C:\Users\Admin\AppData\Local\Google\Cloud SDK\google-cloud-sdk\platform\bundledpython\python.exe" /M

# Then restart your terminal
```

### Step 2: Deploy Backend

Navigate to the backend directory and deploy:

```bash
cd c:\hiking-portal\backend

gcloud run deploy hiking-portal-api `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "PORT=8080,NODE_ENV=production,DB_PORT=5432,DB_NAME=hiking_portal,DB_USER=postgres" `
  --set-env-vars "DB_HOST=/cloudsql/helloliam:us-central1:hiking-db" `
  --update-secrets "DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest" `
  --add-cloudsql-instances "helloliam:us-central1:hiking-db" `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300
```

Expected URL: `https://hiking-portal-api-554106646136.us-central1.run.app`

---

## Frontend Deployment (Firebase Hosting)

### Step 1: Ensure you're logged into Firebase

```bash
firebase login
```

### Step 2: Deploy Frontend

The frontend has already been built. Now deploy it:

```bash
cd c:\hiking-portal\frontend
firebase deploy --only hosting
```

### Step 3: Update Frontend API URL (if backend URL changed)

If your backend URL is different, update `src/App.js` line 4:

```javascript
const API_URL = 'https://hiking-portal-api-554106646136.us-central1.run.app';
```

Then rebuild and redeploy:

```bash
npm run build
firebase deploy --only hosting
```

---

## Changes Made

### Password Reset Functionality Alignment

The frontend now properly implements the complete 3-step password reset flow:

1. **Step 1 - Request Reset**
   - User enters email
   - Frontend calls `/api/auth/forgot-password`
   - Backend generates 6-digit code and sends email

2. **Step 2 - Enter Code & New Password**
   - User enters the 6-digit code from email
   - User enters new password and confirmation
   - Frontend validates passwords match
   - Frontend calls `/api/auth/reset-password` with email, token, and new password
   - Backend validates token and updates password

### Files Modified

- `frontend/src/App.js` - Complete password reset UI with two-step flow

### Backend Endpoints (Already Existed)

- `POST /api/auth/forgot-password` - Generate and send reset code
- `POST /api/auth/verify-reset-token` - Verify token is valid (optional)
- `POST /api/auth/reset-password` - Reset password with token

---

## Verification

After deployment, test the password reset flow:

1. Navigate to your frontend URL
2. Click "Forgot password?"
3. Enter an email address
4. Check email for 6-digit code
5. Enter code and new password
6. Verify you can login with new password

---

## Troubleshooting

### gcloud Python Issues

If gcloud commands fail with Python/grpc errors:

```bash
# Option 1: Reinstall gcloud SDK completely
# Download from: https://cloud.google.com/sdk/docs/install

# Option 2: Set Python path
setx CLOUDSDK_PYTHON "C:\Users\Admin\AppData\Local\Google\Cloud SDK\google-cloud-sdk\platform\bundledpython\python.exe" /M
```

### Firebase Deployment Issues

```bash
# Reinitialize Firebase
firebase init hosting

# Select existing project
# Choose 'build' as public directory
# Configure as single-page app: Yes
```

---

## Quick Deploy Script

I've created `deploy-all.bat` that attempts to deploy both projects automatically. Run it with:

```bash
.\deploy-all.bat
```

Note: This requires gcloud and firebase CLI to be properly configured.
