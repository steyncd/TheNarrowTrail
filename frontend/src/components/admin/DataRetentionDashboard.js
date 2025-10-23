import React, { useState, useEffect } from 'react';
import { API_URL } from '../../services/api';

/**
 * Data Retention Dashboard for POPIA Compliance Management
 * Allows admins to monitor and manage automated data retention processes
 */
const DataRetentionDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningCheck, setRunningCheck] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch retention statistics
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/retention/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch retention logs
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/retention/logs?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      setError(err.message);
    }
  };

  // Run manual retention check
  const runManualCheck = async () => {
    setRunningCheck(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/retention/run-check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to run retention check');

      const data = await response.json();
      alert(`Retention check completed successfully!\n\nStatistics:\n${JSON.stringify(data.statistics, null, 2)}`);

      // Refresh data
      await fetchStatistics();
      await fetchLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningCheck(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatistics(), fetchLogs()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get badge class for retention actions
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'warning_sent': return 'badge bg-warning text-dark';
      case 'data_deleted': return 'badge bg-danger';
      case 'retention_extended': return 'badge bg-info';
      case 'legal_document_updated': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading retention data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h2 mb-0">Data Retention Management</h1>
            <button 
              className="btn btn-primary"
              onClick={runManualCheck} 
              disabled={runningCheck}
            >
              <i className="fas fa-sync-alt me-2"></i>
              {runningCheck ? 'Running...' : 'Run Check'}
            </button>
          </div>
        </div>
      </div>

      {/* POPIA Compliance Notice */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-center">
            <i className="fas fa-shield-alt me-2"></i>
            <div>
              <strong>POPIA Compliance:</strong> Automated data retention system monitors user activity and enforces 3-year warning / 4-year deletion policy
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle text-muted mb-1">Need Warnings</h6>
                    <h3 className="card-title mb-0">{statistics.usersNeedingWarning}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="fas fa-clock text-info" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle text-muted mb-1">Warnings Sent</h6>
                    <h3 className="card-title mb-0">{statistics.usersWithWarningsSent}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="fas fa-calendar-alt text-warning" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle text-muted mb-1">Scheduled Deletion</h6>
                    <h3 className="card-title mb-0">{statistics.usersScheduledForDeletion}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className="fas fa-trash-alt text-danger" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle text-muted mb-1">Deleted Users</h6>
                    <h3 className="card-title mb-0">{statistics.totalDeletedUsers}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="row">
        <div className="col-12">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                Recent Activity
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveTab('statistics')}
                type="button"
              >
                Detailed Statistics
              </button>
            </li>
          </ul>

          <div className="tab-content mt-3">
            {/* Recent Activity Tab */}
            {activeTab === 'overview' && (
              <div className="tab-pane fade show active">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Recent Retention Activity</h5>
                  </div>
                  <div className="card-body">
                    {logs.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {logs.map((log) => (
                          <div key={log.id} className="list-group-item border-0 border-start border-3 border-secondary ps-3 py-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="d-flex align-items-start">
                                <span className={`${getActionBadgeClass(log.action)} me-3`}>
                                  {log.action.replace(/_/g, ' ').toUpperCase()}
                                </span>
                                <div>
                                  <h6 className="mb-1">
                                    {log.user_email || `User ID: ${log.user_id}`}
                                  </h6>
                                  <p className="mb-1 text-muted">{log.reason}</p>
                                </div>
                              </div>
                              <div className="text-end">
                                <small className="text-muted">{formatDate(log.created_at)}</small>
                                <br />
                                <small className="text-muted">by {log.performed_by}</small>
                              </div>
                            </div>
                            
                            {log.metadata && (
                              <details className="mt-2">
                                <summary className="small text-muted">View Details</summary>
                                <pre className="small bg-light p-2 rounded mt-1" style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-center py-5">No retention activity recorded</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Statistics Tab */}
            {activeTab === 'statistics' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  {/* Recent Actions Card */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <h5 className="card-title mb-0">Retention Actions (Last 30 Days)</h5>
                      </div>
                      <div className="card-body">
                        {statistics?.recentActions?.length > 0 ? (
                          <div className="row">
                            {statistics.recentActions.map((action, index) => (
                              <div key={index} className="col-12 mb-2">
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                                  <span className="fw-medium text-capitalize">{action.action.replace(/_/g, ' ')}</span>
                                  <span className="badge bg-outline-secondary">{action.count} actions</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted text-center py-5">No recent actions</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* System Information Card */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <h5 className="card-title mb-0">System Configuration</h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="p-3 bg-primary bg-opacity-10 rounded">
                              <h6 className="text-primary mb-1">Warning Period</h6>
                              <small className="text-muted">3 years of inactivity</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-3 bg-danger bg-opacity-10 rounded">
                              <h6 className="text-danger mb-1">Deletion Period</h6>
                              <small className="text-muted">4 years of inactivity</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-3 bg-success bg-opacity-10 rounded">
                              <h6 className="text-success mb-1">Grace Period</h6>
                              <small className="text-muted">90 days after warning</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-3 bg-info bg-opacity-10 rounded">
                              <h6 className="text-info mb-1">Check Schedule</h6>
                              <small className="text-muted">Daily at 02:00 UTC</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRetentionDashboard;