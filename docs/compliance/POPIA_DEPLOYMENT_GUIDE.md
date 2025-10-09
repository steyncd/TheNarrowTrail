# POPIA Compliance - Quick Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed
- [x] Privacy Policy component created
- [x] Terms & Conditions component created
- [x] Registration consent checkboxes added
- [x] Database migration SQL created
- [x] Backend endpoints implemented (deletion, export, consent status)
- [x] Account deletion UI component created
- [x] Data export UI component created
- [x] Consent management dashboard created
- [x] Frontend components integrated into pages
- [x] API service methods added
- [x] Routes configured

### ⏳ Ready to Deploy
- [ ] Database migration executed
- [ ] Backend deployed with new endpoints
- [ ] Frontend built and deployed
- [ ] All features tested

---

## Deployment Steps

### Step 1: Database Migration (5 minutes)

```bash
# Connect to your PostgreSQL database
# Replace with your actual connection details

psql -h your-database-host \
     -U your-database-user \
     -d hiking_portal \
     -f backend/migrations/014_add_popia_compliance.sql

# Verify the migration
psql -h your-database-host -U your-database-user -d hiking_portal

# In psql:
\d users
# You should see the new columns:
# - privacy_consent_accepted
# - privacy_consent_date
# - terms_accepted
# - terms_accepted_date
# - data_processing_consent
# - data_processing_consent_date
```

**Expected Output:**
- Migration adds 6 new columns to `users` table
- All existing users get consents set to `TRUE` with their `created_at` as consent date

---

### Step 2: Backend Deployment (10 minutes)

```bash
cd backend

# Option A: Deploy to Google Cloud Run (your current setup)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/backend

gcloud run deploy backend \
  --image gcr.io/YOUR_PROJECT_ID/backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated

# Option B: Use your existing deploy script
./deploy.sh

# Or on Windows:
deploy.bat
```

**Verify Backend Deployment:**
```bash
# Test the new endpoints
# 1. Test consent status endpoint (requires admin token)
curl -X GET https://backend-554106646136.europe-west1.run.app/api/admin/consent-status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected: JSON with users array and stats object

# 2. Test data export endpoint (requires user token)
curl -X GET https://backend-554106646136.europe-west1.run.app/api/profile/export/data \
  -H "Authorization: Bearer YOUR_USER_TOKEN"

# Expected: JSON with profile and all user data
```

---

### Step 3: Frontend Deployment (10 minutes)

```bash
cd frontend

# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Wait for deployment to complete
```

**Verify Frontend Deployment:**

Visit these URLs to confirm:
1. https://helloliam.web.app/privacy-policy ✅
2. https://helloliam.web.app/terms ✅  
3. https://helloliam.web.app/signup - Check consent checkboxes visible ✅
4. https://helloliam.web.app/profile - Check Data Export and Danger Zone sections ✅
5. https://helloliam.web.app/admin/users - Check POPIA Consent tab (admin only) ✅

---

## Post-Deployment Testing

### Test 1: New User Registration with Consent (2 minutes)
1. ✅ Go to signup page
2. ✅ Fill out registration form
3. ✅ Try to submit WITHOUT checking consent boxes → Should fail validation
4. ✅ Check all 3 consent boxes
5. ✅ Submit → Registration succeeds
6. ✅ Login with new account
7. ✅ Check database: User has all 3 consent timestamps

### Test 2: Data Export (2 minutes)
1. ✅ Login as any user
2. ✅ Go to own profile page
3. ✅ Scroll to "Export My Data" section
4. ✅ Click "Export Data" button
5. ✅ JSON file downloads: `my-data-YYYY-MM-DD.json`
6. ✅ Open file → Verify it contains all data categories

### Test 3: Account Deletion (3 minutes)
**⚠️ Use a test account for this!**
1. ✅ Login as test user
2. ✅ Go to profile page
3. ✅ Scroll to "Danger Zone"
4. ✅ Click "Delete My Account"
5. ✅ Read warning modal → Click "Continue to Deletion"
6. ✅ Type "DELETE MY ACCOUNT" exactly
7. ✅ Enter password
8. ✅ Click "Delete My Account Forever"
9. ✅ User logged out automatically
10. ✅ Try to login again → Should fail (account deleted)
11. ✅ Check database → User and related data removed

### Test 4: Admin Consent Dashboard (2 minutes)
1. ✅ Login as admin user
2. ✅ Navigate to Users page
3. ✅ Click "POPIA Consent" tab
4. ✅ Verify statistics cards show correct numbers
5. ✅ Verify user table shows consent status with checkmarks/X's
6. ✅ Click filter buttons (All/Complete/Incomplete) → Table updates
7. ✅ Click "Export CSV" → CSV file downloads

---

## Verification Queries

### Check Consent Data in Database
```sql
-- Check consent fields for all users
SELECT 
  name, 
  email,
  privacy_consent_accepted,
  privacy_consent_date,
  terms_accepted,
  terms_accepted_date,
  data_processing_consent,
  data_processing_consent_date,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Count users by consent completion
SELECT 
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE privacy_consent_accepted AND terms_accepted AND data_processing_consent) AS all_consents_given,
  COUNT(*) FILTER (WHERE NOT privacy_consent_accepted) AS missing_privacy,
  COUNT(*) FILTER (WHERE NOT terms_accepted) AS missing_terms,
  COUNT(*) FILTER (WHERE NOT data_processing_consent) AS missing_data_processing
FROM users
WHERE approval_status = 'approved';
```

---

## Rollback Plan (If Issues Arise)

### If Backend Has Issues
```bash
# Revert to previous Cloud Run revision
gcloud run services update-traffic backend \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=europe-west1
```

### If Frontend Has Issues
```bash
# Firebase allows rollback via console:
# 1. Go to Firebase Console → Hosting
# 2. Find previous deployment
# 3. Click "Rollback"
```

### If Database Migration Has Issues
```sql
-- Rollback migration (removes consent columns)
BEGIN;

ALTER TABLE users DROP COLUMN IF EXISTS privacy_consent_accepted;
ALTER TABLE users DROP COLUMN IF EXISTS privacy_consent_date;
ALTER TABLE users DROP COLUMN IF EXISTS terms_accepted;
ALTER TABLE users DROP COLUMN IF EXISTS terms_accepted_date;
ALTER TABLE users DROP COLUMN IF EXISTS data_processing_consent;
ALTER TABLE users DROP COLUMN IF EXISTS data_processing_consent_date;

COMMIT;
```

---

## Common Issues & Solutions

### Issue 1: "getConsentStatus is not a function"
**Solution:** Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue 2: Consent checkboxes not showing on signup
**Solution:** Verify frontend deployed correctly, check browser console for errors

### Issue 3: Account deletion fails with "Invalid password"
**Solution:** User entered wrong password, try again with correct password

### Issue 4: Data export returns empty JSON
**Solution:** Check backend logs, ensure user has data in database

### Issue 5: POPIA Consent tab not visible
**Solution:** Ensure user is logged in as admin, check role in database

---

## Communication to Users

### Email Template (Send After Deployment)

**Subject:** Important: Privacy Policy and Data Rights Update

Dear Hiking Portal Members,

We've updated our platform to comply with POPIA (Protection of Personal Information Act) and enhance your data privacy rights.

**What's New:**
- 📄 **Privacy Policy** - Clear explanation of how we handle your data
- 📋 **Terms & Conditions** - Updated terms of service  
- 📥 **Export Your Data** - Download your complete data anytime from your profile
- 🗑️ **Delete Your Account** - Request full account deletion if needed
- ✅ **Consent Management** - Your privacy preferences are now tracked

**Your Rights:**
Under POPIA, you have the right to:
- Access your personal information
- Correct inaccurate data
- Export your data  
- Delete your account
- Object to data processing

**Where to Find These Features:**
1. View Privacy Policy: https://helloliam.web.app/privacy-policy
2. View Terms: https://helloliam.web.app/terms
3. Manage your data: Profile page → Data Export / Danger Zone sections

**No Action Required:**
Your account remains active. We've recorded your consent based on your continued use of our platform.

If you have any questions, please contact us at [support email].

Happy hiking!
The Hiking Portal Team

---

### In-App Notification (Optional)

Show a banner on first login after deployment:

```
🔒 Privacy Update: We've updated our Privacy Policy and Terms. 
You now have more control over your data, including the ability 
to export and delete your account. [Learn More] [Dismiss]
```

---

## Success Criteria

✅ All deployments successful (database, backend, frontend)  
✅ All 4 test scenarios pass  
✅ No errors in browser console  
✅ No errors in backend logs  
✅ Privacy policy and terms accessible publicly  
✅ Consent checkboxes working on signup  
✅ Data export working  
✅ Account deletion working  
✅ Admin consent dashboard working  

---

## Timeline

- **Database Migration:** 5 minutes
- **Backend Deployment:** 10 minutes
- **Frontend Deployment:** 10 minutes
- **Testing:** 10 minutes
- **Total:** ~35 minutes

---

## Support

If you encounter any issues during deployment:

1. Check browser console for frontend errors
2. Check backend logs in Cloud Run console
3. Check database connection and migration status
4. Review `POPIA_COMPLIANCE_IMPLEMENTATION.md` for detailed docs

**Emergency Rollback:** Use rollback procedures above to revert changes

---

## Next Steps After Deployment

1. ✅ Monitor consent dashboard for completion rates
2. ✅ Track data export and deletion requests
3. ✅ Review and update privacy policy quarterly
4. ✅ Consider implementing consent renewal (annually)
5. ✅ Add data breach notification procedure

---

**Deployment Status:** Ready ✅  
**Last Updated:** January 15, 2025  
**Version:** POPIA Compliance v1.0
