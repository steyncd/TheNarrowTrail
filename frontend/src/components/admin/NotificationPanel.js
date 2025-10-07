import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PageHeader from '../common/PageHeader';

function NotificationPanel() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testNotification, setTestNotification] = useState({
    type: 'email',
    recipient: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications(token);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleSendTestNotification = async () => {
    setError('');

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
        alert('Test notification sent successfully!');
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

  return (
    <div>
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle="Send test notifications and view notification history"
      />

      {/* Test Notification */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Test Notification</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
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

      {/* Notification Log */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Notification Log (Last 100)</h5>
        </div>
        <div className="card-body">
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
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No notifications sent yet</td>
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
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;
