#!/bin/bash

# Development startup script for hiking portal

echo "🏔️  Starting Hiking Portal Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env.dev exists
if [ ! -f .env.dev ]; then
    echo "❌ .env.dev file not found. Please create it from template"
    exit 1
fi

# Load environment variables
export $(cat .env.dev | grep -v '#' | xargs)

echo "📋 Starting services..."

# Start the development environment
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
echo "🗄️  Waiting for database..."
until docker exec hiking_portal_db pg_isready -U ${HIKING_POSTGRES_USER:-hiking_user} -d ${HIKING_POSTGRES_DB:-hiking_portal_dev} > /dev/null 2>&1; do
    sleep 2
done

# Wait for backend to be ready
echo "🚀 Waiting for backend..."
until curl -f http://localhost:5000/health > /dev/null 2>&1; do
    sleep 2
done

# Run database migrations
echo "🔄 Running database migrations..."
docker exec hiking_portal_backend npm run migrate

echo "✅ Development environment is ready!"
echo ""
echo "🌟 Available Services:"
echo "   Frontend:        http://localhost:3000"
echo "   Backend API:     http://localhost:5000"
echo "   Backend Health:  http://localhost:5000/health"
echo "   Nginx Proxy:     http://localhost:8080"
echo "   Database:        localhost:5433"
echo "   Redis:           localhost:6379"
echo ""
echo "📊 Useful Commands:"
echo "   View logs:       docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services:   docker-compose -f docker-compose.dev.yml down"
echo "   Restart service: docker-compose -f docker-compose.dev.yml restart <service>"
echo ""
echo "🐛 Debugging:"
echo "   Backend logs:    docker logs hiking_portal_backend -f"
echo "   Frontend logs:   docker logs hiking_portal_frontend -f"
echo "   Database logs:   docker logs hiking_portal_db -f"