# 🌲 The Narrow Trail - Solution Familiarization Summary

**Date:** October 16, 2025  
**Purpose:** Comprehensive understanding of the complete solution architecture, deployment, and configuration

---

## 📊 Executive Summary

**The Narrow Trail** is a full-stack production-ready hiking portal web application for managing hiking groups, events, and community features. The solution is currently deployed and operational with comprehensive documentation, automated deployment scripts, and a Home Assistant integration.

### Current Production Status
- ✅ **Backend**: Cloud Run (europe-west1) - `https://backend-4kzqyywlqq-ew.a.run.app`
- ✅ **Frontend**: Firebase Hosting - `https://helloliam.web.app`
- ✅ **Database**: Cloud SQL PostgreSQL (us-central1)
- ✅ **Status**: Fully operational since October 15, 2025

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend:**
- React 18 with Hooks
- React Router v6
- Bootstrap 5
- Socket.IO Client (real-time)
- Service Workers (PWA capabilities)

**Backend:**
- Node.js 18 (LTS)
- Express.js framework
- Socket.IO Server (WebSocket)
- JWT Authentication
- Node-cron (scheduled tasks)

**Database:**
- PostgreSQL 14.19
- 26 operational tables
- 77 optimized indexes
- Automated backups

**Infrastructure:**
- Google Cloud Platform (Project: `helloliam`)
  - Cloud Run (Backend hosting in europe-west1)
  - Cloud SQL (Database in us-central1)
  - Secret Manager (8 secrets)
  - Cloud Build (CI/CD)
- Firebase (Frontend hosting & analytics)

**External Integrations:**
- SendGrid (Email notifications)
- Twilio (SMS & WhatsApp)
- OpenWeather API (Weather data)

### System Architecture Pattern

```
┌─────────────────────┐      ┌───────────────────────┐      ┌────────────────────┐
│   React Frontend    │      │   Node.js Backend     │      │   PostgreSQL DB    │
│  Firebase Hosting   │◄────►│     Cloud Run         │◄────►│     Cloud SQL      │
│  (helloliam.web.app)│      │   (backend service)   │      │   (Unix Socket)    │
└─────────────────────┘      └───────────────────────┘      └────────────────────┘
         │                              │                             │
         └──────────────────────────────┼─────────────────────────────┘
                                        │
                    ┌───────────────────┴────────────────────┐
                    │                                        │
          ┌─────────▼─────────┐                  ┌──────────▼─────────┐
          │  Secret Manager   │                  │   Future:          │
          │  (8 secrets)      │                  │   Google Cloud     │
          │                   │                  │   Storage (Files)  │
          └───────────────────┘                  └────────────────────┘
```

---

## 📁 Project Structure

```
hiking-portal/
├── 📄 README.md                          # Main project documentation
├── 📄 DEPLOYMENT.md                      # Comprehensive deployment guide
├── 📄 CONFIGURATION.md                   # All environment variables explained
├── 📄 PRE_DEPLOYMENT_CHECKLIST.md        # Pre-deployment verification
├── 📄 PRODUCTION_DEPLOYMENT_FIXED_2025-10-15.md  # Latest deployment record
├── 📄 DIAGNOSTIC_RESULTS_2025-10-15.md   # System health diagnostics
│
├── 📂 frontend/                          # React application
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── admin/                    # Admin-specific
│   │   │   ├── hikes/                    # Hike management
│   │   │   ├── payments/                 # Payment tracking
│   │   │   ├── profile/                  # User profiles
│   │   │   └── common/                   # Shared components
│   │   ├── pages/                        # Page components
│   │   ├── contexts/                     # React Context (AuthContext)
│   │   ├── services/                     # API integration (api.js)
│   │   ├── hooks/                        # Custom React hooks
│   │   └── utils/                        # Utility functions
│   ├── public/
│   │   ├── service-worker.js             # PWA service worker
│   │   └── manifest.json                 # PWA manifest
│   ├── .env.production                   # ⚠️ CRITICAL: Production config
│   ├── .env.local.example                # Local dev template
│   ├── firebase.json                     # Firebase hosting config
│   └── package.json
│
├── 📂 backend/                           # Node.js API server
│   ├── server.js                         # Application entry point
│   ├── controllers/                      # Request handlers (14 files)
│   │   ├── adminController.js
│   │   ├── hikeController.js
│   │   ├── authController.js
│   │   ├── paymentController.js
│   │   ├── tokenController.js            # Long-lived tokens for HA
│   │   └── ...
│   ├── routes/                           # API route definitions (15 files)
│   │   ├── admin.js
│   │   ├── hikes.js
│   │   ├── auth.js
│   │   ├── tokens.js                     # Token management routes
│   │   └── ...
│   ├── middleware/                       # Express middleware
│   │   ├── auth.js                       # JWT authentication
│   │   └── permissions.js                # Permission checks (not in use)
│   ├── services/                         # Business logic
│   │   ├── emailService.js               # SendGrid integration
│   │   ├── smsService.js                 # Twilio integration
│   │   ├── socketService.js              # WebSocket handling
│   │   └── dataRetentionService.js       # POPIA compliance
│   ├── config/                           # Configuration
│   │   ├── database.js                   # DB connection (CRITICAL)
│   │   └── env.js                        # Environment loader
│   ├── migrations/                       # Database migrations (19 files)
│   ├── Dockerfile                        # Container definition
│   ├── .dockerignore                     # Docker exclusions
│   └── package.json
│
├── 📂 docs/                              # Comprehensive documentation
│   ├── README.md                         # Documentation index
│   ├── setup-guides/                     # Getting started
│   ├── deployment/                       # Deployment docs
│   ├── architecture/                     # System design
│   │   ├── SYSTEM_ARCHITECTURE.md
│   │   └── DATABASE_SCHEMA.md
│   ├── features/                         # Feature documentation
│   │   ├── implemented-features.md
│   │   ├── USER_MANAGEMENT.md
│   │   └── ...
│   ├── development/                      # Developer guides
│   │   ├── SECURITY.md
│   │   ├── PERMISSION_SYSTEM.md
│   │   └── ...
│   ├── configuration/                    # Config management
│   ├── compliance/                       # POPIA & legal
│   ├── mobile/                           # PWA & mobile docs
│   ├── performance/                      # Performance optimization
│   └── troubleshooting/                  # Common issues
│
├── 📂 scripts/                           # Deployment scripts
│   ├── README.md                         # Scripts documentation
│   ├── deploy-all.bat                    # Full-stack deployment
│   ├── deploy-backend.bat/.ps1/.sh       # Backend deployment (3 versions)
│   ├── deploy-frontend.bat/.ps1/.sh      # Frontend deployment (3 versions)
│   └── rollback-deployment.sh            # Rollback script
│
├── 📂 homeassistant/                     # Home Assistant integration
│   ├── custom_components/
│   │   └── hiking_portal/                # Custom component
│   │       ├── __init__.py               # Main integration
│   │       ├── manifest.json             # Integration metadata
│   │       ├── sensor.py                 # 8 sensors
│   │       ├── binary_sensor.py          # 3 binary sensors
│   │       ├── calendar.py               # Calendar integration
│   │       ├── coordinator.py            # Data updates
│   │       └── config_flow.py            # Configuration UI
│   ├── README.md                         # HA integration docs
│   ├── QUICKSTART.md                     # 5-minute setup
│   ├── INSTALLATION.md                   # Detailed install
│   ├── TOKEN_GENERATION.md               # Token creation guide
│   └── TEST_RESULTS.md                   # Integration tests
│
└── 📂 docker/                            # Local development
    └── docker-compose.yml                # Local dev environment
```

---

## 🔑 Critical Configuration Files

### 1. Frontend Environment (`frontend/.env.production`)

**Purpose:** Embedded into JavaScript bundle during build  
**Critical:** YES - Wrong URL breaks entire frontend

```bash
# ⚠️ MUST BE CORRECT BEFORE EVERY BUILD
REACT_APP_API_URL=https://backend-4kzqyywlqq-ew.a.run.app
REACT_APP_SOCKET_URL=https://backend-4kzqyywlqq-ew.a.run.app
REACT_APP_ENV=production
REACT_APP_DEBUG=false

# Other settings
REACT_APP_LOG_LEVEL=error
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PWA=true
REACT_APP_SESSION_TIMEOUT=3600000
REACT_APP_DOMAIN=www.thenarrowtrail.co.za
```

**Verification Before Deploy:**
```bash
cd frontend
cat .env.production | grep REACT_APP_API_URL
# Must show: https://backend-4kzqyywlqq-ew.a.run.app
```

### 2. Backend Configuration (Cloud Run Environment Variables)

**Purpose:** Runtime configuration for backend  
**Critical:** YES - Database connection depends on this  
**Set via:** `gcloud run deploy` command (NOT from .env file)

```bash
# Database (CRITICAL)
DB_HOST=/cloudsql/helloliam:us-central1:hiking-db  # ⚠️ MUST be Unix socket
DB_PORT=5432
DB_NAME=hiking_portal
DB_USER=postgres

# Application
NODE_ENV=production
FRONTEND_URL=https://www.thenarrowtrail.co.za
PORT=8080
```

**8 Required Secrets (from Secret Manager):**
1. `db-password` - Database password
2. `jwt-secret` - JWT signing key
3. `sendgrid-key` - Email API key
4. `sendgrid-from-email` - Sender email
5. `openweather-api-key` - Weather API
6. `twilio-sid` - SMS Account SID
7. `twilio-token` - SMS Auth Token
8. `twilio-whatsapp-number` - WhatsApp number

### 3. Database Configuration (`backend/config/database.js`)

**Purpose:** Database connection pool management  
**Critical:** YES - Controls connection method

**Key Logic:**
```javascript
// Priority 1: DATABASE_URL (if set, overrides everything)
if (process.env.DATABASE_URL) {
  dbConfig = { connectionString: process.env.DATABASE_URL };
}
// Priority 2: Individual variables
else {
  if (DB_HOST.startsWith('/cloudsql/')) {
    // Uses Unix socket (CORRECT for Cloud Run)
    dbConfig.host = DB_HOST;
  } else {
    // Uses TCP connection (FAILS in Cloud Run)
    dbConfig.host = DB_HOST;
    dbConfig.ssl = { rejectUnauthorized: false };
  }
}
```

**CRITICAL:** Never set `DATABASE_URL` for Cloud Run production deployment. Always use individual `DB_*` variables with Unix socket path.

---

## 🚀 Deployment Process

### Pre-Deployment Checklist

**Before EVERY deployment:**

1. ✅ Code reviewed and tested locally
2. ✅ `frontend/.env.production` has correct backend URL
3. ✅ No `.env.local` file exists (or renamed to `.env.local.DISABLED`)
4. ✅ Backend tests pass
5. ✅ Frontend builds successfully
6. ✅ Database migrations ready (if any)
7. ✅ All secrets exist in Secret Manager
8. ✅ Git changes committed with clear messages

### Backend Deployment Command

```bash
cd backend

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
  --min-instances=0
```

**Key Points:**
- Uses `--source .` (buildpacks deployment)
- `DB_HOST` MUST be Unix socket path
- `--add-cloudsql-instances` is REQUIRED
- Secrets loaded from Secret Manager (not inline)

### Frontend Deployment Process

```bash
cd frontend

# 1. Verify configuration
cat .env.production  # Check backend URL

# 2. Remove conflicting .env.local if exists
mv .env.local .env.local.DISABLED  # If it exists

# 3. Install dependencies
npm install

# 4. Build for production
npm run build

# 5. Verify build has correct URL
grep -r "backend-4kzqyywlqq-ew.a.run.app" build/static/js/

# 6. Deploy to Firebase
firebase deploy --only hosting

# 7. Restore .env.local if needed
mv .env.local.DISABLED .env.local  # If it existed
```

### Automated Deployment Scripts

**Available in `/scripts` folder:**

| Script | Platform | Purpose |
|--------|----------|---------|
| `deploy-all.bat` | Windows | Deploy backend + frontend |
| `deploy-backend.bat` | Windows CMD | Backend only |
| `deploy-backend.ps1` | Windows PowerShell | Backend only |
| `deploy-backend.sh` | Unix/Linux/Mac | Backend only |
| `deploy-frontend.bat` | Windows CMD | Frontend only |
| `deploy-frontend.ps1` | Windows PowerShell | Frontend only |
| `deploy-frontend.sh` | Unix/Linux/Mac | Frontend only |
| `rollback-deployment.sh` | Unix/Linux/Mac | Rollback to previous |

**Safety Features:**
- ✅ Secret verification before backend deploy
- ✅ `.env.local` automatic backup/removal
- ✅ Build output scanning for localhost references
- ✅ Deployment confirmation prompts
- ✅ Detailed success/failure reporting

---

## ✨ Key Features

### User Management
- JWT-based authentication with role-based access control (RBAC)
- Comprehensive user profiles with emergency contacts
- Granular permission system (35+ permissions defined)
- Auto-approval for new user registrations
- Long-lived token generation for integrations (Home Assistant)

### Hike Management
- Create and manage hiking events
- Interest tracking and attendance management
- Payment tracking and reporting
- Photo galleries with image upload
- Customizable packing lists
- Weather integration via OpenWeather API
- GPS coordinates and location tracking

### Communication
- Email notifications via SendGrid
- SMS alerts via Twilio
- WhatsApp integration via Twilio
- Real-time updates via WebSocket (Socket.IO)
- Comment system on hikes
- Carpool coordination features

### Admin Features
- User management with approval workflow
- Role and permission management
- Payment tracking and reporting
- Analytics and usage tracking
- Activity logs (signin, user actions)
- System health monitoring
- Editable legal documents (Privacy Policy, Terms)

### Compliance & Security
- POPIA compliance (South African data protection)
- Automated data retention policies
- Data export capabilities for users
- Complete account deletion workflow
- Activity logging and audit trail

### Progressive Web App (PWA)
- Offline support with service workers
- Mobile-optimized responsive design
- Install prompt for mobile home screen
- Push notifications support
- App-like experience

---

## 🏠 Home Assistant Integration

### Overview
Custom integration that monitors and manages the hiking portal from Home Assistant.

**Domain:** `hiking_portal_v2`  
**Version:** 2.5.0  
**Type:** Cloud polling with optional WebSocket real-time updates

### Features

**8 Sensors:**
1. `sensor.next_hike` - Your next upcoming hike
2. `sensor.upcoming_hikes_count` - Number of upcoming hikes
3. `sensor.my_hikes_count` - Hikes you're interested in
4. `sensor.pending_users` - Users awaiting approval (admin only)
5. `sensor.total_hikes` - Total hikes in system
6. `sensor.days_until_next_hike` - Days until next hike
7. `sensor.unread_notifications` - Unread notification count
8. `sensor.websocket_status` - Real-time connection status

**3 Binary Sensors:**
1. `binary_sensor.has_urgent_notifications` - Urgent notifications flag
2. `binary_sensor.weather_warning` - Weather warnings for hikes
3. `binary_sensor.websocket_connected` - WebSocket connection status

**Calendar:**
- `calendar.hiking_portal_events` - All interested hikes as calendar events

**7 Services:**
1. `express_interest` - Register interest in a hike
2. `remove_interest` - Remove interest from a hike
3. `mark_attendance` - Mark attendance (present/absent/maybe)
4. `send_notification` - Send notification to hike participants
5. `mark_notification_read` - Mark notification as read
6. `record_payment` - Record payment for a hike
7. `get_weather` - Get weather forecast for hike

### Installation Status
- ✅ Backend endpoints working (verified October 15, 2025)
- ✅ Long-lived token generation implemented
- ✅ Frontend UI for token generation implemented
- ⏳ Needs real-world testing in Home Assistant instance

### Token Generation
Users can generate long-lived tokens (1-year validity) from their profile:
1. Log into https://helloliam.web.app
2. Go to Profile → Integration Tokens
3. Click "Generate Token"
4. Enter name (e.g., "Home Assistant")
5. Copy token (only shown once!)
6. Use in Home Assistant integration setup

---

## 🗄️ Database Schema

### Cloud SQL Instance
- **Instance ID:** `helloliam:us-central1:hiking-db`
- **Type:** PostgreSQL 14.19
- **Region:** us-central1-c
- **Connection:** Unix socket for Cloud Run (`/cloudsql/helloliam:us-central1:hiking-db`)
- **Public IP:** 35.202.149.98 (for admin access only)

### Core Tables (26 operational)

**User Management:**
- `users` - User accounts and profiles
- `roles` - User roles (admin, hiker, guide)
- `permissions` - System permissions (35+ defined)
- `role_permissions` - Role-permission mappings
- `user_permissions` - User-specific permission overrides
- `long_lived_tokens` - Integration tokens (Home Assistant)

**Hike Management:**
- `hikes` - Hiking events
- `hike_interest` - User registrations and attendance
- `hike_attendance` - Attendance tracking (legacy)
- `hike_attendees` - Attendee lists (legacy)
- `hike_photos` - Photo galleries
- `hike_comments` - Discussion threads
- `packing_list_items` - Gear checklists

**Financial:**
- `payments` - Payment tracking
- `expenses` - Expense management

**Communication:**
- `notifications` - System notifications
- `notification_log` - Notification delivery log

**Compliance:**
- `signin_logs` - User sign-in tracking
- `activity_logs` - User action audit trail
- `feedback` - User feedback submissions
- `suggestions` - Feature suggestions

**System:**
- `public_content` - Editable content (mission, vision, legal)
- `hike_types` - Event type classification
- `difficulties` - Difficulty levels

### Database Indexes
77 optimized indexes for performance, including:
- User email search
- Hike date queries
- Payment lookups
- Permission checks
- Activity log filtering

---

## 🔧 Common Issues & Solutions

### Issue 1: Frontend Shows "Failed to fetch"

**Cause:** Wrong backend URL in `.env.production`

**Solution:**
```bash
cd frontend
cat .env.production  # Verify URL
# Should be: https://backend-4kzqyywlqq-ew.a.run.app

# If wrong:
nano .env.production  # Fix URL
rm -rf build          # Delete old build
npm run build         # Rebuild
firebase deploy --only hosting
```

### Issue 2: Database Connection Timeout

**Cause:** Using TCP IP instead of Unix socket

**Error:**
```
Error: connect ETIMEDOUT 35.202.149.98:5432
```

**Solution:**
Redeploy backend with correct `DB_HOST`:
```bash
--set-env-vars="DB_HOST=/cloudsql/helloliam:us-central1:hiking-db"
--add-cloudsql-instances=helloliam:us-central1:hiking-db
```

### Issue 3: Users Not All Showing (Pagination)

**Status:** ✅ Fixed in October 15, 2025 deployment

**What was fixed:**
- Backend default limit increased
- Frontend requests all users with `?limit=1000`
- Pagination UI implemented

### Issue 4: Home Assistant Integration Not Loading

**Possible causes:**
1. Files not copied to correct location
2. Home Assistant not restarted after install
3. Invalid or expired token
4. Wrong backend URL in token

**Solution:**
1. Verify files in `/config/custom_components/hiking_portal/`
2. Restart Home Assistant
3. Generate new long-lived token from portal
4. Check token hasn't been revoked
5. Test backend endpoint manually with token

---

## 📊 Current Production State (October 15, 2025)

### Backend (Cloud Run)
- **Service:** `backend`
- **URL:** https://backend-4kzqyywlqq-ew.a.run.app
- **Revision:** backend-00066-k2z (active, 100% traffic)
- **Status:** ✅ Healthy
- **Database:** Connected via Unix socket
- **Endpoints:** All responding correctly

### Frontend (Firebase)
- **URL:** https://helloliam.web.app
- **Version:** Latest (deployed October 15, 2025)
- **Status:** ✅ Operational
- **Backend Connection:** Correct URL configured

### Database (Cloud SQL)
- **Instance:** hiking-db
- **Status:** ✅ Running
- **Connection:** Unix socket working
- **Backups:** Automated daily

### Verified Working
- ✅ User authentication and login
- ✅ Hike listing and details
- ✅ User management (all 12 users showing)
- ✅ Payment tracking
- ✅ Admin dashboard
- ✅ Public endpoints (landing page hikes)
- ✅ Permission system
- ✅ Long-lived token generation

---

## 📚 Documentation Structure

### Root Level Documentation
1. **README.md** - Main project overview and quick links
2. **DEPLOYMENT.md** - Complete deployment guide (627 lines)
3. **CONFIGURATION.md** - Environment variables reference (529 lines)
4. **PRE_DEPLOYMENT_CHECKLIST.md** - Pre-deployment verification
5. **PRODUCTION_DEPLOYMENT_FIXED_2025-10-15.md** - Latest deployment record
6. **DIAGNOSTIC_RESULTS_2025-10-15.md** - System health diagnostics

### /docs Folder (Comprehensive)
- **architecture/** - System design and database schema
- **deployment/** - Deployment guides and history
- **development/** - Developer guides and security docs
- **features/** - Feature documentation and implementation
- **mobile/** - PWA and mobile responsiveness
- **performance/** - Performance optimization guides
- **configuration/** - Config management
- **compliance/** - POPIA and legal compliance
- **troubleshooting/** - Common issues and solutions

### /scripts Folder
- **README.md** - Script usage guide (430 lines)
- Platform-specific deployment scripts (Windows, PowerShell, Unix)
- Automated safety checks and validation

### /homeassistant Folder
- **README.md** - Integration overview
- **QUICKSTART.md** - 5-minute setup guide
- **INSTALLATION.md** - Detailed installation
- **TOKEN_GENERATION.md** - Token creation guide
- **TEST_RESULTS.md** - Integration test results
- **DIAGNOSTIC_REPORT.md** - Integration troubleshooting

---

## 🎯 Development Workflow

### Local Development Setup

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env  # Configure local settings
npm start  # Runs on http://localhost:5000

# 2. Frontend (separate terminal)
cd frontend
npm install
cp .env.local.example .env.local  # Configure local settings
npm start  # Runs on http://localhost:3000
```

### Testing Before Deployment

```bash
# Backend tests
cd backend
npm test

# Frontend build test
cd frontend
npm run build
# Verify build folder created successfully

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/hikes/public
```

### Git Workflow

```bash
# Always commit before deploying
git add .
git commit -m "feat: description of changes"
git push origin master

# Tag major releases
git tag -a v2.0.0 -m "Major release description"
git push origin v2.0.0
```

---

## 🔐 Security Considerations

### Authentication & Authorization
- JWT tokens with 24-hour expiration
- Long-lived tokens (1 year) for integrations
- Role-based access control (RBAC)
- Permission checking middleware (available but not in active use)

### Data Protection
- POPIA compliant data handling
- Automated data retention policies
- User data export capabilities
- Complete account deletion workflow
- Activity logging for audit trail

### API Security
- Rate limiting (100 requests per 15 minutes)
- CORS configured for frontend domain only
- Secret Manager for sensitive credentials
- Environment variable separation
- No secrets in code or git

### Infrastructure Security
- Cloud Run with minimal privileges
- Service account with specific roles
- Unix socket database connection (internal only)
- Secrets in Secret Manager (not environment vars)
- HTTPS enforced on all endpoints

---

## 🚦 Monitoring & Health Checks

### Backend Health Check
```bash
curl https://backend-4kzqyywlqq-ew.a.run.app/health
# Expected: {"status":"ok","timestamp":"..."}
```

### View Logs
```bash
# Recent errors only
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND severity>=ERROR" \
  --limit=50 --project=helloliam

# Real-time logs
gcloud run services logs tail backend \
  --region=europe-west1 --project=helloliam
```

### Database Health
```bash
# Check database status
gcloud sql instances describe hiking-db --project=helloliam

# Connect to database
gcloud sql connect hiking-db --user=postgres --project=helloliam
```

### Check Active Revision
```bash
gcloud run services describe backend \
  --region=europe-west1 --project=helloliam \
  --format="value(status.latestReadyRevisionName,status.traffic[0].revisionName)"
```

---

## 📞 Important Links

### Production URLs
- Frontend: https://helloliam.web.app
- Backend API: https://backend-4kzqyywlqq-ew.a.run.app
- Custom Domain (planned): https://www.thenarrowtrail.co.za

### Google Cloud Console
- Project Dashboard: https://console.cloud.google.com/home/dashboard?project=helloliam
- Cloud Run: https://console.cloud.google.com/run?project=helloliam
- Cloud SQL: https://console.cloud.google.com/sql/instances?project=helloliam
- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=helloliam

### Firebase Console
- Project: https://console.firebase.google.com/project/helloliam
- Hosting: https://console.firebase.google.com/project/helloliam/hosting

---

## ✅ Readiness Assessment

### Production Readiness: ✅ READY
- ✅ All core features implemented and tested
- ✅ Backend deployed and operational
- ✅ Frontend deployed and operational
- ✅ Database connected and working
- ✅ All secrets configured
- ✅ Documentation comprehensive and up-to-date
- ✅ Deployment scripts automated and tested
- ✅ Monitoring and logging in place
- ✅ Rollback procedures documented

### Known Issues: NONE (as of October 15, 2025)
- All reported issues from previous deployments resolved
- System health checks passing
- No critical errors in logs
- Performance metrics within acceptable range

### Pending Features (Non-Critical)
- Custom domain DNS configuration (www.thenarrowtrail.co.za)
- Stripe payment integration (currently manual tracking)
- Google Cloud Storage for file uploads (currently base64)
- Enhanced analytics dashboard
- Mobile app (currently PWA)

---

**Last Updated:** October 16, 2025  
**Solution Status:** ✅ Production Ready & Operational  
**Documentation Status:** ✅ Comprehensive & Current
