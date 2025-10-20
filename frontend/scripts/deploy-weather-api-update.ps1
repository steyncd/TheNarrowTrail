# Frontend Deployment Script - Weather API Update
# Builds and deploys the frontend to Firebase Hosting

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FRONTEND DEPLOYMENT" -ForegroundColor Green
Write-Host "Weather API Configuration Update" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Backend URL: https://backend-554106646136.europe-west1.run.app" -ForegroundColor White
Write-Host "  Project: helloliam" -ForegroundColor White
Write-Host "  Platform: Firebase Hosting" -ForegroundColor White
Write-Host "  Production URL: https://www.thenarrowtrail.co.za" -ForegroundColor White
Write-Host ""

# Step 1: Clean old build
Write-Host "Step 1: Cleaning old build..." -ForegroundColor Yellow
if (Test-Path build) {
    Remove-Item -Recurse -Force build
    Write-Host "  ✓ Removed old build directory" -ForegroundColor Green
} else {
    Write-Host "  ✓ No old build to clean" -ForegroundColor Green
}
Write-Host ""

# Step 2: Build production bundle
Write-Host "Step 2: Building production bundle..." -ForegroundColor Yellow
Write-Host "  This will take 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

$buildStart = Get-Date
npm run build
$buildEnd = Get-Date
$buildDuration = ($buildEnd - $buildStart).TotalSeconds

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✓ Build completed successfully in $([math]::Round($buildDuration, 1)) seconds" -ForegroundColor Green
    
    # Show build size
    if (Test-Path build) {
        $buildSize = (Get-ChildItem -Path build -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  ✓ Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "  ✗ Build failed! Check errors above." -ForegroundColor Red
    Write-Host ""
    exit 1
}
Write-Host ""

# Step 3: Verify build
Write-Host "Step 3: Verifying build..." -ForegroundColor Yellow
if (Test-Path "build/index.html") {
    Write-Host "  ✓ index.html exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ index.html missing! Build may be incomplete." -ForegroundColor Red
    exit 1
}

if (Test-Path "build/static") {
    Write-Host "  ✓ Static assets directory exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Static directory missing!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Deploy to Firebase
Write-Host "Step 4: Deploying to Firebase Hosting..." -ForegroundColor Yellow
Write-Host "  This will take 1-2 minutes..." -ForegroundColor Gray
Write-Host ""

$deployStart = Get-Date
firebase deploy --only hosting
$deployEnd = Get-Date
$deployDuration = ($deployEnd - $deployStart).TotalSeconds

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✓ Deployment completed in $([math]::Round($deployDuration, 1)) seconds" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  ✗ Deployment failed! Check errors above." -ForegroundColor Red
    Write-Host ""
    exit 1
}
Write-Host ""

# Success summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalDuration = $buildDuration + $deployDuration
Write-Host "Deployment Summary:" -ForegroundColor Yellow
Write-Host "  Build Time: $([math]::Round($buildDuration, 1)) seconds" -ForegroundColor White
Write-Host "  Deploy Time: $([math]::Round($deployDuration, 1)) seconds" -ForegroundColor White
Write-Host "  Total Time: $([math]::Round($totalDuration, 1)) seconds" -ForegroundColor White
Write-Host ""

Write-Host "Website URLs:" -ForegroundColor Yellow
Write-Host "  Primary: https://helloliam.web.app" -ForegroundColor Cyan
Write-Host "  Custom:  https://www.thenarrowtrail.co.za" -ForegroundColor Cyan
Write-Host ""

Write-Host "Firebase Console:" -ForegroundColor Yellow
Write-Host "  https://console.firebase.google.com/project/helloliam/overview" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open https://www.thenarrowtrail.co.za in your browser" -ForegroundColor White
Write-Host "  2. Log in as admin" -ForegroundColor White
Write-Host "  3. Navigate to Admin → Weather API" -ForegroundColor White
Write-Host "  4. Test weather provider configuration" -ForegroundColor White
Write-Host "  5. Navigate to a hike and verify weather displays" -ForegroundColor White
Write-Host ""

Write-Host "Post-Deployment Verification:" -ForegroundColor Yellow
Write-Host "  ✓ Check browser console for errors (F12)" -ForegroundColor White
Write-Host "  ✓ Verify Weather Settings page loads" -ForegroundColor White
Write-Host "  ✓ Test each weather provider" -ForegroundColor White
Write-Host "  ✓ Save configuration and reload page" -ForegroundColor White
Write-Host "  ✓ Check weather displays on hike pages" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Weather API integration deployed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
