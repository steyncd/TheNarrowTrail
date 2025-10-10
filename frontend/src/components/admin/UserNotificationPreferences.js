import React, { useState, useEffect } from 'react';
import { Bell, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

// All notification types
const NOTIFICATION_TYPES = [
  { code: 'email_verification', name: 'Email Verification', critical: true },
  { code: 'account_approved', name: 'Account Approval', critical: false },
  { code: 'account_rejected', name: 'Account Rejection', critical: false },
  { code: 'password_reset_request', name: 'Password Reset Request', critical: true },
  { code: 'password_reset_confirmed', name: 'Password Reset Confirmation', critical: false },
  { code: 'admin_password_reset', name: 'Admin Password Reset', critical: true },
  { code: 'admin_promotion', name: 'Admin Promotion', critical: false },
  { code: 'new_hike_added', name: 'New Hike Added', critical: false },
  { code: 'hike_announcement', name: 'Hike Announcement', critical: false },
  { code: 'new_registration', name: 'New Registration (Admin)', critical: false },
  { code: 'hike_interest', name: 'Hike Interest (Admin)', critical: false },
  { code: 'attendance_confirmed', name: 'Attendance Confirmed (Admin)', critical: false },
  { code: 'new_feedback', name: 'New Feedback (Admin)', critical: false },
  { code: 'new_suggestion', name: 'New Suggestion (Admin)', critical: false }
];

function UserNotificationPreferences({ user, onClose, onSave }) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.notification_preferences) {
      setPreferences(user.notification_preferences);
    } else {
      // Initialize with all enabled
      const initial = {};
      NOTIFICATION_TYPES.forEach(type => {
        initial[type.code] = { email: true, whatsapp: true };
      });
      setPreferences(initial);
    }
  }, [user]);

  const handleToggle = (notifCode, channel) => {
    setPreferences(prev => ({
      ...prev,
      [notifCode]: {
        ...prev[notifCode],
        [channel]: !prev[notifCode]?.[channel]
      }
    }));
  };

  const handleBulkToggle = (channel, value) => {
    const updated = {};
    NOTIFICATION_TYPES.forEach(type => {
      if (!type.critical) {
        updated[type.code] = {
          ...preferences[type.code],
          [channel]: value
        };
      } else {
        // Keep critical notifications as-is
        updated[type.code] = preferences[type.code] || { email: true, whatsapp: true };
      }
    });
    setPreferences(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Prepare the data in the format expected by the API
      const requestData = {
        global: {
          email: true, // Default global email setting
          whatsapp: true // Default global whatsapp setting
        },
        preferences: preferences
      };

      const result = await api.updateUserNotificationPreferences(
        user.id,
        requestData,
        token
      );

      if (result.success && result.data) {
        onSave?.();
        onClose();
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
  const cardBg = theme === 'dark' ? '#2d2d2d' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#212529';
  const mutedColor = theme === 'dark' ? '#adb5bd' : '#6c757d';
  const overlayBg = theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: overlayBg,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: cardBg,
          color: textColor,
          borderRadius: '12px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={24} />
            <h5 style={{ margin: 0, fontSize: '1.25rem' }}>
              Notification Preferences for {user?.name}
            </h5>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              color: mutedColor
            }}
            aria-label="Close"
          >
            <CloseIcon size={24} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <p style={{ color: mutedColor, marginBottom: '16px', fontSize: '0.95rem' }}>
              Configure notification preferences for each type. Critical notifications (marked with 🔒) cannot be disabled for security purposes.
            </p>
            
            {/* Bulk actions */}
            <div 
              style={{ 
                padding: '12px 16px',
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                borderRadius: '8px',
                border: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <strong style={{ fontSize: '0.9rem' }}>Bulk Actions:</strong>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleBulkToggle('email', true)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ✓ Enable All Email
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleBulkToggle('email', false)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ✕ Disable All Email
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleBulkToggle('whatsapp', true)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ✓ Enable All SMS
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleBulkToggle('whatsapp', false)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ✕ Disable All SMS
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ maxHeight: '450px', overflowY: 'auto', marginBottom: '16px', border: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`, borderRadius: '8px' }}>
            <table className="table table-sm table-hover" style={{ marginBottom: 0 }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f8f9fa', zIndex: 1 }}>
                <tr>
                  <th style={{ borderBottom: `2px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`, padding: '12px', fontWeight: '600' }}>Notification Type</th>
                  <th className="text-center" style={{ width: '100px', borderBottom: `2px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`, padding: '12px', fontWeight: '600' }}>📧 Email</th>
                  <th className="text-center" style={{ width: '100px', borderBottom: `2px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`, padding: '12px', fontWeight: '600' }}>💬 SMS</th>
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_TYPES.map(notif => (
                  <tr 
                    key={notif.code}
                    style={{
                      backgroundColor: notif.critical ? (theme === 'dark' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)') : 'transparent'
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {notif.critical && <span title="Critical - Always enabled" style={{ fontSize: '1rem' }}>🔒</span>}
                        <span style={{ fontWeight: notif.critical ? '600' : '400' }}>{notif.name}</span>
                      </div>
                    </td>
                    <td className="text-center" style={{ padding: '10px 12px' }}>
                      {notif.critical ? (
                        <span title="Always enabled for security" style={{ fontSize: '1.3rem', color: '#28a745' }}>✓</span>
                      ) : (
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={preferences[notif.code]?.email ?? true}
                          onChange={() => handleToggle(notif.code, 'email')}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                      )}
                    </td>
                    <td className="text-center" style={{ padding: '10px 12px' }}>
                      {notif.critical ? (
                        <span title="Always enabled for security" style={{ fontSize: '1.3rem', color: '#28a745' }}>✓</span>
                      ) : (
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={preferences[notif.code]?.whatsapp ?? true}
                          onChange={() => handleToggle(notif.code, 'whatsapp')}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div 
            className="alert alert-info" 
            style={{ 
              fontSize: '0.875rem', 
              marginBottom: 0,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'start',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
            <div>
              <strong>Note:</strong> Critical notifications (🔒) are always enabled for security and cannot be disabled.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderTop: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserNotificationPreferences;
