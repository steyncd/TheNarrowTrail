# 🚀 Hiking Portal - Deployment Guide

**Last Updated**: October 13, 2025  
**Author**: System Admin  
**Production URLs**:
- Frontend: https://www.thenarrowtrail.co.za
- Backend: https://backend-554106646136.europe-west1.run.app

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## ✅ Prerequisites

### Required Tools
- Node.js 18+ and npm
- Google Cloud SDK (`gcloud` CLI)
- Firebase CLI (`firebase-tools`)
- Git

### Authentication
```powershell
# Google Cloud authentication
gcloud auth login
gcloud config set project hiking-portal-442919

# Firebase authentication
firebase login
```

---

## 🔧 Environment Configuration

### Critical Rules
1. **NEVER commit `.env.local` to version control**
2. **NEVER reference localhost in production builds**
3. **ALWAYS validate environment variables before deployment**

### Frontend Environment Files

#### `.env.production` (Production - COMMIT THIS)
```bash
REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app
REACT_APP_ENV=production
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_OFFLINE_MODE=true
```

#### `.env.local` (Development - NEVER COMMIT)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### Backend Environment Variables

Set in Google Cloud Run console or via `gcloud`:
```bash
DATABASE_HOST=<Cloud SQL connection>
DATABASE_PORT=5432
DATABASE_NAME=hiking_portal
DATABASE_USER=<db_user>
DATABASE_PASSWORD=<secure_password>
JWT_SECRET=<secure_random_string>
NODE_ENV=production
```

---

## 🎯 Backend Deployment

### Step 1: Prepare Backend
```powershell
cd C:\hiking-portal\backend

# Test locally first
npm install
npm test

# Verify database connectivity
node check-db-status.js
```

### Step 2: Deploy to Cloud Run
```powershell
# Build and deploy
gcloud run deploy backend `
  --source . `
  --platform managed `
  --region europe-west1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --max-instances 10 `
  --timeout 300s

# Note the service URL that's output
```

### Step 3: Verify Backend
```powershell
# Test health endpoint
curl https://backend-554106646136.europe-west1.run.app/health

# Expected response: {"status":"ok"}
```

---

## 🌐 Frontend Deployment

### CRITICAL: Pre-Deployment Checklist

✅ `.env.local` is removed or backed up  
✅ `.env.production` has correct backend URL  
✅ No hardcoded localhost references in code  
✅ Build cache is cleared  
✅ All tests pass

### Step 1: Clean Build Environment
```powershell
cd C:\hiking-portal\frontend

# Remove development environment file
if (Test-Path ".env.local") {
    Move-Item ".env.local" ".env.local.backup" -Force
}

# Clear build artifacts
Remove-Item -Recurse -Force "build", "node_modules/.cache" -ErrorAction SilentlyContinue
```

### Step 2: Validate Environment
```powershell
# Check that .env.production exists and is correct
Get-Content .env.production | Select-String "REACT_APP_API_URL"

# Should show: REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app
```

### Step 3: Build for Production
```powershell
# Set production environment
$env:NODE_ENV = "production"

# Build
npm run build

# This should complete without errors
```

### Step 4: Validate Build Output
```powershell
# Run validation script
node scripts/validate-deployment.js

# Should output: ✅ DEPLOYMENT READY
```

### Step 5: Deploy to Firebase
```powershell
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Wait for deployment to complete
```

### Step 6: Restore Development Environment
```powershell
# Restore .env.local for local development
if (Test-Path ".env.local.backup") {
    Move-Item ".env.local.backup" ".env.local" -Force
}
```

### Alternative: Use Automated Deployment Script
```powershell
# This handles all the steps above automatically
npm run deploy

# Or skip validation (not recommended)
npm run deploy-force
```

---

## ✔️ Post-Deployment Verification

### Automated Checks
```powershell
# Run the verification script
cd C:\hiking-portal\frontend
node scripts/verify-deployment.js
```

### Manual Verification Checklist

1. **Frontend Loading**
   - Visit https://www.thenarrowtrail.co.za
   - Check browser console for errors
   - Verify no localhost references in Network tab

2. **Backend Connectivity**
   - Open browser DevTools → Network
   - Interact with the app (view hikes, etc.)
   - Verify API calls go to `backend-554106646136.europe-west1.run.app`

3. **Authentication**
   - Try to login
   - Verify token storage
   - Check protected routes

4. **Key Features**
   - Create/view hikes
   - Upload photos
   - Submit payments
   - Admin functions

5. **Mobile Responsiveness**
   - Test on mobile device
   - Check PWA functionality
   - Verify offline mode

---

## ⏮️ Rollback Procedures

### Frontend Rollback (Firebase)
```powershell
# List recent deployments
firebase hosting:channel:list

# Rollback to specific version
firebase hosting:rollback

# Or via Firebase Console
# https://console.firebase.google.com → Hosting → Release history → Rollback
```

### Backend Rollback (Cloud Run)
```powershell
# List revisions
gcloud run revisions list --service=backend --region=europe-west1

# Route traffic to previous revision
gcloud run services update-traffic backend `
  --to-revisions=<REVISION_NAME>=100 `
  --region=europe-west1
```

---

## 🔧 Common Issues & Solutions

### Issue: "localhost" found in production build

**Cause**: `.env.local` not removed before build

**Solution**:
```powershell
Remove-Item ".env.local" -Force
Remove-Item -Recurse -Force "build", "node_modules/.cache"
npm run build
```

### Issue: CORS errors in production

**Cause**: Backend CORS not configured for production domain

**Solution**: Check `backend/server.js`:
```javascript
const allowedOrigins = [
  'https://www.thenarrowtrail.co.za',
  'https://helloliam.web.app',
  // Add any other production domains
];
```

### Issue: 404 errors for routes in Firebase

**Cause**: Firebase rewrites not configured

**Solution**: Check `firebase.json`:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Issue: Environment variables not loading

**Cause**: Variables don't start with `REACT_APP_`

**Solution**: All React environment variables MUST start with `REACT_APP_`

### Issue: Build succeeds but app shows blank screen

**Cause**: Runtime errors or missing environment variables

**Solution**:
1. Check browser console for errors
2. Verify `REACT_APP_API_URL` is set correctly
3. Check that backend is accessible

---

## 📝 Deployment Checklist Template

Copy this for each deployment:

```
□ Backend changes tested locally
□ Database migrations applied
□ Backend deployed to Cloud Run
□ Backend health check passed
□ .env.local removed from frontend
□ Frontend build completed successfully
□ Build validation passed
□ Firebase deployment successful
□ Manual verification completed
□ Monitoring dashboard checked
□ .env.local restored for development
□ Deployment documented in changelog
```

---

## 🆘 Emergency Contacts

- **System Admin**: [Your contact info]
- **Database Admin**: [Contact info]
- **Google Cloud Support**: https://console.cloud.google.com/support
- **Firebase Support**: https://console.firebase.google.com/support

---

## 📚 Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)

---

## 🔄 Version History

| Date | Version | Changes | Deployed By |
|------|---------|---------|-------------|
| 2025-10-13 | 1.0.0 | Initial deployment guide | System Admin |

---

**Remember**: When in doubt, test locally first! 🧪
