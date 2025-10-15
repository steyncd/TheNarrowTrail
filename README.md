# 🌲 The Narrow Trail - Hiking Portal

A comprehensive full-stack web application for managing hiking groups, events, and community features. Built with modern technologies for scalability, security, and user experience.

---

## 🚀 Live Application

- **🌐 Frontend**: https://helloliam.web.app
- **🔧 Backend API**: https://backend-4kzqyywlqq-ew.a.run.app
- **🏠 Custom Domain** (Planned): https://www.thenarrowtrail.co.za
- **📚 Documentation**: [Complete Documentation](docs/README.md)

**Status:** ✅ Production Ready - Last Deployed: October 15, 2025

---

## 📋 Quick Links

### For Developers
- **[⚡ Quick Start Guide](docs/setup-guides/QUICK_START.md)** - Get started in 5 minutes
- **[🚀 Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[⚙️ Configuration Reference](CONFIGURATION.md)** - All environment variables explained
- **[✅ Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md)** - Use before every deployment

### Documentation
- **[Architecture Overview](docs/architecture/SYSTEM_ARCHITECTURE.md)**
- **[Database Schema](docs/architecture/DATABASE_SCHEMA.md)**
- **[Feature Documentation](docs/features/)**
- **[Development Guides](docs/development/)**

---

## ✨ Key Features

### 👥 User Management
- **Authentication** - Secure JWT-based login with role-based access control
- **User Profiles** - Comprehensive profiles with emergency contacts
- **Permission System** - Granular role and permission management
- **Auto-Approval** - Intelligent user registration approval
- **Privacy** - Full POPIA compliance (South African data protection)

### 🥾 Hike Management
- **Event Planning** - Create and manage hiking events
- **Registration** - Interest tracking and attendance management
- **Payment Tracking** - Integrated payment processing
- **Photo Galleries** - Image upload and sharing
- **Packing Lists** - Customizable gear lists
- **Weather Integration** - Real-time weather data

### 📱 Communication
- **Email Notifications** - SendGrid-powered email system
- **SMS Alerts** - Twilio SMS and WhatsApp integration
- **Real-time Updates** - WebSocket-based live notifications
- **Comment System** - Discussions on hikes and events
- **Carpool Coordination** - Organize shared transportation

### 📊 Analytics & Admin
- **Usage Analytics** - Comprehensive usage tracking
- **Activity Logs** - Detailed audit trail
- **Payment Reporting** - Financial tracking and reporting
- **Admin Dashboard** - Complete system administration

### 🔒 Compliance & Security
- **POPIA Compliance** - Full South African data protection compliance
- **Data Retention** - Automated data cleanup policies
- **Editable Legal Docs** - Privacy Policy and Terms in admin panel
- **Data Export** - User data export capabilities
- **Account Deletion** - Complete data removal

### 📱 Progressive Web App (PWA)
- **Offline Support** - Work without internet connection
- **Mobile Optimized** - Responsive design for all devices
- **Install Prompt** - Add to home screen on mobile
- **Push Notifications** - Real-time alerts on mobile

---

## 🏗️ Architecture

```
┌─────────────────────┐      ┌───────────────────────┐      ┌────────────────────┐
│   React Frontend    │      │   Node.js Backend     │      │   PostgreSQL DB    │
│  Firebase Hosting   │◄────►│     Cloud Run         │◄────►│     Cloud SQL      │
│  (Port 3000 dev)    │      │   (Port 8080 prod)    │      │   (Unix Socket)    │
└─────────────────────┘      └───────────────────────┘      └────────────────────┘
         │                              │                             │
         └──────────────────────────────┼─────────────────────────────┘
                                        │
                    ┌───────────────────┴────────────────────┐
                    │                                        │
          ┌─────────▼─────────┐                  ┌──────────▼─────────┐
          │  Secret Manager   │                  │   File Storage     │
          │  (API Keys, etc)  │                  │   (Future: GCS)    │
          └───────────────────┘                  └────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with Hooks
- React Router v6
- Bootstrap 5
- Socket.IO Client
- Service Workers (PWA)

**Backend:**
- Node.js 18 (LTS)
- Express.js
- Socket.IO Server
- JWT Authentication
- Node-cron (Scheduled tasks)

**Database:**
- PostgreSQL 14
- pg (Node PostgreSQL client)
- Connection pooling
- Automated backups

**Cloud Infrastructure:**
- **Google Cloud Platform** (Project: `helloliam`)
  - Cloud Run (Backend hosting)
  - Cloud SQL (Database)
  - Secret Manager (Credentials)
  - Cloud Build (CI/CD)
- **Firebase**
  - Hosting (Frontend)
  - Analytics

**Integrations:**
- SendGrid (Email)
- Twilio (SMS & WhatsApp)
- OpenWeather API (Weather data)
- Stripe (Payment processing - Future)

---

## 📁 Project Structure

```
hiking-portal/
├── 📄 DEPLOYMENT.md              # Complete deployment guide
├── 📄 CONFIGURATION.md           # Environment variables reference
├── 📄 PRE_DEPLOYMENT_CHECKLIST.md # Pre-deployment verification
├── 📄 README.md                  # This file
│
├── 📂 frontend/                  # React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── admin/            # Admin-specific components
│   │   │   ├── hikes/            # Hike-related components
│   │   │   ├── payments/         # Payment components
│   │   │   └── common/           # Shared components
│   │   ├── pages/                # Page-level components
│   │   ├── contexts/             # React Context (state management)
│   │   ├── services/             # API integration layer
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils/                # Utility functions
│   ├── public/
│   │   ├── service-worker.js     # PWA service worker
│   │   └── manifest.json         # PWA manifest
│   ├── .env.production           # Production environment config ⚠️
│   ├── .env.local.example        # Local dev config template
│   └── package.json
│
├── 📂 backend/                   # Node.js API server
│   ├── controllers/              # Request handlers
│   │   ├── adminController.js
│   │   ├── hikeController.js
│   │   ├── paymentController.js
│   │   └── ...
│   ├── routes/                   # API route definitions
│   │   ├── admin.js
│   │   ├── hikes.js
│   │   ├── auth.js
│   │   └── ...
│   ├── middleware/               # Express middleware
│   │   ├── auth.js               # JWT authentication
│   │   ├── permissions.js        # Permission checks
│   │   └── rateLimit.js          # Rate limiting
│   ├── services/                 # Business logic
│   │   ├── emailService.js       # SendGrid integration
│   │   ├── smsService.js         # Twilio integration
│   │   └── socketService.js      # WebSocket handling
│   ├── config/                   # Configuration
│   │   ├── database.js           # DB connection
│   │   └── env.js                # Environment variables
│   ├── migrations/               # Database migrations (future)
│   ├── tools/                    # Utility scripts
│   ├── .env.example              # Backend config template
│   └── server.js                 # Application entry point
│
├── 📂 docs/                      # Documentation
│   ├── setup-guides/             # Getting started guides
│   ├── deployment/               # Deployment documentation
│   ├── architecture/             # System design
│   ├── features/                 # Feature documentation
│   ├── development/              # Developer guides
│   ├── configuration/            # Config guides
│   ├── compliance/               # POPIA & security
│   ├── mobile/                   # PWA & mobile docs
│   └── archive/                  # Archived documentation
│
├── 📂 scripts/                   # Deployment & utility scripts
│   └── pre-deploy-check.sh       # Pre-deployment validation (future)
│
├── 📂 docker/                    # Docker configuration (local dev)
│   └── docker-compose.yml        # Local dev environment
│
└── 📂 .git/                      # Git repository
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Google Cloud SDK** ([Install](https://cloud.google.com/sdk/docs/install))
- **Firebase CLI** - `npm install -g firebase-tools`
- **Git** - For version control

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/hiking-portal.git
cd hiking-portal

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure backend (create .env file)
cp .env.example .env
# Edit .env with your local database credentials

# 4. Start backend
npm start
# Backend runs on http://localhost:5000

# 5. In a new terminal, install frontend dependencies
cd frontend
npm install

# 6. Configure frontend (for local development)
cp .env.local.example .env.local
# Edit .env.local to point to http://localhost:5000

# 7. Start frontend
npm start
# Frontend runs on http://localhost:3000
```

### Using Docker (Alternative)

```bash
# Start all services with Docker Compose
cd docker
docker-compose up -d

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - Database: localhost:5433
```

---

## 🚀 Deployment

### ⚠️ IMPORTANT: Always Use the Checklist

**Before deploying to production:**
1. Read [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
2. Complete ALL checklist items
3. Follow [DEPLOYMENT.md](DEPLOYMENT.md) step-by-step

### Quick Deploy (If Checklist Complete)

```bash
# 1. Deploy Backend
cd backend
gcloud run deploy backend \
  --source . \
  --region europe-west1 \
  --project helloliam \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=/cloudsql/helloliam:us-central1:hiking-db,DB_PORT=5432,FRONTEND_URL=https://www.thenarrowtrail.co.za" \
  --add-cloudsql-instances=helloliam:us-central1:hiking-db \
  --set-secrets="DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest"

# 2. Deploy Frontend
cd frontend
npm run build
firebase deploy --only hosting
```

For complete deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🏠 Home Assistant Integration

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)](https://github.com/steyncd/hiking-portal-homeassistant)

Monitor and manage your hiking portal directly from Home Assistant!

**The Home Assistant integration has been moved to a dedicated repository for easier installation and maintenance.**

👉 **[hiking-portal-homeassistant](https://github.com/steyncd/hiking-portal-homeassistant)**

### Quick Install via HACS

```bash
1. HACS → Integrations → ⋮ → Custom repositories
2. Add: https://github.com/steyncd/hiking-portal-homeassistant
3. Category: Integration
4. Install "The Narrow Trail Hiking Portal"
5. Restart Home Assistant
6. Configuration → Integrations → Add → "The Narrow Trail"
```

### Features

- 📊 **24 Sensors** - Hikes, notifications, weather, payments, WebSocket
- 🚨 **3 Binary Sensors** - Urgent notifications, weather warnings, connection status
- 📅 **Calendar** - All hikes as calendar events
- ⚡ **7 Services** - Express interest, mark attendance, notifications, payments, weather
- 🔄 **Real-time Updates** - WebSocket support for instant notifications

---

## 📊 Recent Updates

### October 15, 2025 - Production Fixes
- ✅ Fixed: Backend database connection using Unix socket
- ✅ Fixed: All 12 users now display (pagination issue resolved)
- ✅ Fixed: Correct backend URL in frontend configuration
- ✅ Added: Smart pagination with per-page selector
- ✅ Added: Comprehensive deployment documentation

### October 14, 2025 - Production Deployment
- ✅ Backend deployed to Cloud Run
- ✅ Frontend deployed to Firebase Hosting
- ✅ Database migrated to Cloud SQL
- ✅ Secret Manager configured
- ✅ SSL certificates configured

### October 13, 2025 - Major Updates
- ✅ Permission system audit complete
- ✅ User role management enhanced
- ✅ Mobile responsiveness improved
- ✅ Performance optimizations
- ✅ Code cleanup and organization

---

## 🔧 Configuration

### Critical Configuration Files

1. **`frontend/.env.production`** - Frontend production config
   - Contains backend API URL
   - **MUST** be verified before every deployment
   - See [CONFIGURATION.md](CONFIGURATION.md)

2. **Backend Environment** - Set via Cloud Run deployment
   - Environment variables set via `gcloud run deploy`
   - Secrets stored in Secret Manager
   - Database connection via Unix socket

3. **Database** - Cloud SQL PostgreSQL
   - Instance: `helloliam:us-central1:hiking-db`
   - Connection: Unix socket for Cloud Run
   - Backups: Automated daily

For complete configuration reference, see [CONFIGURATION.md](CONFIGURATION.md).

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Frontend shows "Failed to fetch"**
- **Cause**: Wrong backend URL in `.env.production`
- **Solution**: Verify URL and rebuild frontend
- **See**: [DEPLOYMENT.md Troubleshooting](DEPLOYMENT.md#troubleshooting)

**Issue: Backend database connection errors**
- **Cause**: Using TCP IP instead of Unix socket
- **Solution**: Redeploy with correct `DB_HOST`
- **See**: [CONFIGURATION.md](CONFIGURATION.md#database-configuration)

**Issue: Users not all displaying**
- **Status**: ✅ Fixed in latest deployment
- **Solution**: Frontend now requests all users with `?limit=1000`

For more troubleshooting, see:
- [DEPLOYMENT.md - Troubleshooting Section](DEPLOYMENT.md#troubleshooting)
- [docs/deployment/troubleshooting.md](docs/deployment/troubleshooting.md)

---

## 🛠️ Development

### API Documentation

API endpoints are documented in [backend/api-docs/](backend/api-docs/).

**Base URL (Production):** `https://backend-4kzqyywlqq-ew.a.run.app`

**Authentication:** JWT Bearer token in `Authorization` header

Example API calls:
```bash
# Public endpoints (no auth)
GET /api/hikes/public
GET /api/public-content/mission_vision

# Authenticated endpoints
GET /api/hikes (requires login)
POST /api/hikes (requires admin)
GET /api/admin/users (requires admin)
```

### Database Schema

See [docs/architecture/DATABASE_SCHEMA.md](docs/architecture/DATABASE_SCHEMA.md) for complete schema documentation.

**Tables:**
- `users` - User accounts and profiles
- `hikes` - Hiking events
- `hike_interest` - User registrations
- `payments` - Payment tracking
- `roles` & `permissions` - Access control
- And 20+ more tables

---

## 📚 Documentation

### Essential Reading

1. **[Quick Start Guide](docs/setup-guides/QUICK_START.md)** - Get up and running
2. **[Deployment Guide](DEPLOYMENT.md)** - Production deployment
3. **[Configuration Reference](CONFIGURATION.md)** - All settings explained
4. **[Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md)** - Before every deploy

### Additional Documentation

- **Architecture**: [docs/architecture/](docs/architecture/)
- **Features**: [docs/features/](docs/features/)
- **Development**: [docs/development/](docs/development/)
- **Compliance**: [docs/compliance/](docs/compliance/)
- **Mobile/PWA**: [docs/mobile/](docs/mobile/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Backend**: ESLint with Airbnb config
- **Frontend**: ESLint with React config
- **Commits**: Conventional commit messages
- **Testing**: Write tests for new features

---

## 📧 Support

**Developer:** Christiaan Steyn
**Email:** steyncd@gmail.com
**Project:** The Narrow Trail Hiking Portal
**Status:** ✅ Production Ready

---

## 📄 License

This project is private and proprietary.

---

**Last Updated:** October 15, 2025
**Version:** 2.0.0
**Status:** ✅ Production - Fully Operational
