@echo off
REM Manual deployment command for Google Cloud Run
REM Use this if the PowerShell scripts have issues

echo ========================================
echo Deploying Backend to Google Cloud Run
echo ========================================
echo.

cd /d "%~dp0"
cd backend

echo Current directory: %CD%
echo.

echo Starting deployment...
echo This will take 2-5 minutes.
echo.

gcloud run deploy backend ^
  --source=. ^
  --platform=managed ^
  --region=europe-west1 ^
  --project=helloliam ^
  --allow-unauthenticated ^
  --set-env-vars=NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=35.202.149.98,DB_PORT=5432,FRONTEND_URL=https://helloliam.web.app ^
  --set-secrets=DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest ^
  --memory=512Mi ^
  --cpu=1 ^
  --timeout=300 ^
  --max-instances=10 ^
  --min-instances=0 ^
  --service-account=554106646136-compute@developer.gserviceaccount.com

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Deployment Complete!
    echo ========================================
    echo.
    echo Service URL: https://backend-554106646136.europe-west1.run.app
    echo.
) else (
    echo.
    echo ========================================
    echo   Deployment Failed!
    echo ========================================
    echo.
    exit /b 1
)

cd ..
