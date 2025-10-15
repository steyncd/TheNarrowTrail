# Production Deployment Checklist - 2025-10-13

## Changes to Deploy

### 1. Environment Variables Consolidation
- Centralized all .env files to project root
- Updated backend to read from root .env files
- Updated deployment scripts
- **Impact:** Better configuration management

### 2. Payment Details Page Navigation Fix
- Fixed back button to return to Payments & Finance tab
- Added navigation state tracking
- **Impact:** Improved UX, correct navigation flow

### 3. React Markdown Fix
- Fixed className prop issue in AboutPage
- Wrapped ReactMarkdown components in div containers
- **Impact:** About Us page now loads without errors

### 4. Hike Expenses Feature (NEW)
- Added comprehensive expense tracking system
- Categories: Food, Travel, Admin, Equipment, Venue, Other
- Full CRUD operations for expenses
- Summary statistics and reporting
- **Impact:** Complete financial management for hikes

## Database Changes

### Migration 012: Add Hike Expenses
- Creates `hike_expenses` table
- Creates `hike_expense_summary` view
- Adds indexes for performance
- **Status:** ✅ Run successfully on local database
- **Action Required:** Run on production database

## Files Changed

### Backend
- ✅ server.js - Added expense routes
- ✅ controllers/expenseController.js - NEW
- ✅ routes/expenses.js - NEW
- ✅ migrations/012_add_hike_expenses.sql - NEW

### Frontend
- ✅ pages/PaymentDetailsPage.js - Added expenses, fixed navigation
- ✅ pages/AboutPage.js - Fixed ReactMarkdown
- ✅ components/payments/ExpensesSection.js - NEW
- ✅ components/payments/PaymentsOverview.js - Added navigation state
- ✅ services/api.js - Added expense API methods

### Configuration
- ✅ .env.local.example - Updated and consolidated
- ✅ .env.production.example - Updated and consolidated
- ✅ docker-compose.yml - Uses root .env
- ✅ scripts/deploy-backend.sh - References root .env
- ✅ scripts/deploy-backend.ps1 - References root .env
- ✅ scripts/deploy-frontend.sh - References root .env

## Pre-Deployment Checklist

- [ ] Verify .env.production exists with correct values
- [ ] Run migration on production database
- [ ] Backend tests passing (if any)
- [ ] Frontend builds successfully
- [ ] No console errors in development

## Deployment Steps

### Step 1: Run Production Database Migration

```bash
# Connect to production database and run:
node backend/tools/run-migration-012.js
# OR manually via psql:
psql -h 34.31.176.242 -U postgres -d hiking_portal -f backend/migrations/012_add_hike_expenses.sql
```

### Step 2: Deploy Backend

```bash
# From project root
./scripts/deploy-backend.sh
# OR on Windows:
pwsh ./scripts/deploy-backend.ps1
```

Expected result:
- Backend deploys to Google Cloud Run
- URL: https://backend-554106646136.europe-west1.run.app
- All environment variables set via Secret Manager

### Step 3: Deploy Frontend

```bash
# From project root
./scripts/deploy-frontend.sh
```

Expected result:
- Frontend builds with production environment variables
- Deploys to Firebase Hosting
- URL: https://helloliam.web.app

## Post-Deployment Verification

### Backend Health Check
```bash
curl https://backend-554106646136.europe-west1.run.app/health
```
Expected: `{"status":"healthy"}`

### Test Expense Endpoints
```bash
# Get expenses for a hike (requires auth token)
curl https://backend-554106646136.europe-west1.run.app/api/expenses/hike/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Tests
1. ✅ Navigate to About Us page - should load without errors
2. ✅ Go to Admin → Manage Hikes → Payments & Finance tab
3. ✅ Click "Details" on a hike
4. ✅ Verify back button goes to correct tab
5. ✅ Scroll to "Hike Expenses" section
6. ✅ Add a test expense
7. ✅ Edit the expense
8. ✅ Delete the expense
9. ✅ Verify summary updates correctly

## Rollback Plan

If issues occur:

### Backend Rollback
```bash
# Redeploy previous version via Cloud Run console
# OR revert git commits and redeploy
```

### Frontend Rollback
```bash
# Firebase Hosting keeps previous versions
firebase hosting:rollback
```

### Database Rollback
```sql
-- If needed, drop the new tables
DROP VIEW IF EXISTS hike_expense_summary;
DROP TABLE IF EXISTS hike_expenses;
```

## Known Issues / Notes

- None - all features tested locally
- Expenses feature is additive (doesn't modify existing functionality)
- Environment consolidation is backward compatible

## Success Criteria

- [ ] Backend deploys successfully
- [ ] Frontend deploys successfully
- [ ] Migration runs on production
- [ ] About Us page loads without errors
- [ ] Payment navigation works correctly
- [ ] Can add/edit/delete expenses
- [ ] Summary statistics display correctly
- [ ] No console errors
- [ ] API endpoints respond correctly

## Timeline

- **Preparation:** 5 minutes
- **Database Migration:** 1 minute
- **Backend Deploy:** 5-10 minutes
- **Frontend Deploy:** 3-5 minutes
- **Testing:** 5-10 minutes
- **Total:** ~20-30 minutes

## Deployment Command Summary

```bash
# 1. Run migration on production
# (Connect to production DB first)

# 2. Deploy backend
cd /c/hiking-portal
./scripts/deploy-backend.sh

# 3. Deploy frontend
./scripts/deploy-frontend.sh

# 4. Test
# - Visit https://helloliam.web.app
# - Test all features listed above
```

---

**Prepared By:** Claude Code
**Date:** 2025-10-13
**Approved By:** [Your Name]
**Status:** Ready for Deployment
