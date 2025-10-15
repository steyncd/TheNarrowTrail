# ⚙️ Configuration Reference - Hiking Portal

**Purpose:** Complete reference for all configuration files and environment variables
**Last Updated:** October 15, 2025

---

## 📋 Table of Contents

1. [Configuration Files Overview](#configuration-files-overview)
2. [Frontend Configuration](#frontend-configuration)
3. [Backend Configuration](#backend-configuration)
4. [Database Configuration](#database-configuration)
5. [Secret Management](#secret-management)
6. [Environment-Specific Settings](#environment-specific-settings)

---

## 📁 Configuration Files Overview

### Critical Configuration Files

| File | Purpose | Used By | Critical? |
|------|---------|---------|-----------|
| `frontend/.env.production` | Frontend production config | Firebase Hosting | ⚠️ **YES** |
| `frontend/.env.local` | Frontend local development | Local dev | No |
| `backend/.env.example` | Backend config template | Documentation | No |
| `backend/config/env.js` | Environment loader | Backend | Yes |
| `backend/config/database.js` | Database connection | Backend | Yes |
| `firebase.json` | Firebase hosting config | Firebase CLI | Yes |
| `.gitignore` | Excludes sensitive files | Git | Yes |

### Configuration Priority (Frontend)

```
1. .env.local            (Highest - Development only, NOT in git)
2. .env.production       (Production builds)
3. .env                  (Fallback - Not used in this project)
```

⚠️ **IMPORTANT:** When building for production, ensure `.env.local` doesn't exist or rename it to `.env.local.DISABLED`

---

## 🌐 Frontend Configuration

### Location: `frontend/.env.production`

This file contains **all** frontend environment variables. Values are **embedded into the JavaScript bundle** during build.

```bash
# ============================================
# API CONFIGURATION - ⚠️ CRITICAL
# ============================================
REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app
REACT_APP_SOCKET_URL=https://backend-4kzqyywlqq-ew.a.run.app

# ⚠️ CRITICAL: Must match actual Cloud Run service URL
# To verify: gcloud run services describe backend --region=europe-west1 --format="value(status.url)"

# ============================================
# ENVIRONMENT SETTINGS
# ============================================
REACT_APP_ENV=production

# ============================================
# DEBUGGING - ⚠️ MUST BE FALSE IN PRODUCTION
# ============================================
REACT_APP_DEBUG=false

# ============================================
# LOGGING
# ============================================
REACT_APP_LOG_LEVEL=error
# Options: error, warn, info, debug

# ============================================
# FEATURES - ENABLE/DISABLE
# ============================================
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# ============================================
# SESSION CONFIGURATION
# ============================================
REACT_APP_SESSION_TIMEOUT=3600000
# 1 hour in milliseconds

# ============================================
# DOMAIN CONFIGURATION
# ============================================
REACT_APP_DOMAIN=www.thenarrowtrail.co.za
PUBLIC_URL=/

# ============================================
# PWA SETTINGS
# ============================================
REACT_APP_PWA_NAME=Hiking Portal
REACT_APP_PWA_SHORT_NAME=HikingPortal

# ============================================
# RATE LIMITING (Frontend)
# ============================================
REACT_APP_API_RATE_LIMIT=100
REACT_APP_API_RATE_WINDOW=60000
```

### How to Update Frontend Config

```bash
cd frontend

# 1. Edit .env.production
nano .env.production

# 2. Verify changes
cat .env.production | grep REACT_APP_API_URL

# 3. Delete old build
rm -rf build

# 4. Rebuild with new config
npm run build

# 5. Verify new config embedded in build
grep -r "backend-4kzqyywlqq-ew.a.run.app" build/static/js/main.*.js

# 6. Deploy
firebase deploy --only hosting
```

### Development Override

For local development, create `frontend/.env.local`:

```bash
# Frontend development config (NEVER commit this file)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

---

## 🖥️ Backend Configuration

### Cloud Run Environment Variables

**Set via:** `gcloud run deploy` command (NOT from a file)

```bash
# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=production

# ============================================
# DATABASE CONNECTION - ⚠️ CRITICAL
# ============================================
DB_HOST=/cloudsql/helloliam:us-central1:hiking-db
# ⚠️ MUST be Unix socket path for Cloud Run
# Format: /cloudsql/PROJECT:REGION:INSTANCE

DB_PORT=5432
DB_NAME=hiking_portal
DB_USER=postgres
# DB_PASSWORD - Set via Secret Manager (not env var)

# ============================================
# CORS CONFIGURATION
# ============================================
FRONTEND_URL=https://www.thenarrowtrail.co.za
# Used for CORS headers

# ============================================
# JWT CONFIGURATION
# ============================================
# JWT_SECRET - Set via Secret Manager (not env var)
JWT_EXPIRATION=24h

# ============================================
# EMAIL SERVICE (SendGrid)
# ============================================
# SENDGRID_API_KEY - Set via Secret Manager
# SENDGRID_FROM_EMAIL - Set via Secret Manager
SENDGRID_FROM_NAME=Hiking Portal

# ============================================
# SMS SERVICE (Twilio)
# ============================================
# TWILIO_ACCOUNT_SID - Set via Secret Manager
# TWILIO_AUTH_TOKEN - Set via Secret Manager
# TWILIO_WHATSAPP_NUMBER - Set via Secret Manager

# ============================================
# EXTERNAL APIS
# ============================================
# OPENWEATHER_API_KEY - Set via Secret Manager

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=8080
# Cloud Run always uses 8080

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
# Options: error, warn, info, debug

# ============================================
# RATE LIMITING (Backend)
# ============================================
RATE_LIMIT_WINDOW_MS=900000
# 15 minutes in milliseconds

RATE_LIMIT_MAX_REQUESTS=100
# Max requests per window
```

### Local Development Config

For local development, create `backend/.env`:

```bash
# Backend local development (NEVER commit this file)
NODE_ENV=development
PORT=5000

# Local database (Docker)
DB_HOST=localhost
DB_PORT=5433
DB_NAME=hiking_portal
DB_USER=postgres
DB_PASSWORD=your-local-password

# Local frontend
FRONTEND_URL=http://localhost:3000

# Development keys (use test accounts)
JWT_SECRET=dev-secret-key-not-for-production
SENDGRID_API_KEY=your-dev-key
SENDGRID_FROM_EMAIL=dev@example.com
TWILIO_ACCOUNT_SID=dev-sid
TWILIO_AUTH_TOKEN=dev-token
TWILIO_WHATSAPP_NUMBER=+1234567890
OPENWEATHER_API_KEY=dev-weather-key
```

---

## 🗄️ Database Configuration

### Cloud SQL Instance Details

```yaml
Project: helloliam
Instance Name: hiking-db
Instance ID: helloliam:us-central1:hiking-db
Region: us-central1
Database Version: PostgreSQL 14
Tier: db-f1-micro
Storage: 10GB SSD

Public IP: 35.202.149.98
# ⚠️ DO NOT USE for Cloud Run - use Unix socket instead

Connection Name: helloliam:us-central1:hiking-db
Unix Socket Path: /cloudsql/helloliam:us-central1:hiking-db
```

### Database Connection Methods

#### Production (Cloud Run)
```javascript
// backend/config/database.js
const pool = new Pool({
  host: '/cloudsql/helloliam:us-central1:hiking-db', // Unix socket
  port: 5432,
  database: 'hiking_portal',
  user: 'postgres',
  password: process.env.DB_PASSWORD, // From Secret Manager
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

#### Local Development (Docker)
```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'hiking_portal',
  user: 'postgres',
  password: 'your-local-password',
  max: 5,
});
```

#### Direct Connection (Admin/Scripts)
```bash
# Using Cloud SQL Proxy
gcloud sql connect hiking-db --user=postgres --project=helloliam

# Using psql with public IP (if authorized network configured)
psql -h 35.202.149.98 -U postgres -d hiking_portal
```

### Database Schema Version

**Current Version:** v2.0.0 (October 2025)
**Tables:** 26 operational tables
**Indexes:** 77 optimized indexes

---

## 🔐 Secret Management

### Google Secret Manager

All sensitive data stored in Secret Manager (NOT in environment variables).

#### Current Secrets

| Secret Name | Description | Used By |
|-------------|-------------|---------|
| `db-password` | PostgreSQL password | Backend |
| `jwt-secret` | JWT signing secret | Backend |
| `sendgrid-key` | SendGrid API key | Backend |
| `sendgrid-from-email` | SendGrid sender email | Backend |
| `openweather-api-key` | OpenWeather API key | Backend |
| `twilio-sid` | Twilio Account SID | Backend |
| `twilio-token` | Twilio Auth Token | Backend |
| `twilio-whatsapp-number` | Twilio WhatsApp number | Backend |

#### Managing Secrets

```bash
# List all secrets
gcloud secrets list --project=helloliam

# View secret metadata (not value)
gcloud secrets describe db-password --project=helloliam

# Add new secret
echo -n "secret-value" | gcloud secrets create SECRET_NAME --data-file=- --project=helloliam

# Update existing secret (creates new version)
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=- --project=helloliam

# Access secret value (for debugging)
gcloud secrets versions access latest --secret=SECRET_NAME --project=helloliam

# Grant Cloud Run access to secret
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member=serviceAccount:554106646136-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor \
  --project=helloliam
```

---

## 🌍 Environment-Specific Settings

### Production

```yaml
Frontend:
  - Build: Optimized, minified
  - Debug: Disabled
  - Logging: Errors only
  - API: https://backend-4kzqyywlqq-ew.a.run.app
  - Caching: Enabled
  - Service Worker: Active

Backend:
  - Server: Cloud Run
  - Database: Cloud SQL (Unix socket)
  - Secrets: Secret Manager
  - Logging: Info level
  - CORS: Restricted to frontend domain
  - Rate Limiting: Enabled (100 req/15min)

Database:
  - Host: Unix socket
  - SSL: Not required (internal connection)
  - Connection Pool: 10 max connections
```

### Development

```yaml
Frontend:
  - Build: Development mode
  - Debug: Enabled
  - Logging: All levels
  - API: http://localhost:5000
  - Hot Reload: Enabled
  - Service Worker: Disabled

Backend:
  - Server: Local (port 5000)
  - Database: Docker (localhost:5433)
  - Secrets: .env file
  - Logging: Debug level
  - CORS: Open (localhost:3000)
  - Rate Limiting: Disabled

Database:
  - Host: localhost
  - Port: 5433
  - SSL: Disabled
  - Connection Pool: 5 max connections
```

---

## 🔍 Configuration Validation

### Frontend Validation Checklist

```bash
cd frontend

# 1. Check .env.production exists
[ -f .env.production ] && echo "✓ .env.production exists" || echo "✗ MISSING"

# 2. Check no .env.local (conflicts with production)
[ ! -f .env.local ] && echo "✓ No .env.local" || echo "⚠ .env.local exists - will override production"

# 3. Verify backend URL
grep "REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app" .env.production && echo "✓ Correct backend URL" || echo "✗ WRONG URL"

# 4. Verify debug is off
grep "REACT_APP_DEBUG=false" .env.production && echo "✓ Debug disabled" || echo "⚠ Debug enabled"

# 5. Check build includes correct URL
[ -d build ] && grep -q "backend-4kzqyywlqq-ew.a.run.app" build/static/js/main.*.js && echo "✓ Build has correct URL" || echo "⚠ Rebuild needed"
```

### Backend Validation Checklist

```bash
# 1. Check Cloud Run config
gcloud run services describe backend \
  --region=europe-west1 \
  --project=helloliam \
  --format="value(spec.template.spec.containers[0].env[?name=='DB_HOST'].value)"
# Should output: /cloudsql/helloliam:us-central1:hiking-db

# 2. Verify Cloud SQL instance attached
gcloud run services describe backend \
  --region=europe-west1 \
  --project=helloliam \
  --format="value(spec.template.metadata.annotations.['run.googleapis.com/cloudsql-instances'])"
# Should output: helloliam:us-central1:hiking-db

# 3. Check secrets are accessible
gcloud secrets list --project=helloliam | grep -E "(db-password|jwt-secret|sendgrid)" && echo "✓ Secrets exist"

# 4. Test API health
curl -s https://backend-4kzqyywlqq-ew.a.run.app/health | grep -q "ok" && echo "✓ Backend healthy"
```

---

## 🚨 Common Configuration Mistakes

### ❌ Mistake 1: Wrong Backend URL
```bash
# WRONG
REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app

# CORRECT
REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app
```

### ❌ Mistake 2: TCP Connection Instead of Unix Socket
```bash
# WRONG (for Cloud Run)
DB_HOST=35.202.149.98

# CORRECT (for Cloud Run)
DB_HOST=/cloudsql/helloliam:us-central1:hiking-db
```

### ❌ Mistake 3: .env.local Overriding Production
```bash
# Problem: .env.local exists during production build
# Solution: Rename or delete it
mv frontend/.env.local frontend/.env.local.DISABLED
```

### ❌ Mistake 4: Debug Enabled in Production
```bash
# WRONG
REACT_APP_DEBUG=true

# CORRECT
REACT_APP_DEBUG=false
```

### ❌ Mistake 5: Missing Cloud SQL Instance Connection
```bash
# Deploy command MUST include:
--add-cloudsql-instances=helloliam:us-central1:hiking-db
```

---

## 📚 Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Backend README](./backend/README.md) - Backend-specific documentation
- [Frontend README](./frontend/README.md) - Frontend-specific documentation
- [Database Schema](./docs/architecture/DATABASE_SCHEMA.md) - Database structure

---

**Last Updated:** October 15, 2025
**Maintainer:** Development Team
**Status:** ✅ Complete and Verified
