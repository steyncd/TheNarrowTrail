# migrate-prod-to-local.ps1 - Copy production database to local development
# PowerShell script for Windows

Write-Host "🔄 Hiking Portal - Production to Local Database Migration" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

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
Write-Host ""

# Create backup directory
if (!(Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "🔄 Step 1: Creating production database dump..." -ForegroundColor Yellow
Write-Host "⏳ This may take a few minutes depending on database size..."

# Set environment variable for PostgreSQL password
$env:PGPASSWORD = $PROD_PASSWORD

try {
    # Create production dump
    & pg_dump -h $PROD_HOST -p $PROD_PORT -U $PROD_USER -d $PROD_DB --no-password --verbose --clean --if-exists --create --format=plain --file="$DUMP_FILE"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production dump created successfully: $DUMP_FILE" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create production dump" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error creating production dump: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure pg_dump is installed and in your PATH" -ForegroundColor Yellow
    Write-Host "   You can install it as part of PostgreSQL client tools" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔄 Step 2: Preparing local database..." -ForegroundColor Yellow

# Stop any running Node.js processes (optional)
Write-Host "⏹️  Stopping any running backend processes..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "server" } | Stop-Process -Force

# Drop and recreate local database using Docker
Write-Host "🗑️  Dropping existing local database..."
docker exec hiking_portal_db psql -U postgres -c "DROP DATABASE IF EXISTS hiking_portal;"
docker exec hiking_portal_db psql -U postgres -c "CREATE DATABASE hiking_portal;"

Write-Host "✅ Local database recreated" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Step 3: Importing production data to local database..." -ForegroundColor Yellow

# Copy dump file to Docker container
docker cp $DUMP_FILE hiking_portal_db:/tmp/dump.sql

# Import the dump
docker exec hiking_portal_db psql -U postgres -d hiking_portal -f /tmp/dump.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production data imported successfully to local database" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to import production data" -ForegroundColor Red
    exit 1
}

# Clean up the dump file from container
docker exec hiking_portal_db rm /tmp/dump.sql

Write-Host ""
Write-Host "🔄 Step 4: Verifying migration..." -ForegroundColor Yellow

# Check table count
$TABLE_COUNT = docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Host "📊 Tables imported: $($TABLE_COUNT.Trim())"

# Check user count (with error handling)
try {
    $USER_COUNT = docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM users;" 2>$null
    Write-Host "👥 Users imported: $($USER_COUNT.Trim())"
} catch {
    Write-Host "👥 Users imported: 0 (table may not exist)"
}

# Check hike count (with error handling)
try {
    $HIKE_COUNT = docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM hikes;" 2>$null
    Write-Host "🥾 Hikes imported: $($HIKE_COUNT.Trim())"
} catch {
    Write-Host "🥾 Hikes imported: 0 (table may not exist)"
}

Write-Host ""
Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Backup saved to: $DUMP_FILE" -ForegroundColor Cyan
Write-Host "🚀 You can now start your local backend server with: npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT SECURITY NOTES:" -ForegroundColor Red
Write-Host "  • This local database now contains production data"
Write-Host "  • Do not commit any data dumps to version control"
Write-Host "  • Consider anonymizing user data for development"
Write-Host "  • Use different credentials for production vs development"

# Clear the password environment variable
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue