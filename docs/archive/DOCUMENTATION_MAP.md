# Documentation Map - Quick Reference

Visual guide to find any documentation quickly.

## 📂 Directory Structure

```
hiking-portal/
├── README.md                      # Project overview
├── SESSION_STATUS.md              # Current status and recent changes
├── docs/                          # All documentation
│   ├── README.md                  # Documentation index
│   ├── DOCUMENTATION_MAP.md       # This file
│   │
│   ├── deployment/                # Everything about deploying
│   │   ├── README.md              # Deployment overview
│   │   ├── deployment-guide.md    # Complete step-by-step guide
│   │   ├── troubleshooting.md     # Fix deployment issues
│   │   └── deployment-history.md  # Past deployments
│   │
│   ├── development/               # For developers
│   │   ├── README.md              # Development overview
│   │   ├── backend-architecture.md    # Backend structure
│   │   ├── frontend-architecture.md   # Frontend structure
│   │   ├── refactoring-guide.md       # Code refactoring
│   │   ├── email-configuration.md     # Email setup
│   │   ├── quick-wins.md              # Quick improvements
│   │   └── profiles-analytics-plan.md # Feature planning
│   │
│   ├── features/                  # Feature documentation
│   │   ├── README.md              # Features overview
│   │   ├── attendance-tracking.md     # Attendance system
│   │   ├── implemented-features.md    # All features list
│   │   ├── future-features.md         # Roadmap
│   │   └── pwa-analysis.md            # PWA analysis
│   │
│   └── archive/                   # Old documentation
│       └── *.md                   # Historical files
│
├── backend/                       # Backend code
│   └── docs/                      # Backend-specific docs
│       ├── ATTENDANCE_FLOW.md
│       ├── PAYMENT_TRACKING_DESIGN.md
│       └── DEPLOYMENT_INSTRUCTIONS.md
│
└── frontend/                      # Frontend code
```

## 🔍 Find What You Need

### "How do I deploy?"
→ [docs/deployment/deployment-guide.md](deployment/deployment-guide.md)

### "Deployment is failing!"
→ [docs/deployment/troubleshooting.md](deployment/troubleshooting.md)

### "How does the backend work?"
→ [docs/development/backend-architecture.md](development/backend-architecture.md)

### "How does the frontend work?"
→ [docs/development/frontend-architecture.md](development/frontend-architecture.md)

### "What features exist?"
→ [docs/features/implemented-features.md](features/implemented-features.md)

### "How does attendance tracking work?"
→ [docs/features/attendance-tracking.md](features/attendance-tracking.md)
→ [backend/docs/ATTENDANCE_FLOW.md](../backend/docs/ATTENDANCE_FLOW.md)

### "How does payment tracking work?"
→ [backend/docs/PAYMENT_TRACKING_DESIGN.md](../backend/docs/PAYMENT_TRACKING_DESIGN.md)

### "What's planned for the future?"
→ [docs/features/future-features.md](features/future-features.md)

### "What changed recently?"
→ [SESSION_STATUS.md](../SESSION_STATUS.md)

### "How do I set up email?"
→ [docs/development/email-configuration.md](development/email-configuration.md)

## 📝 Document Naming Convention

| Type | Location | Naming Pattern |
|------|----------|----------------|
| **Guides** | deployment/ | `*-guide.md` |
| **Reference** | development/ | `*-architecture.md` |
| **Features** | features/ | `*-tracking.md`, `*-features.md` |
| **Problems** | deployment/ | `troubleshooting.md` |
| **History** | archive/ | `*-old.md` |
| **Index** | Any directory | `README.md` |

## 🗺️ Navigation Tips

1. **Start at root README.md** for project overview
2. **Check SESSION_STATUS.md** for what's happening now
3. **Go to docs/README.md** for documentation index
4. **Browse section READMEs** for detailed navigation
5. **Use this file** for quick lookups

## 📋 Common Tasks

### First Time Setup
1. Read [README.md](../README.md)
2. Follow [docs/deployment/deployment-guide.md](deployment/deployment-guide.md)
3. Check [backend/docs/DEPLOYMENT_INSTRUCTIONS.md](../backend/docs/DEPLOYMENT_INSTRUCTIONS.md)

### Deploy Changes
1. Check [SESSION_STATUS.md](../SESSION_STATUS.md) for current state
2. Follow [docs/deployment/deployment-guide.md](deployment/deployment-guide.md)
3. If issues: [docs/deployment/troubleshooting.md](deployment/troubleshooting.md)

### Understand Features
1. Read [docs/features/implemented-features.md](features/implemented-features.md)
2. Check specific feature docs in [docs/features/](features/)
3. See backend implementation in [backend/docs/](../backend/docs/)

### Develop New Features
1. Read [docs/development/README.md](development/README.md)
2. Check architecture docs
3. Review similar features in [docs/features/](features/)

---

**Updated:** 2025-10-08
