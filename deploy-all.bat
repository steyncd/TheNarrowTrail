@echo off
REM Deploy both backend and frontend for The Narrow Trail with Secret Manager

echo ========================================
echo Deploying The Narrow Trail - Full Stack
echo ========================================
echo.

REM Configuration
set PROJECT_ID=helloliam
set SERVICE_NAME=backend
set REGION=europe-west1
set PROJECT_NUMBER=554106646136

REM Check prerequisites
echo Checking prerequisites...
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: gcloud CLI not found. Please install Google Cloud SDK.
    exit /b 1
)

where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: firebase CLI not found. Please run: npm install -g firebase-tools
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    exit /b 1
)

echo Prerequisites OK!
echo.

REM Deploy Backend
echo ========================================
echo STEP 1/2: Deploying Backend
echo ========================================
echo.

REM Ensure we're in the correct directory (where this script is located)
cd /d "%~dp0"
echo Script directory: %CD%

cd backend
echo Backend directory: %CD%

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
    cd ..
    exit /b 1
)

echo All required secrets found!
echo.

REM Deploy using source-based deployment with Secret Manager integration
echo Building and deploying backend to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --platform managed ^
  --region %REGION% ^
  --project %PROJECT_ID% ^
  --allow-unauthenticated ^
  --set-env-vars NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=34.31.176.242,DB_PORT=5432,FRONTEND_URL=https://helloliam.web.app ^
  --set-secrets DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest ^
  --memory 512Mi ^
  --cpu 1 ^
  --timeout 300 ^
  --max-instances 10 ^
  --min-instances 0 ^
  --service-account %PROJECT_NUMBER%-compute@developer.gserviceaccount.com

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend deployment failed
    cd ..
    exit /b 1
)

cd ..

echo.
echo Backend deployment complete!
echo.
echo Environment variables configured:
echo   Database:
echo     - DB_HOST: 34.31.176.242
echo     - DB_PORT: 5432
echo     - DB_NAME: hiking_portal
echo     - DB_USER: postgres
echo     - DB_PASSWORD: (from Secret Manager)
echo   Authentication:
echo     - JWT_SECRET: (from Secret Manager)
echo   Email (SendGrid):
echo     - SENDGRID_API_KEY: (from Secret Manager)
echo     - SENDGRID_FROM_EMAIL: (from Secret Manager)
echo   SMS/WhatsApp (Twilio):
echo     - TWILIO_ACCOUNT_SID: (from Secret Manager)
echo     - TWILIO_AUTH_TOKEN: (from Secret Manager)
echo     - TWILIO_WHATSAPP_NUMBER: (from Secret Manager)
echo   Weather:
echo     - OPENWEATHER_API_KEY: (from Secret Manager)
echo   Frontend:
echo     - FRONTEND_URL: https://helloliam.web.app
echo.

REM Deploy Frontend
echo ========================================
echo STEP 2/2: Deploying Frontend
echo ========================================
echo.

REM Ensure we're back in the project root, then go to frontend
cd /d "%~dp0"
echo Project root: %CD%

cd frontend
echo Frontend directory: %CD%

echo Installing dependencies...
call npm install --silent
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed
    cd ..
    exit /b 1
)

echo Building React app...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    cd ..
    exit /b 1
)

echo Deploying to Firebase...
call firebase deploy --only hosting --project %PROJECT_ID%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Firebase deployment failed
    cd ..
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Backend:  https://backend-554106646136.europe-west1.run.app
echo Frontend: https://helloliam.web.app
echo.
echo All services deployed successfully!
echo.
echo Configuration:
echo   - All secrets loaded from Secret Manager
echo   - Database connection configured
echo   - SendGrid email configured
echo   - Twilio SMS/WhatsApp configured
echo   - Weather API configured
echo.
