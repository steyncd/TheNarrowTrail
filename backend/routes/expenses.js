// routes/expenses.js - Hike expense management routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const expenseController = require('../controllers/expenseController');

// All routes require authentication
router.use(authenticateToken);

// Get all expenses for a hike
router.get('/hike/:hikeId', expenseController.getHikeExpenses);

// Get expense summary for a hike
router.get('/hike/:hikeId/summary', expenseController.getHikeExpenseSummary);

// Get expenses by category for a hike
router.get('/hike/:hikeId/by-category', expenseController.getExpensesByCategory);

// Expense management routes - require attendance management permission
router.post('/', requirePermission('hikes.manage_attendance'), expenseController.addExpense);
router.put('/:expenseId', requirePermission('hikes.manage_attendance'), expenseController.updateExpense);
router.delete('/:expenseId', requirePermission('hikes.manage_attendance'), expenseController.deleteExpense);

module.exports = router;
