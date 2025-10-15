@echo off
REM Development stop script for hiking portal (Windows)

echo 🛑 Stopping Hiking Portal Development Environment...

REM Stop all services
docker-compose -f docker-compose.dev.yml down

echo 🧹 Cleaning up...

REM Optional: Remove volumes (uncomment if you want to reset data)
REM echo ⚠️  Removing all data volumes...
REM docker-compose -f docker-compose.dev.yml down -v

REM Optional: Remove images (uncomment for complete cleanup)
REM echo 🗑️  Removing development images...
REM docker image prune -f

echo ✅ Development environment stopped!
echo.
echo 💡 To restart: docker\start-dev.bat
echo 🗑️  To clean all data: docker-compose -f docker-compose.dev.yml down -v

pause