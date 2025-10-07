#!/bin/bash
# Deploy frontend to Firebase Hosting

echo "🚀 Deploying frontend to Firebase Hosting..."
echo ""

# Navigate to frontend directory
cd frontend

# Build the React app
echo "📦 Building React app..."
npm run build

# Deploy to Firebase
echo "🚢 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Frontend deployment complete!"
echo "🌐 Your app is now live on Firebase Hosting"
