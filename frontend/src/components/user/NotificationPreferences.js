import React, { useState, useEffect } from 'react';
import { Bell, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PageHeader from '../common/PageHeader';

// All notification types
const NOTIFICATION_TYPES = [
  { code: 'email_verification', name: 'Email Verification', critical: true, description: 'Critical security notifications (cannot be disabled)' },
  { code: 'account_approved', name: 'Account Approval', critical: false, description: 'When your account gets approved' },
  { code: 'account_rejected', name: 'Account Rejection', critical: false, description: 'If your account gets rejected' },
  { code: 'password_reset_request', name: 'Password Reset Request', critical: true, description: 'Critical security notifications (cannot be disabled)' },
  { code: 'password_reset_confirmed', name: 'Password Reset Confirmation', critical: false, description: 'Confirmation of password changes' },
  { code: 'admin_password_reset', name: 'Admin Password Reset', critical: true, description: 'Critical security notifications (cannot be disabled)' },
  { code: 'admin_promotion', name: 'Admin Promotion', critical: false, description: 'When you get admin privileges' },
  { code: 'new_hike_added', name: 'New Events Added', critical: false, description: 'Notifications about new events and activities' },
  { code: 'hike_announcement', name: 'Event Announcements', critical: false, description: 'Updates about events you\'re interested in' }
];

const NotificationPreferences = () => {
  const { token } = useAuth();
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPreferences();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.getNotificationPreferences(token);
      
      if (data.preferences) {
        setPreferences(data.preferences);
      } else {
        // Initialize with defaults - email enabled, WhatsApp disabled by default
        const initial = {};
        NOTIFICATION_TYPES.forEach(type => {
          initial[type.code] = { email: true, whatsapp: false };
        });
        setPreferences(initial);
      }
    } catch (err) {
      setError('Failed to load notification preferences: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (notifCode, channel) => {
    // Don't allow disabling critical notifications
    const notifType = NOTIFICATION_TYPES.find(t => t.code === notifCode);
    if (notifType?.critical) {
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      [notifCode]: {
        ...prev[notifCode],
        [channel]: !prev[notifCode]?.[channel]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await api.updateNotificationPreferences(preferences, token);
      setSuccess('Notification preferences saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to defaults
    const initial = {};
    NOTIFICATION_TYPES.forEach(type => {
      initial[type.code] = { email: true, whatsapp: false };
    });
    setPreferences(initial);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading notification preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={Bell}
        title="Notification Preferences"
        subtitle="Choose how you want to receive notifications"
        action={
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={handleReset}
              disabled={saving}
            >
              <RefreshCw size={16} className="me-1" />
              Reset to Defaults
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Saving...</span>
                  </span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="me-1" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Notification Settings</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Notification Type</th>
                      <th style={{ width: '30%' }}>Description</th>
                      <th className="text-center" style={{ width: '15%' }}>Email</th>
                      <th className="text-center" style={{ width: '15%' }}>WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NOTIFICATION_TYPES.map((notifType) => {
                      const pref = preferences[notifType.code] || { email: true, whatsapp: false };
                      const isCritical = notifType.critical;
                      
                      return (
                        <tr key={notifType.code} className={isCritical ? 'table-warning' : ''}>
                          <td>
                            <strong>{notifType.name}</strong>
                            {isCritical && (
                              <span className="badge bg-warning text-dark ms-2">Required</span>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">{notifType.description}</small>
                          </td>
                          <td className="text-center">
                            <div className="form-check d-flex justify-content-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={pref.email || false}
                                onChange={() => handleToggle(notifType.code, 'email')}
                                disabled={isCritical}
                              />
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="form-check d-flex justify-content-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={pref.whatsapp || false}
                                onChange={() => handleToggle(notifType.code, 'whatsapp')}
                                disabled={isCritical}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-3">
                <div className="alert alert-info">
                  <strong>Note:</strong> Security-related notifications (marked as "Required") cannot be disabled for your protection.
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;