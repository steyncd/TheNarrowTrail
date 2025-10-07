# Database Migrations

This folder contains SQL migration scripts that should be applied to the database in sequence.

## Migration List

| # | File | Description | Status |
|---|------|-------------|--------|
| 001 | `001_add_notification_log.sql` | Creates notification_log table for tracking notifications | Required |
| 002 | `002_add_hike_attendees.sql` | Creates hike_attendees table and adds status to hikes | Required |
| 003 | `003_add_attendance_status_to_hike_interest.sql` | Adds attendance_status, payment_status, amount_paid to hike_interest | **Critical** |

## How to Apply Migrations

### Using psql locally:
```bash
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f backend/migrations/001_add_notification_log.sql
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f backend/migrations/002_add_hike_attendees.sql
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f backend/migrations/003_add_attendance_status_to_hike_interest.sql
```

### Using Cloud SQL Proxy:
```bash
# Start proxy in another terminal
cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432

# Apply migrations
psql -h 127.0.0.1 -U YOUR_DB_USER -d YOUR_DB_NAME -f backend/migrations/001_add_notification_log.sql
psql -h 127.0.0.1 -U YOUR_DB_USER -d YOUR_DB_NAME -f backend/migrations/002_add_hike_attendees.sql
psql -h 127.0.0.1 -U YOUR_DB_USER -d YOUR_DB_NAME -f backend/migrations/003_add_attendance_status_to_hike_interest.sql
```

### Apply all migrations at once:
```bash
for file in backend/migrations/*.sql; do
  echo "Applying $file..."
  psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f "$file"
done
```

## Notes

- All migrations are designed to be idempotent (safe to run multiple times)
- Migration 003 is critical - the application will have errors without it
- Always backup your database before running migrations
- Migrations should be applied in numerical order
