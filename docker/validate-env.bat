@echo off
REM Windows validation script for Hiking Portal Development Environment

echo 🔍 Hiking Portal Development Environment Validation
echo ==================================================

REM Function to check service (using PowerShell for curl)
set check_service=powershell -Command "try { $response = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ OK' -ForegroundColor Green } else { Write-Host '❌ FAILED' -ForegroundColor Red } } catch { Write-Host '❌ FAILED' -ForegroundColor Red }"

echo.
echo 🐳 Docker Containers:
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr hiking_portal

echo.
echo 🌐 Service Health Checks:
echo Backend API Health:
set URL=http://localhost:5000/health
%check_service%

echo Frontend:
set URL=http://localhost:3000
%check_service%

echo Database Connection:
docker exec hiking_portal_db pg_isready -U hiking_user -d hiking_portal_dev >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database OK
) else (
    echo ❌ Database FAILED
)

echo.
echo 📊 API Endpoints Test:
echo Auth Status:
set URL=http://localhost:5000/api/auth/status
%check_service%

echo Analytics Overview:
set URL=http://localhost:5000/api/analytics/overview
%check_service%

echo.
echo 🔌 Port Usage:
echo Frontend:        http://localhost:3000
echo Backend:         http://localhost:5000
echo Database:        localhost:5433
echo Redis:           localhost:6379
echo Nginx:           http://localhost:8080

echo.
echo 📝 Container Status:
docker-compose -f docker-compose.dev.yml ps

echo.
echo ==================================
echo 🎉 Validation Complete!
echo.
echo If all services show ✅, your development environment is ready!
echo If any show ❌, check the logs and troubleshooting section in README.md
echo.
echo To view logs: docker logs hiking_portal_backend -f
echo To restart:   docker-compose -f docker-compose.dev.yml restart

pause