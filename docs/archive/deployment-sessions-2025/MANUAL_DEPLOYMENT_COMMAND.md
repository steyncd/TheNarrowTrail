# 🚀 Manual Deployment Instructions

## The deployment command keeps getting interrupted in the automation.

### Please run this command manually in your PowerShell terminal:

```powershell
cd c:\hiking-portal\backend

gcloud run deploy backend `
  --source=. `
  --platform=managed `
  --region=europe-west1 `
  --project=helloliam `
  --allow-unauthenticated `
  --set-env-vars=NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=35.202.149.98,DB_PORT=5432,FRONTEND_URL=https://helloliam.web.app `
  --set-secrets=DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest `
  --memory=512Mi `
  --cpu=1 `
  --timeout=300 `
  --max-instances=10 `
  --min-instances=0 `
  --service-account=554106646136-compute@developer.gserviceaccount.com
```

### What this command does:
1. ✅ Builds your container using Cloud Build
2. ✅ Configures environment variables for production database
3. ✅ Links all Secret Manager secrets
4. ✅ Deploys to europe-west1 region
5. ✅ Sets resource limits (512Mi RAM, 1 CPU)

### Expected output:
- Building Container... (2-3 minutes)
- Creating Revision...
- Setting IAM Policy...
- ✅ Service URL: https://backend-554106646136.europe-west1.run.app

### After deployment, test with:

```powershell
# Test health endpoint
curl https://backend-554106646136.europe-west1.run.app/health

# Test login (use your credentials)
curl -X POST https://backend-554106646136.europe-west1.run.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"steyncd@gmail.com","password":"your_password"}'
```

### If you get any errors:
1. Check the error message
2. Review: GOOGLE_CLOUD_MIGRATION_GUIDE.md
3. Verify migrations ran successfully on production database
