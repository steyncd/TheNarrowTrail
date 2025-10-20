# Deploy backend to Cloud Run with Cloud SQL connection
Write-Host "Deploying backend to Cloud Run with Cloud SQL..." -ForegroundColor Green

gcloud run deploy backend `
  --image=europe-west1-docker.pkg.dev/helloliam/cloud-run-source-deploy/backend:latest `
  --platform=managed `
  --region=europe-west1 `
  --project=helloliam `
  --allow-unauthenticated `
  --port=8080 `
  --memory=512Mi `
  --cpu=1 `
  --timeout=300 `
  --max-instances=10 `
  --min-instances=0 `
  --service-account=554106646136-compute@developer.gserviceaccount.com `
  --add-cloudsql-instances=helloliam:us-central1:hiking-db `
  --update-env-vars=NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=/cloudsql/helloliam:us-central1:hiking-db,DB_PORT=5432,FRONTEND_URL=https://www.thenarrowtrail.co.za `
  --update-secrets=DB_PASSWORD=db-password:latest `
  --update-secrets=JWT_SECRET=jwt-secret:latest `
  --update-secrets=SENDGRID_API_KEY=sendgrid-key:latest `
  --update-secrets=SENDGRID_FROM_EMAIL=sendgrid-from-email:latest `
  --update-secrets=OPENWEATHER_API_KEY=openweather-api-key:latest `
  --update-secrets=TWILIO_ACCOUNT_SID=twilio-sid:latest `
  --update-secrets=TWILIO_AUTH_TOKEN=twilio-token:latest `
  --update-secrets=TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest

Write-Host "`nDeployment command completed!" -ForegroundColor Green
