import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

const PaymentsOverview = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState({ summary: {}, hikes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentsOverview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPaymentsOverview = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getPaymentsOverview(token);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading payments...</span>
        </div>
        <p className="mt-3">Loading payments overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h5>Error Loading Payments</h5>
        <p>{error}</p>
        <button className="btn btn-danger" onClick={fetchPaymentsOverview}>
          Retry
        </button>
      </div>
    );
  }

  const { summary, hikes } = data;

  return (
    <>
      {/* Summary Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Total Expected</small>
                  <h4 className="mb-0">R {parseFloat(summary.total_expected || 0).toLocaleString()}</h4>
                </div>
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Total Collected</small>
                  <h4 className="mb-0 text-success">R {parseFloat(summary.total_collected || 0).toLocaleString()}</h4>
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
                  <small className="text-muted d-block mb-1">Outstanding</small>
                  <h4 className="mb-0 text-warning">R {parseFloat(summary.total_outstanding || 0).toLocaleString()}</h4>
                </div>
                <AlertCircle size={24} className="text-warning" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className={`card ${isDark ? 'bg-dark' : 'bg-light'}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Active Hikes</small>
                  <h4 className="mb-0">{summary.active_hikes || 0}</h4>
                </div>
                <Users size={24} className="text-info" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hikes List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Payment Status by Hike</h5>
        </div>
        <div className="card-body p-0">
          {hikes && hikes.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className={isDark ? 'table-dark' : 'table-light'}>
                  <tr>
                    <th>Hike</th>
                    <th>Date</th>
                    <th className="text-center">Attendees</th>
                    <th className="text-end">Expected (R)</th>
                    <th className="text-end">Collected (R)</th>
                    <th className="text-end">Outstanding (R)</th>
                    <th className="text-center">Collection %</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hikes.map((hike) => {
                    const collectionRate = hike.expected_amount > 0 
                      ? ((hike.collected_amount / hike.expected_amount) * 100) 
                      : 0;
                    
                    return (
                      <tr key={hike.id}>
                        <td>
                          <div>
                            <strong>{hike.title}</strong>
                            <br />
                            <small className="text-muted">{hike.location}</small>
                          </div>
                        </td>
                        <td>
                          {new Date(hike.date).toLocaleDateString('en-ZA')}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info">
                            {hike.confirmed_attendees || 0}
                          </span>
                        </td>
                        <td className="text-end">
                          R {parseFloat(hike.expected_amount || 0).toLocaleString()}
                        </td>
                        <td className="text-end text-success">
                          R {parseFloat(hike.collected_amount || 0).toLocaleString()}
                        </td>
                        <td className="text-end text-warning">
                          R {parseFloat(hike.outstanding_amount || 0).toLocaleString()}
                        </td>
                        <td className="text-center">
                          <div className="progress" style={{ height: '20px', minWidth: '80px' }}>
                            <div
                              className={`progress-bar ${
                                collectionRate >= 90 ? 'bg-success' :
                                collectionRate >= 70 ? 'bg-warning' : 'bg-danger'
                              }`}
                              role="progressbar"
                              style={{ width: `${Math.min(collectionRate, 100)}%` }}
                              aria-valuenow={collectionRate}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {collectionRate.toFixed(0)}%
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <Link
                            to={`/admin/payments/${hike.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Details
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
              <p className="text-muted">No active hikes with payment tracking found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentsOverview;