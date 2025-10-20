# Create Weather API Secrets in Google Secret Manager
# Run this script BEFORE deploying the backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Weather API Secrets Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for API keys
Write-Host "You need to provide API keys for two weather providers:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Visual Crossing (Primary Provider)" -ForegroundColor White
Write-Host "   Sign up at: https://www.visualcrossing.com/" -ForegroundColor Gray
Write-Host "   Free tier: 1,000 calls/day" -ForegroundColor Gray
Write-Host ""
Write-Host "2. WeatherAPI.com (Fallback Provider)" -ForegroundColor White
Write-Host "   Sign up at: https://www.weatherapi.com/" -ForegroundColor Gray
Write-Host "   Free tier: 1M calls/month" -ForegroundColor Gray
Write-Host ""

# Check if secrets already exist
Write-Host "Checking if secrets already exist..." -ForegroundColor Yellow
$existingSecrets = gcloud secrets list --project=helloliam --format="value(name)" 2>$null

$visualCrossingExists = $existingSecrets -contains "visualcrossing-api-key"
$weatherApiExists = $existingSecrets -contains "weatherapi-key"

if ($visualCrossingExists) {
    Write-Host "✓ visualcrossing-api-key already exists" -ForegroundColor Green
} else {
    Write-Host "✗ visualcrossing-api-key does NOT exist" -ForegroundColor Red
}

if ($weatherApiExists) {
    Write-Host "✓ weatherapi-key already exists" -ForegroundColor Green
} else {
    Write-Host "✗ weatherapi-key does NOT exist" -ForegroundColor Red
}

Write-Host ""

# Ask if user wants to create/update secrets
$createSecrets = Read-Host "Do you want to create/update these secrets now? (y/n)"

if ($createSecrets -ne 'y') {
    Write-Host ""
    Write-Host "Secrets setup cancelled." -ForegroundColor Yellow
    Write-Host "You can run this script again when you're ready." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Secrets" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Visual Crossing API Key
Write-Host "Enter your Visual Crossing API key:" -ForegroundColor Yellow
Write-Host "(The key will be hidden as you type)" -ForegroundColor Gray
$visualCrossingKey = Read-Host -AsSecureString
$visualCrossingKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($visualCrossingKey)
)

# WeatherAPI.com Key
Write-Host ""
Write-Host "Enter your WeatherAPI.com API key:" -ForegroundColor Yellow
Write-Host "(The key will be hidden as you type)" -ForegroundColor Gray
$weatherApiKey = Read-Host -AsSecureString
$weatherApiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($weatherApiKey)
)

Write-Host ""
Write-Host "Creating secrets in Google Secret Manager..." -ForegroundColor Yellow
Write-Host ""

# Create or update Visual Crossing secret
try {
    if ($visualCrossingExists) {
        Write-Host "Updating visualcrossing-api-key..." -ForegroundColor Yellow
        echo $visualCrossingKeyPlain | gcloud secrets versions add visualcrossing-api-key `
            --data-file=- `
            --project=helloliam
        Write-Host "✓ Updated visualcrossing-api-key" -ForegroundColor Green
    } else {
        Write-Host "Creating visualcrossing-api-key..." -ForegroundColor Yellow
        echo $visualCrossingKeyPlain | gcloud secrets create visualcrossing-api-key `
            --data-file=- `
            --project=helloliam `
            --replication-policy=automatic
        Write-Host "✓ Created visualcrossing-api-key" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed to create/update visualcrossing-api-key" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Create or update WeatherAPI secret
try {
    if ($weatherApiExists) {
        Write-Host "Updating weatherapi-key..." -ForegroundColor Yellow
        echo $weatherApiKeyPlain | gcloud secrets versions add weatherapi-key `
            --data-file=- `
            --project=helloliam
        Write-Host "✓ Updated weatherapi-key" -ForegroundColor Green
    } else {
        Write-Host "Creating weatherapi-key..." -ForegroundColor Yellow
        echo $weatherApiKeyPlain | gcloud secrets create weatherapi-key `
            --data-file=- `
            --project=helloliam `
            --replication-policy=automatic
        Write-Host "✓ Created weatherapi-key" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed to create/update weatherapi-key" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Granting access to Cloud Run service account..." -ForegroundColor Yellow
Write-Host ""

# Grant access to service account
try {
    gcloud secrets add-iam-policy-binding visualcrossing-api-key `
        --member="serviceAccount:554106646136-compute@developer.gserviceaccount.com" `
        --role="roles/secretmanager.secretAccessor" `
        --project=helloliam `
        --quiet 2>$null
    Write-Host "✓ Granted access to visualcrossing-api-key" -ForegroundColor Green
} catch {
    Write-Host "Note: IAM policy may already exist (this is OK)" -ForegroundColor Gray
}

try {
    gcloud secrets add-iam-policy-binding weatherapi-key `
        --member="serviceAccount:554106646136-compute@developer.gserviceaccount.com" `
        --role="roles/secretmanager.secretAccessor" `
        --project=helloliam `
        --quiet 2>$null
    Write-Host "✓ Granted access to weatherapi-key" -ForegroundColor Green
} catch {
    Write-Host "Note: IAM policy may already exist (this is OK)" -ForegroundColor Gray
}

# Clear sensitive variables
$visualCrossingKeyPlain = $null
$weatherApiKeyPlain = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Secrets Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifying secrets..." -ForegroundColor Yellow
gcloud secrets list --project=helloliam --filter="name:visualcrossing OR name:weatherapi" --format="table(name,createTime)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Build the Docker image: gcloud builds submit" -ForegroundColor White
Write-Host "  2. Deploy to Cloud Run: .\deploy-to-cloud-run-updated.ps1" -ForegroundColor White
Write-Host ""
