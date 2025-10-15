import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Plus, Edit2, Trash2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Catering', icon: '🍽️' },
  { value: 'travel', label: 'Travel & Transport', icon: '🚗' },
  { value: 'admin', label: 'Admin & Fees', icon: '📋' },
  { value: 'equipment', label: 'Equipment & Gear', icon: '🎒' },
  { value: 'venue', label: 'Venue & Accommodation', icon: '🏕️' },
  { value: 'other', label: 'Other', icon: '💳' }
];

function ExpensesSection({ hikeId, isAdmin }) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    category: 'food',
    description: '',
    amount: 0,
    paidBy: '',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    expenseDate: '',
    receiptUrl: '',
    notes: ''
  });

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await api.getHikeExpenses(hikeId, token);
      setExpenses(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses. Please check your connection and try again.');
    }
  }, [hikeId, token]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await api.getHikeExpenseSummary(hikeId, token);
      setSummary(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      setError('Failed to load expense summary.');
    } finally {
      setLoading(false);
    }
  }, [hikeId, token]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getAllUsers(token);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchExpenses();
      fetchSummary();
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [hikeId, token, isAdmin, fetchExpenses, fetchSummary, fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expenseData = {
      hikeId: parseInt(hikeId),
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      paidBy: formData.paidBy ? parseInt(formData.paidBy) : null,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      expenseDate: formData.expenseDate || null,
      receiptUrl: formData.receiptUrl || null,
      notes: formData.notes || null
    };

    const result = editingExpense
      ? await api.updateHikeExpense(hikeId, editingExpense.id, expenseData, token)
      : await api.addHikeExpense(hikeId, expenseData, token);

    if (result.success) {
      setShowAddModal(false);
      setEditingExpense(null);
      resetForm();
      fetchExpenses();
      fetchSummary();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paid_by || '',
      paymentMethod: expense.payment_method || 'cash',
      paymentStatus: expense.payment_status || 'pending',
      expenseDate: expense.expense_date ? expense.expense_date.split('T')[0] : '',
      receiptUrl: expense.receipt_url || '',
      notes: expense.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    const result = await api.deleteHikeExpense(hikeId, expenseId, token);
    if (result.success) {
      fetchExpenses();
      fetchSummary();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'food',
      description: '',
      amount: 0,
      paidBy: '',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      expenseDate: '',
      receiptUrl: '',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge bg-success"><CheckCircle size={12} className="me-1" />Paid</span>;
      case 'pending':
        return <span className="badge bg-warning"><Clock size={12} className="me-1" />Pending</span>;
      case 'reimbursed':
        return <span className="badge bg-info"><TrendingUp size={12} className="me-1" />Reimbursed</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getCategoryInfo = (category) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  };

  if (loading) {
    return (
      <div className="card mt-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading expenses...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card mt-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <Receipt size={20} className="me-2" />
              Hike Expenses
            </h5>
          </div>
          <div className="alert alert-danger">
            <h6>Error Loading Expenses</h6>
            <p className="mb-2">{error}</p>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchExpenses();
                fetchSummary();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <Receipt size={20} className="me-2" />
            Hike Expenses
          </h5>
          {isAdmin && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setEditingExpense(null);
                resetForm();
                setShowAddModal(true);
              }}
            >
              <Plus size={16} className="me-1" />
              Add Expense
            </button>
          )}
        </div>

        {/* Expense Summary */}
        {summary && (
          <div className="row mb-4">
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Total Expenses</small>
                  <strong className="text-danger">R {parseFloat(summary.total_expenses || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Paid</small>
                  <strong className="text-success">R {parseFloat(summary.paid_expenses || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Pending</small>
                  <strong className="text-warning">R {parseFloat(summary.pending_expenses || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Count</small>
                  <strong>{summary.expense_count || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        {expenses.length > 0 ? (
          <div className="table-responsive">
            <table className={`table table-sm ${isDark ? 'table-dark' : ''}`}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid By</th>
                  <th>Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  return (
                    <tr key={expense.id}>
                      <td>
                        <span className="me-1">{categoryInfo.icon}</span>
                        <small>{categoryInfo.label}</small>
                      </td>
                      <td>{expense.description}</td>
                      <td>
                        <strong>R {parseFloat(expense.amount).toLocaleString()}</strong>
                      </td>
                      <td>{getStatusBadge(expense.payment_status)}</td>
                      <td>
                        <small className="text-muted">
                          {expense.paid_by_name || '-'}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {expense.expense_date
                            ? new Date(expense.expense_date).toLocaleDateString()
                            : '-'}
                        </small>
                      </td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <Receipt size={48} className="mb-2 opacity-50" />
            <p>No expenses recorded yet</p>
            {isAdmin && (
              <p className="small">Click "Add Expense" to start tracking hike expenses</p>
            )}
          </div>
        )}

        {/* Add/Edit Expense Modal */}
        {showAddModal && isAdmin && (
          <div
            className="modal d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="modal-dialog modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`modal-content ${isDark ? 'bg-dark text-light' : ''}`}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingExpense ? 'Edit Expense' : 'Add Expense'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        >
                          {EXPENSE_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Amount (R) *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g., Shuttle service, Lunch catering, Park fees"
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Payment Status *</label>
                        <select
                          className="form-select"
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="reimbursed">Reimbursed</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Payment Method</label>
                        <select
                          className="form-select"
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="card">Card</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Paid By</label>
                        <select
                          className="form-select"
                          value={formData.paidBy}
                          onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                        >
                          <option value="">Select person...</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Expense Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.expenseDate}
                          onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Receipt URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.receiptUrl}
                        onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                        placeholder="https://..."
                      />
                      <small className="form-text text-muted">
                        Link to receipt or proof of payment
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes about this expense..."
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingExpense ? 'Update' : 'Add'} Expense
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpensesSection;
