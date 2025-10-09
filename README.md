# The Narrow Trail - Hiking Portal

Full-stack hiking club management application with React frontend and Node.js backend.

## 🚀 Quick Links

- **📱 Live Application**: https://helloliam.web.app
- **🔧 API Endpoint**: https://backend-554106646136.europe-west1.run.app
- **📚 Documentation**: [docs/README.md](docs/README.md)

## 📖 Documentation

All documentation is organized in the [`docs/`](docs/) directory by topic:

- **[Compliance](docs/compliance/)** - POPIA compliance and data protection
- **[Features](docs/features/)** - Feature documentation and user guides
- **[Mobile](docs/mobile/)** - Mobile responsiveness documentation
- **[Notifications](docs/notifications/)** - Notification system guides
- **[Performance](docs/performance/)** - Performance optimization
- **[Development](docs/development/)** - Architecture and development guides
- **[Deployment](docs/deployment/)** - Deployment procedures

## 🏗️ Project Structure

```
hiking-portal/
├── docs/                    # Documentation (organized by topic)
│   ├── compliance/          # POPIA and data protection
│   ├── features/            # Feature docs
│   ├── mobile/              # Mobile responsiveness
│   ├── notifications/       # Notification system
│   ├── performance/         # Performance docs
│   ├── development/         # Dev guides
│   ├── deployment/          # Deployment guides
│   └── archive/             # Historical docs
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── contexts/        # React contexts
│   └── build/               # Production build
├── backend/                 # Node.js API
│   ├── controllers/         # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, validation
│   ├── config/              # Configuration
│   ├── migrations/          # SQL migrations
│   └── docs/                # Backend-specific docs
└── README.md                # This file
```

## ✨ Key Features

### User Management
- 🔐 Authentication and authorization (JWT)
- 👥 User profiles with emergency contacts
- ✅ Intelligent auto-approval system
- 📊 Admin dashboard

### Hike Management
- 🥾 Hike creation and management
- 📝 Interest expression and attendance tracking
- 💰 Payment tracking for hike costs
- 📸 Photo galleries
- 📦 Packing list management
- 🌤️ Weather integration

### Communication
- 💬 Comments and discussions
- 🚗 Carpool coordination
- 🔔 Customizable notifications (Email/SMS/WhatsApp)
- 📧 Automated email notifications

### Compliance & Security
- 🔒 POPIA compliance (South African data protection)
- 📄 Editable Privacy Policy and Terms
- 🗑️ Automated data retention
- 📊 Data export capabilities
- ❌ Account deletion

### Analytics & Monitoring
- 📊 Usage analytics
- 📝 Activity logging
- 💾 Payment reporting

## 🛠️ Tech Stack

### Frontend
- React 18
- Bootstrap 5
- React Router
- Socket.IO (real-time)
- Firebase Hosting

### Backend
- Node.js 18
- Express
- PostgreSQL (Cloud SQL)
- Cloud Run
- JWT Authentication
- Socket.IO

### Infrastructure
- Google Cloud Platform
- Cloud SQL (PostgreSQL)
- Cloud Run (Backend)
- Firebase Hosting (Frontend)
- Secret Manager
- Cloud Build

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase`)
- PostgreSQL client (`psql`)

### Local Development

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

### Deployment

See [docs/deployment/deployment-guide.md](docs/deployment/deployment-guide.md) for complete deployment instructions.

**Quick Deploy:**

```bash
# Frontend
cd frontend
npm run build
firebase deploy --only hosting

# Backend
cd backend
gcloud run deploy backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

## 📝 Recent Updates (2025-10-09)

- ✅ **Editable Legal Documents**: Privacy Policy and Terms & Conditions now editable through admin panel
- ✅ **POPIA Compliance**: Full compliance with South African data protection laws
- ✅ **Data Retention**: Automated cleanup of old logs and data
- ✅ **Mobile Optimization**: Enhanced mobile responsiveness across all pages
- ✅ **Notification System**: User-customizable notification preferences
- ✅ **Auto Approval**: Intelligent user registration approval system
- ✅ **Performance**: Lazy loading and code splitting implemented

## 🆘 Getting Help

1. **Deployment Issues**: See [docs/deployment/troubleshooting.md](docs/deployment/troubleshooting.md)
2. **Development Guides**: See [docs/development/](docs/development/)
3. **Feature Documentation**: See [docs/features/](docs/features/)
4. **POPIA Compliance**: See [docs/compliance/](docs/compliance/)

## 📧 Support

Contact: steyncd@gmail.com

---

**Last Updated:** 2025-10-09
