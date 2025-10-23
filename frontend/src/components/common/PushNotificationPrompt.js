import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const PushNotificationPrompt = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkShouldShow = () => {
      // Don't show if not supported
      if (!pushNotificationService.isSupported()) return;

      // Don't show if already decided
      const promptDismissed = localStorage.getItem('push_prompt_dismissed');
      if (promptDismissed) return;

      // Don't show if already granted or denied
      const permission = pushNotificationService.getPermissionStatus();
      if (permission === 'granted' || permission === 'denied') return;

      // Don't show on first session - wait until 2nd visit
      const sessionCount = parseInt(localStorage.getItem('session_count') || '0');
      if (sessionCount < 2) return;

      // Show the prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    // Track session count
    const sessionCount = parseInt(localStorage.getItem('session_count') || '0');
    localStorage.setItem('session_count', (sessionCount + 1).toString());

    checkShouldShow();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await pushNotificationService.requestPermission();

      if (permission === 'granted') {
        await pushNotificationService.subscribe(token);

        // Send test notification
        await pushNotificationService.sendTestNotification();

        // Close prompt
        setShowPrompt(false);

        // Show success message
        alert('✅ Push notifications enabled! You\'ll receive timely updates about events, deadlines, and more.');
      } else {
        alert('Push notifications were not enabled. You can enable them anytime in your browser settings.');
        setShowPrompt(false);
        localStorage.setItem('push_prompt_dismissed', 'true');
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      alert('Failed to enable push notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('push_prompt_dismissed', 'true');
    localStorage.setItem('push_prompt_dismissed_date', new Date().toISOString());
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Clear the dismissed flag so it can show again next session
    localStorage.removeItem('push_prompt_dismissed');
  };

  if (!showPrompt) return null;

  return (
    <div
      className="push-notification-prompt"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '400px',
        zIndex: 1060,
        animation: 'slideInUp 0.3s ease-out'
      }}
    >
      <div
        className="card shadow-lg"
        style={{
          background: theme === 'dark' ? 'var(--card-bg)' : 'white',
          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div
          className="card-header d-flex justify-content-between align-items-center"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
            borderBottom: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <Bell size={20} className="text-primary" />
            <strong>Stay Updated!</strong>
          </div>
          <button
            onClick={handleDismiss}
            className="btn btn-sm btn-link text-muted p-0"
            style={{ textDecoration: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="card-body">
          <p className="mb-3">
            Enable push notifications to get instant alerts for:
          </p>
          <ul className="small mb-3" style={{ paddingLeft: '20px' }}>
            <li>New events matching your preferences</li>
            <li>Registration deadlines approaching</li>
            <li>Payment reminders</li>
            <li>Carpool updates</li>
            <li>Event comments and announcements</li>
          </ul>
          <p className="small text-muted mb-0">
            You can disable notifications anytime in your settings.
          </p>
        </div>

        <div className="card-footer d-flex gap-2" style={{
          background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
          borderTop: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
        }}>
          <button
            onClick={handleEnable}
            className="btn btn-primary flex-grow-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Enabling...
              </>
            ) : (
              <>
                <Bell size={16} className="me-2" />
                Enable Notifications
              </>
            )}
          </button>
          <button
            onClick={handleRemindLater}
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            Later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PushNotificationPrompt;
