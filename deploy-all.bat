@echo off
REM Deploy both backend and frontend

echo ========================================
echo Deploying Hiking Portal - Full Stack
echo ========================================
echo.

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

echo Prerequisites OK!
echo.

REM Deploy Backend
echo ========================================
echo STEP 1/2: Deploying Backend
echo ========================================
echo.

cd backend

echo Building Docker container...
docker build -t hiking-portal-backend .
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker build failed
    cd ..
    exit /b 1
)

echo Tagging for Google Container Registry...
set PROJECT_ID=hiking-portal-api-554106646136
docker tag hiking-portal-backend gcr.io/%PROJECT_ID%/hiking-portal-api

echo Pushing to GCR...
docker push gcr.io/%PROJECT_ID%/hiking-portal-api

echo Deploying to Cloud Run...
gcloud run deploy hiking-portal-api --image gcr.io/%PROJECT_ID%/hiking-portal-api --platform managed --region us-central1 --allow-unauthenticated --project %PROJECT_ID%

cd ..

echo.
echo Backend deployment complete!
echo.

REM Deploy Frontend
echo ========================================
echo STEP 2/2: Deploying Frontend
echo ========================================
echo.

cd frontend

echo Building React app...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    cd ..
    exit /b 1
)

echo Deploying to Firebase...
call firebase deploy --only hosting

cd ..

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Backend: https://hiking-portal-api-554106646136.us-central1.run.app
echo Frontend: Check Firebase console for URL
echo.
