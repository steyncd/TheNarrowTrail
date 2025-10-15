// controllers/expenseController.js
const pool = require('../config/database');

// Get all expenses for a hike
exports.getHikeExpenses = async (req, res) => {
  const { hikeId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        e.*,
        u.name as paid_by_name,
        c.name as created_by_name
      FROM hike_expenses e
      LEFT JOIN users u ON e.paid_by = u.id
      LEFT JOIN users c ON e.created_by = c.id
      WHERE e.hike_id = $1
      ORDER BY e.expense_date DESC, e.created_at DESC`,
      [hikeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hike expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Get expense summary for a hike
exports.getHikeExpenseSummary = async (req, res) => {
  const { hikeId } = req.params;

  try {
    // First get the basic summary
    const summaryResult = await pool.query(
      `SELECT
        COALESCE(SUM(amount), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as paid_expenses,
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END), 0) as pending_expenses,
        COALESCE(SUM(CASE WHEN payment_status = 'reimbursed' THEN amount ELSE 0 END), 0) as reimbursed_expenses,
        COUNT(*) as expense_count
      FROM hike_expenses
      WHERE hike_id = $1`,
      [hikeId]
    );

    // Then get the category breakdown
    const categoryResult = await pool.query(
      `SELECT 
        category,
        SUM(amount) as amount
      FROM hike_expenses
      WHERE hike_id = $1 AND category IS NOT NULL
      GROUP BY category`,
      [hikeId]
    );

    // Combine the results
    const summary = summaryResult.rows[0];
    summary.category_breakdown = categoryResult.rows;

    res.json(summary);
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({ error: 'Failed to fetch expense summary' });
  }
};

// Add a new expense
exports.addExpense = async (req, res) => {
  const {
    hikeId,
    category,
    description,
    amount,
    paidBy,
    paymentMethod,
    paymentStatus,
    expenseDate,
    receiptUrl,
    notes
  } = req.body;

  const createdBy = req.user.id;

  // Validation
  if (!hikeId || !category || !description || !amount) {
    return res.status(400).json({
      error: 'Missing required fields: hikeId, category, description, amount'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  const validCategories = ['food', 'travel', 'admin', 'equipment', 'venue', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO hike_expenses
        (hike_id, category, description, amount, paid_by, payment_method,
         payment_status, expense_date, receipt_url, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        hikeId,
        category,
        description,
        amount,
        paidBy || null,
        paymentMethod || 'cash',
        paymentStatus || 'pending',
        expenseDate || null,
        receiptUrl || null,
        notes || null,
        createdBy
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  const { expenseId } = req.params;
  const {
    category,
    description,
    amount,
    paidBy,
    paymentMethod,
    paymentStatus,
    expenseDate,
    receiptUrl,
    notes
  } = req.body;

  // Validation
  if (amount !== undefined && amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  const validCategories = ['food', 'travel', 'admin', 'equipment', 'venue', 'other'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
    });
  }

  try {
    const result = await pool.query(
      `UPDATE hike_expenses
      SET
        category = COALESCE($1, category),
        description = COALESCE($2, description),
        amount = COALESCE($3, amount),
        paid_by = COALESCE($4, paid_by),
        payment_method = COALESCE($5, payment_method),
        payment_status = COALESCE($6, payment_status),
        expense_date = COALESCE($7, expense_date),
        receipt_url = COALESCE($8, receipt_url),
        notes = COALESCE($9, notes),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [
        category,
        description,
        amount,
        paidBy,
        paymentMethod,
        paymentStatus,
        expenseDate,
        receiptUrl,
        notes,
        expenseId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  const { expenseId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM hike_expenses WHERE id = $1 RETURNING *',
      [expenseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully', expense: result.rows[0] });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// Get expenses by category for a hike
exports.getExpensesByCategory = async (req, res) => {
  const { hikeId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount
      FROM hike_expenses
      WHERE hike_id = $1
      GROUP BY category
      ORDER BY total_amount DESC`,
      [hikeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    res.status(500).json({ error: 'Failed to fetch expense breakdown' });
  }
};
