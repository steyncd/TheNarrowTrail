#!/bin/bash
# Deploy backend to Google Cloud Run with Secret Manager configuration

# Configuration
PROJECT_ID="helloliam"
SERVICE_NAME="backend"
REGION="europe-west1"
PROJECT_NUMBER="554106646136"

echo "🚀 Deploying backend to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Get script directory and navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"
echo "Project root: $(pwd)"

# Check if root .env files exist
if [ -f ".env.production" ]; then
  echo "✓ Found .env.production in root directory"
else
  echo "⚠️  Note: .env.production not found. Using Secret Manager for all secrets."
fi

# Navigate to backend directory
cd backend
echo "Backend directory: $(pwd)"

# Remove any 'nul' files that may have been created on Windows
echo "🧹 Cleaning up Windows artifacts..."
find . -name "nul" -type f -delete 2>/dev/null || true

# Verify secrets exist in Secret Manager
echo "🔐 Verifying Secret Manager configuration..."
REQUIRED_SECRETS=(
  "db-password"
  "jwt-secret"
  "sendgrid-key"
  "sendgrid-from-email"
  "openweather-api-key"
  "twilio-sid"
  "twilio-token"
  "twilio-whatsapp-number"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! gcloud secrets describe $secret --project=$PROJECT_ID &>/dev/null; then
    echo "❌ ERROR: Secret '$secret' not found in Secret Manager"
    echo "Please create all required secrets before deploying"
    exit 1
  fi
done

echo "✅ All required secrets found!"
echo ""

# Important migration warning
echo "⚠️  IMPORTANT: If deploying permission system updates (migrations 017/018),"
echo "   make sure you have run the migrations on the production database FIRST!"
echo "   See: GOOGLE_CLOUD_MIGRATION_GUIDE.md"
echo ""

# Deploy using source-based deployment with Secret Manager integration
echo "📦 Building and deploying with Cloud Build..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars \
NODE_ENV=production,\
DB_USER=postgres,\
DB_NAME=hiking_portal,\
DB_HOST=35.202.149.98,\
DB_PORT=5432,\
FRONTEND_URL=https://www.thenarrowtrail.co.za \
  --set-secrets \
DB_PASSWORD=db-password:latest,\
JWT_SECRET=jwt-secret:latest,\
SENDGRID_API_KEY=sendgrid-key:latest,\
SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,\
OPENWEATHER_API_KEY=openweather-api-key:latest,\
TWILIO_ACCOUNT_SID=twilio-sid:latest,\
TWILIO_AUTH_TOKEN=twilio-token:latest,\
TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --service-account ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Backend deployment complete!"
  echo "🌐 Service URL:"
  gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)'
  echo ""
  echo "🔐 Environment variables configured:"
  echo "  Database:"
  echo "    - DB_HOST: 35.202.149.98"
  echo "    - DB_PORT: 5432"
  echo "    - DB_NAME: hiking_portal"
  echo "    - DB_USER: postgres"
  echo "    - DB_PASSWORD: (from Secret Manager)"
  echo "  Authentication:"
  echo "    - JWT_SECRET: (from Secret Manager)"
  echo "  Email (SendGrid):"
  echo "    - SENDGRID_API_KEY: (from Secret Manager)"
  echo "    - SENDGRID_FROM_EMAIL: (from Secret Manager)"
  echo "  SMS/WhatsApp (Twilio):"
  echo "    - TWILIO_ACCOUNT_SID: (from Secret Manager)"
  echo "    - TWILIO_AUTH_TOKEN: (from Secret Manager)"
  echo "    - TWILIO_WHATSAPP_NUMBER: (from Secret Manager)"
  echo "  Weather:"
  echo "    - OPENWEATHER_API_KEY: (from Secret Manager)"
  echo "  Frontend:"
  echo "    - FRONTEND_URL: https://www.thenarrowtrail.co.za"
else
  echo ""
  echo "❌ Deployment failed!"
  exit 1
fi
