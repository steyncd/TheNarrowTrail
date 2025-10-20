# Run Migration 024 - Update Event Types
# This script runs the migration to remove fishing and add cycling

$env:PGPASSWORD = "!Dobby1021"

$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "ERROR: PostgreSQL psql.exe not found at: $psqlPath" -ForegroundColor Red
    Write-Host "Please update the `$psqlPath variable in this script with the correct path." -ForegroundColor Yellow
    exit 1
}

Write-Host "Running Migration 024: Update Event Types" -ForegroundColor Cyan
Write-Host "  - Removing fishing event type" -ForegroundColor Yellow
Write-Host "  - Adding cycling event type" -ForegroundColor Green
Write-Host ""

& $psqlPath -h 35.202.149.98 -U postgres -d hiking_portal -f ".\migrations\024_update_event_types.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration 024 completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Migration 024 failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}

Remove-Item Env:\PGPASSWORD
