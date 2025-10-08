# Hiking Portal

Full-stack hiking club management application with React frontend and Node.js backend.

## 🚀 Quick Links

- **📱 Live Application**: https://helloliam.web.app
- **🔧 API Endpoint**: https://hiking-portal-api-554106646136.us-central1.run.app
- **📚 Documentation**: [docs/README.md](docs/README.md)
- **📊 Current Status**: [SESSION_STATUS.md](SESSION_STATUS.md)

## 📖 Documentation

All documentation is organized in the [`docs/`](docs/) directory:

- **[Deployment](docs/deployment/)** - How to deploy frontend and backend
- **[Development](docs/development/)** - Architecture and development guides  
- **[Features](docs/features/)** - Feature documentation and roadmap

## 🏗️ Project Structure

```
hiking-portal/
├── docs/                    # All documentation
│   ├── deployment/          # Deployment guides
│   ├── development/         # Development docs
│   ├── features/            # Feature documentation
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
├── SESSION_STATUS.md        # Current session status
└── README.md                # This file
```

## ✨ Key Features

- 👥 User authentication and profiles
- 🥾 Hike creation and management
- 📝 Interest expression and attendance confirmation
- 💰 Payment tracking for hike costs
- 💬 Comments and carpool coordination
- 📦 Packing list management
- 🌤️ Weather integration
- 📊 Analytics and reporting

## 🛠️ Tech Stack

### Frontend
- React 18
- Bootstrap 5
- React Router
- Firebase Hosting

### Backend
- Node.js 18
- Express
- PostgreSQL (Cloud SQL)
- Cloud Run
- JWT Authentication

### Infrastructure
- Google Cloud Platform
- Cloud SQL (PostgreSQL)
- Cloud Run (Backend)
- Firebase Hosting (Frontend)
- Secret Manager

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase`)

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

# Backend (after removing nul files!)
cd backend
find . -name "nul" -exec rm -f {} +
gcloud run deploy hiking-portal-api --source . --region us-central1 [...]
```

## 📝 Recent Updates (2025-10-08)

- ✅ Consolidated attendance tracking to single table
- ✅ Added payment tracking system
- ✅ Frontend alignment with new attendance flow
- ✅ Resolved Windows deployment issues
- ✅ Organized documentation structure

See [SESSION_STATUS.md](SESSION_STATUS.md) for detailed recent changes.

## 🆘 Getting Help

1. **Deployment Issues**: See [docs/deployment/troubleshooting.md](docs/deployment/troubleshooting.md)
2. **Development Guides**: See [docs/development/](docs/development/)
3. **Feature Documentation**: See [docs/features/](docs/features/)
4. **Backend API**: See `backend/docs/`

## 📧 Support

For questions or issues, check the documentation first. Common issues and solutions are documented in [docs/deployment/troubleshooting.md](docs/deployment/troubleshooting.md).

---

**Last Updated:** 2025-10-08
