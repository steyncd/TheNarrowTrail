# Hiking Portal Documentation

Complete documentation for the Hiking Portal project.

## 📋 Quick Links

- **[Current Status](SESSION_STATUS.md)** - Current session context and recent changes
- **[Deployment Guide](deployment/README.md)** - How to deploy frontend and backend
- **[Development Guide](development/README.md)** - Setup and development workflows
- **[Features](features/README.md)** - Implemented features and documentation

## 📂 Documentation Structure

### Deployment (`deployment/`)
- **deployment-guide.md** - Complete deployment instructions
- **troubleshooting.md** - Common deployment issues and solutions (Windows-specific)
- **deployment-history.md** - Past deployment records and summaries

### Development (`development/`)
- **backend-architecture.md** - Backend structure and additions
- **frontend-architecture.md** - Frontend structure and additions
- **refactoring-guide.md** - Code refactoring documentation
- **email-configuration.md** - Email service setup and troubleshooting

### Features (`features/`)
- **attendance-tracking.md** - Interest and attendance flow documentation
- **payment-tracking.md** - Payment tracking system design
- **implemented-features.md** - Complete list of implemented features
- **future-features.md** - Planned features and enhancements
- **pwa-analysis.md** - Progressive Web App analysis

### Archive (`archive/`)
- Historical documentation and old summaries

## 🚀 Quick Start

1. **First Time Setup**: See [Deployment Guide](deployment/README.md)
2. **Current Session**: See [SESSION_STATUS.md](SESSION_STATUS.md)
3. **Deploy Changes**: See [deployment/deployment-guide.md](deployment/deployment-guide.md)
4. **Troubleshooting**: See [deployment/troubleshooting.md](deployment/troubleshooting.md)

## 📦 Project Structure

```
hiking-portal/
├── docs/                    # All documentation (this folder)
│   ├── deployment/          # Deployment guides
│   ├── development/         # Development docs
│   ├── features/            # Feature documentation
│   └── archive/             # Historical docs
├── frontend/                # React application
├── backend/                 # Node.js API
│   └── docs/                # Backend-specific docs
└── SESSION_STATUS.md        # Current session status
```

## 🔄 Recent Changes (2025-10-08)

- ✅ Consolidated attendance tracking to single `hike_interest` table
- ✅ Added payment tracking system
- ✅ Frontend alignment with new attendance flow
- ✅ Resolved Windows deployment issues
- ✅ All systems deployed and operational

## 🆘 Getting Help

1. Check [deployment/troubleshooting.md](deployment/troubleshooting.md) for common issues
2. Review [SESSION_STATUS.md](SESSION_STATUS.md) for current context
3. See backend-specific docs in `backend/docs/`

---

**Last Updated:** 2025-10-08
