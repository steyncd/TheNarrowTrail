import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

function EmailAttendeesModal({ hike, onClose, onSuccess }) {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');

    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setSending(true);
    try {
      const result = await api.emailHikeAttendees(
        hike.id,
        { subject, message },
        token
      );

      if (result.success) {
        onSuccess?.(result.message);
        onClose();
      } else {
        setError(result.error || 'Failed to send emails');
      }
    } catch (err) {
      console.error('Send email error:', err);
      setError('Failed to send emails to attendees');
    } finally {
      setSending(false);
    }
  };

  const cardBg = theme === 'dark' ? '#2d2d2d' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#212529';
  const mutedColor = theme === 'dark' ? '#adb5bd' : '#6c757d';
  const overlayBg = theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';
  const inputBg = theme === 'dark' ? '#1a1a1a' : '#fff';

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
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h4 className="mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={24} />
              Email Attendees
            </h4>
            <small style={{ color: mutedColor }}>
              {hike.name} - {new Date(hike.date).toLocaleDateString()}
            </small>
          </div>
          <button
            className="btn btn-link"
            onClick={onClose}
            style={{ color: textColor, textDecoration: 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
            </div>
          )}

          <div className="alert alert-info mb-4" style={{ fontSize: '14px' }}>
            <Mail size={16} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
            This email will be sent to all confirmed attendees with email notifications enabled.
          </div>

          <div className="mb-3">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Important Update: Meeting Point Changed"
              disabled={sending}
              style={{
                backgroundColor: inputBg,
                color: textColor,
                border: `1px solid ${theme === 'dark' ? '#444' : '#ced4da'}`
              }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Message *</label>
            <textarea
              className="form-control"
              rows="8"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              disabled={sending}
              style={{
                backgroundColor: inputBg,
                color: textColor,
                border: `1px solid ${theme === 'dark' ? '#444' : '#ced4da'}`,
                resize: 'vertical'
              }}
            />
            <small style={{ color: mutedColor }}>
              Tip: Be clear and concise. Include any important details about the hike.
            </small>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Send size={18} />
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailAttendeesModal;
