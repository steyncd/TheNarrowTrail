# migrate-prod-to-local-docker.ps1 - Copy production database to local development using Docker
# This version uses a temporary PostgreSQL container to handle the dump/restore process

param(
    [switch]$SkipBackup = $false,
    [switch]$AnonymizeData = $false
)

Write-Host "🔄 Hiking Portal - Production to Local Database Migration (Docker Method)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Production database connection details
$PROD_HOST = "35.202.149.98"
$PROD_PORT = "5432"
$PROD_DB = "hiking-db"
$PROD_USER = "postgres"
$PROD_PASSWORD = "!Dobby1021"

# Local database connection details
$LOCAL_HOST = "localhost"
$LOCAL_PORT = "5432"
$LOCAL_DB = "hiking_portal"
$LOCAL_USER = "postgres"
$LOCAL_PASSWORD = "hiking_password"

# Backup directory
$BACKUP_DIR = "./database-backup"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$DUMP_FILE = "$BACKUP_DIR/production_dump_$TIMESTAMP.sql"

Write-Host "📋 Migration Configuration:" -ForegroundColor Yellow
Write-Host "  Production: $PROD_HOST`:$PROD_PORT/$PROD_DB"
Write-Host "  Local:      $LOCAL_HOST`:$LOCAL_PORT/$LOCAL_DB"
Write-Host "  Dump file:  $DUMP_FILE"
Write-Host "  Skip backup: $SkipBackup"
Write-Host "  Anonymize data: $AnonymizeData"
Write-Host ""

# Create backup directory
if (!(Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "🔄 Step 1: Creating production database dump using Docker..." -ForegroundColor Yellow
Write-Host "⏳ This may take a few minutes depending on database size..."

try {
    # Create production dump using a temporary PostgreSQL container
    $dumpCommand = @"
pg_dump -h $PROD_HOST -p $PROD_PORT -U $PROD_USER -d $PROD_DB --no-password --verbose --clean --if-exists --format=plain > /backup/dump.sql
"@

    # Run pg_dump in a temporary container
    $currentPath = (Get-Location).Path
    docker run --rm -it `
        --network hiking_portal_dev `
        -v "${currentPath}/${BACKUP_DIR}:/backup" `
        -e PGPASSWORD="$PROD_PASSWORD" `
        postgres:15-alpine `
        sh -c "$dumpCommand"

    if ($LASTEXITCODE -eq 0) {
        # Move the dump file to the timestamped name
        Move-Item "$BACKUP_DIR/dump.sql" $DUMP_FILE
        Write-Host "✅ Production dump created successfully: $DUMP_FILE" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create production dump" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error creating production dump: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Step 2: Preparing local database..." -ForegroundColor Yellow

# Stop any running backend processes
Write-Host "⏹️  Stopping any running backend processes..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Drop and recreate local database
Write-Host "🗑️  Recreating local database..."
docker exec hiking_portal_db psql -U postgres -c "DROP DATABASE IF EXISTS hiking_portal;"
docker exec hiking_portal_db psql -U postgres -c "CREATE DATABASE hiking_portal;"

Write-Host "✅ Local database recreated" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Step 3: Importing production data to local database..." -ForegroundColor Yellow

# Copy dump file to Docker container
docker cp $DUMP_FILE hiking_portal_db:/tmp/dump.sql

# Import the dump
Write-Host "📥 Importing data..."
docker exec hiking_portal_db psql -U postgres -d hiking_portal -f /tmp/dump.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production data imported successfully to local database" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to import production data" -ForegroundColor Red
    Write-Host "🔍 Checking what went wrong..."
    
    # Show any error details
    docker exec hiking_portal_db psql -U postgres -d hiking_portal -c "\dt" 2>&1
    exit 1
}

# Clean up the dump file from container
docker exec hiking_portal_db rm /tmp/dump.sql

Write-Host ""
Write-Host "🔄 Step 4: Post-migration tasks..." -ForegroundColor Yellow

if ($AnonymizeData) {
    Write-Host "🔒 Anonymizing user data for development..."
    
    $anonymizeScript = @'
-- Anonymize user data for development
UPDATE users SET 
    email = CONCAT('user', id, '@example.com'),
    phone = NULL,
    emergency_contact_name = 'Emergency Contact ' || id,
    emergency_contact_phone = '+1234567890'
WHERE role != 'admin';

-- Keep one admin user with known credentials
UPDATE users SET 
    email = 'admin@localhost',
    name = 'Local Admin'
WHERE role = 'admin' 
LIMIT 1;

-- Anonymize any other sensitive data
UPDATE hike_payments SET 
    payment_reference = 'DEV-' || id || '-' || EXTRACT(epoch FROM payment_date)::TEXT
WHERE payment_reference IS NOT NULL;
'@

    # Write anonymization script to temp file and execute
    $anonymizeScript | docker exec -i hiking_portal_db psql -U postgres -d hiking_portal
    
    Write-Host "✅ User data anonymized for development" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 Step 5: Verifying migration..." -ForegroundColor Yellow

# Check table count
$TABLE_COUNT = (docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';").Trim()
Write-Host "📊 Tables imported: $TABLE_COUNT"

# Check user count
try {
    $USER_COUNT = (docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM users;" 2>$null).Trim()
    Write-Host "👥 Users imported: $USER_COUNT"
} catch {
    Write-Host "👥 Users: 0 (table may not exist)"
}

# Check hike count
try {
    $HIKE_COUNT = (docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM hikes;" 2>$null).Trim()
    Write-Host "🥾 Hikes imported: $HIKE_COUNT"
} catch {
    Write-Host "🥾 Hikes: 0 (table may not exist)"
}

# Check payment count
try {
    $PAYMENT_COUNT = (docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM hike_payments;" 2>$null).Trim()
    Write-Host "💰 Payments imported: $PAYMENT_COUNT"
} catch {
    Write-Host "💰 Payments: 0 (table may not exist)"
}

Write-Host ""
Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Backup saved to: $DUMP_FILE" -ForegroundColor Cyan
Write-Host "🚀 You can now start your local backend server with:" -ForegroundColor Cyan
Write-Host "   cd C:\hiking-portal\backend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT SECURITY NOTES:" -ForegroundColor Red
Write-Host "  • This local database now contains production data" -ForegroundColor Yellow
Write-Host "  • Do not commit any data dumps to version control" -ForegroundColor Yellow
Write-Host "  • Consider using -AnonymizeData flag for safer development" -ForegroundColor Yellow
Write-Host "  • Use different credentials for production vs development" -ForegroundColor Yellow

if (!$SkipBackup) {
    Write-Host ""
    Write-Host "💾 Backup retention:" -ForegroundColor Cyan
    Write-Host "  • Keep recent backups for rollback purposes"
    Write-Host "  • Delete old backups periodically to save disk space"
    Write-Host "  • Current backup: $DUMP_FILE"
}