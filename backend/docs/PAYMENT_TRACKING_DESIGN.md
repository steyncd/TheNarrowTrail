# Payment Tracking Design

## Overview

Payment tracking uses a **separate table approach** with `hike_payments` as the authoritative source for financial records.

## Table Structure

### Primary Table: `hike_payments`
**Purpose**: Authoritative source of truth for all payment-related financial records

**Key Fields**:
- `id` - Unique payment record ID
- `hike_id`, `user_id` - Links to hike and user
- `amount` - Payment amount
- `payment_method` - cash, bank_transfer, card, other
- `payment_status` - pending, paid, partial, refunded
- `payment_date` - When payment was received
- `notes` - Optional payment notes
- `created_by` - Admin who recorded the payment
- `created_at`, `updated_at` - Timestamps

**Constraints**:
- One payment record per user per hike (UNIQUE constraint)
- Cascade delete when hike or user is deleted

### Secondary Table: `hike_interest`
**Purpose**: Attendance and interest tracking

**Payment-Related Fields** (denormalized cache):
- `payment_status` - Quick lookup for payment status
- `amount_paid` - Quick lookup for amount paid

## Design Rationale

### Why Separate Tables?

**1. Domain Separation**
- **Attendance** and **Payments** are distinct business concepts
- Different lifecycles and business rules
- A person can be interested without paying
- A person can pay even after canceling attendance

**2. Data Integrity**
- Payment records are financial transactions - should be immutable
- Changing attendance status shouldn't affect payment history
- Better audit trail for financial records

**3. Future Flexibility**
- Multiple payments per person (deposits, installments)
- Payment refunds with history
- Group payments (one person paying for multiple)
- Historical tracking even if attendance record changes

**4. Reporting & Analytics**
- Easier to query all payments across hikes
- Financial reports don't need to join through attendance
- Can track payment trends independently

### Relationship Between Tables

```
hike_interest (attendance)     hike_payments (financial)
├─ payment_status (cache)  ←──┐
├─ amount_paid (cache)     ←──┤  Optionally synced for
│                              │  quick lookups
└─ attendance_status           │
                               │
                        Source of truth
```

**Key Points**:
- `hike_payments` is the **authoritative source** for payment data
- `hike_interest.payment_status/amount_paid` are **denormalized caches** for convenience
- When querying payment status, use `hike_payments`
- The cache fields in `hike_interest` can be synced on payment updates (optional)

## Usage Patterns

### Creating a Payment Record
```javascript
// 1. User confirms attendance (hike_interest)
// 2. Admin records payment (hike_payments) - creates authoritative record
// 3. Optionally sync payment status back to hike_interest for quick lookups
```

### Querying Payment Status
```sql
-- Authoritative query (use this for reports)
SELECT * FROM hike_payments WHERE hike_id = ?

-- Quick lookup (if cache is synced)
SELECT payment_status FROM hike_interest WHERE hike_id = ? AND user_id = ?
```

### Handling Payment Changes
- Payment updates go to `hike_payments` first
- Optionally sync to `hike_interest` (non-critical)
- If sync fails, payment record is still safe

## Migration Notes

The existing `payment_status` and `amount_paid` fields in `hike_interest` (added in migration 003) can:
1. **Keep as denormalized cache** - Sync from `hike_payments` for quick lookups
2. **Deprecate** - Query `hike_payments` directly (cleaner but potentially slower)
3. **Migrate data** - Move existing payment data from `hike_interest` to `hike_payments`

**Recommended**: Keep as cache, sync on payment updates, but always use `hike_payments` as source of truth.

## API Endpoints

All payment endpoints use `hike_payments`:
- `GET /api/hikes/:hikeId/payments` - Get all payments for a hike
- `GET /api/hikes/:hikeId/payments/stats` - Get payment statistics
- `POST /api/payments` - Create/update payment record
- `DELETE /api/payments/:id` - Delete payment record
- `POST /api/hikes/:hikeId/payments/bulk` - Bulk create for confirmed attendees

## Important Notes

1. **Payments are expenses, not revenue** - These track what users pay for hikes, not organizational income
2. **One payment per user per hike** - UNIQUE constraint enforces this
3. **Audit trail** - All payment changes are logged via activity logger
4. **Admin only** - Only admins can create/modify payment records
5. **Immutability** - Consider payment records as financial documents - avoid deleting, prefer status changes
