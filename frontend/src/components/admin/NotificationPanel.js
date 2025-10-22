import React, { useState, useEffect } from 'react';
import { Bell, Settings, Mail, MessageCircle, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PageHeader from '../common/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';

// Notification type definitions
const NOTIFICATION_TYPES = {
  USER_NOTIFICATIONS: [
    {
      code: 'email_verification',
      name: 'Email Verification',
      description: 'Email verification link when registering',
      critical: true,
      userFacing: true
    },
    {
      code: 'account_approved',
      name: 'Account Approval',
      description: 'Welcome email when account is approved',
      critical: false,
      userFacing: true
    },
    {
      code: 'account_rejected',
      name: 'Account Rejection',
      description: 'Notification when registration is rejected',
      critical: false,
      userFacing: true
    },
    {
      code: 'password_reset_request',
      name: 'Password Reset Request',
      description: 'Password reset link and code',
      critical: true,
      userFacing: true
    },
    {
      code: 'password_reset_confirmed',
      name: 'Password Reset Confirmation',
      description: 'Confirmation after password is reset',
      critical: false,
      userFacing: true
    },
    {
      code: 'admin_password_reset',
      name: 'Admin Password Reset',
      description: 'When admin resets your password',
      critical: true,
      userFacing: true
    },
    {
      code: 'admin_promotion',
      name: 'Admin Promotion',
      description: 'When promoted to admin role',
      critical: false,
      userFacing: true
    },
    {
      code: 'new_hike_added',
      name: 'New Event Announcements',
      description: 'Notification when new events are added',
      critical: false,
      userFacing: true
    }
  ],
  ADMIN_NOTIFICATIONS: [
    {
      code: 'new_registration',
      name: 'New User Registrations',
      description: 'When users register and need approval',
      critical: false,
      userFacing: false,
      adminOnly: true
    },
    {
      code: 'hike_interest',
      name: 'Event Interest',
      description: 'When users express interest in events',
      critical: false,
      userFacing: false,
      adminOnly: true
    },
    {
      code: 'attendance_confirmed',
      name: 'Attendance Confirmations',
      description: 'When users confirm attendance',
      critical: false,
      userFacing: false,
      adminOnly: true
    },
    {
      code: 'new_feedback',
      name: 'User Feedback',
      description: 'When users submit feedback',
      critical: false,
      userFacing: false,
      adminOnly: true
    },
    {
      code: 'new_suggestion',
      name: 'Event Suggestions',
      description: 'When users suggest new events',
      critical: false,
      userFacing: false,
      adminOnly: true
    }
  ]
};

function NotificationPanel() {
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('preferences');
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [globalSettings, setGlobalSettings] = useState({
    email: true,
    whatsapp: true
  });
  const [loading, setLoading] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testNotification, setTestNotification] = useState({
    type: 'email',
    recipient: '',
    subject: '',
    message: ''
  });

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      console.log('Fetching notifications...');
      const data = await api.getNotifications(token);
      console.log('Notifications fetched:', data);
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const data = await api.getNotificationPreferences(token);

      setGlobalSettings({
        email: data.global.email,
        whatsapp: data.global.whatsapp
      });

      setPreferences(data.preferences);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = (notifCode, channel) => {
    setPreferences(prev => ({
      ...prev,
      [notifCode]: {
        ...prev[notifCode],
        [channel]: !prev[notifCode]?.[channel]
      }
    }));
  };

  const handleToggleGlobal = (channel) => {
    setGlobalSettings(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.updateNotificationPreferences(
        {
          global: globalSettings,
          preferences: preferences
        },
        token
      );

      if (result.success) {
        setSuccess('Notification preferences saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to save notification preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    setError('');
    setSuccess('');

    if (!testNotification.recipient) {
      setError('Recipient is required');
      return;
    }

    if (testNotification.type === 'email' && !testNotification.subject) {
      setError('Subject is required for email notifications');
      return;
    }

    if (!testNotification.message) {
      setError('Message is required');
      return;
    }

    setLoading(true);
    try {
      const result = await api.sendTestNotification(testNotification, token);
      if (result.success) {
        setTestNotification({
          type: 'email',
          recipient: '',
          subject: '',
          message: ''
        });
        await fetchNotifications();
        setSuccess('Test notification sent successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to send test notification');
      }
    } catch (err) {
      console.error('Send notification error:', err);
      setError('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const renderPreferences = () => {
    const cardBg = theme === 'dark' ? '#2d2d2d' : '#fff';
    const textColor = theme === 'dark' ? '#fff' : '#212529';
    const mutedColor = theme === 'dark' ? '#adb5bd' : '#6c757d';

    return (
      <div>
        {/* Global Settings */}
        <div className="card mb-4" style={{ backgroundColor: cardBg, color: textColor }}>
          <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
            <h5 className="mb-0">
              <Settings size={20} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
              Global Notification Settings
            </h5>
          </div>
          <div className="card-body">
            <p className="text-muted mb-3">
              Master switches to enable/disable all notifications by channel. Turning these off will disable all notifications regardless of individual preferences below.
            </p>
            <div className="d-flex gap-4">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="globalEmail"
                  checked={globalSettings.email}
                  onChange={() => handleToggleGlobal('email')}
                  style={{ cursor: 'pointer', width: '48px', height: '24px' }}
                />
                <label className="form-check-label ms-2" htmlFor="globalEmail" style={{ cursor: 'pointer' }}>
                  <Mail size={18} className="me-1" style={{ verticalAlign: 'text-bottom' }} />
                  Email Notifications
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="globalWhatsApp"
                  checked={globalSettings.whatsapp}
                  onChange={() => handleToggleGlobal('whatsapp')}
                  style={{ cursor: 'pointer', width: '48px', height: '24px' }}
                />
                <label className="form-check-label ms-2" htmlFor="globalWhatsApp" style={{ cursor: 'pointer' }}>
                  <MessageCircle size={18} className="me-1" style={{ verticalAlign: 'text-bottom' }} />
                  SMS Notifications
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* User Notifications */}
        <div className="card mb-4" style={{ backgroundColor: cardBg, color: textColor }}>
          <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
            <h5 className="mb-0">
              <Bell size={20} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
              Personal Notifications
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Notification Type</th>
                    <th className="text-center" style={{ width: '100px' }}>
                      <Mail size={18} />
                    </th>
                    <th className="text-center" style={{ width: '100px' }}>
                      <MessageCircle size={18} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {NOTIFICATION_TYPES.USER_NOTIFICATIONS.map(notif => (
                    <tr key={notif.code}>
                      <td>
                        <div>
                          <strong>{notif.name}</strong>
                          {notif.critical && (
                            <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>
                              Required
                            </span>
                          )}
                          <br />
                          <small style={{ color: mutedColor }}>{notif.description}</small>
                        </div>
                      </td>
                      <td className="text-center">
                        {notif.critical ? (
                          <Check size={20} className="text-success" title="Always enabled for security" />
                        ) : (
                          <div className="form-check form-switch d-flex justify-content-center">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences[notif.code]?.email ?? true}
                              onChange={() => handleTogglePreference(notif.code, 'email')}
                              disabled={!globalSettings.email}
                              style={{ cursor: globalSettings.email ? 'pointer' : 'not-allowed' }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        {notif.critical ? (
                          <X size={20} className="text-muted" title="Not available" />
                        ) : (
                          <div className="form-check form-switch d-flex justify-content-center">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences[notif.code]?.whatsapp ?? true}
                              onChange={() => handleTogglePreference(notif.code, 'whatsapp')}
                              disabled={!globalSettings.whatsapp}
                              style={{ cursor: globalSettings.whatsapp ? 'pointer' : 'not-allowed' }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Admin Notifications */}
        {isAdmin && (
          <div className="card mb-4" style={{ backgroundColor: cardBg, color: textColor }}>
            <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
              <h5 className="mb-0">
                <Bell size={20} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
                Admin Notifications
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Notification Type</th>
                      <th className="text-center" style={{ width: '100px' }}>
                        <Mail size={18} />
                      </th>
                      <th className="text-center" style={{ width: '100px' }}>
                        <MessageCircle size={18} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {NOTIFICATION_TYPES.ADMIN_NOTIFICATIONS.map(notif => (
                      <tr key={notif.code}>
                        <td>
                          <div>
                            <strong>{notif.name}</strong>
                            <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>
                              Admin Only
                            </span>
                            <br />
                            <small style={{ color: mutedColor }}>{notif.description}</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="form-check form-switch d-flex justify-content-center">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences[notif.code]?.email ?? true}
                              onChange={() => handleTogglePreference(notif.code, 'email')}
                              disabled={!globalSettings.email}
                              style={{ cursor: globalSettings.email ? 'pointer' : 'not-allowed' }}
                            />
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="form-check form-switch d-flex justify-content-center">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={preferences[notif.code]?.whatsapp ?? true}
                              onChange={() => handleTogglePreference(notif.code, 'whatsapp')}
                              disabled={!globalSettings.whatsapp}
                              style={{ cursor: globalSettings.whatsapp ? 'pointer' : 'not-allowed' }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="d-flex justify-content-end mb-4">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSavePreferences}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    );
  };

  const renderTestNotification = () => {
    const cardBg = theme === 'dark' ? '#2d2d2d' : '#fff';
    const textColor = theme === 'dark' ? '#fff' : '#212529';

    return (
      <div className="card" style={{ backgroundColor: cardBg, color: textColor }}>
        <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
          <h5 className="mb-0">Send Test Notification</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={testNotification.type}
                onChange={(e) => setTestNotification({
                  ...testNotification,
                  type: e.target.value,
                  subject: '',
                  message: ''
                })}
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="col-md-9">
              <label className="form-label">Recipient</label>
              <input
                type="text"
                className="form-control"
                placeholder={testNotification.type === 'email' ? 'email@example.com' : '+27123456789'}
                value={testNotification.recipient}
                onChange={(e) => setTestNotification({...testNotification, recipient: e.target.value})}
              />
            </div>
            {testNotification.type === 'email' && (
              <div className="col-12">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  value={testNotification.subject}
                  onChange={(e) => setTestNotification({...testNotification, subject: e.target.value})}
                />
              </div>
            )}
            <div className="col-12">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows="4"
                value={testNotification.message}
                onChange={(e) => setTestNotification({...testNotification, message: e.target.value})}
              />
            </div>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={handleSendTestNotification}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Test Notification'}
          </button>
        </div>
      </div>
    );
  };

  const renderNotificationLog = () => {
    const cardBg = theme === 'dark' ? '#2d2d2d' : '#fff';
    const textColor = theme === 'dark' ? '#fff' : '#212529';

    return (
      <div className="card" style={{ backgroundColor: cardBg, color: textColor }}>
        <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
          <h5 className="mb-0">Notification Log (Last 100)</h5>
        </div>
        <div className="card-body">
          {loadingNotifications ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Recipient</th>
                    <th>Subject/Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!notifications || notifications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="text-muted">
                          <Bell size={48} className="mb-3 opacity-50" />
                          <p className="mb-0">No notifications sent yet</p>
                          <small>Notifications will appear here once sent</small>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    notifications.map(notif => (
                      <tr key={notif.id}>
                        <td className="small">{new Date(notif.sent_at).toLocaleString()}</td>
                        <td>
                          <span className={'badge ' + (notif.type === 'email' ? 'bg-info' : 'bg-success')}>
                            {notif.type}
                          </span>
                        </td>
                        <td className="small">{notif.recipient}</td>
                        <td
                          className="small"
                          style={{
                            maxWidth: '300px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {notif.subject || notif.message}
                        </td>
                        <td>
                          <span className={'badge ' +
                            (notif.status === 'sent' ? 'bg-success' :
                             notif.status === 'failed' ? 'bg-danger' : 'bg-warning')}>
                            {notif.status}
                          </span>
                          {notif.error && (
                            <small className="text-danger d-block" title={notif.error}>
                              {notif.error.substring(0, 50)}...
                            </small>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle="Manage your notification preferences and test notifications"
      />

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Settings size={18} className="me-1" style={{ verticalAlign: 'text-bottom' }} />
            Preferences
          </button>
        </li>
        {isAdmin && (
          <>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'test' ? 'active' : ''}`}
                onClick={() => setActiveTab('test')}
              >
                <Bell size={18} className="me-1" style={{ verticalAlign: 'text-bottom' }} />
                Test Notification
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'log' ? 'active' : ''}`}
                onClick={() => setActiveTab('log')}
              >
                <Mail size={18} className="me-1" style={{ verticalAlign: 'text-bottom' }} />
                Notification Log
              </button>
            </li>
          </>
        )}
      </ul>

      {/* Tab Content */}
      {loading && activeTab === 'preferences' ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'preferences' && renderPreferences()}
          {activeTab === 'test' && renderTestNotification()}
          {activeTab === 'log' && renderNotificationLog()}
        </>
      )}
    </div>
  );
}

export default NotificationPanel;
