import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import haptics from '../../utils/haptics';
import './StickyActionButtons.css';

/**
 * Sticky action buttons for mobile event detail pages
 * Only visible on mobile devices (<768px)
 */
const StickyActionButtons = ({
  userStatus,
  isRegistrationClosed,
  onInterestToggle,
  onConfirmAttendance,
  onCancelAttendance,
  theme
}) => {
  const handleInterestClick = () => {
    haptics.medium();
    onInterestToggle();
  };

  const handleConfirmClick = () => {
    haptics.success();
    onConfirmAttendance();
  };

  const handleCancelClick = () => {
    haptics.warning();
    if (window.confirm('Are you sure you want to cancel your attendance?')) {
      onCancelAttendance();
    }
  };

  // Don't show if no user status
  if (!userStatus && !isRegistrationClosed) return null;

  const isDark = theme === 'dark';

  return (
    <div className="sticky-action-buttons d-md-none">
      {/* No status - show express interest */}
      {!userStatus?.attendance_status && (
        <button
          className="btn btn-success w-100"
          onClick={handleInterestClick}
          disabled={isRegistrationClosed}
          data-tour="interest-button"
          style={{
            minHeight: '44px',
            fontSize: '0.9rem',
            fontWeight: '600',
            padding: '8px 16px'
          }}
        >
          {isRegistrationClosed ? (
            <>
              <XCircle size={18} className="me-2" />
              Registration Closed
            </>
          ) : (
            <>
              <CheckCircle size={18} className="me-2" />
              Express Interest
            </>
          )}
        </button>
      )}

      {/* Interested - show confirm button */}
      {userStatus?.attendance_status === 'interested' && (
        <button
          className="btn btn-primary w-100"
          onClick={handleConfirmClick}
          disabled={isRegistrationClosed}
          data-tour="confirm-button"
          style={{
            minHeight: '44px',
            fontSize: '0.9rem',
            fontWeight: '600',
            padding: '8px 16px'
          }}
        >
          {isRegistrationClosed ? (
            <>
              <XCircle size={18} className="me-2" />
              Registration Closed
            </>
          ) : (
            <>
              <CheckCircle size={18} className="me-2" />
              Confirm Attendance
            </>
          )}
        </button>
      )}

      {/* Confirmed - show status */}
      {userStatus?.attendance_status === 'confirmed' && (
        <div className="d-flex gap-2">
          <button
            className="btn btn-success flex-grow-1"
            disabled
            style={{
              minHeight: '44px',
              fontSize: '0.9rem',
              fontWeight: '600',
              opacity: 1,
              padding: '8px 16px'
            }}
          >
            <CheckCircle size={18} className="me-2" />
            Confirmed ✓
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={handleCancelClick}
            style={{
              minHeight: '44px',
              minWidth: '44px',
              padding: '8px'
            }}
          >
            <XCircle size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StickyActionButtons;
