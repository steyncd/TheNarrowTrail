import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const FeedbackButton = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.submitFeedback(
        {
          feedback_type: feedbackType,
          message: message
        },
        token
      );

      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setMessage('');
        setFeedbackType('suggestion');
        setSubmitting(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button - Small and Subtle */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-outline-secondary shadow-sm"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          padding: '0',
          zIndex: 1000,
          border: '1px solid rgba(108, 117, 125, 0.3)',
          background: theme === 'dark' ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Send Feedback"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.borderColor = 'rgba(13, 110, 253, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'rgba(108, 117, 125, 0.3)';
        }}
      >
        <MessageSquare size={20} strokeWidth={1.5} />
      </button>

      {/* Feedback Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                background: theme === 'dark' ? 'var(--card-bg)' : 'white',
                border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
              }}
            >
              <div className="modal-header">
                <h5
                  className="modal-title"
                  style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
                >
                  Send Feedback
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
                ></button>
              </div>

              <div className="modal-body">
                {submitted ? (
                  <div className="text-center py-4">
                    <div className="text-success mb-3">
                      <Send size={48} />
                    </div>
                    <h5>Thank you for your feedback!</h5>
                    <p className="text-muted">We appreciate your input.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
                      >
                        Feedback Type
                      </label>
                      <select
                        className="form-select"
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        style={{
                          background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                          color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da'
                        }}
                        required
                      >
                        <option value="suggestion">Suggestion</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="compliment">Compliment</option>
                        <option value="complaint">Complaint</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
                      >
                        Your Message
                      </label>
                      <textarea
                        className="form-control"
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what's on your mind..."
                        style={{
                          background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                          color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da'
                        }}
                        required
                      />
                    </div>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary flex-grow-1"
                        disabled={submitting}
                      >
                        <Send size={18} className="me-2" />
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
