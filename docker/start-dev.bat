@echo off
REM Development startup script for hiking portal (Windows)

echo 🏔️  Starting Hiking Portal Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

REM Check if .env.dev exists
if not exist .env.dev (
    echo ❌ .env.dev file not found. Please create it from template
    exit /b 1
)

echo 📋 Starting services...

REM Start the development environment
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

echo ⏳ Waiting for services to be ready...

REM Wait for database to be ready
echo 🗄️  Waiting for database...
:wait_db
docker exec hiking_portal_db pg_isready -U hiking_user -d hiking_portal_dev >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto wait_db
)

REM Wait for backend to be ready
echo 🚀 Waiting for backend...
:wait_backend
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto wait_backend
)

REM Run database migrations
echo 🔄 Running database migrations...
docker exec hiking_portal_backend npm run migrate

echo ✅ Development environment is ready!
echo.
echo 🌟 Available Services:
echo    Frontend:        http://localhost:3000
echo    Backend API:     http://localhost:5000
echo    Backend Health:  http://localhost:5000/health
echo    Nginx Proxy:     http://localhost:8080
echo    Database:        localhost:5433
echo    Redis:           localhost:6379
echo.
echo 📊 Useful Commands:
echo    View logs:       docker-compose -f docker-compose.dev.yml logs -f
echo    Stop services:   docker-compose -f docker-compose.dev.yml down
echo    Restart service: docker-compose -f docker-compose.dev.yml restart ^<service^>
echo.
echo 🐛 Debugging:
echo    Backend logs:    docker logs hiking_portal_backend -f
echo    Frontend logs:   docker logs hiking_portal_frontend -f
echo    Database logs:   docker logs hiking_portal_db -f

pause