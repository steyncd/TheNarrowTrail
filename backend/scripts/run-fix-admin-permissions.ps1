# Fix admin permissions script
$env:PGPASSWORD = "!Dobby1021"
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$dbHost = "35.202.149.98"
$database = "hiking_portal"
$dbUser = "postgres"
$sqlFile = "fix-admin-permissions.sql"

Write-Host "Running SQL script to fix admin permissions..." -ForegroundColor Cyan

& $psqlPath -h $dbHost -U $dbUser -d $database -f $sqlFile

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Green
