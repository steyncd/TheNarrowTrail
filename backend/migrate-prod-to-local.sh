#!/bin/bash
# migrate-prod-to-local.sh - Copy production database to local development

set -e

echo "🔄 Hiking Portal - Production to Local Database Migration"
echo "========================================================"

# Production database connection details
PROD_HOST="35.202.149.98"
PROD_PORT="5432"
PROD_DB="hiking-db"
PROD_USER="postgres"
PROD_PASSWORD="!Dobby1021"

# Local database connection details
LOCAL_HOST="localhost"
LOCAL_PORT="5432"
LOCAL_DB="hiking_portal"
LOCAL_USER="postgres"
LOCAL_PASSWORD="hiking_password"

# Backup directory
BACKUP_DIR="./database-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$BACKUP_DIR/production_dump_$TIMESTAMP.sql"

echo "📋 Migration Configuration:"
echo "  Production: $PROD_HOST:$PROD_PORT/$PROD_DB"
echo "  Local:      $LOCAL_HOST:$LOCAL_PORT/$LOCAL_DB"
echo "  Dump file:  $DUMP_FILE"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Step 1: Creating production database dump..."
echo "⏳ This may take a few minutes depending on database size..."

# Create production dump with password
export PGPASSWORD="$PROD_PASSWORD"
pg_dump -h "$PROD_HOST" -p "$PROD_PORT" -U "$PROD_USER" -d "$PROD_DB" \
  --no-password \
  --verbose \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  --file="$DUMP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Production dump created successfully: $DUMP_FILE"
else
  echo "❌ Failed to create production dump"
  exit 1
fi

echo ""
echo "🔄 Step 2: Preparing local database..."

# Stop local backend if running
echo "⏹️  Stopping any running backend processes..."
pkill -f "node server.js" || true

# Drop and recreate local database using Docker
echo "🗑️  Dropping existing local database..."
docker exec hiking_portal_db psql -U postgres -c "DROP DATABASE IF EXISTS hiking_portal;"
docker exec hiking_portal_db psql -U postgres -c "CREATE DATABASE hiking_portal;"

echo "✅ Local database recreated"

echo ""
echo "🔄 Step 3: Importing production data to local database..."

# Copy dump file to Docker container
docker cp "$DUMP_FILE" hiking_portal_db:/tmp/dump.sql

# Import the dump
docker exec hiking_portal_db psql -U postgres -d hiking_portal -f /tmp/dump.sql

if [ $? -eq 0 ]; then
  echo "✅ Production data imported successfully to local database"
else
  echo "❌ Failed to import production data"
  exit 1
fi

# Clean up the dump file from container
docker exec hiking_portal_db rm /tmp/dump.sql

echo ""
echo "🔄 Step 4: Verifying migration..."

# Check table count
TABLE_COUNT=$(docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "📊 Tables imported: $TABLE_COUNT"

# Check user count
USER_COUNT=$(docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
echo "👥 Users imported: $USER_COUNT"

# Check hike count
HIKE_COUNT=$(docker exec hiking_portal_db psql -U postgres -d hiking_portal -t -c "SELECT COUNT(*) FROM hikes;" 2>/dev/null || echo "0")
echo "🥾 Hikes imported: $HIKE_COUNT"

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📁 Backup saved to: $DUMP_FILE"
echo "🚀 You can now start your local backend server with: npm start"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "  • This local database now contains production data"
echo "  • Do not commit any data dumps to version control"
echo "  • Consider anonymizing user data for development"
echo "  • Use different credentials for production vs development"