#!/bin/bash
#
# Quick Production Deployment Script
# hiking-portal Permission System v1.0
#
# Usage: ./deploy-to-production.sh
#
# This script automates the deployment process
#

set -e  # Exit on error

echo "============================================"
echo "🚀 Hiking Portal - Production Deployment"
echo "Permission System v1.0"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="hiking_portal"
DB_USER="postgres"
BACKEND_PATH="/path/to/hiking-portal/backend"  # UPDATE THIS
BACKUP_DIR="$HOME/backups/$(date +%Y-%m-%d)"

# Functions
info() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Step 1: Backup Database
echo "Step 1: Creating database backup..."
mkdir -p "$BACKUP_DIR"
pg_dump -h localhost -U $DB_USER $DB_NAME > "$BACKUP_DIR/hiking_portal_backup.sql" || error "Database backup failed!"
info "Backup created at: $BACKUP_DIR/hiking_portal_backup.sql"
echo ""

# Step 2: Pull latest code
echo "Step 2: Pulling latest code..."
cd "$BACKEND_PATH"
git stash || warn "No local changes to stash"
git pull origin master || error "Git pull failed!"
info "Code updated successfully"
echo ""

# Step 3: Install dependencies
echo "Step 3: Installing dependencies..."
npm install || error "npm install failed!"
info "Dependencies installed"
echo ""

# Step 4: Run migrations
echo "Step 4: Running database migrations..."
echo "  - Migration 017: Create permission system..."
psql -h localhost -U $DB_USER -d $DB_NAME < "$BACKEND_PATH/migrations/017_create_permission_system.sql" || error "Migration 017 failed!"
info "Migration 017 completed"

echo "  - Migration 018: Add performance indexes..."
psql -h localhost -U $DB_USER -d $DB_NAME < "$BACKEND_PATH/migrations/018_add_user_management_indexes.sql" || error "Migration 018 failed!"
info "Migration 018 completed"
echo ""

# Step 5: Verify migrations
echo "Step 5: Verifying database migrations..."
PERM_COUNT=$(psql -h localhost -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM permissions;")
ROLE_COUNT=$(psql -h localhost -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM roles;")

echo "  Permissions created: $PERM_COUNT (expected: 36)"
echo "  Roles created: $ROLE_COUNT (expected: 4)"

if [ "$PERM_COUNT" -lt 35 ]; then
    error "Permission count is too low!"
fi

if [ "$ROLE_COUNT" -ne 4 ]; then
    error "Role count is incorrect!"
fi

info "Database verification passed"
echo ""

# Step 6: Restart server
echo "Step 6: Restarting backend server..."
if command -v pm2 &> /dev/null; then
    pm2 restart hiking-portal-backend || error "PM2 restart failed!"
    info "Server restarted with PM2"
elif systemctl is-active --quiet hiking-portal-backend; then
    sudo systemctl restart hiking-portal-backend || error "systemctl restart failed!"
    info "Server restarted with systemctl"
else
    warn "No process manager found. Please restart server manually."
fi
echo ""

# Step 7: Test endpoints
echo "Step 7: Testing endpoints..."
sleep 3  # Give server time to start

# Test health endpoint
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HEALTH_STATUS" == "200" ]; then
    info "Health endpoint: OK (200)"
else
    error "Health endpoint failed: $HEALTH_STATUS"
fi
echo ""

# Deployment complete
echo "============================================"
echo "🎉 Deployment Completed Successfully!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Test login: curl -X POST http://localhost:5000/api/auth/login"
echo "  2. Monitor logs: pm2 logs hiking-portal-backend"
echo "  3. Check performance: curl http://localhost:5000/api/admin/users?page=1&limit=10"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "If issues occur, run: ./rollback-deployment.sh"
echo ""
