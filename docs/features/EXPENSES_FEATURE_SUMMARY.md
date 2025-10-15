# Hike Expenses Feature - Implementation Summary

## Overview

Added comprehensive expense tracking to the Payments & Finance system, allowing admins to track ad hoc costs for hikes beyond attendee payments.

## Features Added

### Expense Categories

Track expenses across 6 categories:
- 🍽️ **Food & Catering** - Meals, snacks, catering services
- 🚗 **Travel & Transport** - Shuttle services, fuel, vehicle hire
- 📋 **Admin & Fees** - Park fees, permits, insurance
- 🎒 **Equipment & Gear** - Rental equipment, supplies
- 🏕️ **Venue & Accommodation** - Camping fees, lodging
- 💳 **Other** - Miscellaneous expenses

### Expense Tracking

Each expense includes:
- **Category** - From the predefined categories above
- **Description** - What the expense was for
- **Amount** - Cost in Rands (R)
- **Payment Status** - Pending, Paid, or Reimbursed
- **Payment Method** - Cash, Bank Transfer, Card, Other
- **Paid By** - Which user/admin paid this expense
- **Expense Date** - When the expense was incurred
- **Receipt URL** - Optional link to receipt or proof
- **Notes** - Additional information

### Summary Statistics

The expense summary shows:
- **Total Expenses** - Sum of all expenses for the hike
- **Paid** - Amount already paid
- **Pending** - Amount still outstanding
- **Count** - Number of expense records

## Implementation Details

### Database Changes

**Migration:** `012_add_hike_expenses.sql`

Created `hike_expenses` table with:
- Foreign keys to hikes and users
- Category, description, amount fields
- Payment tracking (status, method, date)
- Optional receipt URL
- Audit fields (created_by, created_at, updated_at)
- Performance indexes

Created `hike_expense_summary` view for quick reporting.

### Backend API

**Controller:** `backend/controllers/expenseController.js`
**Routes:** `backend/routes/expenses.js`

Endpoints:
- `GET /api/expenses/hike/:hikeId` - Get all expenses for a hike
- `GET /api/expenses/hike/:hikeId/summary` - Get expense summary
- `GET /api/expenses/hike/:hikeId/by-category` - Get breakdown by category
- `POST /api/expenses` - Add new expense (admin only)
- `PUT /api/expenses/:expenseId` - Update expense (admin only)
- `DELETE /api/expenses/:expenseId` - Delete expense (admin only)

### Frontend Components

**Component:** `frontend/src/components/payments/ExpensesSection.js`

Features:
- Expense table with category icons
- Add/Edit expense modal with full form
- Delete with confirmation
- Summary cards showing totals
- Status badges (Pending, Paid, Reimbursed)
- Responsive design with dark mode support

**Updated:** `frontend/src/pages/PaymentDetailsPage.js`
- Added ExpensesSection below PaymentsSection
- Updated page title to "Payments & Expenses"

### API Service

**Updated:** `frontend/src/services/api.js`

Added expense methods:
- `getHikeExpenses(hikeId, token)`
- `getHikeExpenseSummary(hikeId, token)`
- `getExpensesByCategory(hikeId, token)`
- `addExpense(expenseData, token)`
- `updateExpense(expenseId, expenseData, token)`
- `deleteExpense(expenseId, token)`

## Usage

### For Admins

1. **Navigate to Payments & Finance**
   - Go to Admin → Manage Hikes
   - Click "Payments & Finance" tab
   - Click "Details" on any hike

2. **Add an Expense**
   - Scroll to "Hike Expenses" section
   - Click "Add Expense" button
   - Fill in the form:
     - Select category
     - Enter description and amount
     - Set payment status and method
     - Optionally select who paid
     - Add expense date and receipt URL
     - Add notes if needed
   - Click "Add Expense"

3. **Edit an Expense**
   - Click the edit (pencil) icon on any expense
   - Update fields as needed
   - Click "Update Expense"

4. **Delete an Expense**
   - Click the delete (trash) icon
   - Confirm deletion

5. **View Summary**
   - See total expenses, paid, pending amounts
   - View expense count
   - Track payment status across all expenses

### Use Cases

**Example 1: Food Expenses**
```
Category: Food & Catering
Description: Lunch catering for 25 people
Amount: R 2,500
Status: Paid
Method: Bank Transfer
Paid By: Admin User
Date: 2025-10-15
```

**Example 2: Transport**
```
Category: Travel & Transport
Description: Shuttle service to trailhead
Amount: R 1,800
Status: Pending
Method: Cash
Paid By: Guide
Date: 2025-10-15
```

**Example 3: Admin Fees**
```
Category: Admin & Fees
Description: National Park entrance fees
Amount: R 450
Status: Paid
Method: Card
Date: 2025-10-15
Receipt URL: https://...
```

## Financial Overview

With both payments and expenses tracking, you can now see:

### Income (Attendee Payments)
- Who paid
- How much collected
- Outstanding payments
- Payment methods

### Expenses (Hike Costs)
- What was spent
- Category breakdown
- Who paid expenses
- Pending reimbursements

### Net Position
Calculate: Total Attendee Payments - Total Expenses = Net Profit/Loss

## Database Schema

```sql
CREATE TABLE hike_expenses (
  id SERIAL PRIMARY KEY,
  hike_id INTEGER NOT NULL REFERENCES hikes(id),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid_by INTEGER REFERENCES users(id),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  expense_date TIMESTAMP,
  receipt_url TEXT,
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security

- **Authentication Required** - All endpoints require valid JWT token
- **Admin Only** - Create, Update, Delete operations restricted to admins
- **Read Access** - All authenticated users can view expenses for hikes they're attending
- **Audit Trail** - created_by field tracks who added each expense

## Files Created/Modified

### Created
- `backend/migrations/012_add_hike_expenses.sql` - Database migration
- `backend/controllers/expenseController.js` - Expense business logic
- `backend/routes/expenses.js` - API routes
- `backend/tools/run-migration-012.js` - Migration runner
- `frontend/src/components/payments/ExpensesSection.js` - Expense UI component

### Modified
- `backend/server.js` - Added expense routes
- `frontend/src/services/api.js` - Added expense API methods
- `frontend/src/pages/PaymentDetailsPage.js` - Integrated expenses section

## Testing

To test the feature:

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to the feature:**
   - Log in as admin
   - Go to Admin → Manage Hikes
   - Click "Payments & Finance" tab
   - Click "Details" on any hike
   - Scroll down to "Hike Expenses" section

4. **Test CRUD operations:**
   - Add a new expense with various categories
   - Edit an existing expense
   - Delete an expense
   - View the summary updates

## Future Enhancements

Possible additions:
- Export expenses to CSV/Excel
- Attach receipt images directly (file upload)
- Expense approval workflow
- Budget vs actual tracking
- Category-wise budget limits
- Expense reimbursement tracking
- Split expenses across multiple payers
- Recurring expense templates

## Notes

- All amounts are in South African Rands (R)
- Expenses are tracked per hike
- Multiple users can have expenses for the same hike
- Payment status tracks if expense has been paid/reimbursed
- Receipt URLs can link to cloud storage (Google Drive, Dropbox, etc.)

---

**Feature Status:** ✅ Complete and Ready for Use
**Migration Status:** ✅ Run Successfully
**Testing Status:** ✅ Ready for Testing

**Date:** 2025-10-13
**Version:** 1.0
