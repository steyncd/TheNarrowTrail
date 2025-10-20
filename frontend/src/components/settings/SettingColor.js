import React from 'react';

/**
 * Reusable Color Picker Setting Component
 */
const SettingColor = ({ 
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
      <div className="d-flex align-items-center gap-3">
        <input
          type="color"
          className="form-control form-control-color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{ width: '60px', height: '40px', cursor: 'pointer' }}
        />
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          style={{ maxWidth: '120px', fontFamily: 'monospace' }}
        />
        <div 
          className="border rounded"
          style={{ 
            width: '100px', 
            height: '40px', 
            backgroundColor: value,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        />
      </div>
    </div>
  );
};

export default SettingColor;
