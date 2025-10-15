# Current State Analysis - October 15, 2025

## ⚠️ DO NOT DEPLOY - ANALYSIS ONLY

This document contains a complete analysis of the current production state to understand issues before making any changes.

---

## 🎯 Current Production Environment

### Frontend
- **URL:** https://helloliam.web.app
- **Platform:** Firebase Hosting
- **Project:** helloliam
- **Last Known Working Version:** 070537cda34d3974 (per PRODUCTION_DEPLOYMENT_FIXED_2025-10-15.md)

### Backend
- **URL:** https://backend-4kzqyywlqq-ew.a.run.app
- **Platform:** Google Cloud Run
- **Region:** europe-west1
- **Project:** helloliam (ID: 554106646136)
- **Last Known Working Revision:** backend-00066-k2z (per docs)

### Database
- **Instance Name:** hiking-db
- **Type:** Cloud SQL PostgreSQL 14.19
- **Connection Name:** helloliam:us-central1:hiking-db
- **Public IP:** 35.202.149.98
- **Database Name:** hiking_portal
- **Location:** us-central1-c

---

## 🔍 Database Configuration Analysis

### Backend Database Connection Priority Chain

The backend uses `config/database.js` which has the following priority:

```javascript
Priority 1: process.env.DATABASE_URL
  ↓ If this exists, uses connection string (ignores all other vars)
  ↓ Format: postgresql://user:password@host:port/database
  
Priority 2: Individual environment variables
  ↓ DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT
  ↓ If DB_HOST starts with '/cloudsql/', uses Unix socket
  ↓ Otherwise uses TCP connection with SSL
```

### Critical Files

**backend/.env.production** (copied into Docker image during build):
```bash
DB_HOST=/cloudsql/helloliam:us-central1:hiking-db
DB_USER=postgres
DB_PASSWORD=!Dobby1021
DB_NAME=hiking_portal
DB_PORT=5432

# COMMENTED OUT (as of my last edit):
# DATABASE_URL=postgresql://postgres:!Dobby1021@35.202.149.98:5432/hiking_portal
```

**Issue Identified:**
- Originally, `DATABASE_URL` was active in `.env.production`
- This would cause TCP connection to 35.202.149.98 instead of Unix socket
- When using `--source .` deployment, `.env.production` is copied into container
- `DATABASE_URL` takes precedence over `DB_HOST` environment variable
- **However**, the working deployment may have overridden this via Cloud Run env vars

---

## 🚀 Cloud Run Deployment Methods

### Method 1: Source-based deployment (Buildpacks)
```bash
gcloud run deploy backend \
  --source . \
  --platform managed \
  --region europe-west1
```
**What happens:**
- Cloud Build uses buildpacks to detect project type
- Copies `.env.production` into container
- `DATABASE_URL` in `.env.production` takes precedence
- May cause TCP connection instead of Unix socket

### Method 2: Container image deployment
```bash
# Step 1: Build image
gcloud builds submit --tag europe-west1-docker.pkg.dev/helloliam/cloud-run-source-deploy/backend

# Step 2: Deploy image
gcloud run deploy backend \
  --image europe-west1-docker.pkg.dev/helloliam/cloud-run-source-deploy/backend:latest \
  --set-env-vars DB_HOST=/cloudsql/helloliam:us-central1:hiking-db
```
**What happens:**
- Dockerfile builds the image explicitly
- Still copies `.env.production` if not in .dockerignore
- Environment variables from deployment command may override .env file
- More control over what gets included

### Correct Production Deployment (from docs)
```bash
gcloud run deploy backend \
  --source . \
  --set-env-vars="NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=/cloudsql/helloliam:us-central1:hiking-db,DB_PORT=5432,FRONTEND_URL=https://www.thenarrowtrail.co.za" \
  --add-cloudsql-instances=helloliam:us-central1:hiking-db \
  --set-secrets="DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,..."
```

**Key points:**
- `--add-cloudsql-instances` mounts the Cloud SQL Unix socket
- `--set-env-vars DB_HOST=/cloudsql/...` sets the socket path
- These env vars **may override** `DATABASE_URL` from `.env.production`

---

## 🔄 Revision History (from my terminal commands)

### Revisions Created During Troubleshooting:
1. **backend-00059-xlc** - Old revision (before my changes)
2. **backend-00060-57f** - Created during attempts
3. **backend-00061-tqp** - Created during attempts
4. **backend-00062-zpr** - Created during attempts
5. **backend-00063-pb5** - Created during attempts
6. **backend-00064-9bm** - Created with permission routes
7. **backend-00065-64z** - Created with Cloud SQL socket env vars
8. **backend-00066-k2z** - Documented as WORKING revision (per PRODUCTION_DEPLOYMENT_FIXED_2025-10-15.md)

### Current Unknown State:
- Don't know which revision is currently serving traffic
- Multiple revisions may exist with different configurations
- Need to check: `gcloud run services describe backend --region=europe-west1 --project=helloliam`

---

## 📋 Route Structure

### Public Routes (NO AUTH REQUIRED)
These should work without being logged in:
- `GET /health` - Health check
- `GET /` - API info
- `GET /api/hikes/public` - **Landing page hikes** ⚠️ REPORTED NOT WORKING
- `GET /api/public-content/:key` - Public content (mission/vision)

### Protected Routes (AUTH REQUIRED)
- `GET /api/permissions/user/permissions` - User permissions
- `GET /api/hikes` - Full hikes list
- `GET /api/my-hikes` - User's hikes dashboard
- All admin routes
- All profile routes

---

## 🐛 Reported Issue

### Problem Statement
**"Hikes are not loading on the landing page....it should load even if you are not logged in"**

### Expected Behavior
- Landing page (`frontend/src/components/landing/LandingPage.js`) calls `/api/hikes/public`
- This endpoint is public (no auth required)
- Should return upcoming hikes for display

### Code Analysis

**Frontend (LandingPage.js lines 23-46):**
```javascript
const fetchPublicHikes = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/hikes/public`);
    if (response.ok) {
      const data = await response.json();
      setHikes(data);
    }
  } catch (err) {
    console.error('Fetch public hikes error:', err);
  } finally {
    setLoading(false);
  }
};
```

**Backend (routes/hikes.js line 10):**
```javascript
router.get('/public', hikeController.getPublicHikes);
```

**Controller (controllers/hikeController.js lines 8-22):**
```javascript
exports.getPublicHikes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, date, difficulty, distance, description, type, cost, group_type, status, image_url, gps_coordinates, price_is_estimate, date_is_estimate
       FROM hikes
       WHERE date >= CURRENT_DATE
       ORDER BY date ASC
       LIMIT 12`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get public hikes error:', error);
    res.status(500).json({ error: 'Failed to fetch hikes' });
  }
};
```

**Analysis:**
- Route is registered correctly
- No authentication middleware on this route
- Query is straightforward
- **REQUIRES DATABASE CONNECTION** ⚠️

### Previous Error Logs Showed
```
Get public hikes error: Error: connect ETIMEDOUT 35.202.149.98:5432
```

**This means:**
- Backend is trying to connect via TCP to IP address
- Not using the Unix socket path
- Database connection is failing
- Returns 500 error or timeout

---

## 🔧 Environment Variable Precedence Issue

### The Root Cause (Hypothesis)

1. **`.env.production` file contains:** `DATABASE_URL=postgresql://...@35.202.149.98:5432/...`
2. **Docker build copies this file** into the container
3. **Node.js `dotenv` loads it** when the app starts
4. **`database.js` checks `process.env.DATABASE_URL` FIRST**
5. **Even if Cloud Run sets `DB_HOST=/cloudsql/...`**, it's ignored

### Why Setting Env Vars Might Not Work

**Scenario A: Using `--source` deployment**
```bash
gcloud run deploy --source . --set-env-vars DB_HOST=/cloudsql/...
```
- Buildpack copies `.env.production` into image
- `dotenv` loads `DATABASE_URL` from file
- Cloud Run env vars may not override dotenv-loaded vars
- Result: Uses TCP connection from `DATABASE_URL`

**Scenario B: Using `--image` deployment**
```bash
gcloud run deploy --image <tag> --set-env-vars DB_HOST=/cloudsql/...
```
- Dockerfile copies `.env.production` into image
- Same issue as Scenario A

### Potential Solutions (NOT IMPLEMENTING YET)

1. **Remove `DATABASE_URL` from `.env.production`**
   - Let Cloud Run env vars be the only source
   - Requires rebuild and redeploy

2. **Don't include `.env.production` in Docker image**
   - Add to `.dockerignore`
   - Requires rebuild and redeploy

3. **Change code to prioritize Cloud Run env vars**
   - Modify `database.js` to check individual vars first
   - Requires code change, rebuild, redeploy

4. **Use `DATABASE_URL` correctly**
   - Set `DATABASE_URL` via Cloud Run with socket path
   - Format: `postgresql://user:pass@/dbname?host=/cloudsql/instance`
   - No code changes needed, just redeploy

---

## ✅ What We Know For Sure

1. **Frontend is correctly configured** (per .env.production)
   - `REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app`
   - `REACT_APP_SOCKET_URL=https://backend-4kzqyywlqq-ew.a.run.app`

2. **Routes are defined correctly**
   - `/api/hikes/public` route exists
   - Controller function exists
   - No auth middleware blocking it

3. **Database connection is the issue**
   - Previous logs showed TCP connection timeouts
   - Backend needs to use Unix socket for Cloud SQL
   - The configuration precedence is problematic

4. **A working deployment existed** (per docs)
   - Revision: backend-00066-k2z
   - Deployed: Oct 15, 2025, 11:24 UTC
   - Verified working with all endpoints

---

## 🎯 Next Steps (DIAGNOSTIC ONLY - NO DEPLOYMENT)

### Step 1: Check Current State
```bash
# What revision is serving traffic?
gcloud run services describe backend --region=europe-west1 --project=helloliam \
  --format="value(status.latestReadyRevisionName,status.traffic[0].revisionName)"

# What are the env vars on current revision?
gcloud run revisions describe <revision> --region=europe-west1 --project=helloliam \
  --format="yaml(spec.containers[0].env)"

# Is Cloud SQL instance connected?
gcloud run revisions describe <revision> --region=europe-west1 --project=helloliam \
  --format="value(metadata.annotations.'run.googleapis.com/cloudsql-instances')"
```

### Step 2: Test Endpoints
```bash
# Test health (should always work)
curl https://backend-4kzqyywlqq-ew.a.run.app/health

# Test public hikes (requires database)
curl https://backend-4kzqyywlqq-ew.a.run.app/api/hikes/public
```

### Step 3: Check Logs
```bash
# Recent errors
gcloud logging read \
  'resource.type=cloud_run_revision AND resource.labels.service_name=backend AND severity>=ERROR' \
  --limit=20 --project=helloliam --format='table(timestamp,textPayload)' --freshness=30m

# Database connection logs
gcloud logging read \
  'resource.type=cloud_run_revision AND resource.labels.service_name=backend AND textPayload:"Database"' \
  --limit=10 --project=helloliam --format='table(timestamp,textPayload)' --freshness=30m
```

### Step 4: Identify Root Cause
Based on diagnostics:
- If revision is NOT backend-00066-k2z → Need to route traffic to working revision
- If database connection failing → Need to fix DATABASE_URL precedence issue
- If different error → Investigate specific issue

---

## 📝 Changes Made During This Session

### Files Modified:
1. **backend/.env.production**
   - Changed: Commented out `DATABASE_URL` line
   - Reason: To prevent TCP connection precedence issue
   - Status: NOT DEPLOYED (no rebuild/redeploy done)

2. **backend/deploy-to-cloud-run.ps1**
   - Changed: Updated to use Cloud SQL socket path
   - Added: `--add-cloudsql-instances` flag
   - Status: NOT EXECUTED

3. **frontend/.env.production**
   - Changed: Updated `REACT_APP_SOCKET_URL` to correct backend
   - Status: May have been deployed (frontend rebuild occurred)

### Deployments Attempted (ALL FAILED OR CANCELLED):
- Multiple Docker build attempts
- Cloud Run deployment attempts
- All were either cancelled or failed due to various errors

### Current Repository State:
- Modified files exist locally
- No confirmed successful deployments
- Production may still be on old working revision
- Frontend may have been redeployed (need to verify)

---

## ⚠️ CRITICAL WARNINGS

1. **DO NOT** deploy without understanding current state
2. **DO NOT** assume DATABASE_URL fix will work without testing
3. **DO NOT** route traffic without verifying revision works
4. **DO VERIFY** which revision is currently serving production traffic
5. **DO TEST** endpoints directly before making changes
6. **DO CHECK** logs to understand actual current errors

---

## 📊 Decision Matrix

| Scenario | Action Required |
|----------|----------------|
| Correct revision serving, just need traffic routing | Use `update-traffic` command |
| Wrong DATABASE_URL in running revision | Rebuild with fixed .env, redeploy |
| No Cloud SQL instance connection | Add `--add-cloudsql-instances` flag |
| Frontend calling wrong backend | Rebuild and redeploy frontend |
| Different issue entirely | Investigate logs and error messages |

---

**Status:** ANALYSIS COMPLETE - AWAITING DIAGNOSTIC COMMANDS
**Date:** October 15, 2025
**Next Action:** Run diagnostic commands to determine current state before any deployment
