# Weather API Implementation - Deployment Checklist

## ✅ Implementation Complete

All code has been implemented and is ready for deployment. Follow this checklist to deploy the new weather API configuration system.

---

## Pre-Deployment: Get API Keys (5 minutes)

### Visual Crossing (Recommended Primary)
1. Visit: https://www.visualcrossing.com/
2. Click "Sign Up" → Create free account
3. Navigate to Account → API Key
4. Copy your API key
5. **Save it**: `VISUAL_CROSSING_API_KEY=<your_key>`

### WeatherAPI.com (Recommended Fallback)
1. Visit: https://www.weatherapi.com/
2. Click "Sign Up Free" → Create account
3. Navigate to Dashboard → Your API Key
4. Copy your API key
5. **Save it**: `WEATHERAPI_KEY=<your_key>`

### OpenWeather (Already Have)
- You should already have this: `OPENWEATHER_API_KEY=<existing_key>`
- If not, get it from: https://openweathermap.org/api

---

## Step 1: Add API Keys to Google Secret Manager (10 minutes)

```bash
# 1. Visual Crossing API key
echo -n "YOUR_ACTUAL_VISUAL_CROSSING_KEY" | gcloud secrets create visualcrossing-api-key \
  --data-file=- \
  --project=helloliam \
  --replication-policy=automatic

# 2. WeatherAPI.com key
echo -n "YOUR_ACTUAL_WEATHERAPI_KEY" | gcloud secrets create weatherapi-key \
  --data-file=- \
  --project=helloliam \
  --replication-policy=automatic

# 3. Get your Cloud Run service account email
gcloud run services describe hiking-portal-backend \
  --platform=managed \
  --region=us-central1 \
  --format="value(spec.template.spec.serviceAccountName)"

# 4. Grant access (replace YOUR-SERVICE-ACCOUNT with actual email from step 3)
gcloud secrets add-iam-policy-binding visualcrossing-api-key \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT@helloliam.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding weatherapi-key \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT@helloliam.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Verification:
```bash
# Verify secrets exist
gcloud secrets list --project=helloliam | grep -E "visualcrossing|weatherapi"

# Verify access granted
gcloud secrets get-iam-policy visualcrossing-api-key
gcloud secrets get-iam-policy weatherapi-key
```

---

## Step 2: Update Backend Deployment Config (5 minutes)

Check if you have `backend/cloudbuild.yaml` or similar deployment configuration.

Add these environment variable mappings:

```yaml
# In your Cloud Run deployment config
env:
  - name: VISUAL_CROSSING_API_KEY
    valueFrom:
      secretKeyRef:
        name: visualcrossing-api-key
        key: latest
  - name: WEATHERAPI_KEY
    valueFrom:
      secretKeyRef:
        name: weatherapi-key
        key: latest
```

**OR if using Cloud Run directly**:

```bash
# Update Cloud Run service with new secrets
gcloud run services update hiking-portal-backend \
  --update-secrets=VISUAL_CROSSING_API_KEY=visualcrossing-api-key:latest \
  --update-secrets=WEATHERAPI_KEY=weatherapi-key:latest \
  --region=us-central1 \
  --platform=managed
```

---

## Step 3: Run Database Migration (5 minutes)

```bash
# Connect to your Cloud SQL database
gcloud sql connect hiking-db --user=postgres --database=hiking-db

# When connected, run the migration
\i backend/migrations/020_add_system_settings.sql

# Verify table created
\dt system_settings

# Check default settings were inserted
SELECT * FROM system_settings WHERE category = 'weather';

# You should see 4 rows:
# - weather_api_primary: visualcrossing
# - weather_api_fallback: weatherapi
# - weather_api_enabled: true
# - weather_cache_duration: 3600

# Exit psql
\q
```

### If migration fails:
- Check SQL syntax errors
- Ensure you're connected to the correct database
- Verify you have CREATE TABLE permissions
- Try running each statement separately

---

## Step 4: Deploy Backend (10 minutes)

```bash
# Navigate to backend directory
cd c:\hiking-portal\backend

# If using Cloud Build:
gcloud builds submit --config cloudbuild.yaml

# OR if deploying directly:
gcloud run deploy hiking-portal-backend \
  --source . \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated
```

### Wait for deployment to complete

Check deployment status:
```bash
gcloud run services describe hiking-portal-backend \
  --platform=managed \
  --region=us-central1
```

---

## Step 5: Deploy Frontend (10 minutes)

```bash
# Navigate to frontend directory
cd c:\hiking-portal\frontend

# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# OR if you have staging:
firebase deploy --only hosting:staging
```

### Wait for deployment to complete

---

## Step 6: Verify Deployment (15 minutes)

### 6.1 Check Backend Health
```bash
# Test backend is running
curl https://your-backend-url.run.app/health

# Test settings endpoint (requires admin token)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://your-backend-url.run.app/api/settings/weather/providers
```

### 6.2 Check Frontend
1. Open your browser
2. Navigate to your hiking portal URL
3. Log in as admin
4. Check browser console for errors (F12)

### 6.3 Access Weather Settings
1. Click on your profile/menu
2. Look for "Admin" section
3. Click "Weather API" (should see CloudRain icon)
4. Page should load without errors

---

## Step 7: Test Weather API Configuration (20 minutes)

### 7.1 Check Current Settings
- [ ] Weather Settings page loads
- [ ] Current settings display (should show default: Visual Crossing primary, WeatherAPI fallback)
- [ ] All three providers listed with status cards

### 7.2 Test Each Provider
**Visual Crossing:**
- [ ] Click "Test" button on Visual Crossing card
- [ ] Should show: "Configured" status (green)
- [ ] Test should succeed with ~1-2 second response time
- [ ] Weather data should display: Temperature, conditions, location

**WeatherAPI.com:**
- [ ] Click "Test" button on WeatherAPI card
- [ ] Should show: "Configured" status (green)
- [ ] Test should succeed with ~1-2 second response time
- [ ] Weather data should display

**OpenWeather:**
- [ ] Click "Test" button on OpenWeather card
- [ ] Should show: "Configured" status (if key exists) or "Not Configured"
- [ ] If configured, test should succeed

### 7.3 Save Configuration
- [ ] Keep Visual Crossing as primary (or change if you prefer)
- [ ] Keep WeatherAPI as fallback (or change if you prefer)
- [ ] Click "Save Configuration"
- [ ] Should see success message: "Weather settings saved successfully!"
- [ ] Reload page - settings should persist

### 7.4 Test Weather Display on Hikes
- [ ] Navigate to "Hikes" page
- [ ] Click on any upcoming hike
- [ ] Weather widget should display
- [ ] Weather data should load (may take a few seconds on first load)
- [ ] Subsequent loads should be faster (cached)

---

## Step 8: Test Automatic Fallback (10 minutes)

### Test Scenario: Primary Provider Fails

1. Go to Weather Settings page
2. Note which provider is primary (e.g., Visual Crossing)
3. Temporarily disable primary in Google Secret Manager:
   ```bash
   # Rename or remove primary secret temporarily
   gcloud secrets versions disable latest --secret=visualcrossing-api-key
   ```
4. Navigate to a hike page
5. Weather should still load (using fallback provider)
6. Re-enable primary:
   ```bash
   gcloud secrets versions enable latest --secret=visualcrossing-api-key
   ```

### Test Scenario: Both Providers Fail

1. Disable both primary and fallback providers
2. Navigate to hike page
3. Should see: "Weather information unavailable"
4. No errors in console (graceful degradation)
5. Re-enable providers

---

## Step 9: Performance Verification (5 minutes)

### Check Settings Cache
1. Navigate to Weather Settings page
2. Open browser DevTools Network tab
3. Reload page
4. Check `/api/settings/category/weather` request
5. Reload again within 5 minutes
6. Request should return from cache (faster response)

### Check Weather Data Cache
1. Navigate to hike details page
2. Note weather load time
3. Reload page
4. Weather should load faster (cached on backend)

---

## Step 10: Update Documentation (10 minutes)

### Update DEPLOYMENT.md
Add new environment variables section:
```markdown
## Environment Variables

### Weather API Keys (NEW)
- VISUAL_CROSSING_API_KEY - Visual Crossing API key (primary provider)
- WEATHERAPI_KEY - WeatherAPI.com API key (fallback provider)
- OPENWEATHER_API_KEY - OpenWeather API key (legacy support)

See WEATHER_API_IMPLEMENTATION_COMPLETE.md for setup instructions.
```

### Update README.md
Add weather configuration section:
```markdown
## Weather Configuration

The Hiking Portal uses multiple weather APIs for reliable weather data:
- **Primary**: Visual Crossing (best coverage for South Africa)
- **Fallback**: WeatherAPI.com (generous free tier)
- **Legacy**: OpenWeather (existing integration)

Admins can configure providers in: Admin → Weather API

See WEATHER_API_IMPLEMENTATION_COMPLETE.md for details.
```

---

## Troubleshooting

### Issue: "Provider not configured" error
**Solution:**
1. Check API key exists in Secret Manager: `gcloud secrets list`
2. Check service account has access: `gcloud secrets get-iam-policy <secret-name>`
3. Verify environment variables in Cloud Run: `gcloud run services describe ...`
4. Redeploy backend after adding secrets

### Issue: Weather data not loading
**Solution:**
1. Open browser console (F12) - check for errors
2. Go to Admin → Weather API - test each provider
3. Check backend logs: `gcloud logs read --service=hiking-portal-backend --limit=50`
4. Verify API keys are valid (test on provider websites)

### Issue: Slow response times
**Solution:**
1. First load is slower (cache warming) - this is normal
2. Subsequent loads within 5 minutes should be fast (cached)
3. If consistently slow, check API provider status
4. Consider increasing cache duration in database

### Issue: Settings not saving
**Solution:**
1. Check browser console for errors
2. Verify you're logged in as admin
3. Check backend logs for database errors
4. Verify migration ran successfully: `SELECT * FROM system_settings;`

### Issue: Navigation link missing
**Solution:**
1. Check you have "manage_settings" permission
2. Check user role is "admin"
3. Clear browser cache and reload
4. Check Header.js was deployed correctly

---

## Rollback Plan (If Needed)

### Rollback Backend:
```bash
# Restore original weatherService.js
cd backend/services
cp weatherService.js.backup weatherService.js

# Rollback database (if needed)
DROP TABLE IF EXISTS system_settings;

# Redeploy backend
cd ../..
gcloud builds submit --config backend/cloudbuild.yaml
```

### Rollback Frontend:
```bash
# Deploy previous version
firebase hosting:releases:list
firebase hosting:rollback
```

---

## Post-Deployment Checklist

- [ ] All API keys added to Secret Manager
- [ ] Service account has access to secrets
- [ ] Database migration completed successfully
- [ ] Backend deployed with new code and env vars
- [ ] Frontend deployed with new pages and routes
- [ ] Weather Settings page accessible to admins
- [ ] All three providers tested successfully
- [ ] Settings save and persist correctly
- [ ] Weather displays on hike pages
- [ ] Automatic fallback works
- [ ] Performance is acceptable
- [ ] Documentation updated
- [ ] Team notified of new feature

---

## Success Criteria

✅ Admin can access Weather Settings page
✅ All three providers show configuration status
✅ Provider testing works (shows weather data and response time)
✅ Settings can be changed and saved
✅ Weather data displays on hike pages
✅ Automatic fallback works when primary fails
✅ Settings cache improves performance
✅ No console errors or warnings

---

## Support & Monitoring

### Monitor API Usage:
- Visual Crossing: 1,000 calls/day limit
- WeatherAPI: 1M calls/month limit
- OpenWeather: 1,000 calls/day limit

Set up monitoring to track usage and alert before limits.

### Check Logs:
```bash
# Backend logs
gcloud logs read --service=hiking-portal-backend \
  --format="table(timestamp,textPayload)" \
  --limit=100

# Filter weather-related logs
gcloud logs read --service=hiking-portal-backend \
  --filter="textPayload:weather" \
  --limit=50
```

---

## Completion

Once all steps are complete and tests pass:

1. ✅ Mark deployment as complete
2. 📊 Monitor for 24 hours
3. 📢 Announce new feature to admins
4. 📝 Update admin training materials
5. 🎉 Celebrate successful deployment!

**Estimated Total Time**: 90-120 minutes

**Implementation Date**: _____________________
**Deployed By**: _____________________
**Verified By**: _____________________
