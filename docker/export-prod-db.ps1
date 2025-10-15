# Production Database Export Script
# Run this on a machine that has access to your production database

# Production database connection
$PROD_HOST = "35.202.149.98"
$PROD_PORT = "5432"
$PROD_DB = "hiking-db"
$PROD_USER = "postgres"
$PROD_PASSWORD = "!Dobby1021"

Write-Host "🏔️  Exporting Production Database" -ForegroundColor Green
Write-Host "=================================="

# Set environment variable for password
$env:PGPASSWORD = $PROD_PASSWORD

# Export database to SQL file
Write-Host "📡 Connecting to production database..." -ForegroundColor Yellow
Write-Host "   Host: $PROD_HOST"
Write-Host "   Database: $PROD_DB"

try {
    # Create dump file
    pg_dump -h $PROD_HOST -p $PROD_PORT -U $PROD_USER -d $PROD_DB --no-owner --no-privileges --clean --if-exists -f "hiking_portal_production_dump.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production database exported successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📁 File created: hiking_portal_production_dump.sql"
        
        # Show file size
        $fileSize = (Get-Item "hiking_portal_production_dump.sql").Length
        $fileSizeMB = [Math]::Round($fileSize / 1MB, 2)
        Write-Host "📊 File size: $fileSizeMB MB"
        
        Write-Host ""
        Write-Host "🚀 Next steps:"
        Write-Host "   1. Copy 'hiking_portal_production_dump.sql' to your Docker environment"
        Write-Host "   2. Run: docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev < hiking_portal_production_dump.sql"
        Write-Host "   3. Test your application at http://localhost:3000"
    } else {
        Write-Host "❌ Failed to export database" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure pg_dump is installed and accessible"
    Write-Host "💡 Check if the production database is accessible from this machine"
}

# Clear password from environment
$env:PGPASSWORD = $null