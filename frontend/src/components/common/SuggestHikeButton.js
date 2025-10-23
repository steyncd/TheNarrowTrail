import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

const SuggestHikeButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [suggestionType, setSuggestionType] = useState('date_and_destination');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [destinationDescription, setDestinationDescription] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { token } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.submitSuggestion(
        {
          suggestion_type: suggestionType,
          suggested_date: suggestedDate || null,
          destination_name: destinationName || null,
          destination_description: destinationDescription || null,
          message: message || null
        },
        token
      );
      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setSuggestionType('date_and_destination');
        setSuggestedDate('');
        setDestinationName('');
        setDestinationDescription('');
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting suggestion:', err);
      setError('Failed to submit suggestion. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button - Small and Subtle */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-outline-secondary shadow-sm d-none d-md-flex"
        style={{
          position: 'fixed',
          bottom: '78px',
          right: '20px',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          padding: '0',
          zIndex: 999,
          border: '1px solid rgba(108, 117, 125, 0.3)',
          background: theme === 'dark' ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Suggest a Hike"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'rgba(108, 117, 125, 0.3)';
        }}
      >
        <Lightbulb size={20} strokeWidth={1.5} />
      </button>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop show"
            onClick={() => setShowModal(false)}
            style={{ zIndex: 1040 }}
          />
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
              <div
                className="modal-content"
                style={{
                  background: theme === 'dark' ? '#2d2d2d' : 'white',
                  color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                  maxHeight: '90vh'
                }}
              >
                <div className="modal-header border-bottom">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <Lightbulb size={24} />
                    Suggest a Hike
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    style={{
                      filter: theme === 'dark' ? 'invert(1)' : 'none'
                    }}
                  />
                </div>

                <div className="modal-body">
                  {submitted ? (
                    <div className="alert alert-success" role="alert">
                      <strong>Thank you!</strong> Your suggestion has been submitted successfully.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label">What would you like to suggest?</label>
                        <select
                          className="form-select"
                          value={suggestionType}
                          onChange={(e) => setSuggestionType(e.target.value)}
                          required
                          style={{
                            background: theme === 'dark' ? '#1a1a1a' : 'white',
                            color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                            borderColor: theme === 'dark' ? '#444' : '#ced4da'
                          }}
                        >
                          <option value="date_and_destination">Date and Destination</option>
                          <option value="destination_only">Destination Only</option>
                          <option value="date_only">Date Only</option>
                        </select>
                      </div>

                      {(suggestionType === 'date_only' || suggestionType === 'date_and_destination') && (
                        <div className="mb-3">
                          <label className="form-label">Suggested Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={suggestedDate}
                            onChange={(e) => setSuggestedDate(e.target.value)}
                            required={suggestionType !== 'destination_only'}
                            style={{
                              background: theme === 'dark' ? '#1a1a1a' : 'white',
                              color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                              borderColor: theme === 'dark' ? '#444' : '#ced4da'
                            }}
                          />
                        </div>
                      )}

                      {(suggestionType === 'destination_only' || suggestionType === 'date_and_destination') && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Destination Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g., Table Mountain, Cape Town"
                              value={destinationName}
                              onChange={(e) => setDestinationName(e.target.value)}
                              required={suggestionType !== 'date_only'}
                              style={{
                                background: theme === 'dark' ? '#1a1a1a' : 'white',
                                color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                                borderColor: theme === 'dark' ? '#444' : '#ced4da'
                              }}
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Destination Description</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              placeholder="Tell us about this destination..."
                              value={destinationDescription}
                              onChange={(e) => setDestinationDescription(e.target.value)}
                              style={{
                                background: theme === 'dark' ? '#1a1a1a' : 'white',
                                color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                                borderColor: theme === 'dark' ? '#444' : '#ced4da'
                              }}
                            />
                          </div>
                        </>
                      )}

                      <div className="mb-3">
                        <label className="form-label">Additional Notes (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Any additional details or context..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          style={{
                            background: theme === 'dark' ? '#1a1a1a' : 'white',
                            color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                            borderColor: theme === 'dark' ? '#444' : '#ced4da'
                          }}
                        />
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-warning"
                          disabled={submitting}
                        >
                          {submitting ? 'Submitting...' : 'Submit Suggestion'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SuggestHikeButton;
