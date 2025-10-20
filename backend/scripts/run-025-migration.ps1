# Run Migration 025 - Update tags to be South African-focused
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Migration 025" -ForegroundColor Green
Write-Host "Update tags to South African context" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = '!Dobby1021'

try {
    & 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -h 35.202.149.98 -U postgres -d hiking_portal -f migrations/025_update_tags_south_african.sql

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "New tag categories added:" -ForegroundColor Yellow
        Write-Host "  - Target Audience (Family, Mens, Ladies, Mixed, etc.)" -ForegroundColor White
        Write-Host "  - South African Locations (Provinces, Cities, Landmarks)" -ForegroundColor White
        Write-Host "  - SA-Specific Activities (Braai, Game Drive, Wine Tasting)" -ForegroundColor White
        Write-Host "  - Terrain Types (Bushveld, Fynbos, Grassland)" -ForegroundColor White
        Write-Host "  - Difficulty, Duration, Cost, Season tags" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Migration failed!" -ForegroundColor Red
        Write-Host "Check the error messages above" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error running migration: $_" -ForegroundColor Red
    exit 1
}
