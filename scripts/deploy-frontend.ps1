# Secure deployment script for frontend to Firebase Hosting
# Includes safety checks to prevent local environment leaks to production

param(
    [switch]$SkipValidation = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting secure frontend deployment..." -ForegroundColor Blue
Write-Host ""

# Get script directory and navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot
Write-Host "Project root: $(Get-Location)" -ForegroundColor Yellow

# Navigate to frontend directory
Set-Location "frontend"
Write-Host "Frontend directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Step 1: Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path ".firebase") { Remove-Item -Recurse -Force ".firebase" }

# Step 2: Validate .env.production exists
Write-Host "🔍 Validating production environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ ERROR: .env.production not found" -ForegroundColor Red
    Write-Host "Please create .env.production with production values" -ForegroundColor Red
    exit 1
}

# Verify production API URL is set correctly
$envContent = Get-Content ".env.production" -Raw
if ($envContent -notmatch "REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app") {
    Write-Host "❌ ERROR: Production API URL not correctly set in .env.production" -ForegroundColor Red
    Write-Host "Expected: REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Production environment validated" -ForegroundColor Green

# Step 3: Handle .env.local (backup and temporarily remove)
$envLocalHandled = $false
if (Test-Path ".env.local") {
    Write-Host "📋 Found .env.local - backing up and temporarily removing..." -ForegroundColor Yellow
    Write-Host "   (This prevents local settings from overriding production)" -ForegroundColor Yellow
    Copy-Item ".env.local" ".env.local.backup" -Force
    Move-Item ".env.local" ".env.local.temp" -Force
    $envLocalHandled = $true
}

# Step 4: Build for production
Write-Host ""
Write-Host "🏗️  Building for production..." -ForegroundColor Yellow
$env:NODE_ENV = "production"

# Clear build cache
if (Test-Path "node_modules\.cache") {
    Write-Host "   Clearing build cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
}

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    
    # Restore .env.local if we moved it
    if ($envLocalHandled) {
        if (Test-Path ".env.local.temp") { Move-Item ".env.local.temp" ".env.local" -Force }
        if (Test-Path ".env.local.backup") { Remove-Item ".env.local.backup" -Force }
    }
    
    exit 1
}

# Step 5: Validate build output (no local references)
Write-Host ""
Write-Host "🔍 Validating build output for local references..." -ForegroundColor Yellow

$hasLocalReferences = $false
if (Test-Path "build\static") {
    $files = Get-ChildItem -Path "build\static" -Recurse -File
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            # Check for localhost
            if ($content -match "localhost") {
                Write-Host "❌ ERROR: Build contains 'localhost' references in $($file.Name)!" -ForegroundColor Red
                $hasLocalReferences = $true
                break
            }
            
            # Check for 127.0.0.1
            if ($content -match "127\.0\.0\.1") {
                Write-Host "❌ ERROR: Build contains '127.0.0.1' references in $($file.Name)!" -ForegroundColor Red
                $hasLocalReferences = $true
                break
            }
            
            # Check for local network
            if ($content -match "192\.168\.") {
                Write-Host "❌ ERROR: Build contains local network references in $($file.Name)!" -ForegroundColor Red
                $hasLocalReferences = $true
                break
            }
        }
    }
}

if ($hasLocalReferences) {
    Write-Host "Build is not safe for production deployment" -ForegroundColor Red
    
    # Restore .env.local
    if ($envLocalHandled) {
        if (Test-Path ".env.local.temp") { Move-Item ".env.local.temp" ".env.local" -Force }
        if (Test-Path ".env.local.backup") { Remove-Item ".env.local.backup" -Force }
    }
    
    exit 1
}

Write-Host "✅ Build validated - no local references found" -ForegroundColor Green

# Step 6: Deploy to Firebase
Write-Host ""
Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Yellow

firebase deploy --only hosting

$deployStatus = $LASTEXITCODE

# Step 7: Restore .env.local
if ($envLocalHandled) {
    Write-Host ""
    Write-Host "🔄 Restoring .env.local for development..." -ForegroundColor Yellow
    if (Test-Path ".env.local.temp") { Move-Item ".env.local.temp" ".env.local" -Force }
    if (Test-Path ".env.local.backup") { Remove-Item ".env.local.backup" -Force }
}

# Step 8: Report results
Write-Host ""
if ($deployStatus -eq 0) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✅ Deployment Successful!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your app is live at:" -ForegroundColor Blue
    Write-Host "   • https://helloliam.web.app" -ForegroundColor White
    Write-Host "   • https://www.thenarrowtrail.co.za" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Deployment validated:" -ForegroundColor Blue
    Write-Host "   • Production environment used" -ForegroundColor White
    Write-Host "   • No local references in build" -ForegroundColor White
    Write-Host "   • Backend URL: https://backend-554106646136.europe-west1.run.app" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  ❌ Deployment Failed!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}
