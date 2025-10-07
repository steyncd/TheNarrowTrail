import React, { useState } from 'react';
import { CheckSquare, Mail, Edit, Download, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { exportToCSV } from '../../utils/exportUtils';

const BulkActions = ({ hikes, selectedHikes, onSelectAll, onDeselectAll, onSelectionChange }) => {
  const { theme } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const allSelected = selectedHikes.length === hikes.length && hikes.length > 0;
  const someSelected = selectedHikes.length > 0 && selectedHikes.length < hikes.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const handleExportSelected = () => {
    const selectedHikeData = hikes.filter(h => selectedHikes.includes(h.id));
    const exportData = selectedHikeData.map(hike => ({
      id: hike.id,
      name: hike.name,
      date: hike.date,
      difficulty: hike.difficulty,
      type: hike.type,
      status: hike.status,
      distance: hike.distance,
      cost: hike.cost || 0,
      interested: hike.interested_users?.length || 0,
      confirmed: hike.confirmed_users?.length || 0
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `hikes-export-${timestamp}.csv`);
  };

  const handleSendEmail = () => {
    // In a real app, this would call an API to send emails
    console.log('Sending email to participants of:', selectedHikes);
    console.log('Subject:', emailSubject);
    console.log('Message:', emailMessage);

    alert(`Email would be sent to all participants of ${selectedHikes.length} selected hike(s)`);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailMessage('');
  };

  return (
    <>
      <div
        className="card shadow-sm mb-4"
        style={{
          background: theme === 'dark' ? 'var(--card-bg)' : 'white',
          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
        }}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5
                className="mb-1"
                style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
              >
                Bulk Actions
              </h5>
              <p
                className="mb-0 small"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d' }}
              >
                {selectedHikes.length} hike{selectedHikes.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={() => setShowActions(!showActions)}
              className="btn btn-sm btn-outline-primary"
            >
              {showActions ? 'Hide Actions' : 'Show Actions'}
            </button>
          </div>

          {/* Select All Checkbox */}
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="selectAll"
              checked={allSelected}
              ref={input => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={handleSelectAll}
            />
            <label
              className="form-check-label"
              htmlFor="selectAll"
              style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
            >
              {allSelected ? 'Deselect All' : 'Select All'} ({hikes.length} hikes)
            </label>
          </div>

          {/* Action Buttons */}
          {showActions && selectedHikes.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              <button
                onClick={() => setShowEmailModal(true)}
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              >
                <Mail size={16} />
                Email Participants
              </button>

              <button
                onClick={handleExportSelected}
                className="btn btn-success btn-sm d-flex align-items-center gap-2"
              >
                <Download size={16} />
                Export Selected
              </button>

              <button
                onClick={onDeselectAll}
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
              >
                <X size={16} />
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
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
                  Send Email to Participants
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEmailModal(false)}
                  style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
                ></button>
              </div>

              <div className="modal-body">
                <p
                  className="text-muted"
                  style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d' }}
                >
                  This email will be sent to all confirmed participants of the {selectedHikes.length} selected hike(s).
                </p>

                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                    style={{
                      background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                      color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                      border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
                  >
                    Message
                  </label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Your message..."
                    style={{
                      background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                      color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                      border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSendEmail}
                  disabled={!emailSubject || !emailMessage}
                >
                  <Mail size={18} className="me-2" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;
