# URGENT: Deploy corrected frontend build
Set-Location C:\hiking-portal\frontend

Write-Host "`n"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DEPLOYING CORRECTED FRONTEND" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor White
Write-Host "`n"

Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n"
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " DEPLOYMENT SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`n"
    Write-Host "✅ Frontend is now live with CORRECT backend URL!" -ForegroundColor Green
    Write-Host "   https://helloliam.web.app" -ForegroundColor White
    Write-Host "`n"
    Write-Host "✅ Backend URL: https://backend-554106646136.europe-west1.run.app" -ForegroundColor Green
    Write-Host "`n"
} else {
    Write-Host "`n"
    Write-Host "❌ DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "`n"
}
