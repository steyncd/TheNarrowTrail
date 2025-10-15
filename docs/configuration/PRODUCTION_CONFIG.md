# 🚀 Production Configuration Guide

This document contains all production environment details for The Narrow Trail Hiking Portal.

## 📋 Table of Contents
- [Environment Files](#environment-files)
- [Domain Configuration](#domain-configuration)
- [Backend API](#backend-api)
- [Frontend Hosting](#frontend-hosting)
- [Database](#database)
- [Email Service](#email-service)
- [SMS/WhatsApp](#smswhatsapp)
- [External APIs](#external-apis)
- [Deployment Commands](#deployment-commands)
- [Secret Management](#secret-management)
- [Security Checklist](#security-checklist)

---

## 📁 Environment Files

Production environment variables are stored in:

| File | Purpose | Status |
|------|---------|--------|
| [.env.production](.env.production) | Root production config | ✅ Created |
| [backend/.env.production](backend/.env.production) | Backend-specific config | ✅ Created |
| [frontend/.env.production](frontend/.env.production) | Frontend build config | ✅ Created |

**⚠️ CRITICAL:** These files contain actual credentials and are in `.gitignore`. Never commit them!

---

## 🌐 Domain Configuration

### Primary Domain
- **Production URL:** https://www.thenarrowtrail.co.za
- **DNS Provider:** [Your DNS provider]
- **SSL/TLS:** Auto-managed by Firebase Hosting

### Firebase Hosting URLs
- **Primary:** https://helloliam.web.app
- **Secondary:** https://helloliam.firebaseapp.com
- **Project ID:** helloliam

### Email Domain
- **Sender Email:** noreply@thenarrowtrail.co.za
- **Admin Email:** noreply@thenarrowtrail.co.za

---

## 🔧 Backend API

### Google Cloud Run Service

**Service Name:** `backend`
**Region:** `europe-west1`
**URL:** https://backend-554106646136.europe-west1.run.app

**Service Configuration:**
```yaml
Service: backend
Region: europe-west1
Platform: managed
Allow Unauthenticated: Yes
CPU: 1
Memory: 512Mi
Timeout: 300s
Concurrency: 80
Min Instances: 0
Max Instances: 100
```

**Last Deployed:** 2025-10-10 by steyncd@gmail.com

### Environment Variables

Set via Google Secret Manager:
- `DATABASE_URL` → secret: `postgresql-connection-string`
- `JWT_SECRET` → secret: `jwt-secret`
- `DB_PASSWORD` → secret: `db-password`
- `SENDGRID_API_KEY` → secret: `sendgrid-key`
- `SENDGRID_FROM_EMAIL` → secret: `sendgrid-from-email`
- `OPENWEATHER_API_KEY` → secret: `openweather-api-key`
- `TWILIO_ACCOUNT_SID` → secret: `twilio-sid`
- `TWILIO_AUTH_TOKEN` → secret: `twilio-token`
- `TWILIO_WHATSAPP_NUMBER` → secret: `twilio-whatsapp-number`

Direct environment variables:
- `NODE_ENV=production`
- `DB_NAME=hiking_portal`
- `DB_USER=postgres`
- `DB_HOST=/cloudsql/helloliam:us-central1:hiking-db`
- `FRONTEND_URL=https://helloliam.web.app`

---

## 🎨 Frontend Hosting

### Firebase Hosting

**Project:** helloliam
**Primary URL:** https://helloliam.web.app
**Custom Domain:** https://www.thenarrowtrail.co.za

**Build Configuration:**
```json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Environment Variables (Build Time):**
- `REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app`
- `REACT_APP_ENV=production`

---

## 🗄️ Database

### Google Cloud SQL Instance

**Instance Name:** `hiking-db`
**Type:** PostgreSQL 14
**Region:** us-central1-c
**Tier:** db-f1-micro

**Connection Details:**
- **Connection Name:** `helloliam:us-central1:hiking-db`
- **Public IP:** 35.202.149.98
- **Database:** hiking_portal
- **User:** postgres
- **Password:** Stored in Secret Manager (`db-password`)

**Connection Methods:**

1. **Cloud Run (Unix Socket):**
   ```
   DB_HOST=/cloudsql/helloliam:us-central1:hiking-db
   ```

2. **External (TCP):**
   ```
   postgresql://postgres:[PASSWORD]@35.202.149.98:5432/hiking_portal
   ```

3. **Cloud SQL Proxy:**
   ```bash
   cloud_sql_proxy -instances=helloliam:us-central1:hiking-db=tcp:5432
   ```

**Backup Schedule:**
- Automated daily backups enabled
- Retention: 7 days
- Point-in-time recovery available

---

## 📧 Email Service

### SendGrid Configuration

**API Key:** Stored in Secret Manager (`sendgrid-key`)
**Sender Email:** noreply@thenarrowtrail.co.za
**Sender Domain:** thenarrowtrail.co.za

**Domain Authentication:**
- SPF Record: ✅ Required
- DKIM: ✅ Required
- Domain Verification: ✅ Required

**Email Types:**
- Welcome emails
- Hike notifications
- Payment confirmations
- Password resets
- Admin notifications

**SendGrid Dashboard:** https://app.sendgrid.com/

---

## 📱 SMS/WhatsApp

### Twilio Configuration

**Account SID:** Stored in Secret Manager (`twilio-sid`)
**Auth Token:** Stored in Secret Manager (`twilio-token`)
**Phone Number:** +12183181678
**WhatsApp Number:** +12183181678

**Features:**
- SMS notifications
- WhatsApp messages
- Two-way messaging support

**Twilio Console:** https://console.twilio.com/

---

## 🔌 External APIs

### OpenWeather API
- **Purpose:** Weather data for hikes
- **API Key:** Stored in Secret Manager
- **Plan:** Free tier
- **Dashboard:** https://openweathermap.org/api

### Google Maps API (Optional)
- **Purpose:** Location services, route planning
- **Status:** Not currently configured
- **Note:** Add API key when implementing map features

### Stripe (Optional)
- **Purpose:** Payment processing
- **Status:** Not currently in production
- **Note:** Using test keys for development

---

## 🚀 Deployment Commands

### Backend Deployment

**Option 1: Automatic (from source)**
```bash
cd backend
gcloud run deploy backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

**Option 2: Using deployment script**
```bash
cd scripts
./deploy-backend.sh
```

### Frontend Deployment

**Build and Deploy:**
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

**Deploy to custom domain:**
```bash
firebase deploy --only hosting:production
```

### Database Migrations

**Run migrations via Cloud Run:**
```bash
gcloud run jobs execute migrate-database \
  --region europe-west1
```

**Manual SQL execution:**
```bash
gcloud sql connect hiking-db --user=postgres --database=hiking_portal
```

---

## 🔐 Secret Management

### Google Secret Manager

All sensitive credentials are stored in Google Secret Manager:

| Secret Name | Purpose | Last Updated |
|-------------|---------|--------------|
| `postgresql-connection-string` | Full database URL | 2025-10-08 |
| `jwt-secret` | JWT signing key | 2025-10-06 |
| `db-password` | Database password | 2025-10-06 |
| `sendgrid-key` | SendGrid API key | 2025-10-06 |
| `sendgrid-from-email` | From email address | 2025-10-06 |
| `openweather-api-key` | Weather API key | 2025-10-08 |
| `twilio-sid` | Twilio Account SID | 2025-10-06 |
| `twilio-token` | Twilio Auth Token | 2025-10-06 |
| `twilio-whatsapp-number` | WhatsApp number | 2025-10-06 |

### Accessing Secrets

**List all secrets:**
```bash
gcloud secrets list
```

**View secret value:**
```bash
gcloud secrets versions access latest --secret="SECRET_NAME"
```

**Update secret:**
```bash
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-
```

### Secret Rotation Schedule

**Recommended rotation frequency:**
- JWT Secret: Every 90 days
- Database Password: Every 90 days
- API Keys: Annually or on suspected compromise
- Twilio Tokens: Every 180 days

---

## ✅ Security Checklist

### Pre-Deployment

- [ ] All secrets stored in Secret Manager
- [ ] `.env.production` files in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] CORS configured for production domains only
- [ ] Database uses strong password
- [ ] JWT secret is 64+ characters

### Post-Deployment

- [ ] HTTPS enforced on all domains
- [ ] SendGrid domain authentication complete
- [ ] Cloud SQL automated backups enabled
- [ ] API keys restricted to production domains
- [ ] Monitoring and logging enabled
- [ ] Error tracking configured (Sentry)
- [ ] Rate limiting enabled on API
- [ ] Input validation on all endpoints

### Ongoing Maintenance

- [ ] Monitor API usage and costs
- [ ] Review access logs weekly
- [ ] Rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Test backup restoration quarterly
- [ ] Review and update CORS policies
- [ ] Audit user permissions

---

## 🆘 Emergency Procedures

### Backend Service Down

1. Check Cloud Run logs:
   ```bash
   gcloud run services logs read backend --region=europe-west1
   ```

2. Check recent deployments:
   ```bash
   gcloud run revisions list --service=backend --region=europe-west1
   ```

3. Rollback if needed:
   ```bash
   gcloud run services update-traffic backend \
     --to-revisions=REVISION_NAME=100 \
     --region=europe-west1
   ```

### Database Issues

1. Check Cloud SQL status:
   ```bash
   gcloud sql instances describe hiking-db
   ```

2. Check database logs:
   ```bash
   gcloud sql operations list --instance=hiking-db
   ```

3. Restore from backup:
   ```bash
   gcloud sql backups restore BACKUP_ID --backup-instance=hiking-db
   ```

### Domain/DNS Issues

1. Verify DNS records:
   ```bash
   nslookup www.thenarrowtrail.co.za
   ```

2. Check Firebase Hosting status:
   ```bash
   firebase hosting:channel:list
   ```

3. Redeploy if needed:
   ```bash
   firebase deploy --only hosting
   ```

---

## 📞 Support Contacts

- **Domain Registrar:** [Your registrar]
- **DNS Provider:** [Your DNS provider]
- **Firebase Support:** https://firebase.google.com/support
- **Google Cloud Support:** https://cloud.google.com/support
- **SendGrid Support:** https://support.sendgrid.com/
- **Twilio Support:** https://support.twilio.com/

---

## 📝 Change Log

| Date | Change | By |
|------|--------|-----|
| 2025-10-13 | Created production config documentation | Claude |
| 2025-10-13 | Migrated production database to local | Claude |
| 2025-10-13 | Created .env.production files | Claude |
| 2025-10-10 | Last backend deployment | steyncd@gmail.com |
| 2025-10-08 | Configured Secret Manager | steyncd@gmail.com |

---

**Last Updated:** 2025-10-13
**Maintained By:** steyncd@gmail.com
**Repository:** [GitHub URL]

---

## 🔒 Security Notice

This document contains references to production infrastructure but not actual credentials.
All sensitive values are stored in:
1. Google Secret Manager (production)
2. `.env.production` files (local development - gitignored)

**Never commit production credentials to version control!**
