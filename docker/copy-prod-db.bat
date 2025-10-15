@echo off
REM Copy production database to local development environment

echo 🏔️  Copying Production Database to Local Development
echo =====================================================

REM Production database details
set PROD_HOST=35.202.149.98
set PROD_PORT=5432
set PROD_DB=hiking-db
set PROD_USER=postgres
set PROD_PASSWORD=!Dobby1021

REM Local database details
set LOCAL_HOST=localhost
set LOCAL_PORT=5433
set LOCAL_DB=hiking_portal_dev
set LOCAL_USER=hiking_user
set LOCAL_PASSWORD=hiking_pass_dev_123

echo 📡 Step 1: Dumping production database...
echo   Host: %PROD_HOST%:%PROD_PORT%
echo   Database: %PROD_DB%

REM Set password for pg_dump
set PGPASSWORD=%PROD_PASSWORD%

REM Dump production database (schema and data)
docker run --rm -v %cd%:/backup postgres:15-alpine pg_dump ^
  -h %PROD_HOST% ^
  -p %PROD_PORT% ^
  -U %PROD_USER% ^
  -d %PROD_DB% ^
  --no-owner ^
  --no-privileges ^
  --clean ^
  --if-exists ^
  -f /backup/production_dump.sql

if %errorlevel% neq 0 (
    echo ❌ Failed to dump production database
    pause
    exit /b 1
)

echo ✅ Production database dumped successfully

echo.
echo 🐳 Step 2: Restoring to local development database...
echo   Host: %LOCAL_HOST%:%LOCAL_PORT%
echo   Database: %LOCAL_DB%

REM Restore to local database
docker exec -i hiking_portal_db psql -U %LOCAL_USER% -d %LOCAL_DB% < production_dump.sql

if %errorlevel% neq 0 (
    echo ⚠️  Some errors occurred during restore (this is often normal)
)

echo.
echo 📊 Step 3: Verifying local database...
docker exec hiking_portal_db psql -U %LOCAL_USER% -d %LOCAL_DB% -c "\dt"
docker exec hiking_portal_db psql -U %LOCAL_USER% -d %LOCAL_DB% -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'hikes', COUNT(*) FROM hikes UNION SELECT 'hike_interest', COUNT(*) FROM hike_interest;"

echo.
echo 🎉 Database copy completed!
echo.
echo 🔧 Next steps:
echo   1. Test your application: http://localhost:3000
echo   2. Login with production credentials
echo   3. Verify data looks correct
echo.
echo 🗑️  Cleanup: Delete production_dump.sql when done

pause