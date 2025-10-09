import React, { useState } from 'react';
import { Trash2, AlertTriangle, Shield, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

function AccountDeletion({ show, onClose, onDeleted }) {
  const { token, logout } = useAuth();
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation

  const isDark = theme === 'dark';
  const cardBg = isDark ? '#2d2d2d' : '#fff';
  const textColor = isDark ? '#fff' : '#212529';
  const mutedColor = isDark ? '#adb5bd' : '#6c757d';

  // Don't render if not shown
  if (!show) return null;

  const handleDelete = async () => {
    setError('');

    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    if (!password) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${api.API_URL}/api/profile/delete/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmPassword: password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Account deleted successfully
        onDeleted?.();
        logout();
        // User will be redirected to landing page by logout
      } else {
        setError(data.error || 'Failed to delete account');
        setLoading(false);
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setError('Failed to delete account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${isDark ? '#444' : '#dee2e6'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trash2 size={24} />
            <h5 style={{ margin: 0, fontSize: '1.25rem' }}>Delete Account</h5>
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
              color: 'white',
              fontSize: '1.5rem'
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {step === 1 && (
            <>
              <div className="alert alert-danger mb-4">
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <AlertTriangle size={32} className="flex-shrink-0" />
                  <div>
                    <h6 className="mb-2"><strong>⚠️ Warning: This Action is Permanent</strong></h6>
                    <p className="mb-0">
                      Deleting your account will permanently remove all your data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <h6 className="mb-3" style={{ color: textColor }}>
                <Shield size={18} className="me-2" />
                What will be deleted:
              </h6>

              <ul style={{ color: mutedColor, marginBottom: '24px' }}>
                <li>Your profile information (name, email, phone)</li>
                <li>All hike registrations and attendance records</li>
                <li>Emergency contact information</li>
                <li>Payment history</li>
                <li>Uploaded photos and comments</li>
                <li>Feedback and suggestions</li>
                <li>All notification preferences</li>
              </ul>

              <h6 className="mb-3" style={{ color: textColor }}>
                <Lock size={18} className="me-2" />
                What happens after deletion:
              </h6>

              <ul style={{ color: mutedColor, marginBottom: '24px' }}>
                <li>You will be immediately logged out</li>
                <li>Your data will be permanently removed from our systems</li>
                <li>You will need to register again if you want to rejoin</li>
                <li>Activity logs may be retained for security purposes (anonymous)</li>
              </ul>

              <div className="alert alert-info">
                <strong>💡 Alternative:</strong> If you just want to stop receiving notifications, 
                you can update your notification preferences in your profile settings instead.
              </div>

              <div className="d-flex gap-2 justify-content-end mt-4">
                <button
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setStep(2)}
                >
                  Continue to Deletion
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="alert alert-danger mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangle size={24} />
                  <strong>Final Confirmation Required</strong>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label" style={{ color: textColor, fontWeight: '600' }}>
                  Type "DELETE MY ACCOUNT" to confirm:
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  disabled={loading}
                  style={{ fontFamily: 'monospace' }}
                />
                <small style={{ color: mutedColor }}>
                  Must match exactly (case-sensitive)
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ color: textColor, fontWeight: '600' }}>
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  disabled={loading}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading || confirmText !== 'DELETE MY ACCOUNT' || !password}
                >
                  {loading ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountDeletion;
