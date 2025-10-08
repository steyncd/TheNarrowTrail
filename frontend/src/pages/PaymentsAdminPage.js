import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';

const PaymentsAdminPage = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState({ summary: {}, hikes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentsOverview();
  }, []);

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
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading payments...</span>
          </div>
          <p className="mt-3">Loading payments overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h5>Error Loading Payments</h5>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={fetchPaymentsOverview}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, hikes } = data;

  return (
    <div className="container-fluid mt-4">
      <PageHeader
        icon={DollarSign}
        title="Payments Dashboard"
        subtitle="Consolidated payment tracking for all upcoming hikes"
      />

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
                  <small className="text-muted d-block mb-1">Total Outstanding</small>
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
                  <small className="text-muted d-block mb-1">Attendees</small>
                  <h4 className="mb-0">{summary.total_paid_attendees || 0} / {summary.total_confirmed_attendees || 0}</h4>
                  <small className="text-muted">Paid</small>
                </div>
                <Users size={24} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hikes Table */}
      <div className={`card ${isDark ? 'bg-dark text-light' : 'bg-white'}`}>
        <div className="card-header">
          <h5 className="mb-0">Upcoming Hikes Payment Status</h5>
        </div>
        <div className="card-body p-0">
          {hikes && hikes.length > 0 ? (
            <div className="table-responsive">
              <table className={`table table-hover mb-0 ${isDark ? 'table-dark' : ''}`}>
                <thead>
                  <tr>
                    <th>Hike</th>
                    <th>Date</th>
                    <th>Cost</th>
                    <th className="text-center">Attendees</th>
                    <th className="text-center">Paid</th>
                    <th className="text-center">Pending</th>
                    <th className="text-end">Collected</th>
                    <th className="text-end">Outstanding</th>
                    <th style={{ width: '200px' }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {hikes.map(hike => {
                    const collectionPercentage = parseFloat(hike.paid_percentage || 0);
                    const progressColor = collectionPercentage >= 80 ? 'success' : collectionPercentage >= 50 ? 'warning' : 'danger';

                    return (
                      <tr key={hike.hike_id}>
                        <td>
                          <Link to={`/hikes/${hike.hike_id}`} className="text-decoration-none">
                            <strong>{hike.hike_name}</strong>
                          </Link>
                          <br />
                          <small className="text-muted">
                            {hike.hike_status === 'trip_booked' ? (
                              <span className="badge bg-success">Trip Booked</span>
                            ) : hike.hike_status === 'pre_planning' ? (
                              <span className="badge bg-info">Pre-planning</span>
                            ) : (
                              <span className="badge bg-secondary">{hike.hike_status}</span>
                            )}
                          </small>
                        </td>
                        <td>
                          {new Date(hike.hike_date).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td>R {parseFloat(hike.hike_cost || 0).toLocaleString()}</td>
                        <td className="text-center">{hike.confirmed_attendees || 0}</td>
                        <td className="text-center">
                          <span className="badge bg-success">{hike.paid_count || 0}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-warning">{hike.pending_count || 0}</span>
                        </td>
                        <td className="text-end text-success">
                          <strong>R {parseFloat(hike.total_paid || 0).toLocaleString()}</strong>
                        </td>
                        <td className="text-end text-warning">
                          <strong>R {parseFloat(hike.outstanding || 0).toLocaleString()}</strong>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
                              <div
                                className={`progress-bar bg-${progressColor}`}
                                role="progressbar"
                                style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
                                aria-valuenow={collectionPercentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {collectionPercentage.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <DollarSign size={48} className="mb-3 opacity-50" />
              <p>No upcoming hikes with payment records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsAdminPage;
