# Backend Deployment Plan - Weather API Implementation

## 🔍 Pre-Deployment Status Check

### ✅ Completed:
- [x] Database migration run successfully
- [x] All backend code implemented
- [x] Original weatherService.js backed up

### ⚠️ Required Before Deployment:
- [ ] Create Visual Crossing API secret in Google Secret Manager
- [ ] Create WeatherAPI.com API secret in Google Secret Manager
- [ ] Update deployment script to include new secrets
- [ ] Build and push Docker image
- [ ] Deploy to Cloud Run

---

## 📋 Current Deployment Configuration

### Cloud Build Config (`cloudbuild.yaml`)
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'europe-west1-docker.pkg.dev/helloliam/cloud-run-source-deploy/backend:latest', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'europe-west1-docker.pkg.dev/helloliam/cloud-run-source-deploy/backend:latest']
```

### Cloud Run Deployment Script (`deploy-to-cloud-run.ps1`)
**Current Configuration:**
- Region: europe-west1
- Platform: managed
- Memory: 512Mi
- CPU: 1
- Port: 8080
- Service Account: 554106646136-compute@developer.gserviceaccount.com
- Cloud SQL: helloliam:us-central1:hiking-db

**Existing Secrets:**
- DB_PASSWORD=db-password:latest
- JWT_SECRET=jwt-secret:latest
- SENDGRID_API_KEY=sendgrid-key:latest
- SENDGRID_FROM_EMAIL=sendgrid-from-email:latest
- OPENWEATHER_API_KEY=openweather-api-key:latest
- TWILIO_ACCOUNT_SID=twilio-sid:latest
- TWILIO_AUTH_TOKEN=twilio-token:latest
- TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest

**⚠️ Missing Secrets (Need to Add):**
- VISUAL_CROSSING_API_KEY
- WEATHERAPI_KEY

---

## 🎯 Deployment Steps

### Step 1: Get API Keys (If Not Already Done)

#### Visual Crossing:
1. Go to: https://www.visualcrossing.com/
2. Sign up or log in
3. Navigate to Account → API Key
4. Copy your API key

#### WeatherAPI.com:
1. Go to: https://www.weatherapi.com/
2. Sign up or log in
3. Navigate to Dashboard → Your API Key
4. Copy your API key

**❓ Do you have these API keys ready?**

---

### Step 2: Create Secrets in Google Secret Manager

```powershell
# Create Visual Crossing API secret
# Replace YOUR_VISUAL_CROSSING_KEY with your actual key
$visualCrossingKey = "YOUR_VISUAL_CROSSING_KEY"
echo -n $visualCrossingKey | gcloud secrets create visualcrossing-api-key `
  --data-file=- `
  --project=helloliam `
  --replication-policy=automatic

# Create WeatherAPI secret
# Replace YOUR_WEATHERAPI_KEY with your actual key
$weatherApiKey = "YOUR_WEATHERAPI_KEY"
echo -n $weatherApiKey | gcloud secrets create weatherapi-key `
  --data-file=- `
  --project=helloliam `
  --replication-policy=automatic

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding visualcrossing-api-key `
  --member="serviceAccount:554106646136-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor" `
  --project=helloliam

gcloud secrets add-iam-policy-binding weatherapi-key `
  --member="serviceAccount:554106646136-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor" `
  --project=helloliam

# Verify secrets were created
gcloud secrets list --project=helloliam | Select-String "visualcrossing|weatherapi"
```

---

### Step 3: Update Deployment Script

I will create an updated version of `deploy-to-cloud-run.ps1` that includes the new secrets:

**File: `deploy-to-cloud-run-updated.ps1`**
```powershell
# Deploy backend to Cloud Run with Cloud SQL connection
Write-Host "Deploying backend to Cloud Run with Cloud SQL (Weather API Update)..." -ForegroundColor Green

gcloud run deploy backend `
  --image=europe-west1-docker.pkg.dev/helloliam/cloud-run-source-deploy/backend:latest `
  --platform=managed `
  --region=europe-west1 `
  --project=helloliam `
  --allow-unauthenticated `
  --port=8080 `
  --memory=512Mi `
  --cpu=1 `
  --timeout=300 `
  --max-instances=10 `
  --min-instances=0 `
  --service-account=554106646136-compute@developer.gserviceaccount.com `
  --add-cloudsql-instances=helloliam:us-central1:hiking-db `
  --update-env-vars=NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=/cloudsql/helloliam:us-central1:hiking-db,DB_PORT=5432,FRONTEND_URL=https://www.thenarrowtrail.co.za `
  --update-secrets=DB_PASSWORD=db-password:latest `
  --update-secrets=JWT_SECRET=jwt-secret:latest `
  --update-secrets=SENDGRID_API_KEY=sendgrid-key:latest `
  --update-secrets=SENDGRID_FROM_EMAIL=sendgrid-from-email:latest `
  --update-secrets=OPENWEATHER_API_KEY=openweather-api-key:latest `
  --update-secrets=TWILIO_ACCOUNT_SID=twilio-sid:latest `
  --update-secrets=TWILIO_AUTH_TOKEN=twilio-token:latest `
  --update-secrets=TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest `
  --update-secrets=VISUAL_CROSSING_API_KEY=visualcrossing-api-key:latest `
  --update-secrets=WEATHERAPI_KEY=weatherapi-key:latest

Write-Host "`nDeployment command completed!" -ForegroundColor Green
Write-Host "Check the output above for any errors." -ForegroundColor Yellow
Write-Host "Service URL: https://backend-554106646136.europe-west1.run.app" -ForegroundColor Cyan
```

---

### Step 4: Build and Deploy

```powershell
# Navigate to backend directory
cd c:\hiking-portal\backend

# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml --project=helloliam

# Wait for build to complete, then deploy
.\deploy-to-cloud-run-updated.ps1
```

---

## ⚠️ Important Pre-Deployment Checks

### 1. Verify Database Migration Status
```sql
-- Connect to database and verify:
SELECT * FROM system_settings WHERE category = 'weather';
-- Should return 4 rows with default weather settings
```

### 2. Verify Code Files Exist
```powershell
# Check all new files exist
Test-Path c:\hiking-portal\backend\services\weatherService.js
Test-Path c:\hiking-portal\backend\controllers\settingsController.js
Test-Path c:\hiking-portal\backend\routes\settings.js
Test-Path c:\hiking-portal\backend\migrations\020_add_system_settings.sql
```

### 3. Check Server.js Integration
```powershell
# Verify settings routes are registered
Select-String -Path c:\hiking-portal\backend\server.js -Pattern "settingsRoutes"
# Should show 2 matches (import and use)
```

---

## 🚀 Recommended Deployment Approach

### Option A: Incremental (Safer - Recommended)

1. **Create secrets first** (Step 2)
2. **Build Docker image** (without deploying)
3. **Test locally if possible**
4. **Deploy to Cloud Run** (Step 4)
5. **Test endpoints**
6. **Monitor for errors**

### Option B: Quick Deploy (If Time-Constrained)

1. **Create secrets** (Step 2)
2. **Run combined build + deploy** (Step 4)
3. **Monitor and test**

**I recommend Option A for this deployment.**

---

## 📝 Deployment Commands Summary

Here's the complete sequence I propose:

```powershell
# 1. STOP - Get API keys first if you don't have them
# Visual Crossing: https://www.visualcrossing.com/
# WeatherAPI.com: https://www.weatherapi.com/

# 2. Create secrets (replace with actual keys)
# I'll create a script for this below

# 3. Build Docker image
cd c:\hiking-portal\backend
gcloud builds submit --config cloudbuild.yaml --project=helloliam

# 4. Deploy to Cloud Run (using updated script)
.\deploy-to-cloud-run-updated.ps1

# 5. Verify deployment
gcloud run services describe backend --platform=managed --region=europe-west1 --project=helloliam

# 6. Test API endpoint
Invoke-WebRequest -Uri "https://backend-554106646136.europe-west1.run.app/api/settings/weather/providers" -Headers @{Authorization="Bearer YOUR_ADMIN_TOKEN"}
```

---

## ❓ Questions Before Proceeding

1. **Do you have the API keys for Visual Crossing and WeatherAPI.com?**
   - [ ] Yes, I have both keys
   - [ ] No, I need to sign up and get them first

2. **Which deployment approach do you prefer?**
   - [ ] Option A: Incremental (create secrets → build → deploy → test)
   - [ ] Option B: Quick deploy (create secrets → build+deploy)

3. **Should I create the updated deployment script now?**
   - [ ] Yes, create the updated script
   - [ ] No, I'll handle it manually

4. **Do you want to test locally with Docker first?**
   - [ ] Yes, let's test locally
   - [ ] No, deploy directly to Cloud Run

---

## 🔒 Security Notes

- API keys will be stored securely in Google Secret Manager
- Keys are never logged or exposed in code
- Service account has minimal required permissions
- Secrets are accessed at runtime only
- All API calls are logged for monitoring

---

## 📊 Expected Deployment Time

- Create secrets: 5 minutes
- Build Docker image: 3-5 minutes
- Deploy to Cloud Run: 2-3 minutes
- Verification: 5 minutes

**Total: ~15-20 minutes**

---

## 🆘 Rollback Plan

If deployment fails or causes issues:

```powershell
# Restore previous version
gcloud run services update backend `
  --image=europe-west1-docker.pkg.dev/helloliam/cloud-run-source-deploy/backend:previous `
  --platform=managed `
  --region=europe-west1 `
  --project=helloliam

# Or restore original weatherService.js and redeploy
cd c:\hiking-portal\backend\services
Copy-Item weatherService.js.backup weatherService.js -Force
cd ..\..
gcloud builds submit --config cloudbuild.yaml --project=helloliam
```

---

## ✅ What to Confirm

**Please confirm:**

1. ✅ You have run the database migration (DONE)
2. ⏳ You have or can get the API keys
3. ⏳ You're ready to create the secrets
4. ⏳ You approve the deployment configuration above
5. ⏳ You want me to proceed with deployment

**Once confirmed, I'll:**
1. Create the secret creation script
2. Create the updated deployment script  
3. Execute the build
4. Deploy to Cloud Run
5. Verify the deployment

**Ready to proceed? Please let me know:**
- If you have the API keys
- Which deployment approach you prefer
- If you want me to create and run the scripts
