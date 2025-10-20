import React from 'react';

/**
 * Reusable Number Input Setting Component
 */
const SettingNumber = ({ 
  label, 
  description, 
  value, 
  onChange, 
  min = 0,
  max = null,
  step = 1,
  unit = '',
  disabled = false 
}) => {
  return (
    <div className="mb-3 pb-3 border-bottom">
      <label className="fw-bold">{label}</label>
      {description && (
        <div className="text-muted small mb-2">{description}</div>
      )}
      <div className="d-flex align-items-center gap-2">
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          style={{ maxWidth: '200px' }}
        />
        {unit && <span className="text-muted">{unit}</span>}
      </div>
    </div>
  );
};

export default SettingNumber;
