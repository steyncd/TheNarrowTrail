# PowerShell Backend Deployment Script
# Deploy backend to Google Cloud Run with proper directory handling

param(
    [switch]$Force = $false
)

# Configuration
$PROJECT_ID = "helloliam"
$SERVICE_NAME = "backend"
$REGION = "europe-west1"
$PROJECT_NUMBER = "554106646136"

Write-Host "🚀 Deploying backend to Google Cloud Run..." -ForegroundColor Green
Write-Host "Project: $PROJECT_ID"
Write-Host "Service: $SERVICE_NAME" 
Write-Host "Region: $REGION"
Write-Host ""

# Get script directory and ensure we're in project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "Project root: $(Get-Location)" -ForegroundColor Yellow

# Navigate to backend directory
Set-Location "backend"
Write-Host "Backend directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Verify we're in the right place
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Not in backend directory!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: server.js not found. Not in backend directory!" -ForegroundColor Red
    exit 1
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check gcloud
try {
    $gcloudVersion = gcloud --version 2>$null
    Write-Host "✓ Google Cloud SDK installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Google Cloud SDK not found. Please install it." -ForegroundColor Red
    exit 1
}

# Clean up Windows artifacts
Write-Host "🧹 Cleaning up Windows artifacts..." -ForegroundColor Cyan
Get-ChildItem -Recurse -Name "nul" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# Confirm deployment unless forced
if (-not $Force) {
    Write-Host ""
    Write-Host "⚠️  You are about to deploy the backend to Cloud Run." -ForegroundColor Yellow
    Write-Host "Service: $SERVICE_NAME"
    Write-Host "Region: $REGION"
    Write-Host ""
    $confirm = Read-Host "Continue with deployment? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "🚀 Starting deployment..." -ForegroundColor Green
Write-Host ""

# Deploy to Cloud Run
$deployCmd = "gcloud run deploy $SERVICE_NAME --source . --region $REGION --platform managed --allow-unauthenticated"
Write-Host "Running: $deployCmd" -ForegroundColor Cyan

Invoke-Expression $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✅ Deployment Complete!" -ForegroundColor Green  
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service URL: https://backend-4kzqyywlqq-ew.a.run.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Check Cloud Run logs for any errors"
    Write-Host "  2. Test API endpoints"
    Write-Host "  3. Verify frontend connectivity"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  ❌ Deployment Failed!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}