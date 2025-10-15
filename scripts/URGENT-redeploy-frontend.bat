@echo off
REM Urgent: Rebuild and redeploy frontend with correct API URL

cd /d "%~dp0\..\frontend"

echo.
echo ========================================
echo  URGENT: Rebuilding Frontend
echo ========================================
echo.
echo Current directory: %CD%
echo.

echo Step 1: Cleaning old build...
if exist build (
    rmdir /s /q build
    echo Build directory removed
)
echo.

echo Step 2: Verifying .env.production...
if exist .env.production (
    echo .env.production exists
    findstr "REACT_APP_API_URL" .env.production
) else (
    echo ERROR: .env.production not found!
    exit /b 1
)
echo.

echo Step 3: Building production bundle...
echo This will take 1-2 minutes...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    exit /b 1
)

echo.
echo ========================================
echo  Build Complete!
echo ========================================
echo.

cd ..

echo Step 4: Deploying to Firebase...
call firebase deploy --only hosting

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Deployment Complete!
    echo ========================================
    echo.
    echo Your site is now live at:
    echo https://www.thenarrowtrail.co.za
    echo.
) else (
    echo.
    echo ERROR: Deployment failed!
    exit /b 1
)
