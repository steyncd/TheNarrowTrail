# Attendance Flow - Simplified Model

## Overview

The attendance tracking has been simplified to use a **single table** (`hike_interest`) with `attendance_status` to track the full user journey.

## Database Structure

### Single Table: `hike_interest`

**Purpose**: Tracks user interest and attendance throughout the entire hike lifecycle

**Key Fields**:
- `hike_id`, `user_id` - Links to hike and user
- `attendance_status` - VARCHAR(20) with CHECK constraint
  - `'interested'` - Initial state when user expresses interest
  - `'confirmed'` - User has confirmed they will attend
  - `'cancelled'` - User cancelled their attendance
  - `'attended'` - User attended the hike (post-hike status)
- `payment_status` - Quick lookup cache (source of truth is `hike_payments`)
- `amount_paid` - Quick lookup cache (source of truth is `hike_payments`)
- `created_at`, `updated_at` - Timestamps

### Payment Table: `hike_payments`

**Purpose**: Authoritative source for payment financial records (see PAYMENT_TRACKING_DESIGN.md)

## User Journey

```
┌─────────────┐
│   Express   │  User clicks "I'm Interested"
│  Interest   │  → INSERT hike_interest (attendance_status='interested')
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Confirm   │  User clicks "Confirm Attendance"
│ Attendance  │  → UPDATE attendance_status='confirmed'
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│    Cancel   │    │   Payment   │  Admin tracks payment
│ Attendance  │    │   Tracking  │  → INSERT/UPDATE hike_payments
└─────────────┘    └─────────────┘
       │                  │
       │                  ▼
       │           ┌─────────────┐
       │           │   Payment   │  payment_status: pending/paid/partial
       │           │   Complete  │
       │           └─────────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Hike Day  │────│   Attended  │  Post-hike
│             │    │             │  → UPDATE attendance_status='attended'
└─────────────┘    └─────────────┘
```

## API Endpoints

### For Users (Self-Service)

**1. Express Interest**
```
POST /api/hikes/:id/interest
```
- Creates `hike_interest` record with `attendance_status='interested'`
- Toggle endpoint: if already interested, removes record
- Cannot remove if already confirmed (returns error)

**2. Confirm Attendance**
```
POST /api/hikes/:id/confirm
```
- Requires user to be interested first
- Updates `attendance_status='confirmed'`
- Toggle endpoint: if already confirmed, reverts to 'interested'
- Sends notification to admins

**3. Cancel Attendance**
```
POST /api/hikes/:id/cancel
```
- Updates `attendance_status='cancelled'`
- User can re-express interest later if needed

### For Admins

**4. Track Payments**
```
POST /api/payments
```
- Creates/updates record in `hike_payments` table
- See PAYMENT_TRACKING_DESIGN.md for details

## Status Transitions

### Valid Transitions

```
NULL → interested        (User expresses interest)
interested → confirmed   (User confirms attendance)
interested → NULL        (User removes interest)
confirmed → interested   (User unconfirms)
confirmed → cancelled    (User cancels)
cancelled → interested   (User re-expresses interest)
confirmed → attended     (After hike, admin marks)
```

### Invalid Transitions (Prevented by Logic)

- `interested → attended` (must confirm first)
- `confirmed → NULL` (must unconfirm or cancel first)

## Key Business Rules

1. **Must express interest before confirming**
   - Prevents users from confirming without showing initial interest
   - Ensures we track the full journey

2. **Cannot remove interest after confirming**
   - Users must explicitly unconfirm or cancel
   - Prevents accidental removal of confirmed attendees

3. **Payment tracking is separate**
   - Payments tracked in `hike_payments` (source of truth)
   - `payment_status` in `hike_interest` is a denormalized cache
   - Enables payment history and audit trail

4. **Status is sticky**
   - Once a record exists, it persists through status changes
   - Provides complete history of user's journey with the hike

## Queries

### Get Interested Users
```sql
SELECT u.* FROM users u
JOIN hike_interest hi ON u.id = hi.user_id
WHERE hi.hike_id = ?
  AND hi.attendance_status = 'interested'
```

### Get Confirmed Attendees
```sql
SELECT u.* FROM users u
JOIN hike_interest hi ON u.id = hi.user_id
WHERE hi.hike_id = ?
  AND hi.attendance_status = 'confirmed'
```

### Get All Engaged Users (Interested + Confirmed)
```sql
SELECT u.*, hi.attendance_status FROM users u
JOIN hike_interest hi ON u.id = hi.user_id
WHERE hi.hike_id = ?
  AND hi.attendance_status IN ('interested', 'confirmed')
```

### Get Confirmed Users Who Haven't Paid
```sql
SELECT u.*, hi.attendance_status,
       COALESCE(hp.payment_status, 'pending') as payment_status
FROM users u
JOIN hike_interest hi ON u.id = hi.user_id
LEFT JOIN hike_payments hp ON hi.hike_id = hp.hike_id
  AND hi.user_id = hp.user_id
WHERE hi.hike_id = ?
  AND hi.attendance_status = 'confirmed'
  AND (hp.payment_status IS NULL OR hp.payment_status != 'paid')
```

## Migration Notes

### Removed Tables
- `hike_attendees` - **DROPPED** in migration 012
- Data migrated to `hike_interest` before drop

### Why This is Better

**Before** (Complex):
- `hike_interest` - For expressing interest
- `hike_attendees` - For confirmed attendance
- `hike_payments` - For payment tracking
- Duplication of payment data in multiple places
- Complex joins and sync issues

**After** (Simple):
- `hike_interest` - Single source for interest/attendance status
- `hike_payments` - Authoritative source for payment records
- Clear separation of concerns
- Simple queries, no sync issues

## Frontend Integration

The frontend should:
1. Show "Express Interest" button when user not interested
2. Show "Confirm Attendance" button when interested
3. Show "Cancel Attendance" option when confirmed
4. Display payment status from payment tracking section (separate component)
5. Use `attendance_status` field to determine button states

Status indicators:
- ❤️ Interested
- ✅ Confirmed
- ❌ Cancelled
- 🎉 Attended
