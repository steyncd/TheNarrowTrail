import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, Calendar, Clock, CheckCircle, Info } from 'lucide-react';
import { API_URL } from '../../services/api';
import PageHeader from '../common/PageHeader';

/**
 * Data Retention Status for Users (POPIA Compliance)
 * Shows personal data retention information and status
 */
const DataRetentionStatus = () => {
  const [retentionData, setRetentionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's retention status
  const fetchRetentionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile/retention/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch retention status: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setRetentionData(data);
    } catch (err) {
      console.error('Retention status fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetentionStatus();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-success" size={20} />;
      case 'warning_sent':
      case 'warning_due':
        return <AlertCircle className="text-warning" size={20} />;
      case 'scheduled_for_deletion':
        return <AlertCircle className="text-danger" size={20} />;
      default:
        return <Info className="text-info" size={20} />;
    }
  };

  const getStatusMessage = (status, retention) => {
    switch (status) {
      case 'active':
        return 'Your account is active and your data is secure.';
      case 'warning_sent':
        return `A data retention warning was sent on ${formatDate(retention.warning_sent_at)}. Please log in regularly to keep your account active.`;
      case 'warning_due':
        return 'Your account has been inactive for over 3 years. A retention warning will be sent soon.';
      case 'scheduled_for_deletion':
        return `Your account is scheduled for deletion on ${formatDate(retention.scheduled_deletion_at)} due to inactivity. Please log in to prevent deletion.`;
      default:
        return 'Unable to determine account status.';
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your privacy information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <AlertCircle size={20} className="me-2" />
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={Shield}
        title="Privacy & Data Retention"
        subtitle="Your personal data protection status under POPIA"
      />

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Status Overview */}
          <div className="row mb-4">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {getStatusIcon(retentionData.status)}
                    <h5 className="mb-0 ms-2">Account Status</h5>
                  </div>
                  <p className="card-text">
                    {getStatusMessage(retentionData.status, retentionData.retention)}
                  </p>
                  
                  {retentionData.retention.days_until_deletion && retentionData.retention.days_until_deletion > 0 && (
                    <div className="alert alert-warning mt-3">
                      <strong>Action Required:</strong> Your account will be deleted in {retentionData.retention.days_until_deletion} days unless you log in.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <Shield size={48} className="text-primary mb-3" />
                  <h6 className="card-title">POPIA Compliant</h6>
                  <p className="card-text small">
                    Your data is protected according to South African privacy laws
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header d-flex align-items-center">
                  <Calendar size={20} className="me-2" />
                  Account Information
                </div>
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col-sm-6"><strong>Account Created:</strong></div>
                    <div className="col-sm-6">{formatDate(retentionData.user.created_at)}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-sm-6"><strong>Last Active:</strong></div>
                    <div className="col-sm-6">{formatDate(retentionData.user.last_active_at)}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-sm-6"><strong>Days Since Active:</strong></div>
                    <div className="col-sm-6">{retentionData.user.days_since_active || 0} days</div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6"><strong>Account Age:</strong></div>
                    <div className="col-sm-6">{Math.floor(retentionData.user.account_age_days / 365)} years</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header d-flex align-items-center">
                  <Clock size={20} className="me-2" />
                  Retention Timeline
                </div>
                <div className="card-body">
                  {retentionData.retention.warning_sent_at && (
                    <div className="row mb-2">
                      <div className="col-sm-6"><strong>Warning Sent:</strong></div>
                      <div className="col-sm-6">{formatDate(retentionData.retention.warning_sent_at)}</div>
                    </div>
                  )}
                  {retentionData.retention.scheduled_deletion_at && (
                    <div className="row mb-2">
                      <div className="col-sm-6"><strong>Deletion Date:</strong></div>
                      <div className="col-sm-6 text-danger">{formatDate(retentionData.retention.scheduled_deletion_at)}</div>
                    </div>
                  )}
                  {retentionData.retention.days_until_warning > 0 && (
                    <div className="row mb-2">
                      <div className="col-sm-6"><strong>Warning in:</strong></div>
                      <div className="col-sm-6">{retentionData.retention.days_until_warning} days</div>
                    </div>
                  )}
                  {!retentionData.retention.warning_sent_at && !retentionData.retention.scheduled_deletion_at && (
                    <p className="text-muted mb-0">No retention actions scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {retentionData.recent_activity && retentionData.recent_activity.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Recent Privacy Actions</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retentionData.recent_activity.map((log, index) => (
                        <tr key={index}>
                          <td>{formatDate(log.created_at)}</td>
                          <td>
                            <span className="badge bg-info">{log.action}</span>
                          </td>
                          <td>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="card mt-4">
            <div className="card-body">
              <h6 className="card-title d-flex align-items-center">
                <Info size={20} className="me-2" />
                About Data Retention
              </h6>
              <p className="card-text">
                Under the Protection of Personal Information Act (POPIA), we automatically manage your personal data:
              </p>
              <ul className="mb-0">
                <li>After 3 years of inactivity, we send a warning email</li>
                <li>After 4 years of inactivity, your data is permanently deleted</li>
                <li>Simply logging in resets your activity timer</li>
                <li>You can export your data at any time from your profile</li>
                <li>You can delete your account manually if desired</li>
              </ul>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRetentionStatus;