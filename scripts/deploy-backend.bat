@echo off
REM Backend Deployment Script for The Narrow Trail Hiking Portal
REM Deploy backend to Google Cloud Run with Secret Manager configuration

setlocal enabledelayedexpansion

echo ========================================
echo Deploying Backend to Google Cloud Run
echo ========================================
echo.

REM Configuration
set PROJECT_ID=helloliam
set SERVICE_NAME=backend
set REGION=europe-west1
set PROJECT_NUMBER=554106646136
set DB_HOST=35.202.149.98

REM Check prerequisites
echo Checking prerequisites...

where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: gcloud CLI not found. Please install Google Cloud SDK.
    echo Download from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    echo Download from: https://nodejs.org/
    exit /b 1
)

echo Prerequisites OK!
echo.

REM Get script directory and navigate to project root
cd /d "%~dp0"
cd ..
echo Project root: %CD%
echo.

REM Navigate to backend directory
cd backend
echo Backend directory: %CD%
echo.

REM Verify we're in the right place
if not exist "package.json" (
    echo ERROR: package.json not found. Not in backend directory!
    cd ..
    exit /b 1
)

if not exist "server.js" (
    echo ERROR: server.js not found. Not in backend directory!
    cd ..
    exit /b 1
)

REM Clean up Windows artifacts
echo Cleaning up Windows artifacts...
for /r %%i in (nul) do @del "%%i" 2>nul
echo Cleanup complete!
echo.

REM Verify Secret Manager secrets
echo Verifying Secret Manager configuration...
set SECRETS_OK=1

gcloud secrets describe db-password --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0
gcloud secrets describe jwt-secret --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0
gcloud secrets describe sendgrid-key --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0
gcloud secrets describe sendgrid-from-email --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0
gcloud secrets describe openweather-api-key --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0
gcloud secrets describe twilio-sid --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0
gcloud secrets describe twilio-token --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0
gcloud secrets describe twilio-whatsapp-number --project=%PROJECT_ID% >nul 2>nul || set SECRETS_OK=0

if %SECRETS_OK% EQU 0 (
    echo ERROR: One or more required secrets not found in Secret Manager
    echo Please create all required secrets before deploying
    echo.
    echo Required secrets:
    echo   - db-password
    echo   - jwt-secret
    echo   - sendgrid-key
    echo   - sendgrid-from-email
    echo   - openweather-api-key
    echo   - twilio-sid
    echo   - twilio-token
    echo   - twilio-whatsapp-number
    cd ..
    exit /b 1
)

echo All required secrets found!
echo.

REM Confirm deployment
REM echo WARNING: You are about to deploy the backend to Cloud Run.
REM echo Service: %SERVICE_NAME%
REM echo Region: %REGION%
REM echo Database: %DB_HOST%
REM echo.
REM echo IMPORTANT: If deploying permission system updates (migrations 017/018),
REM echo make sure you have run the migrations on the production database FIRST!
REM echo See: GOOGLE_CLOUD_MIGRATION_GUIDE.md
REM echo.
REM set /p CONFIRM="Continue with deployment? (y/N): "
REM
REM if /i not "%CONFIRM%"=="y" (
REM     echo Deployment cancelled.
REM     cd ..
REM     exit /b 0
REM )

echo.
echo Starting deployment...
echo.

REM Deploy using source-based deployment with Secret Manager integration
echo Building and deploying backend to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --platform managed ^
  --region %REGION% ^
  --project %PROJECT_ID% ^
  --allow-unauthenticated ^
  --set-env-vars NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=%DB_HOST%,DB_PORT=5432,FRONTEND_URL=https://www.thenarrowtrail.co.za ^
  --set-secrets DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest ^
  --memory 512Mi ^
  --cpu 1 ^
  --timeout 300 ^
  --max-instances 10 ^
  --min-instances 0 ^
  --service-account %PROJECT_NUMBER%-compute@developer.gserviceaccount.com

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   Backend Deployment Complete!
    echo ================================================
    echo.
    echo Service URL: https://backend-554106646136.europe-west1.run.app
    echo.
    echo Environment variables configured:
    echo   Database:
    echo     - DB_HOST: %DB_HOST%
    echo     - DB_PORT: 5432
    echo     - DB_NAME: hiking_portal
    echo     - DB_USER: postgres
    echo     - DB_PASSWORD: ^(from Secret Manager^)
    echo   Authentication:
    echo     - JWT_SECRET: ^(from Secret Manager^)
    echo   Email ^(SendGrid^):
    echo     - SENDGRID_API_KEY: ^(from Secret Manager^)
    echo     - SENDGRID_FROM_EMAIL: ^(from Secret Manager^)
    echo   SMS/WhatsApp ^(Twilio^):
    echo     - TWILIO_ACCOUNT_SID: ^(from Secret Manager^)
    echo     - TWILIO_AUTH_TOKEN: ^(from Secret Manager^)
    echo     - TWILIO_WHATSAPP_NUMBER: ^(from Secret Manager^)
    echo   Weather:
    echo     - OPENWEATHER_API_KEY: ^(from Secret Manager^)
    echo   Frontend:
    echo     - FRONTEND_URL: https://www.thenarrowtrail.co.za
    echo.
    echo Next steps:
    echo   1. Check Cloud Run logs for any errors
    echo   2. Test API endpoints
    echo   3. Verify database connectivity
    echo.
) else (
    echo.
    echo ================================================
    echo   Deployment Failed!
    echo ================================================
    echo.
    echo Please check the error messages above.
    cd ..
    exit /b 1
)

cd ..
