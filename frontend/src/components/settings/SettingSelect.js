import React from 'react';

/**
 * Reusable Select/Dropdown Setting Component
 */
const SettingSelect = ({ 
  label, 
  description, 
  value, 
  onChange, 
  options = [],
  disabled = false 
}) => {
  // Normalize options to always be { value, label }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  return (
    <div className="mb-3 pb-3 border-bottom">
      <label className="fw-bold">{label}</label>
      {description && (
        <div className="text-muted small mb-2">{description}</div>
      )}
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ maxWidth: '300px' }}
      >
        {normalizedOptions.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SettingSelect;
