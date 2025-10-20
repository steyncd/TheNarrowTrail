import React from 'react';

/**
 * Reusable Boolean Toggle Setting Component
 * @param {string} label - Setting label
 * @param {string} description - Setting description (optional)
 * @param {boolean} value - Current value
 * @param {function} onChange - Callback when value changes
 * @param {boolean} disabled - Whether the toggle is disabled
 */
const SettingToggle = ({ 
  label, 
  description, 
  value, 
  onChange, 
  disabled = false
}) => {
  return (
    <div className="mb-3 pb-3 border-bottom">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <label className="mb-1 fw-bold">{label}</label>
          {description && (
            <div className="text-muted small">{description}</div>
          )}
        </div>
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            role="switch"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingToggle;
