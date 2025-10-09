@echo off
REM Backend Deployment Script for The Narrow Trail Hiking Portal
REM This script deploys the backend to Google Cloud Run

setlocal enabledelayedexpansion

echo ================================================
echo   Deploying Backend to Google Cloud Run
echo ================================================
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: gcloud CLI is not installed or not in PATH
    echo Please install it from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Change to backend directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Confirm deployment
echo WARNING: You are about to deploy the backend to Cloud Run.
echo Service: backend
echo Region: europe-west1
echo.
set /p CONFIRM="Continue with deployment? (y/N): "

if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled.
    exit /b 0
)

echo.
echo Starting deployment...
echo.

REM Deploy to Cloud Run
gcloud run deploy backend ^
  --source . ^
  --region europe-west1 ^
  --platform managed ^
  --allow-unauthenticated ^
  --min-instances 0 ^
  --max-instances 10 ^
  --timeout 300

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   Deployment Complete!
    echo ================================================
    echo.
    echo Service URL: https://backend-4kzqyywlqq-ew.a.run.app
    echo.
    echo Next steps:
    echo   1. Check Cloud Run logs for any errors
    echo   2. Test email functionality by triggering a notification
    echo   3. Verify new email templates are being sent
    echo.
) else (
    echo.
    echo ================================================
    echo   Deployment Failed!
    echo ================================================
    echo.
    echo Please check the error messages above.
    exit /b 1
)
