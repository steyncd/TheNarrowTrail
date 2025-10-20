# 🚀 Hiking Portal - Production Deployment Guide

**Last Updated:** October 15, 2025
**Current Version:** Production Ready
**Status:** ✅ Fully Operational

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Configuration](#environment-configuration)
4. [Backend Deployment (Cloud Run)](#backend-deployment-cloud-run)
5. [Frontend Deployment (Firebase)](#frontend-deployment-firebase)
6. [Verification Steps](#verification-steps)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Reference

### Production URLs
- **Frontend:** https://helloliam.web.app
- **Backend API:** https://backend-4kzqyywlqq-ew.a.run.app
- **Custom Domain (Planned):** https://www.thenarrowtrail.co.za

### Infrastructure
- **Cloud Platform:** Google Cloud Platform (Project: `helloliam`)
- **Backend:** Cloud Run (Region: `europe-west1`)
- **Frontend:** Firebase Hosting
- **Database:** Cloud SQL PostgreSQL (Instance: `hiking-db`, Region: `us-central1`)
- **Secrets:** Google Secret Manager

### Key Configuration Files
- **Backend Config:** `backend/.env.example` (template)
- **Frontend Config:** `frontend/.env.production` ⚠️ **CRITICAL**
- **Database Config:** `backend/config/database.js`
- **Environment Loader:** `backend/config/env.js`

---

## ✅ Pre-Deployment Checklist

### Before Every Deployment

- [ ] **Code Review:** All changes reviewed and tested locally
- [ ] **Environment Files:** Verify correct URLs and secrets
- [ ] **Database Migrations:** Run and test any schema changes
- [ ] **Dependencies:** `npm install` completed without errors
- [ ] **Build Test:** Frontend builds successfully with `npm run build`
- [ ] **Backend Test:** Backend starts without errors locally
- [ ] **API Tests:** Critical endpoints tested and responding
- [ ] **Git Status:** All changes committed with clear messages

### Critical Configuration Verification

⚠️ **MUST VERIFY BEFORE DEPLOYMENT:**

```bash
# 1. Check Frontend Environment File
cat frontend/.env.production

# MUST contain:
REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app
REACT_APP_SOCKET_URL=https://backend-4kzqyywlqq-ew.a.run.app
REACT_APP_ENV=production
REACT_APP_DEBUG=false

# 2. Verify Backend will use Cloud SQL Unix Socket
# backend/config/database.js should use:
# - DB_HOST=/cloudsql/helloliam:us-central1:hiking-db (for Cloud Run)
# - NOT 35.202.149.98 (TCP connection won't work from Cloud Run)
```

---

## 🔧 Environment Configuration

### Backend Environment Variables

**Location:** Configured via `gcloud run deploy` command (NOT from .env file in production)

#### Required Variables (Set via --set-env-vars)
```bash
NODE_ENV=production
DB_USER=postgres
DB_NAME=hiking_portal
DB_HOST=/cloudsql/helloliam:us-central1:hiking-db  # ⚠️ CRITICAL: Unix socket path
DB_PORT=5432
FRONTEND_URL=https://www.thenarrowtrail.co.za
```

#### Required Secrets (Set via --set-secrets)
```bash
DB_PASSWORD=db-password:latest
JWT_SECRET=jwt-secret:latest
SENDGRID_API_KEY=sendgrid-key:latest
SENDGRID_FROM_EMAIL=sendgrid-from-email:latest
OPENWEATHER_API_KEY=openweather-api-key:latest
TWILIO_ACCOUNT_SID=twilio-sid:latest
TWILIO_AUTH_TOKEN=twilio-token:latest
TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest
```

**How to Update Secrets:**
```bash
# View current secrets
gcloud secrets list --project=helloliam

# Update a secret
echo -n "new-secret-value" | gcloud secrets versions add SECRET_NAME --data-file=- --project=helloliam

# Example: Update JWT secret
echo -n "new-jwt-secret-here" | gcloud secrets versions add jwt-secret --data-file=- --project=helloliam
```

### Frontend Environment Variables

**Location:** `frontend/.env.production` ⚠️ **EMBEDDED IN BUILD**

```bash
# API Configuration
REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app
REACT_APP_SOCKET_URL=https://backend-4kzqyywlqq-ew.a.run.app

# Environment
REACT_APP_ENV=production

# Debugging (MUST be false in production)
REACT_APP_DEBUG=false

# Logging
REACT_APP_LOG_LEVEL=error

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_OFFLINE=true

# Session
REACT_APP_SESSION_TIMEOUT=3600000

# Domain Configuration
REACT_APP_DOMAIN=www.thenarrowtrail.co.za
PUBLIC_URL=/
```

⚠️ **CRITICAL:** These values are **embedded into the JavaScript bundle** during `npm run build`. Always verify before building!

---

## 🖥️ Backend Deployment (Cloud Run)

### Step 1: Prepare Backend

```bash
cd backend

# Verify dependencies
npm install

# Test locally (optional but recommended)
npm start
```

### Step 2: Deploy to Cloud Run

```bash
gcloud run deploy backend \
  --source . \
  --platform managed \
  --region europe-west1 \
  --project helloliam \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=/cloudsql/helloliam:us-central1:hiking-db,DB_PORT=5432,FRONTEND_URL=https://www.thenarrowtrail.co.za" \
  --add-cloudsql-instances=helloliam:us-central1:hiking-db \
  --set-secrets="DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest" \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --min-instances=0 \
  --service-account=554106646136-compute@developer.gserviceaccount.com
```

### Step 3: Route Traffic to New Revision

```bash
# Check deployment status
gcloud run services describe backend \
  --region europe-west1 \
  --project helloliam \
  --format="table(status.url,status.latestReadyRevisionName)"

# Route traffic to latest revision
gcloud run services update-traffic backend \
  --to-latest \
  --region=europe-west1 \
  --project=helloliam
```

### Step 4: Verify Backend

```bash
# Health check
curl https://backend-4kzqyywlqq-ew.a.run.app/health

# Test API endpoints
curl https://backend-4kzqyywlqq-ew.a.run.app/api/hikes/public
curl https://backend-4kzqyywlqq-ew.a.run.app/api/public-content/mission_vision
```

---

## 🌐 Frontend Deployment (Firebase)

### Step 1: Verify Configuration

⚠️ **CRITICAL STEP - DO NOT SKIP:**

```bash
cd frontend

# 1. Check environment file
cat .env.production

# MUST show:
# REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app
# REACT_APP_SOCKET_URL=https://backend-4kzqyywlqq-ew.a.run.app

# 2. Verify no .env.local file exists (it overrides production)
ls -la .env.local  # Should show "No such file or directory"

# 3. If .env.local exists and you need production build:
mv .env.local .env.local.DISABLED
```

### Step 2: Build Frontend

```bash
# Install dependencies
npm install

# Build for production (uses .env.production)
npm run build

# Verify build succeeded
ls -lh build/

# Verify correct backend URL is in the build
grep -r "backend-4kzqyywlqq-ew.a.run.app" build/static/js/main.*.js
# Should return matches if configured correctly
```

### Step 3: Deploy to Firebase

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Output will show:
# ✔ Deploy complete!
# Hosting URL: https://helloliam.web.app
```

### Step 4: Verify Frontend

```bash
# Check deployment
curl -I https://helloliam.web.app

# Verify correct backend URL embedded
curl -s https://helloliam.web.app/static/js/main.*.js | grep -o "backend-4kzqyywlqq"
```

---

## ✔️ Verification Steps

### 1. Backend Verification

```bash
# Health check
curl https://backend-4kzqyywlqq-ew.a.run.app/health
# Expected: {"status":"ok","timestamp":"..."}

# Database connection check
curl https://backend-4kzqyywlqq-ew.a.run.app/api/hikes/public
# Expected: Array of hikes

# Check logs for errors
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=backend" \
  --limit=20 \
  --project=helloliam
```

### 2. Frontend Verification

```bash
# Open in browser
open https://helloliam.web.app

# Check console for errors (should be none)
# Try logging in
# Verify data loads on dashboard
```

### 3. Database Verification

```bash
# Connect to production database
gcloud sql connect hiking-db --user=postgres --project=helloliam

# Run verification queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM hikes;
SELECT COUNT(*) FROM payments;
```

### 4. End-to-End Test

- [ ] Homepage loads without errors
- [ ] User can register/login
- [ ] Dashboard shows data
- [ ] Hikes list populates
- [ ] User management page shows all users (with pagination)
- [ ] No console errors in browser DevTools
- [ ] Backend logs show no errors

---

## 🔄 Rollback Procedures

### Backend Rollback

```bash
# 1. List recent revisions
gcloud run revisions list \
  --service=backend \
  --region=europe-west1 \
  --project=helloliam \
  --limit=5

# 2. Route traffic to previous revision
gcloud run services update-traffic backend \
  --to-revisions=PREVIOUS_REVISION_NAME=100 \
  --region=europe-west1 \
  --project=helloliam

# Example:
gcloud run services update-traffic backend \
  --to-revisions=backend-00065-64z=100 \
  --region=europe-west1 \
  --project=helloliam
```

### Frontend Rollback

```bash
cd frontend

# 1. Check previous Firebase versions
firebase hosting:channel:list --project=helloliam

# 2. If you have the previous build folder:
firebase deploy --only hosting

# 3. Or rebuild from git:
git checkout HEAD~1 -- frontend/.env.production
npm run build
firebase deploy --only hosting
git checkout HEAD -- frontend/.env.production
```

### Database Rollback

⚠️ **Use with extreme caution - test in staging first:**

```bash
# 1. Create backup before rollback
gcloud sql backups create \
  --instance=hiking-db \
  --project=helloliam

# 2. Restore from backup
gcloud sql backups list \
  --instance=hiking-db \
  --project=helloliam

gcloud sql backups restore BACKUP_ID \
  --backup-instance=hiking-db \
  --project=helloliam
```

---

## 🔍 Troubleshooting

### Issue: Frontend Shows "Failed to fetch" or API Errors

**Diagnosis:**
```bash
# Check browser console - look for CORS or 404 errors
# Check network tab - see what URL is being called

# Verify environment file
cat frontend/.env.production

# Check if wrong URL is embedded in build
grep -r "REACT_APP_API_URL" frontend/build/
```

**Solution:**
1. Fix `frontend/.env.production` with correct backend URL
2. Delete build folder: `rm -rf frontend/build`
3. Rebuild: `npm run build`
4. Redeploy: `firebase deploy --only hosting`

---

### Issue: Backend Returns 500 or Database Connection Errors

**Diagnosis:**
```bash
# Check logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND severity>=ERROR" \
  --limit=50 \
  --project=helloliam
```

**Common Causes:**

**1. Wrong DB_HOST (TCP instead of Unix socket)**
```
Error: connect ETIMEDOUT 35.202.149.98:5432
```
**Solution:** Redeploy with `DB_HOST=/cloudsql/helloliam:us-central1:hiking-db`

**2. Missing Cloud SQL Instance Connection**
```
Error: Cannot connect to Cloud SQL instance
```
**Solution:** Add `--add-cloudsql-instances=helloliam:us-central1:hiking-db` to deploy command

**3. Wrong Database Credentials**
```
Error: password authentication failed for user "postgres"
```
**Solution:** Update `db-password` secret in Secret Manager

---

### Issue: Users Can't See All Users (Pagination)

**Diagnosis:**
- Backend API defaults to `limit=10`
- Frontend wasn't requesting all users

**Solution:** Already fixed in latest deployment
- Frontend now calls: `/api/admin/users?limit=1000`
- Pagination implemented in UI

---

### Issue: Deploy Shows Success But Changes Not Visible

**Frontend (Firebase):**
```bash
# Clear browser cache
# Force refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check Firebase version deployed
firebase hosting:channel:list --project=helloliam
```

**Backend (Cloud Run):**
```bash
# Check which revision is serving traffic
gcloud run services describe backend \
  --region=europe-west1 \
  --project=helloliam \
  --format="value(status.traffic[0].revisionName)"

# Route to latest
gcloud run services update-traffic backend \
  --to-latest \
  --region=europe-west1 \
  --project=helloliam
```

---

## 📊 Monitoring & Logs

### Backend Logs (Cloud Run)

```bash
# Real-time logs
gcloud run services logs tail backend \
  --region=europe-west1 \
  --project=helloliam

# Recent errors only
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND severity>=ERROR" \
  --limit=50 \
  --project=helloliam

# Specific time range
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND timestamp>=\"2025-10-15T10:00:00Z\"" \
  --limit=100 \
  --project=helloliam
```

### Frontend Logs (Firebase)

```bash
# Check deployment history
firebase hosting:channel:list --project=helloliam

# View hosting analytics
# Visit: https://console.firebase.google.com/project/helloliam/hosting
```

### Database Monitoring

```bash
# Check database status
gcloud sql instances describe hiking-db --project=helloliam

# View database metrics
# Visit: https://console.cloud.google.com/sql/instances/hiking-db/monitoring?project=helloliam
```

---

## 🎯 Best Practices

### 1. Always Use Version Control
```bash
# Before deployment, commit all changes
git add .
git commit -m "feat: description of changes"
git push origin main
```

### 2. Test Locally First
```bash
# Backend
cd backend && npm start

# Frontend (with production build)
cd frontend && npm run build && npx serve -s build
```

### 3. Deploy During Low Traffic
- Prefer deployments during off-peak hours
- Monitor logs immediately after deployment
- Be ready to rollback if issues occur

### 4. Keep Documentation Updated
- Update this file when configuration changes
- Document any new environment variables
- Note any breaking changes

### 5. Backup Before Major Changes
```bash
# Database backup
gcloud sql backups create \
  --instance=hiking-db \
  --project=helloliam

# Code backup (git tag)
git tag -a v1.0.0 -m "Pre-major-update backup"
git push origin v1.0.0
```

---

## 📞 Support & Resources

### Documentation
- [Main README](./README.md)
- [Configuration Guide](./CONFIGURATION.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

### GCP Console Links
- **Project:** https://console.cloud.google.com/home/dashboard?project=helloliam
- **Cloud Run:** https://console.cloud.google.com/run?project=helloliam
- **Cloud SQL:** https://console.cloud.google.com/sql/instances?project=helloliam
- **Secret Manager:** https://console.cloud.google.com/security/secret-manager?project=helloliam

### Firebase Console
- **Project:** https://console.firebase.google.com/project/helloliam
- **Hosting:** https://console.firebase.google.com/project/helloliam/hosting

---

## 📝 Deployment History

### Latest Deployments

**October 15, 2025 - Bug Fixes & Pagination**
- Fixed: All 12 users now displayed (was showing only 10)
- Fixed: Backend URL configuration issue
- Fixed: Database connection using Unix socket
- Added: Smart pagination with per-page selector
- Added: Enhanced user count display

**October 14, 2025 - Initial Production Deployment**
- Backend deployed to Cloud Run
- Frontend deployed to Firebase Hosting
- Database connected via Cloud SQL
- All secrets configured in Secret Manager

---

**Last Updated:** October 15, 2025
**Maintainer:** Development Team
**Status:** ✅ Production Ready
