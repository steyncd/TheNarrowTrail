import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, AlertCircle, Download, Users, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PageHeader from '../common/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';

function ConsentManagement() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, complete, incomplete

  const isDark = theme === 'dark';
  const cardBg = isDark ? '#2d2d2d' : '#fff';
  const textColor = isDark ? '#fff' : '#212529';
  const mutedColor = isDark ? '#adb5bd' : '#6c757d';

  useEffect(() => {
    fetchConsentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchConsentStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getConsentStatus(token);
      if (data) {
        setUsers(data.users || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching consent status:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hasAllConsents = (user) => {
    return user.privacy_consent_accepted && 
           user.terms_accepted && 
           user.data_processing_consent;
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'complete') return hasAllConsents(user);
    if (filter === 'incomplete') return !hasAllConsents(user);
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Privacy Consent', 'Privacy Date', 'Terms Accepted', 'Terms Date', 'Data Processing', 'Data Processing Date', 'Created'];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.privacy_consent_accepted ? 'Yes' : 'No',
      formatDate(u.privacy_consent_date),
      u.terms_accepted ? 'Yes' : 'No',
      formatDate(u.terms_accepted_date),
      u.data_processing_consent ? 'Yes' : 'No',
      formatDate(u.data_processing_consent_date),
      formatDate(u.created_at)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popia-consent-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', padding: '20px' }}>
        <PageHeader 
          title="POPIA Consent Management"
          subtitle="Monitor user consent status for POPIA compliance"
          icon={Shield}
        />
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', padding: '20px' }}>
      <PageHeader 
        title="POPIA Consent Management"
        subtitle="Monitor user consent status for POPIA compliance"
        icon={Shield}
      />

      <div className="container-fluid" style={{ maxWidth: '1400px' }}>
        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '4px' }}>
                      Total Users
                    </div>
                    <div style={{ color: textColor, fontSize: '1.75rem', fontWeight: '700' }}>
                      {stats?.total_users || 0}
                    </div>
                  </div>
                  <Users size={40} className="text-primary" style={{ opacity: 0.3 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '4px' }}>
                      All Consents
                    </div>
                    <div style={{ color: '#28a745', fontSize: '1.75rem', fontWeight: '700' }}>
                      {stats?.all_consents || 0}
                    </div>
                  </div>
                  <CheckCircle size={40} className="text-success" style={{ opacity: 0.3 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '4px' }}>
                      Missing Privacy
                    </div>
                    <div style={{ color: '#ffc107', fontSize: '1.75rem', fontWeight: '700' }}>
                      {stats?.missing_privacy || 0}
                    </div>
                  </div>
                  <AlertCircle size={40} className="text-warning" style={{ opacity: 0.3 }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '4px' }}>
                      Missing Terms
                    </div>
                    <div style={{ color: '#dc3545', fontSize: '1.75rem', fontWeight: '700' }}>
                      {stats?.missing_terms || 0}
                    </div>
                  </div>
                  <XCircle size={40} className="text-danger" style={{ opacity: 0.3 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="card shadow-sm mb-4" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="btn-group" role="group">
                <button
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All Users ({users.length})
                </button>
                <button
                  className={`btn ${filter === 'complete' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('complete')}
                >
                  Complete ({users.filter(hasAllConsents).length})
                </button>
                <button
                  className={`btn ${filter === 'incomplete' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFilter('incomplete')}
                >
                  Incomplete ({users.filter(u => !hasAllConsents(u)).length})
                </button>
              </div>

              <button
                className="btn btn-outline-primary"
                onClick={exportToCSV}
              >
                <Download size={18} className="me-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="card shadow-sm" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
          <div className="card-body p-0">
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px', color: textColor }}>User</th>
                    <th className="text-center" style={{ padding: '12px', color: textColor }}>
                      <Shield size={16} className="me-1" />
                      Privacy
                    </th>
                    <th className="text-center" style={{ padding: '12px', color: textColor }}>
                      <Shield size={16} className="me-1" />
                      Terms
                    </th>
                    <th className="text-center" style={{ padding: '12px', color: textColor }}>
                      <Shield size={16} className="me-1" />
                      Data Processing
                    </th>
                    <th style={{ padding: '12px', color: textColor }}>
                      <Calendar size={16} className="me-1" />
                      Registered
                    </th>
                    <th className="text-center" style={{ padding: '12px', color: textColor }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ color: textColor, fontWeight: '600' }}>{user.name}</div>
                          <div style={{ color: mutedColor, fontSize: '0.875rem' }}>{user.email}</div>
                          <div style={{ color: mutedColor, fontSize: '0.75rem' }}>
                            {user.role === 'admin' && <span className="badge bg-danger me-1">Admin</span>}
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="text-center" style={{ padding: '12px' }}>
                        {user.privacy_consent_accepted ? (
                          <div>
                            <CheckCircle size={20} className="text-success" />
                            <div style={{ fontSize: '0.75rem', color: mutedColor }}>
                              {formatDate(user.privacy_consent_date)}
                            </div>
                          </div>
                        ) : (
                          <XCircle size={20} className="text-danger" />
                        )}
                      </td>
                      <td className="text-center" style={{ padding: '12px' }}>
                        {user.terms_accepted ? (
                          <div>
                            <CheckCircle size={20} className="text-success" />
                            <div style={{ fontSize: '0.75rem', color: mutedColor }}>
                              {formatDate(user.terms_accepted_date)}
                            </div>
                          </div>
                        ) : (
                          <XCircle size={20} className="text-danger" />
                        )}
                      </td>
                      <td className="text-center" style={{ padding: '12px' }}>
                        {user.data_processing_consent ? (
                          <div>
                            <CheckCircle size={20} className="text-success" />
                            <div style={{ fontSize: '0.75rem', color: mutedColor }}>
                              {formatDate(user.data_processing_consent_date)}
                            </div>
                          </div>
                        ) : (
                          <XCircle size={20} className="text-danger" />
                        )}
                      </td>
                      <td style={{ padding: '12px', color: mutedColor, fontSize: '0.875rem' }}>
                        {formatDate(user.created_at)}
                      </td>
                      <td className="text-center" style={{ padding: '12px' }}>
                        {hasAllConsents(user) ? (
                          <span className="badge bg-success">Complete</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Incomplete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-5" style={{ color: mutedColor }}>
                <Shield size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No users match the selected filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="card shadow-sm mt-4" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
          <div className="card-body">
            <h6 style={{ color: textColor, marginBottom: '12px' }}>
              <Shield size={18} className="me-2" />
              About POPIA Consent Tracking
            </h6>
            <p style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '8px' }}>
              This dashboard tracks user consent for POPIA (Protection of Personal Information Act) compliance. 
              All users registering from October 2025 onwards provide explicit consent during registration.
            </p>
            <p style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: 0 }}>
              <strong>Note:</strong> Users registered before the POPIA implementation may show incomplete 
              consent records. These users were retroactively marked as consented based on their continued use of the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsentManagement;
