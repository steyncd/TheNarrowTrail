import React, { useState, useEffect, useRef } from 'react';

/**
 * Reusable Text Input Setting Component with Debouncing
 */
const SettingText = ({
  label,
  description,
  value,
  onChange,
  placeholder = '',
  maxLength = null,
  multiline = false,
  rows = 3,
  disabled = false,
  type = 'text',
  debounceMs = 500
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef(null);

  // Update local value when prop value changes (e.g., reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue) => {
    setLocalValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to call onChange after delay
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-3 pb-3 border-bottom">
      <label className="fw-bold">{label}</label>
      {description && (
        <div className="text-muted small mb-2">{description}</div>
      )}
      {multiline ? (
        <textarea
          className="form-control"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          className="form-control"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
        />
      )}
      {maxLength && (
        <div className="text-muted small mt-1">
          {localValue?.length || 0} / {maxLength} characters
        </div>
      )}
    </div>
  );
};

export default SettingText;
