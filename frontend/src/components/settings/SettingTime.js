import React from 'react';

/**
 * Reusable Time Picker Setting Component
 */
const SettingTime = ({ 
  label, 
  description, 
  value, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className="mb-3 pb-3 border-bottom">
      <label className="fw-bold">{label}</label>
      {description && (
        <div className="text-muted small mb-2">{description}</div>
      )}
      <input
        type="time"
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ maxWidth: '200px' }}
      />
    </div>
  );
};

export default SettingTime;
