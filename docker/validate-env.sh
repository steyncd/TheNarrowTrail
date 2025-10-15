#!/bin/bash

echo "🔍 Hiking Portal Development Environment Validation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local service_name=$1
    local url=$2
    local expected_response=$3
    
    echo -n "Checking $service_name... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check database
check_database() {
    echo -n "Checking Database Connection... "
    
    if docker exec hiking_portal_db pg_isready -U hiking_user -d hiking_portal_dev > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check docker container
check_container() {
    local container_name=$1
    echo -n "Checking $container_name container... "
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not Running${NC}"
        return 1
    fi
}

echo ""
echo "🐳 Docker Containers:"
check_container "hiking_portal_backend"
check_container "hiking_portal_frontend"
check_container "hiking_portal_db"
check_container "hiking_portal_redis"

echo ""
echo "🌐 Service Health Checks:"
check_service "Backend API" "http://localhost:5000/health"
check_service "Frontend" "http://localhost:3000"
check_database

echo ""
echo "📊 API Endpoints Test:"
check_service "Auth Endpoint" "http://localhost:5000/api/auth/status"
check_service "Analytics Endpoint" "http://localhost:5000/api/analytics/overview"
check_service "Hikes Endpoint" "http://localhost:5000/api/hikes"

echo ""
echo "🔌 Port Usage:"
echo "Frontend:        http://localhost:3000"
echo "Backend:         http://localhost:5000"
echo "Database:        localhost:5433"
echo "Redis:           localhost:6379"
echo "Nginx:           http://localhost:8080"

echo ""
echo "📝 Container Logs (last 5 lines):"
echo "Backend:"
docker logs hiking_portal_backend --tail 5 2>/dev/null || echo "  Container not running"
echo ""
echo "Frontend:"
docker logs hiking_portal_frontend --tail 5 2>/dev/null || echo "  Container not running"

echo ""
echo "🎯 Backend Integration Test:"
echo -n "Backend API Integration... "
if curl -s -f "http://localhost:5000/api/analytics/overview" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Backend analytics endpoint not ready${NC}"
fi

echo ""
echo "=================================="
echo "🎉 Validation Complete!"
echo ""
echo "If all services show ✅, your development environment is ready!"
echo "If any show ❌, check the logs and troubleshooting section in README.md"