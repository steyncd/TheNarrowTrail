@echo off
REM Secure deployment script for frontend to Firebase Hosting
REM Includes safety checks to prevent local environment leaks to production

setlocal enabledelayedexpansion

echo ========================================
echo Deploying Frontend to Firebase Hosting
echo ========================================
echo.

REM Check prerequisites
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

REM Get script directory and navigate to project root
cd /d "%~dp0"
cd ..
echo Project root: %CD%
echo.

REM Navigate to frontend directory
cd frontend
echo Frontend directory: %CD%
echo.

REM Step 1: Clean previous build
echo Cleaning previous build...
if exist "build" rd /s /q "build"
if exist ".firebase" rd /s /q ".firebase"
echo Done!
echo.

REM Step 2: Validate .env.production exists
echo Validating production environment...
if not exist ".env.production" (
    echo ERROR: .env.production not found
    echo Please create .env.production with production values
    cd ..
    exit /b 1
)

REM Verify production API URL is set correctly
findstr /C:"REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app" .env.production >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Production API URL not correctly set in .env.production
    echo Expected: REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app
    cd ..
    exit /b 1
)

echo Production environment validated!
echo.

REM Step 3: Handle .env.local (backup and temporarily remove)
set ENV_LOCAL_HANDLED=0
if exist ".env.local" (
    echo Found .env.local - backing up and temporarily removing...
    echo ^(This prevents local settings from overriding production^)
    copy /Y ".env.local" ".env.local.backup" >nul
    move /Y ".env.local" ".env.local.temp" >nul
    set ENV_LOCAL_HANDLED=1
)
echo.

REM Step 4: Build for production
echo Building for production...
set NODE_ENV=production

REM Clear build cache
if exist "node_modules\.cache" (
    echo Clearing build cache...
    rd /s /q "node_modules\.cache" 2>nul
)

call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    
    REM Restore .env.local if we moved it
    if %ENV_LOCAL_HANDLED% EQU 1 (
        if exist ".env.local.temp" move /Y ".env.local.temp" ".env.local" >nul
        if exist ".env.local.backup" del /F /Q ".env.local.backup" >nul
    )
    
    cd ..
    exit /b 1
)
echo.

REM Step 5: Validate build output (no local references)
echo Validating build output for local references...

set HAS_LOCAL_REFS=0

if exist "build\static" (
    REM Check for localhost
    findstr /S /R "localhost" "build\static\*" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ERROR: Build contains 'localhost' references!
        echo Build is not safe for production deployment
        set HAS_LOCAL_REFS=1
    )
    
    REM Check for 127.0.0.1
    if !HAS_LOCAL_REFS! EQU 0 (
        findstr /S /R "127\.0\.0\.1" "build\static\*" >nul 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo ERROR: Build contains '127.0.0.1' references!
            echo Build is not safe for production deployment
            set HAS_LOCAL_REFS=1
        )
    )
    
    REM Check for local network addresses
    if !HAS_LOCAL_REFS! EQU 0 (
        findstr /S /R "192\.168\." "build\static\*" >nul 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo ERROR: Build contains local network references!
            echo Build is not safe for production deployment
            set HAS_LOCAL_REFS=1
        )
    )
)

if %HAS_LOCAL_REFS% EQU 1 (
    REM Restore .env.local
    if %ENV_LOCAL_HANDLED% EQU 1 (
        if exist ".env.local.temp" move /Y ".env.local.temp" ".env.local" >nul
        if exist ".env.local.backup" del /F /Q ".env.local.backup" >nul
    )
    cd ..
    exit /b 1
)

echo Build validated - no local references found!
echo.

REM Step 6: Deploy to Firebase
echo Deploying to Firebase Hosting...
firebase deploy --only hosting

set DEPLOY_STATUS=%ERRORLEVEL%

REM Step 7: Restore .env.local
if %ENV_LOCAL_HANDLED% EQU 1 (
    echo.
    echo Restoring .env.local for development...
    if exist ".env.local.temp" move /Y ".env.local.temp" ".env.local" >nul
    if exist ".env.local.backup" del /F /Q ".env.local.backup" >nul
)

REM Step 8: Report results
echo.
if %DEPLOY_STATUS% EQU 0 (
    echo ================================================
    echo   Deployment Successful!
    echo ================================================
    echo.
    echo Your app is live at:
    echo   - https://helloliam.web.app
    echo   - https://www.thenarrowtrail.co.za
    echo.
    echo Deployment validated:
    echo   - Production environment used
    echo   - No local references in build
    echo   - Backend URL: https://backend-554106646136.europe-west1.run.app
    echo.
) else (
    echo ================================================
    echo   Deployment Failed!
    echo ================================================
    echo.
    echo Please check the error messages above
    cd ..
    exit /b 1
)

cd ..
