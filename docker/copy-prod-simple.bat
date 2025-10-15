@echo off
REM Simple production database copy using Docker exec

echo 🏔️  Copying Production Database to Local Development
echo =====================================================

echo 📡 Step 1: Creating dump from production database...

REM Use Docker to run pg_dump against production
docker exec hiking_portal_db pg_dump ^
  -h 35.202.149.98 ^
  -p 5432 ^
  -U postgres ^
  -d hiking-db ^
  --no-owner ^
  --no-privileges ^
  --clean ^
  --if-exists > production_dump.sql

if %errorlevel% neq 0 (
    echo ❌ Failed to dump production database
    echo ℹ️  You may need to install pg_dump or check connection
    pause
    exit /b 1
)

echo ✅ Production database dumped to production_dump.sql

echo.
echo 🐳 Step 2: Restoring to local development database...

REM Clear and restore local database
docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev < production_dump.sql

echo.
echo 📊 Step 3: Verifying local database...
docker exec hiking_portal_db psql -U hiking_user -d hiking_portal_dev -c "\dt"

echo.
echo 📈 Record counts:
docker exec hiking_portal_db psql -U hiking_user -d hiking_portal_dev -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'hikes', COUNT(*) FROM hikes UNION ALL SELECT 'hike_interest', COUNT(*) FROM hike_interest ORDER BY table_name;"

echo.
echo 🎉 Database copy completed!
echo   - Production data is now available locally
echo   - Test at http://localhost:3000
echo   - Use your production login credentials

pause