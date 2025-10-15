#!/bin/bash
# Secure deployment script for frontend to Firebase Hosting
# Includes safety checks to prevent local environment leaks to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting secure frontend deployment...${NC}"
echo ""

# Get script directory and navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"
echo -e "${YELLOW}Project root: $(pwd)${NC}"

# Navigate to frontend directory
cd frontend
echo -e "${YELLOW}Frontend directory: $(pwd)${NC}"
echo ""

# Step 1: Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf build/ .firebase/ 2>/dev/null || true

# Step 2: Validate .env.production exists
echo -e "${YELLOW}🔍 Validating production environment...${NC}"
if [ ! -f ".env.production" ]; then
  echo -e "${RED}❌ ERROR: .env.production not found${NC}"
  echo "Please create .env.production with production values"
  exit 1
fi

# Verify production API URL is set correctly
if ! grep -q "REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app" .env.production; then
  echo -e "${RED}❌ ERROR: Production API URL not correctly set in .env.production${NC}"
  echo "Expected: REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app"
  exit 1
fi

echo -e "${GREEN}✅ Production environment validated${NC}"

# Step 3: Handle .env.local (backup and temporarily remove)
ENV_LOCAL_HANDLED=false
if [ -f ".env.local" ]; then
  echo -e "${YELLOW}📋 Found .env.local - backing up and temporarily removing...${NC}"
  echo -e "${YELLOW}   (This prevents local settings from overriding production)${NC}"
  cp .env.local .env.local.backup
  mv .env.local .env.local.temp
  ENV_LOCAL_HANDLED=true
fi

# Step 4: Build for production
echo ""
echo -e "${YELLOW}🏗️  Building for production...${NC}"
export NODE_ENV=production

npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed${NC}"
  
  # Restore .env.local if we moved it
  if [ "$ENV_LOCAL_HANDLED" = true ]; then
    [ -f ".env.local.temp" ] && mv .env.local.temp .env.local
    [ -f ".env.local.backup" ] && rm -f .env.local.backup
  fi
  
  exit 1
fi

# Step 5: Validate build output (no local references)
echo ""
echo -e "${YELLOW}🔍 Validating build output for local references...${NC}"

if [ -d "build/static" ]; then
  # Check for localhost
  if grep -r "localhost" build/static/ 2>/dev/null; then
    echo -e "${RED}❌ ERROR: Build contains 'localhost' references!${NC}"
    echo "Build is not safe for production deployment"
    
    # Restore .env.local
    if [ "$ENV_LOCAL_HANDLED" = true ]; then
      [ -f ".env.local.temp" ] && mv .env.local.temp .env.local
      [ -f ".env.local.backup" ] && rm -f .env.local.backup
    fi
    
    exit 1
  fi
  
  # Check for 127.0.0.1
  if grep -r "127\.0\.0\.1" build/static/ 2>/dev/null; then
    echo -e "${RED}❌ ERROR: Build contains '127.0.0.1' references!${NC}"
    echo "Build is not safe for production deployment"
    
    # Restore .env.local
    if [ "$ENV_LOCAL_HANDLED" = true ]; then
      [ -f ".env.local.temp" ] && mv .env.local.temp .env.local
      [ -f ".env.local.backup" ] && rm -f .env.local.backup
    fi
    
    exit 1
  fi
  
  # Check for local network addresses
  if grep -r "192\.168\." build/static/ 2>/dev/null; then
    echo -e "${RED}❌ ERROR: Build contains local network references!${NC}"
    echo "Build is not safe for production deployment"
    
    # Restore .env.local
    if [ "$ENV_LOCAL_HANDLED" = true ]; then
      [ -f ".env.local.temp" ] && mv .env.local.temp .env.local
      [ -f ".env.local.backup" ] && rm -f .env.local.backup
    fi
    
    exit 1
  fi
fi

echo -e "${GREEN}✅ Build validated - no local references found${NC}"

# Step 6: Deploy to Firebase
echo ""
echo -e "${YELLOW}� Deploying to Firebase Hosting...${NC}"

firebase deploy --only hosting

DEPLOY_STATUS=$?

# Step 7: Restore .env.local
if [ "$ENV_LOCAL_HANDLED" = true ]; then
  echo ""
  echo -e "${YELLOW}🔄 Restoring .env.local for development...${NC}"
  [ -f ".env.local.temp" ] && mv .env.local.temp .env.local
  [ -f ".env.local.backup" ] && rm -f .env.local.backup
fi

# Step 8: Report results
echo ""
if [ $DEPLOY_STATUS -eq 0 ]; then
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}  ✅ Deployment Successful!${NC}"
  echo -e "${GREEN}================================================${NC}"
  echo ""
  echo -e "${BLUE}🌐 Your app is live at:${NC}"
  echo -e "   • https://helloliam.web.app"
  echo -e "   • https://www.thenarrowtrail.co.za"
  echo ""
  echo -e "${BLUE}🔐 Deployment validated:${NC}"
  echo -e "   • Production environment used"
  echo -e "   • No local references in build"
  echo -e "   • Backend URL: https://backend-554106646136.europe-west1.run.app"
  echo ""
else
  echo -e "${RED}================================================${NC}"
  echo -e "${RED}  ❌ Deployment Failed!${NC}"
  echo -e "${RED}================================================${NC}"
  echo ""
  echo "Please check the error messages above"
  exit 1
fi
