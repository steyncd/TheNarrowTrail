@echo off
REM Run all database migrations to build production-like schema

echo 🏗️  Building Production Schema from Migrations
echo ===============================================

echo 📋 Running all database migrations...

REM First, let's make sure we have a clean start
echo 🧹 Clearing existing tables...
docker exec hiking_portal_db psql -U hiking_user -d hiking_portal_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo 🏗️  Running basic schema...
Get-Content basic_schema.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo 📦 Running migrations in order...

REM Run migrations in chronological order
echo   📝 001 - Notification log...
Get-Content ..\backend\migrations\001_add_notification_log.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 002 - User profile fields...
Get-Content ..\backend\migrations\002_add_user_profile_fields.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 003 - Attendance status...
Get-Content ..\backend\migrations\003_add_attendance_status_to_hike_interest.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 004 - Activity logs...
Get-Content ..\backend\migrations\004_add_signin_and_activity_logs.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 005 - Hike estimates...
Get-Content ..\backend\migrations\005_add_hike_estimate_and_links.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 006 - Feedback table...
Get-Content ..\backend\migrations\006_add_feedback_table.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 007 - Suggestions table...
Get-Content ..\backend\migrations\007_add_suggestions_table.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 008 - Long lived tokens...
Get-Content ..\backend\migrations\008_add_long_lived_tokens.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 009 - Location field...
Get-Content ..\backend\migrations\009_add_location_field.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 010 - GPS coordinates...
Get-Content ..\backend\migrations\010_add_gps_coordinates_remove_destination_url.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 011 - Hike payments...
Get-Content ..\backend\migrations\011_add_hike_payments.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 011 - Site content...
Get-Content ..\backend\migrations\011_add_site_content.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 012 - Consolidate attendees...
Get-Content ..\backend\migrations\012_consolidate_attendees_to_interest.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 013 - Notification preferences...
Get-Content ..\backend\migrations\013_add_notification_preferences.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 014 - POPIA compliance...
Get-Content ..\backend\migrations\014_add_popia_compliance.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 015 - Legal content...
Get-Content ..\backend\migrations\015_add_legal_content.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 016 - Data retention tracking...
Get-Content ..\backend\migrations\016_add_data_retention_tracking.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo   📝 999 - Performance indexes...
Get-Content ..\backend\migrations\999_add_performance_indexes_no_concurrent.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev

echo.
echo 📊 Final database summary:
docker exec hiking_portal_db psql -U hiking_user -d hiking_portal_dev -c "\dt"

echo.
echo 🎉 Production-like schema built successfully!
echo   - All migrations applied
echo   - Database ready for development
echo   - Test at http://localhost:3000

pause