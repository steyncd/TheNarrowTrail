// pages/LogsPage.js - Admin Logs Page
import React, { useState, useEffect } from 'react';
import { Activity, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PermissionGate from '../components/PermissionGate';

const LogsPage = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'activity'
  const [signinLogs, setSigninLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [filters, setFilters] = useState({
    limit: 50,
    offset: 0,
    userId: '',
    success: '',
    action: '',
    entityType: ''
  });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'signin') {
      fetchSigninLogs();
    } else {
      fetchActivityLogs();
    }
  }, [activeTab, filters]);

  const fetchSigninLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.success) params.success = filters.success;
      params.limit = filters.limit;
      params.offset = filters.offset;

      const data = await api.getSigninLogs(params, token);
      setSigninLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching signin logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.action) params.action = filters.action;
      if (filters.entityType) params.entityType = filters.entityType;
      params.limit = filters.limit;
      params.offset = filters.offset;

      const data = await api.getActivityLogs(params, token);
      setActivityLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getActivityStats(token);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PermissionGate 
      permission="audit.view"
      fallback={
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            <h5>Access Denied</h5>
            <p>You don't have permission to view system logs.</p>
            <button className="btn btn-primary" onClick={() => navigate('/hikes')}>
              Return to Hikes
            </button>
          </div>
        </div>
      }
    >
      <div>
        <PageHeader
          icon={Activity}
          title="Activity & Sign-in Logs"
          subtitle="Monitor user activity and authentication attempts"
        />

      {/* Stats Cards */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h6 className="text-muted mb-2">Most Active Users (30 days)</h6>
                {stats.activeUsers.slice(0, 3).map((user, idx) => (
                  <div key={user.id} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{idx + 1}. {user.name}</span>
                    <span className="badge bg-primary">{user.activity_count} actions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h6 className="text-muted mb-2">Top Actions (30 days)</h6>
                {stats.topActions.slice(0, 5).map((action, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-truncate">{action.action}</span>
                    <span className="badge bg-secondary">{action.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h6 className="text-muted mb-2">Recent Login Activity</h6>
                {stats.loginStats.slice(0, 3).map((stat) => (
                  <div key={stat.date} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <small>{new Date(stat.date).toLocaleDateString()}</small>
                      <small className="text-success">{stat.successful_logins} / {stat.total_logins}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            <LogIn size={16} className="me-2" />
            Sign-in Logs
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={16} className="me-2" />
            Activity Logs
          </button>
        </li>
      </ul>

      {/* Sign-in Logs Table */}
      {activeTab === 'signin' && (
        <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Status</th>
                      <th>IP Address</th>
                      <th>User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signinLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{formatDate(log.signin_time)}</td>
                        <td>{log.user_name || 'Unknown'}</td>
                        <td>
                          <span className={`badge ${log.success ? 'bg-success' : 'bg-danger'}`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td><small>{log.ip_address}</small></td>
                        <td><small className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>{log.user_agent}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Logs Table */}
      {activeTab === 'activity' && (
        <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{formatDate(log.created_at)}</td>
                        <td>{log.user_name}</td>
                        <td><span className="badge bg-info">{log.action}</span></td>
                        <td>
                          {log.entity_type && (
                            <small>{log.entity_type} {log.entity_id && `#${log.entity_id}`}</small>
                          )}
                        </td>
                        <td><small>{log.ip_address}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </PermissionGate>
  );
};

export default LogsPage;
