import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, XCircle, Plus, Trash2, Edit2, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

function PaymentsSection({ hikeId, hikeCost, isAdmin }) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    userId: '',
    amount: hikeCost || 0,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'pending',
    paymentDate: '',
    notes: ''
  });

  useEffect(() => {
    if (token) {
      fetchPayments();
      fetchStats();
      if (isAdmin) {
        fetchUsers();
      }
    }
  }, [hikeId, token, isAdmin]);

  const fetchPayments = async () => {
    try {
      const data = await api.getHikePayments(hikeId, token);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getHikePaymentStats(hikeId, token);
      setStats(data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers(token);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleBulkCreate = async () => {
    if (!window.confirm('This will create payment records for all confirmed attendees who don\'t have one yet. Continue?')) {
      return;
    }

    const result = await api.bulkCreatePayments(hikeId, hikeCost, 'pending', token);
    if (result.success) {
      alert(result.data.message);
      fetchPayments();
      fetchStats();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentData = {
      hikeId: parseInt(hikeId),
      userId: parseInt(formData.userId),
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      paymentDate: formData.paymentDate || null,
      notes: formData.notes
    };

    const result = await api.recordPayment(paymentData, token);
    if (result.success) {
      setShowAddModal(false);
      setEditingPayment(null);
      setFormData({
        userId: '',
        amount: hikeCost || 0,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        paymentDate: '',
        notes: ''
      });
      fetchPayments();
      fetchStats();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      userId: payment.user_id,
      amount: payment.amount,
      paymentMethod: payment.payment_method || 'bank_transfer',
      paymentStatus: payment.payment_status,
      paymentDate: payment.payment_date ? payment.payment_date.split('T')[0] : '',
      notes: payment.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) {
      return;
    }

    const result = await api.deletePayment(paymentId, token);
    if (result.success) {
      fetchPayments();
      fetchStats();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge bg-success"><CheckCircle size={12} className="me-1" />Paid</span>;
      case 'pending':
        return <span className="badge bg-warning"><Clock size={12} className="me-1" />Pending</span>;
      case 'refunded':
        return <span className="badge bg-secondary"><XCircle size={12} className="me-1" />Refunded</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading payments...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <DollarSign size={20} className="me-2" />
            Payment Tracking
          </h5>
          {isAdmin && (
            <div>
              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={handleBulkCreate}
              >
                <Users size={16} className="me-1" />
                Bulk Create
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setEditingPayment(null);
                  setFormData({
                    userId: '',
                    amount: hikeCost || 0,
                    paymentMethod: 'bank_transfer',
                    paymentStatus: 'pending',
                    paymentDate: '',
                    notes: ''
                  });
                  setShowAddModal(true);
                }}
              >
                <Plus size={16} className="me-1" />
                Add Payment
              </button>
            </div>
          )}
        </div>

        {/* Payment Statistics */}
        {stats && (
          <div className="row mb-4">
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Total Paid</small>
                  <strong className="text-success">R {parseFloat(stats.total_paid).toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Outstanding</small>
                  <strong className="text-warning">R {parseFloat(stats.outstanding).toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Paid</small>
                  <strong>{stats.paid_count} / {stats.confirmed_attendees}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
                <div className="card-body py-2 px-3">
                  <small className="text-muted d-block">Expected Total</small>
                  <strong>R {parseFloat(stats.expected_total).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        {payments.length > 0 ? (
          <div className="table-responsive">
            <table className={`table table-sm ${isDark ? 'table-dark' : ''}`}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.user_name}</td>
                    <td>R {parseFloat(payment.amount).toLocaleString()}</td>
                    <td>{getStatusBadge(payment.payment_status)}</td>
                    <td>
                      <small className="text-muted">
                        {payment.payment_method ? payment.payment_method.replace('_', ' ') : '-'}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : '-'}
                      </small>
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(payment)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(payment.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <DollarSign size={48} className="mb-2 opacity-50" />
            <p>No payment records yet</p>
            {isAdmin && (
              <p className="small">Click "Add Payment" or "Bulk Create" to start tracking payments</p>
            )}
          </div>
        )}

        {/* Add/Edit Payment Modal */}
        {showAddModal && isAdmin && (
          <div
            className="modal d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="modal-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`modal-content ${isDark ? 'bg-dark text-light' : ''}`}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingPayment ? 'Edit Payment' : 'Add Payment'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">User *</label>
                      <select
                        className="form-select"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                        disabled={editingPayment}
                      >
                        <option value="">Select user...</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
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

                    <div className="mb-3">
                      <label className="form-label">Payment Status *</label>
                      <select
                        className="form-select"
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <div className="mb-3">
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

                    <div className="mb-3">
                      <label className="form-label">Payment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Optional notes about this payment..."
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
                      {editingPayment ? 'Update' : 'Add'} Payment
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

export default PaymentsSection;
