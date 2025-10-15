# 🚀 Production Quick Reference Card

Quick access to all production URLs, credentials locations, and commands.

## 🌐 Production URLs

| Service | URL | Status |
|---------|-----|--------|
| **Main Site** | https://www.thenarrowtrail.co.za | ✅ Live |
| **Frontend** | https://helloliam.web.app | ✅ Live |
| **Backend API** | https://backend-554106646136.europe-west1.run.app | ✅ Live |
| **Health Check** | https://backend-554106646136.europe-west1.run.app/health | ✅ Live |

## 📧 Email Configuration

```
FROM_EMAIL=noreply@thenarrowtrail.co.za
ADMIN_EMAIL=noreply@thenarrowtrail.co.za
SUPPORT_EMAIL=noreply@thenarrowtrail.co.za
```

## 🔐 Credentials Location

All production credentials are stored in:
1. **Google Secret Manager** (for Cloud Run)
2. **Local files** (gitignored):
   - [.env.production](.env.production)
   - [backend/.env.production](backend/.env.production)
   - [frontend/.env.production](frontend/.env.production)

## 📱 Key Services

### SendGrid (Email)
- **From:** noreply@thenarrowtrail.co.za
- **Dashboard:** https://app.sendgrid.com/

### Twilio (SMS/WhatsApp)
- **Phone:** +12183181678
- **Dashboard:** https://console.twilio.com/

### Google Cloud SQL
- **Instance:** hiking-db
- **Database:** hiking_portal
- **Region:** us-central1

## 🚀 Quick Deploy Commands

### Deploy Backend
```bash
cd backend
gcloud run deploy backend --source . --region europe-west1 --allow-unauthenticated
```

### Deploy Frontend
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### View Logs
```bash
# Backend logs
gcloud run services logs read backend --region=europe-west1 --limit=50

# Database logs
gcloud sql operations list --instance=hiking-db
```

### Access Production Database
```bash
# Via Cloud SQL Proxy
gcloud sql connect hiking-db --user=postgres --database=hiking_portal

# Or using psql directly
psql "postgresql://postgres:PASSWORD@35.202.149.98:5432/hiking_portal"
```

## 🔍 Health Checks

```bash
# Backend health
curl https://backend-554106646136.europe-west1.run.app/health

# Database connectivity
gcloud sql instances describe hiking-db --format="value(state)"

# Frontend
curl https://www.thenarrowtrail.co.za
```

## 🆘 Emergency Commands

### Rollback Backend
```bash
gcloud run revisions list --service=backend --region=europe-west1
gcloud run services update-traffic backend --to-revisions=REVISION=100 --region=europe-west1
```

### Restore Database
```bash
gcloud sql backups list --instance=hiking-db
gcloud sql backups restore BACKUP_ID --backup-instance=hiking-db
```

### View Secret
```bash
gcloud secrets versions access latest --secret="SECRET_NAME"
```

## 📊 Monitoring

### Google Cloud Console
- **Project:** helloliam
- **Console:** https://console.cloud.google.com/
- **Cloud Run:** https://console.cloud.google.com/run
- **Cloud SQL:** https://console.cloud.google.com/sql/instances
- **Secret Manager:** https://console.cloud.google.com/security/secret-manager

### Firebase Console
- **Project:** helloliam
- **Console:** https://console.firebase.google.com/
- **Hosting:** https://console.firebase.google.com/project/helloliam/hosting

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| [PRODUCTION_CONFIG.md](PRODUCTION_CONFIG.md) | Complete production documentation |
| [.env.production](.env.production) | Root environment variables |
| [backend/.env.production](backend/.env.production) | Backend environment variables |
| [frontend/.env.production](frontend/.env.production) | Frontend build variables |
| [.env.production.example](.env.production.example) | Template (safe to commit) |

## 📝 Important Notes

- All `.env.production` files are gitignored
- Use Secret Manager for Cloud Run deployments
- Rotate secrets every 90 days
- Test deployments in staging first
- Monitor costs and API usage
- Keep this document updated!

---

**Last Updated:** 2025-10-13
**For detailed documentation, see:** [PRODUCTION_CONFIG.md](PRODUCTION_CONFIG.md)
