#!/bin/bash

# Backend Deployment Script for The Narrow Trail Hiking Portal
# This script deploys the backend to Google Cloud Run

set -e  # Exit on error

echo "================================================"
echo "  Deploying Backend to Google Cloud Run"
echo "================================================"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed or not in PATH"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Current directory: $(pwd)"
echo ""

# Confirm deployment
echo "⚠️  You are about to deploy the backend to Cloud Run."
echo "Service: backend"
echo "Region: europe-west1"
echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Starting deployment..."
echo ""

# Deploy to Cloud Run
gcloud run deploy backend \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300

echo ""
echo "================================================"
echo "  ✅ Deployment Complete!"
echo "================================================"
echo ""
echo "Service URL: https://backend-4kzqyywlqq-ew.a.run.app"
echo ""
echo "Next steps:"
echo "  1. Check Cloud Run logs for any errors"
echo "  2. Test email functionality by triggering a notification"
echo "  3. Verify new email templates are being sent"
echo ""
