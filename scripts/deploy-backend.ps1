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
$DB_HOST = "35.202.149.98"

Write-Host "🚀 Deploying backend to Google Cloud Run..." -ForegroundColor Green
Write-Host "Project: $PROJECT_ID"
Write-Host "Service: $SERVICE_NAME" 
Write-Host "Region: $REGION"
Write-Host ""

# Get script directory and ensure we're in project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot
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

# Verify secrets exist in Secret Manager
Write-Host "🔐 Verifying Secret Manager configuration..." -ForegroundColor Cyan
$REQUIRED_SECRETS = @(
  "db-password",
  "jwt-secret",
  "sendgrid-key",
  "sendgrid-from-email",
  "openweather-api-key",
  "twilio-sid",
  "twilio-token",
  "twilio-whatsapp-number"
)

$secretsOK = $true
foreach ($secret in $REQUIRED_SECRETS) {
  $result = gcloud secrets describe $secret --project=$PROJECT_ID 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Secret '$secret' not found in Secret Manager" -ForegroundColor Red
    $secretsOK = $false
  }
}

if (-not $secretsOK) {
    Write-Host "Please create all required secrets before deploying" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All required secrets found!" -ForegroundColor Green
Write-Host ""

# Important migration warning
Write-Host "⚠️  IMPORTANT: If deploying permission system updates (migrations 017/018)," -ForegroundColor Yellow
Write-Host "   make sure you have run the migrations on the production database FIRST!" -ForegroundColor Yellow
Write-Host "   See: GOOGLE_CLOUD_MIGRATION_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

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

# Deploy to Cloud Run with full configuration
Write-Host "📦 Building and deploying with Cloud Build..." -ForegroundColor Cyan

gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --project $PROJECT_ID `
  --allow-unauthenticated `
  --set-env-vars `
    "NODE_ENV=production,DB_USER=postgres,DB_NAME=hiking_portal,DB_HOST=$DB_HOST,DB_PORT=5432,FRONTEND_URL=https://www.thenarrowtrail.co.za" `
  --set-secrets `
    "DB_PASSWORD=db-password:latest,JWT_SECRET=jwt-secret:latest,SENDGRID_API_KEY=sendgrid-key:latest,SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,OPENWEATHER_API_KEY=openweather-api-key:latest,TWILIO_ACCOUNT_SID=twilio-sid:latest,TWILIO_AUTH_TOKEN=twilio-token:latest,TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest" `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10 `
  --min-instances 0 `
  --service-account "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✅ Deployment Complete!" -ForegroundColor Green  
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Service URL: https://backend-554106646136.europe-west1.run.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔐 Environment variables configured:" -ForegroundColor Cyan
    Write-Host "  Database:" -ForegroundColor White
    Write-Host "    - DB_HOST: $DB_HOST" -ForegroundColor Gray
    Write-Host "    - DB_PORT: 5432" -ForegroundColor Gray
    Write-Host "    - DB_NAME: hiking_portal" -ForegroundColor Gray
    Write-Host "    - DB_USER: postgres" -ForegroundColor Gray
    Write-Host "    - DB_PASSWORD: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "  Authentication:" -ForegroundColor White
    Write-Host "    - JWT_SECRET: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "  Email (SendGrid):" -ForegroundColor White
    Write-Host "    - SENDGRID_API_KEY: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "    - SENDGRID_FROM_EMAIL: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "  SMS/WhatsApp (Twilio):" -ForegroundColor White
    Write-Host "    - TWILIO_ACCOUNT_SID: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "    - TWILIO_AUTH_TOKEN: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "    - TWILIO_WHATSAPP_NUMBER: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "  Weather:" -ForegroundColor White
    Write-Host "    - OPENWEATHER_API_KEY: (from Secret Manager)" -ForegroundColor Gray
    Write-Host "  Frontend:" -ForegroundColor White
    Write-Host "    - FRONTEND_URL: https://www.thenarrowtrail.co.za" -ForegroundColor Gray
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