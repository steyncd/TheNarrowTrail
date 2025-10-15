#!/bin/bash

# Development stop script for hiking portal

echo "🛑 Stopping Hiking Portal Development Environment..."

# Stop all services
docker-compose -f docker-compose.dev.yml down

echo "🧹 Cleaning up..."

# Optional: Remove volumes (uncomment if you want to reset data)
# echo "⚠️  Removing all data volumes..."
# docker-compose -f docker-compose.dev.yml down -v

# Optional: Remove images (uncomment for complete cleanup)
# echo "🗑️  Removing development images..."
# docker image prune -f

echo "✅ Development environment stopped!"
echo ""
echo "💡 To restart: ./docker/start-dev.sh"
echo "🗑️  To clean all data: docker-compose -f docker-compose.dev.yml down -v"