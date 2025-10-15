import React, { useState, useEffect } from 'react';
import { Receipt, TrendingDown, DollarSign, AlertTriangle, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Catering', icon: '🍽️', color: '#28a745' },
  { value: 'travel', label: 'Travel & Transport', icon: '🚗', color: '#17a2b8' },
  { value: 'admin', label: 'Admin & Fees', icon: '📋', color: '#6c757d' },
  { value: 'equipment', label: 'Equipment & Gear', icon: '🎒', color: '#fd7e14' },
  { value: 'venue', label: 'Venue & Accommodation', icon: '🏕️', color: '#20c997' },
  { value: 'other', label: 'Other', icon: '💳', color: '#6f42c1' }
];

const ExpensesOverview = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [hikesWithExpenses, setHikesWithExpenses] = useState([]);
  const [categorySummary, setCategorySummary] = useState({});
  const [totalSummary, setTotalSummary] = useState({
    totalExpenses: 0,
    totalPending: 0,
    totalPaid: 0,
    expenseCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpensesOverview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchExpensesOverview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all hikes first
      const hikesData = await api.getHikes(token);
      
      // Fetch expenses for each hike
      const hikesWithExpenseData = await Promise.all(
        hikesData.map(async (hike) => {
          try {
            const expenseSummary = await api.getHikeExpenseSummary(hike.id, token);
            return {
              ...hike,
              expenses: expenseSummary
            };
          } catch (err) {
            console.warn(`Failed to fetch expenses for hike ${hike.id}:`, err);
            return {
              ...hike,
              expenses: {
                totalExpenses: 0,
                totalPending: 0,
                totalPaid: 0,
                expenseCount: 0,
                categorySummary: {}
              }
            };
          }
        })
      );

      // Filter hikes that have expenses
      const hikesWithExpenses = hikesWithExpenseData.filter(
        hike => hike.expenses.expenseCount > 0
      );

      // Calculate overall summary
      const overallSummary = hikesWithExpenseData.reduce(
        (acc, hike) => ({
          totalExpenses: acc.totalExpenses + (hike.expenses.totalExpenses || 0),
          totalPending: acc.totalPending + (hike.expenses.totalPending || 0),
          totalPaid: acc.totalPaid + (hike.expenses.totalPaid || 0),
          expenseCount: acc.expenseCount + (hike.expenses.expenseCount || 0)
        }),
        { totalExpenses: 0, totalPending: 0, totalPaid: 0, expenseCount: 0 }
      );

      // Calculate category summary across all hikes
      const categoryTotals = {};
      hikesWithExpenseData.forEach(hike => {
        if (hike.expenses.categorySummary) {
          Object.entries(hike.expenses.categorySummary).forEach(([category, amount]) => {
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          });
        }
      });

      setHikesWithExpenses(hikesWithExpenses);
      setTotalSummary(overallSummary);
      setCategorySummary(categoryTotals);
    } catch (err) {
      console.error('Expenses overview fetch error:', err);
      setError(err.message || 'Failed to load expenses data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return EXPENSE_CATEGORIES.find(cat => cat.value === categoryValue) || 
           { label: categoryValue, icon: '💳', color: '#6c757d' };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading expenses...</span>
        </div>
        <p className="mt-3">Loading expenses overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h5>Error Loading Expenses</h5>
        <p>{error}</p>
        <button className="btn btn-danger" onClick={fetchExpensesOverview}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Summary Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Total Expenses</small>
                  <h4 className="mb-0">R {totalSummary.totalExpenses.toLocaleString()}</h4>
                </div>
                <Receipt size={24} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Paid Expenses</small>
                  <h4 className="mb-0 text-success">R {totalSummary.totalPaid.toLocaleString()}</h4>
                </div>
                <DollarSign size={24} className="text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Pending</small>
                  <h4 className="mb-0 text-warning">R {totalSummary.totalPending.toLocaleString()}</h4>
                </div>
                <AlertTriangle size={24} className="text-warning" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Total Items</small>
                  <h4 className="mb-0">{totalSummary.expenseCount}</h4>
                </div>
                <TrendingDown size={24} className="text-info" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categorySummary).length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0 d-flex align-items-center">
              <PieChart size={20} className="me-2" />
              Expenses by Category
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {Object.entries(categorySummary).map(([category, amount]) => {
                const categoryInfo = getCategoryInfo(category);
                const percentage = totalSummary.totalExpenses > 0 
                  ? ((amount / totalSummary.totalExpenses) * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={category} className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center p-3 border rounded">
                      <div 
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: categoryInfo.color + '20',
                          borderRadius: '8px',
                          fontSize: '20px'
                        }}
                      >
                        {categoryInfo.icon}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{categoryInfo.label}</div>
                        <div className="text-muted small">
                          R {amount.toLocaleString()} ({percentage}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hikes with Expenses */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Expenses by Hike</h5>
        </div>
        <div className="card-body p-0">
          {hikesWithExpenses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className={isDark ? 'table-dark' : 'table-light'}>
                  <tr>
                    <th>Hike</th>
                    <th>Date</th>
                    <th className="text-center">Items</th>
                    <th className="text-end">Total (R)</th>
                    <th className="text-end">Paid (R)</th>
                    <th className="text-end">Pending (R)</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hikesWithExpenses.map((hike) => {
                    const paymentRate = hike.expenses.totalExpenses > 0 
                      ? ((hike.expenses.totalPaid / hike.expenses.totalExpenses) * 100) 
                      : 0;
                    
                    return (
                      <tr key={hike.id}>
                        <td>
                          <div>
                            <strong>{hike.name}</strong>
                            <br />
                            <small className="text-muted">ID #{hike.id}</small>
                          </div>
                        </td>
                        <td>
                          {new Date(hike.date).toLocaleDateString('en-ZA')}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info">
                            {hike.expenses.expenseCount}
                          </span>
                        </td>
                        <td className="text-end">
                          R {hike.expenses.totalExpenses.toLocaleString()}
                        </td>
                        <td className="text-end text-success">
                          R {hike.expenses.totalPaid.toLocaleString()}
                        </td>
                        <td className="text-end text-warning">
                          R {hike.expenses.totalPending.toLocaleString()}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${
                            paymentRate >= 100 ? 'bg-success' :
                            paymentRate >= 50 ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {paymentRate.toFixed(0)}% Paid
                          </span>
                        </td>
                        <td className="text-center">
                          <Link
                            to={`/manage-hikes/${hike.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <Receipt size={48} className="text-muted mb-3" />
              <p className="text-muted">No expenses recorded yet.</p>
              <p className="text-muted small">
                Expenses can be added when managing individual hikes.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpensesOverview;