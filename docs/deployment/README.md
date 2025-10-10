# Deployment Guide

Complete guide for deploying the Hiking Portal application.

## 📖 Documentation in this Section

- **[deployment-guide.md](deployment-guide.md)** - Complete step-by-step deployment instructions
- **[troubleshooting.md](troubleshooting.md)** - Common deployment issues and solutions
- **[deployment-history.md](deployment-history.md)** - Past deployment summaries

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase`)
- PostgreSQL database (Cloud SQL)

### Frontend Deployment
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend Deployment
```bash
cd backend

# CRITICAL: Pre-deployment check
find . -name "nul" -exec rm -f {} +

# Deploy
gcloud run deploy backend \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated
```

### Database Migrations
```bash
cd backend
psql $DATABASE_URL -f migrations/XXX_migration_name.sql
```

## ⚠️ Important Notes

1. **Always check for `nul` files before deploying backend** (Windows issue)
2. **Deploy backend before frontend** to avoid API mismatches
3. **Run migrations in order** (check DEPLOYMENT_INSTRUCTIONS.md in backend/)

## 🔗 Quick Links

- Frontend URL: https://helloliam.web.app
- Backend API: https://backend-4kzqyywlqq-ew.a.run.app
- Cloud Console: https://console.cloud.google.com/
- Firebase Console: https://console.firebase.google.com/

---

For detailed instructions, see [deployment-guide.md](deployment-guide.md).
For troubleshooting, see [troubleshooting.md](troubleshooting.md).
