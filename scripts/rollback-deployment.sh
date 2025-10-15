#!/bin/bash
#
# Rollback Script for Production Deployment
# Use this if the deployment encounters critical issues
#
# Usage: ./rollback-deployment.sh <backup-date>
# Example: ./rollback-deployment.sh 2025-10-14
#

set -e

echo "============================================"
echo "⚠️  ROLLBACK - Permission System Deployment"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DB_NAME="hiking_portal"
DB_USER="postgres"
BACKEND_PATH="/path/to/hiking-portal/backend"  # UPDATE THIS
BACKUP_DATE=${1:-$(date +%Y-%m-%d)}
BACKUP_FILE="$HOME/backups/$BACKUP_DATE/hiking_portal_backup.sql"

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Confirm rollback
warn "This will rollback the permission system deployment!"
warn "Backup date: $BACKUP_DATE"
warn "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Rollback cancelled."
    exit 0
fi
echo ""

# Step 1: Stop server
echo "Step 1: Stopping server..."
if command -v pm2 &> /dev/null; then
    pm2 stop hiking-portal-backend || warn "PM2 stop failed"
    info "Server stopped with PM2"
elif systemctl is-active --quiet hiking-portal-backend; then
    sudo systemctl stop hiking-portal-backend || warn "systemctl stop failed"
    info "Server stopped with systemctl"
else
    warn "No process manager found. Ensure server is stopped manually."
fi
echo ""

# Step 2: Drop new tables
echo "Step 2: Removing permission system tables..."
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS user_roles CASCADE;" || warn "Failed to drop user_roles"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS role_permissions CASCADE;" || warn "Failed to drop role_permissions"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS roles CASCADE;" || warn "Failed to drop roles"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS permissions CASCADE;" || warn "Failed to drop permissions"
info "Permission tables removed"
echo ""

# Step 3: Drop new indexes
echo "Step 3: Removing new indexes..."
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_users_name;" || warn "idx_users_name not found"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_users_created_at;" || warn "idx_users_created_at not found"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_users_search_text;" || warn "idx_users_search_text not found"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_users_status_role;" || warn "idx_users_status_role not found"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_users_email_verified;" || warn "idx_users_email_verified not found"
psql -h localhost -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_users_consent_status;" || warn "idx_users_consent_status not found"
info "Indexes removed"
echo ""

# Step 4: Revert code
echo "Step 4: Reverting code..."
cd "$BACKEND_PATH"
git reset --hard HEAD~2 || error "Git reset failed!"
npm install || error "npm install failed!"
info "Code reverted to previous version"
echo ""

# Step 5: Restart server
echo "Step 5: Restarting server..."
if command -v pm2 &> /dev/null; then
    pm2 restart hiking-portal-backend || error "PM2 restart failed!"
    info "Server restarted with PM2"
elif systemctl is-active --quiet hiking-portal-backend; then
    sudo systemctl start hiking-portal-backend || error "systemctl start failed!"
    info "Server restarted with systemctl"
else
    warn "No process manager found. Please start server manually."
fi
echo ""

# Step 6: Verify rollback
echo "Step 6: Verifying rollback..."
sleep 3

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HEALTH_STATUS" == "200" ]; then
    info "Health endpoint: OK (200)"
else
    error "Health endpoint failed: $HEALTH_STATUS"
fi
echo ""

# Complete
echo "============================================"
echo "✅ Rollback Completed Successfully"
echo "============================================"
echo ""
echo "System has been restored to previous state."
echo ""
echo "Next steps:"
echo "  1. Test old endpoints still work"
echo "  2. Review what went wrong"
echo "  3. Fix issues before re-deploying"
echo ""
