# Environment Variables Consolidation Summary

## What Changed

All environment variables have been consolidated into the **project root directory** for simpler management and consistency.

## Before (Old Structure)

```
hiking-portal/
├── .env.local.example
├── .env.production.example
├── backend/
│   ├── .env              ❌ Removed
│   ├── .env.example      ❌ Removed
│   └── .env.production   ❌ Removed
├── frontend/
│   ├── .env              ❌ Removed
│   ├── .env.example      ❌ Removed
│   ├── .env.local        ❌ Removed
│   └── .env.production   ❌ Removed
└── docker/
    ├── .env              ❌ Removed
    └── .env.dev          ❌ Removed
```

## After (New Structure)

```
hiking-portal/
├── .env.local              ✅ Single source for local dev
├── .env.production         ✅ Single source for production
├── .env.local.example      ✅ Template for local
├── .env.production.example ✅ Template for production
├── backend/                (no .env files)
├── frontend/               (no .env files)
└── docker/                 (no .env files)
```

## Benefits

1. **Single Source of Truth**
   - One `.env.local` file for all local development
   - One `.env.production` file for all production settings
   - No more duplicate variables across directories

2. **Easier Management**
   - Change variables in one place
   - No confusion about which file is being used
   - Simpler deployment process

3. **Better Security**
   - Centralized location makes it easier to secure
   - Clearer .gitignore rules
   - Less risk of committing secrets

4. **Consistency**
   - Backend and frontend always use same configuration
   - Docker services read from same file
   - Deployment scripts reference same location

## Changes Made

### 1. Root Environment Files

**Created/Updated:**
- [.env.local.example](.env.local.example) - Comprehensive local development template
- [.env.production.example](.env.production.example) - Comprehensive production template

**Includes all variables for:**
- Database configuration
- Backend settings
- Frontend settings
- Docker configuration
- External services (SendGrid, Twilio, Stripe, etc.)

### 2. Backend Changes

**File:** [backend/server.js](backend/server.js)

Changed from:
```javascript
require('dotenv').config();
```

To:
```javascript
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.production') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
```

The backend now explicitly loads from root directory.

### 3. Frontend Changes

**No code changes needed** - React scripts automatically look for `.env` files in the project root.

The frontend automatically loads:
- `.env.local` in development
- `.env.production` for production builds

### 4. Docker Changes

**File:** [docker-compose.yml](docker-compose.yml)

Updated to use environment variables:
```yaml
environment:
  POSTGRES_DB: ${HIKING_POSTGRES_DB:-hiking_portal}
  POSTGRES_USER: ${HIKING_POSTGRES_USER:-postgres}
  POSTGRES_PASSWORD: ${HIKING_POSTGRES_PASSWORD:-hiking_password}
```

Docker Compose automatically loads from root `.env.local` or `.env`.

### 5. Deployment Script Updates

**Files:**
- [scripts/deploy-backend.sh](scripts/deploy-backend.sh)
- [scripts/deploy-backend.ps1](scripts/deploy-backend.ps1)
- [scripts/deploy-frontend.sh](scripts/deploy-frontend.sh)

**Changes:**
- Added checks for root `.env.production` file
- Updated paths to reference root directory
- Added validation and error messages

### 6. Documentation Updates

**File:** [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)

- Complete rewrite to reflect new structure
- Added "How It Works" section
- Updated all examples and instructions
- Added troubleshooting for new structure

### 7. Removed Files

Removed duplicate `.env` files from git tracking:
```bash
git rm backend/.env.example
git rm frontend/.env.example
```

**Note:** Any actual `.env` files in these directories are already gitignored and will be ignored by the application.

## Migration Guide

If you have existing `.env` files in subdirectories:

### Step 1: Backup Current Settings

```bash
# Backup any custom settings you have
cat backend/.env > ~/backup-backend-env.txt
cat frontend/.env.local > ~/backup-frontend-env.txt
```

### Step 2: Create Root .env.local

```bash
# From project root
cp .env.local.example .env.local
```

### Step 3: Transfer Your Settings

Copy your custom values from the backup files into `.env.local`:
- Database credentials
- API keys
- Custom configuration

### Step 4: Clean Up Old Files

```bash
# Remove old files (they're ignored now)
rm backend/.env backend/.env.production
rm frontend/.env frontend/.env.local frontend/.env.production
rm docker/.env docker/.env.dev
```

### Step 5: Test

```bash
# Start Docker services
docker-compose up -d

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm start
```

## Environment Variable Reference

### Required for Local Development

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:hiking_password@hiking_postgres:5432/hiking_portal
REACT_APP_API_URL=http://localhost:5000
JWT_SECRET=dev-jwt-secret-minimum-64-chars
FRONTEND_URL=http://localhost:3000
```

### Required for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/hiking_portal
REACT_APP_API_URL=https://backend-xxx.run.app
JWT_SECRET=<minimum-64-character-secret>
FRONTEND_URL=https://helloliam.web.app
```

### Optional Services

```env
# Email
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@domain.com

# SMS
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Weather
WEATHER_API_KEY=xxx

# Payments
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PUBLISHABLE_KEY=pk_xxx
```

## Deployment

### Backend (Google Cloud Run)

The backend deployment uses Secret Manager for sensitive values:

```bash
./scripts/deploy-backend.sh
```

- Reads configuration understanding from root
- Uses Secret Manager for secrets
- Sets environment variables in Cloud Run

### Frontend (Firebase Hosting)

The frontend deployment builds with root `.env.production`:

```bash
./scripts/deploy-frontend.sh
```

- Checks for `.env.production` in root
- Builds React app with REACT_APP_* variables
- Deploys to Firebase Hosting

## Troubleshooting

### Backend can't find environment variables

**Solution:** Ensure `.env.local` exists in project root
```bash
ls -la .env.local
# Should show the file
```

### Frontend environment variables undefined

**Solution:**
1. Ensure variables are prefixed with `REACT_APP_`
2. Restart the development server after changing `.env.local`
3. For production, ensure `.env.production` exists before building

### Docker containers using wrong database

**Solution:** Check `.env.local` in project root
```bash
grep HIKING_POSTGRES .env.local
```

### Deployment script errors

**Backend:**
```bash
# Check root .env.production exists
ls -la .env.production

# Verify Secret Manager secrets
gcloud secrets list --project=helloliam
```

**Frontend:**
```bash
# Check root .env.production exists
ls -la .env.production

# Verify REACT_APP_API_URL is set correctly
grep REACT_APP_API_URL .env.production
```

## Verification Checklist

After consolidation, verify:

- [ ] `.env.local` exists in project root
- [ ] `.env.local` contains all required variables
- [ ] Backend starts successfully: `cd backend && npm start`
- [ ] Frontend starts successfully: `cd frontend && npm start`
- [ ] Docker containers use correct database: `docker-compose up -d`
- [ ] Backend can connect to database
- [ ] Frontend can reach backend API
- [ ] No `.env` files in backend/ or frontend/ directories
- [ ] Deployment scripts reference root directory

## Files Affected

### Modified
- [.env.local.example](.env.local.example)
- [.env.production.example](.env.production.example)
- [backend/server.js](backend/server.js)
- [docker-compose.yml](docker-compose.yml)
- [scripts/deploy-backend.sh](scripts/deploy-backend.sh)
- [scripts/deploy-backend.ps1](scripts/deploy-backend.ps1)
- [scripts/deploy-frontend.sh](scripts/deploy-frontend.sh)
- [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
- [.gitignore](.gitignore)

### Removed from Git
- `backend/.env.example`
- `frontend/.env.example`

### Ignored (if exist)
- `backend/.env`
- `backend/.env.production`
- `frontend/.env`
- `frontend/.env.local`
- `frontend/.env.production`
- `docker/.env`
- `docker/.env.dev`

## Support

For issues related to environment consolidation:

1. Check [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
2. Review this summary
3. Verify file locations and contents
4. Check application logs

---

**Consolidation Date:** 2025-10-13
**Version:** 1.0
**Status:** Complete ✅
