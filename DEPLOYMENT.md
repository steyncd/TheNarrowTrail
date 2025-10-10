# Deployment Guide - The Narrow Trail

Complete deployment guide for The Narrow Trail hiking portal.

## 🚀 Quick Deploy

### Windows
```batch
deploy-all.bat
```

### Linux/Mac
```bash
./deploy-backend.sh
cd frontend && npm run build && firebase deploy --only hosting
```

## 📋 Prerequisites

1. **Google Cloud SDK** (`gcloud`)
2. **Firebase CLI** (`firebase-tools`)
3. **Node.js 18+**
4. **Git Bash** (for Windows users running .sh scripts)

## 🔐 Required Secrets in Secret Manager

The deployment scripts automatically configure all environment variables from Google Cloud Secret Manager. Ensure these secrets exist:

| Secret Name | Description | Environment Variable |
|------------|-------------|---------------------|
| `db-password` | PostgreSQL password | `DB_PASSWORD` |
| `jwt-secret` | JWT signing key | `JWT_SECRET` |
| `sendgrid-key` | SendGrid API key | `SENDGRID_API_KEY` |
| `sendgrid-from-email` | SendGrid sender email | `SENDGRID_FROM_EMAIL` |
| `openweather-api-key` | OpenWeather API key | `OPENWEATHER_API_KEY` |
| `twilio-sid` | Twilio Account SID | `TWILIO_ACCOUNT_SID` |
| `twilio-token` | Twilio Auth Token | `TWILIO_AUTH_TOKEN` |
| `twilio-whatsapp-number` | WhatsApp number | `TWILIO_WHATSAPP_NUMBER` |

### Create Secrets (if needed)

```bash
# Database password
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=- --project=helloliam

# JWT Secret
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- --project=helloliam

# SendGrid
echo -n "YOUR_SENDGRID_API_KEY" | gcloud secrets create sendgrid-key --data-file=- --project=helloliam
echo -n "your-email@example.com" | gcloud secrets create sendgrid-from-email --data-file=- --project=helloliam

# OpenWeather
echo -n "YOUR_OPENWEATHER_KEY" | gcloud secrets create openweather-api-key --data-file=- --project=helloliam

# Twilio
echo -n "YOUR_TWILIO_SID" | gcloud secrets create twilio-sid --data-file=- --project=helloliam
echo -n "YOUR_TWILIO_TOKEN" | gcloud secrets create twilio-token --data-file=- --project=helloliam
echo -n "+1234567890" | gcloud secrets create twilio-whatsapp-number --data-file=- --project=helloliam
```

## 📝 Environment Variables Set by Deployment

### Automatically Configured
These are set by the deployment scripts:

```bash
# Database Configuration
DB_HOST=34.31.176.242
DB_PORT=5432
DB_NAME=hiking_portal
DB_USER=postgres
DB_PASSWORD=<from Secret Manager>

# Application
NODE_ENV=production
FRONTEND_URL=https://helloliam.web.app

# Authentication
JWT_SECRET=<from Secret Manager>

# Email (SendGrid)
SENDGRID_API_KEY=<from Secret Manager>
SENDGRID_FROM_EMAIL=<from Secret Manager>

# SMS/WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=<from Secret Manager>
TWILIO_AUTH_TOKEN=<from Secret Manager>
TWILIO_WHATSAPP_NUMBER=<from Secret Manager>

# Weather
OPENWEATHER_API_KEY=<from Secret Manager>
```

## 🔧 Deployment Configuration

### Project Settings
```bash
PROJECT_ID=helloliam
PROJECT_NUMBER=554106646136
SERVICE_NAME=backend
REGION=europe-west1
```

### Resource Limits
- **Memory**: 512Mi
- **CPU**: 1
- **Timeout**: 300s
- **Max Instances**: 10
- **Min Instances**: 0 (scales to zero)

## 📦 Deployment Steps

### Backend Deployment

1. **Verify Prerequisites**
   ```bash
   gcloud --version
   firebase --version
   node --version
   ```

2. **Check Secrets**
   ```bash
   gcloud secrets list --project=helloliam
   ```

3. **Deploy Backend**
   ```bash
   # Using the deploy script (recommended)
   ./deploy-backend.sh

   # OR manually
   cd backend
   gcloud run deploy backend \
     --source . \
     --platform managed \
     --region europe-west1 \
     --project helloliam \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=34.31.176.242,DB_PORT=5432,FRONTEND_URL=https://helloliam.web.app \
     --set-secrets DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest \
     --memory 512Mi \
     --cpu 1 \
     --timeout 300 \
     --max-instances 10 \
     --min-instances 0
   ```

### Frontend Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting --project helloliam
   ```

### Full Stack Deployment (Windows)

```batch
deploy-all.bat
```

This script will:
1. Check prerequisites (gcloud, firebase, node)
2. Verify all secrets exist in Secret Manager
3. Clean up Windows artifacts
4. Deploy backend to Cloud Run with all environment variables
5. Build and deploy frontend to Firebase
6. Display service URLs and configuration summary

## 🌐 Service URLs

- **Backend API**: https://backend-554106646136.europe-west1.run.app
- **Frontend**: https://helloliam.web.app

## 🔍 Verify Deployment

### Check Backend Health
```bash
curl https://backend-554106646136.europe-west1.run.app/health
```

### Check Backend Configuration
```bash
gcloud run services describe backend \
  --region europe-west1 \
  --project helloliam \
  --format json | jq '.spec.template.spec.containers[0].env'
```

### View Logs
```bash
# Backend logs
gcloud run services logs read backend \
  --region europe-west1 \
  --project helloliam \
  --limit 50

# Or in Cloud Console
https://console.cloud.google.com/run/detail/europe-west1/backend/logs
```

## 🐛 Troubleshooting

### Common Issues

1. **Secret Not Found**
   ```bash
   # List all secrets
   gcloud secrets list --project=helloliam

   # Create missing secret
   echo -n "SECRET_VALUE" | gcloud secrets create SECRET_NAME --data-file=- --project=helloliam
   ```

2. **Database Connection Failed**
   ```bash
   # Check database is accessible
   gcloud sql instances describe hiking-db-instance --project=helloliam

   # Verify IP is whitelisted
   gcloud sql instances describe hiking-db-instance --format="get(settings.ipConfiguration.authorizedNetworks)"
   ```

3. **Build Failed**
   ```bash
   # Check Cloud Build logs
   gcloud builds list --project=helloliam --limit=5

   # View specific build
   gcloud builds log BUILD_ID --project=helloliam
   ```

4. **Windows 'nul' Files**
   - The deployment scripts automatically clean these up
   - Manual cleanup: `for /r %i in (nul) do @del "%i"`

## 📊 Monitoring

### View Service Status
```bash
gcloud run services describe backend \
  --region europe-west1 \
  --project helloliam
```

### Check Resource Usage
```bash
gcloud run services describe backend \
  --region europe-west1 \
  --project helloliam \
  --format="table(status.conditions)"
```

## 🔄 Rollback

If you need to rollback to a previous version:

```bash
# List revisions
gcloud run revisions list \
  --service backend \
  --region europe-west1 \
  --project helloliam

# Rollback to specific revision
gcloud run services update-traffic backend \
  --to-revisions REVISION_NAME=100 \
  --region europe-west1 \
  --project helloliam
```

## 📝 Notes

- All sensitive data is stored in Secret Manager
- Secrets are automatically mounted as environment variables
- Database connection uses TCP (not Unix socket) for external access
- Service scales to zero when idle (cost-effective)
- Frontend is static and cached by Firebase CDN
- CORS is configured for helloliam.web.app

## 🔗 Related Documentation

- [Backend Architecture](docs/development/backend-architecture.md)
- [Frontend Architecture](docs/development/frontend-architecture.md)
- [Deployment Troubleshooting](docs/deployment/troubleshooting.md)

---

**Last Updated:** 2025-10-09
