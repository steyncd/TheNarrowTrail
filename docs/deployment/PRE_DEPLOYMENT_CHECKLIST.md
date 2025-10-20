# ✅ Pre-Deployment Checklist

**Use this checklist before EVERY production deployment to prevent configuration errors**

---

## 🎯 Quick Pre-Flight Check (2 minutes)

Run these commands before deploying:

```bash
# Navigate to project root
cd /path/to/hiking-portal

# Run validation script
./scripts/pre-deploy-check.sh
```

If validation script doesn't exist or fails, proceed with manual checklist below.

---

## 📋 Manual Checklist

### Phase 1: Code & Dependencies ✓

- [ ] **All changes committed to git**
  ```bash
  git status  # Should show "working tree clean"
  ```

- [ ] **Dependencies installed**
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

- [ ] **No security vulnerabilities**
  ```bash
  cd backend && npm audit --production
  cd ../frontend && npm audit --production
  ```

- [ ] **Backend starts locally without errors**
  ```bash
  cd backend && npm start
  # Should see: "Server running on port 5000"
  # Ctrl+C to stop
  ```

---

### Phase 2: Frontend Configuration ⚠️ CRITICAL

- [ ] **Frontend .env.production exists**
  ```bash
  ls -la frontend/.env.production  # Must exist
  ```

- [ ] **Correct backend URL configured**
  ```bash
  grep "REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app" frontend/.env.production
  # Must match exactly ✓
  ```

- [ ] **No .env.local file (or renamed to .DISABLED)**
  ```bash
  ls frontend/.env.local  # Should show "No such file or directory"
  # If exists: mv frontend/.env.local frontend/.env.local.DISABLED
  ```

- [ ] **Debug mode disabled**
  ```bash
  grep "REACT_APP_DEBUG=false" frontend/.env.production
  # Must be false ✓
  ```

- [ ] **Production environment set**
  ```bash
  grep "REACT_APP_ENV=production" frontend/.env.production
  # Must be production ✓
  ```

- [ ] **Frontend builds successfully**
  ```bash
  cd frontend
  rm -rf build  # Clean old build
  npm run build
  # Should complete without errors ✓
  ```

- [ ] **Correct backend URL in build**
  ```bash
  grep -r "backend-4kzqyywlqq-ew.a.run.app" frontend/build/static/js/main.*.js
  # Should return matches ✓
  ```

---

### Phase 3: Backend Configuration ⚠️ CRITICAL

- [ ] **Cloud Run deploy command ready**
  - Review deployment command in [DEPLOYMENT.md](./DEPLOYMENT.md#backend-deployment-cloud-run)
  - Verify all parameters are correct

- [ ] **Database connection uses Unix socket**
  ```bash
  # Deploy command MUST include:
  DB_HOST=/cloudsql/helloliam:us-central1:hiking-db
  # NOT: DB_HOST=35.202.149.98
  ```

- [ ] **Cloud SQL instance attached**
  ```bash
  # Deploy command MUST include:
  --add-cloudsql-instances=helloliam:us-central1:hiking-db
  ```

- [ ] **All secrets exist in Secret Manager**
  ```bash
  gcloud secrets list --project=helloliam | grep -E "(db-password|jwt-secret|sendgrid|twilio|openweather)"
  # Should show all 8 secrets ✓
  ```

---

### Phase 4: Database

- [ ] **Database is accessible**
  ```bash
  gcloud sql instances describe hiking-db --project=helloliam --format="value(state)"
  # Should return: RUNNABLE ✓
  ```

- [ ] **Any database migrations tested**
  ```bash
  # If you have migrations, test them first:
  # 1. Backup: gcloud sql backups create --instance=hiking-db --project=helloliam
  # 2. Run migration script
  # 3. Verify data integrity
  ```

- [ ] **Backup created (if making significant changes)**
  ```bash
  gcloud sql backups create --instance=hiking-db --project=helloliam --description="Pre-deployment backup $(date +%Y%m%d)"
  ```

---

### Phase 5: Pre-Deployment Tests

- [ ] **Backend health check passes**
  ```bash
  curl https://backend-4kzqyywlqq-ew.a.run.app/health
  # Expected: {"status":"ok","timestamp":"..."}
  ```

- [ ] **Critical API endpoints responding**
  ```bash
  curl https://backend-4kzqyywlqq-ew.a.run.app/api/hikes/public
  # Should return array of hikes

  curl https://backend-4kzqyywlqq-ew.a.run.app/api/public-content/mission_vision
  # Should return content object
  ```

- [ ] **No recent errors in backend logs**
  ```bash
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND severity>=ERROR AND timestamp>=\"$(date -u -d '10 minutes ago' '+%Y-%m-%dT%H:%M:%SZ')\"" --limit=10 --project=helloliam
  # Should show "Listed 0 items" or only old errors
  ```

---

### Phase 6: Deployment Plan

- [ ] **Deployment window planned**
  - [ ] Deploying during low-traffic period
  - [ ] Team member available for monitoring
  - [ ] Rollback plan ready if needed

- [ ] **Stakeholders notified** (if applicable)
  - [ ] Users informed of potential brief downtime
  - [ ] Team aware of deployment

- [ ] **Monitoring tools ready**
  - [ ] GCP Console open: https://console.cloud.google.com/run?project=helloliam
  - [ ] Firebase Console open: https://console.firebase.google.com/project/helloliam
  - [ ] Browser DevTools ready for frontend testing

---

## 🚀 Ready to Deploy?

If all items above are checked ✓, proceed with deployment:

1. **Backend First:**
   ```bash
   cd backend
   # Copy full deployment command from DEPLOYMENT.md
   gcloud run deploy backend...
   ```

2. **Verify Backend:**
   ```bash
   curl https://backend-4kzqyywlqq-ew.a.run.app/health
   ```

3. **Frontend Second:**
   ```bash
   cd frontend
   firebase deploy --only hosting
   ```

4. **Verify Frontend:**
   - Open: https://helloliam.web.app
   - Check console for errors (F12)
   - Test login and core functionality

---

## 🔍 Post-Deployment Verification

After deploying, complete the [Verification Steps in DEPLOYMENT.md](./DEPLOYMENT.md#verification-steps)

### Quick Verification

```bash
# 1. Backend health
curl https://backend-4kzqyywlqq-ew.a.run.app/health

# 2. Frontend loads
curl -I https://helloliam.web.app

# 3. No errors in logs (last 5 minutes)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND severity>=ERROR AND timestamp>=\"$(date -u -d '5 minutes ago' '+%Y-%m-%dT%H:%M:%SZ')\"" --limit=20 --project=helloliam

# 4. Test login and core features in browser
```

### Full Testing Checklist

- [ ] Homepage loads without errors
- [ ] User can login
- [ ] Dashboard displays data
- [ ] Hikes list populates
- [ ] Admin features work (if applicable)
- [ ] Mobile view renders correctly
- [ ] No console errors in browser DevTools

---

## 🔄 If Issues Occur

### Immediate Actions

1. **Check logs immediately:**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND severity>=ERROR" --limit=50 --project=helloliam
   ```

2. **If critical issue, rollback:**
   - See [Rollback Procedures in DEPLOYMENT.md](./DEPLOYMENT.md#rollback-procedures)

3. **Document the issue:**
   - What went wrong?
   - What was the error message?
   - How was it resolved?
   - Update this checklist if needed

---

## 📊 Deployment Record

Keep a record of your deployments:

```
Date: _______________
Time: _______________
Deployed by: _______________
Changes: _______________________________________________
Backend Revision: _______________
Frontend Version: _______________
Issues encountered: _______________________________________________
Rollback required: Yes / No
```

---

## 🛠️ Tools & Resources

### Quick Links

- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Configuration Reference:** [CONFIGURATION.md](./CONFIGURATION.md)
- **GCP Console:** https://console.cloud.google.com/run?project=helloliam
- **Firebase Console:** https://console.firebase.google.com/project/helloliam

### Useful Commands

```bash
# Check current backend revision
gcloud run services describe backend --region=europe-west1 --project=helloliam --format="value(status.latestReadyRevisionName)"

# Check frontend deployment version
firebase hosting:channel:list --project=helloliam

# Real-time backend logs
gcloud run services logs tail backend --region=europe-west1 --project=helloliam

# List recent revisions for rollback
gcloud run revisions list --service=backend --region=europe-west1 --project=helloliam --limit=5
```

---

**Last Updated:** October 15, 2025
**Purpose:** Prevent configuration errors and ensure smooth deployments
**Status:** ✅ Active - Use Before Every Deployment
