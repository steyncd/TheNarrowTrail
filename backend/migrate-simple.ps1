# Simple database migration script
# migrate-simple.ps1

Write-Host "🔄 Simple Database Migration" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Create backup directory
$BACKUP_DIR = "./database-backup"
if (!(Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$DUMP_FILE = "$BACKUP_DIR/production_dump_$TIMESTAMP.sql"

Write-Host "📥 Step 1: Creating production database dump..." -ForegroundColor Yellow

# Use docker to create the dump
docker run --rm `
    -e PGPASSWORD='!Dobby1021' `
    postgres:15-alpine `
    pg_dump -h 35.202.149.98 -p 5432 -U postgres -d hiking-db --clean --if-exists --format=plain > $DUMP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production dump created: $DUMP_FILE" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create dump" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Step 2: Importing to local database..." -ForegroundColor Yellow

# Drop and recreate local database
docker exec hiking_portal_db psql -U postgres -c "DROP DATABASE IF EXISTS hiking_portal;"
docker exec hiking_portal_db psql -U postgres -c "CREATE DATABASE hiking_portal;"

# Import the dump
docker cp $DUMP_FILE hiking_portal_db:/tmp/dump.sql
docker exec hiking_portal_db psql -U postgres -d hiking_portal -f /tmp/dump.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to import data" -ForegroundColor Red
    exit 1
}

# Clean up
docker exec hiking_portal_db rm /tmp/dump.sql

Write-Host "🎉 Migration completed!" -ForegroundColor Green
Write-Host "🚀 You can now start the backend with: npm start" -ForegroundColor Cyan