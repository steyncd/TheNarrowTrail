# Deploy backend to Cloud Run with Cloud SQL connection
# UPDATED: Includes new weather API secrets (Visual Crossing & WeatherAPI.com)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying backend to Cloud Run" -ForegroundColor Green
Write-Host "Weather API Integration Update" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Region: europe-west1" -ForegroundColor White
Write-Host "  Project: helloliam" -ForegroundColor White
Write-Host "  Memory: 512Mi" -ForegroundColor White
Write-Host "  CPU: 1" -ForegroundColor White
Write-Host "  Port: 8080" -ForegroundColor White
Write-Host ""

Write-Host "New Secrets:" -ForegroundColor Yellow
Write-Host "  ✓ VISUAL_CROSSING_API_KEY" -ForegroundColor Green
Write-Host "  ✓ WEATHERAPI_KEY" -ForegroundColor Green
Write-Host ""

Write-Host "Starting deployment..." -ForegroundColor Green
Write-Host ""

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
  --update-secrets=TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest `
  --update-secrets=VISUAL_CROSSING_API_KEY=visualcrossing-api-key:latest `
  --update-secrets=WEATHERAPI_KEY=weatherapi-key:latest

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment command completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the output above for any errors." -ForegroundColor Yellow
Write-Host ""
Write-Host "Service URL: https://backend-554106646136.europe-west1.run.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify deployment status above" -ForegroundColor White
Write-Host "  2. Test the weather API endpoint" -ForegroundColor White
Write-Host "  3. Deploy frontend" -ForegroundColor White
Write-Host ""
