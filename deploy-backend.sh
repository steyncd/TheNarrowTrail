#!/bin/bash
# Deploy backend to Google Cloud Run

# Configuration
PROJECT_ID="hiking-portal-api-554106646136"
SERVICE_NAME="hiking-portal-api"
REGION="us-central1"

echo "🚀 Deploying backend to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Navigate to backend directory
cd backend

# Build and submit the container to Google Cloud Build
echo "📦 Building container with Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production

echo ""
echo "✅ Backend deployment complete!"
echo "🌐 Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
