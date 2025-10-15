# Backend Deployment Instructions

## IMPORTANT: Manual Deployment Required

**DO NOT** attempt to automatically deploy the backend. All backend deployments must be done manually by the user.

## Recent Changes - GPS Coordinates & Payment Tracking Features

### Database Migrations Required

Three new migration files have been created:

1. **Migration 010**: `migrations/010_add_gps_coordinates_remove_destination_url.sql`
   - Adds `gps_coordinates` column (VARCHAR(50)) to the `hikes` table
   - Removes `destination_url` column (duplicate of `destination_website`)

2. **Migration 011**: `migrations/011_add_hike_payments.sql`
   - Creates new `hike_payments` table for tracking user payments
   - Adds indexes for performance (hike_id, user_id, status)
   - **Important**: Payments track hike expenses (not organizational revenue)

3. **Migration 012**: `migrations/012_consolidate_attendees_to_interest.sql`
   - **IMPORTANT**: Consolidates `hike_attendees` into `hike_interest`
   - Migrates data from `hike_attendees` to `hike_interest.attendance_status`
   - Drops `hike_attendees` table (no longer needed)
   - Simplifies data model to use single table for interest/attendance tracking

### Backend Code Changes

**GPS Coordinates Feature:**
- Updated `controllers/hikeController.js`:
  - Removed all references to `destination_url`
  - Added `gps_coordinates` to all hike queries and mutations

**Payment Tracking Feature:**
- Created `controllers/paymentController.js` - Complete payment CRUD operations
- Created `routes/payments.js` - Payment API endpoints
- Updated `server.js` - Registered payment routes
- Updated `controllers/analyticsController.js`:
  - Changed `total_revenue` calculation to return 0
  - Revenue metric removed (payments are expenses, not revenue)

**Attendance Tracking Consolidation:**
- Updated `controllers/interestController.js` - Added attendance management functions
  - `confirmAttendance()` - Confirm/unconfirm attendance
  - `cancelAttendance()` - Cancel attendance
  - Updated `toggleInterest()` - Prevents removal when confirmed
- Updated `controllers/hikeController.js`:
  - Removed old `confirmAttendance()` (moved to interestController)
  - Updated `getMyHikeStatus()` - Uses `attendance_status` instead of `hike_attendees`
- Updated `routes/interest.js` - Added new attendance endpoints
- Updated `server.js` - Properly mounted interest routes

## Manual Deployment Steps

### 1. Run Database Migrations

Connect to your production database and run all three migrations in order:

```bash
# Migration 010 - GPS Coordinates
psql -h [DB_HOST] -U [DB_USER] -d hiking_portal -f migrations/010_add_gps_coordinates_remove_destination_url.sql

# Migration 011 - Payment Tracking
psql -h [DB_HOST] -U [DB_USER] -d hiking_portal -f migrations/011_add_hike_payments.sql

# Migration 012 - Consolidate Attendance Tracking (IMPORTANT: Migrates data from hike_attendees)
psql -h [DB_HOST] -U [DB_USER] -d hiking_portal -f migrations/012_consolidate_attendees_to_interest.sql
```

Or using Cloud SQL proxy:
```bash
cloud-sql-proxy [INSTANCE_CONNECTION_NAME] &

# Run all three migrations
psql -h localhost -U postgres -d hiking_portal -f migrations/010_add_gps_coordinates_remove_destination_url.sql
psql -h localhost -U postgres -d hiking_portal -f migrations/011_add_hike_payments.sql
psql -h localhost -U postgres -d hiking_portal -f migrations/012_consolidate_attendees_to_interest.sql
```

**⚠️ IMPORTANT**: Migration 012 will migrate existing data from `hike_attendees` to `hike_interest` before dropping the `hike_attendees` table. Make sure to backup your database before running this migration.

### 2. Deploy Backend to Cloud Run

```bash
cd backend
gcloud run deploy backend \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated
```

### 3. Verify Deployment

After deployment, test the following endpoints:

**GPS Coordinates:**
- GET `/api/hikes` - Should return hikes with `gps_coordinates` field
- POST `/api/hikes` - Should accept `gps_coordinates` in request body
- PUT `/api/hikes/:id` - Should accept `gps_coordinates` in request body

**Payment Tracking:**
- GET `/api/hikes/:hikeId/payments` - Get payments for a hike
- GET `/api/hikes/:hikeId/payments/stats` - Get payment statistics
- POST `/api/payments` - Record a payment (Admin only)
- POST `/api/hikes/:hikeId/payments/bulk` - Bulk create payments (Admin only)

**Attendance Tracking:**
- POST `/api/hikes/:id/interest` - Toggle interest (express/remove interest)
- POST `/api/hikes/:id/confirm` - Confirm/unconfirm attendance (toggle)
- POST `/api/hikes/:id/cancel` - Cancel attendance

### 4. Test Frontend Integration

Once backend is deployed:

**GPS Coordinates:**
1. Create/edit a hike in the admin panel
2. Add GPS coordinates (e.g., "-33.9249, 18.4241")
3. View hike details page
4. Verify map displays correct location from GPS coordinates

**Payment Tracking:**
1. Navigate to a hike details page as admin
2. Verify "Payment Tracking" section appears below packing list
3. Click "Bulk Create" to create payment records for confirmed attendees
4. Click "Add Payment" to manually add/edit payment records
5. Verify payment statistics display correctly

## Notes

- Frontend has already been deployed with both features
- Backend must be deployed for features to work end-to-end
- Both migrations are idempotent (use IF EXISTS/IF NOT EXISTS)
- Payments are tracked as expenses, not revenue
- Payment tracking only visible to authenticated users
