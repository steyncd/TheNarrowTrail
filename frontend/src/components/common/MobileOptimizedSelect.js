import React from 'react';

/**
 * Mobile-optimized select dropdown with native mobile picker
 */
const MobileOptimizedSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  hint,
  multiple = false,
  className = '',
  ...props
}) => {
  const selectId = props.id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        multiple={multiple}
        style={{
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          minHeight: '44px',
          ...props.style
        }}
        {...props}
      >
        {!multiple && placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}

        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const optionDisabled = typeof option === 'object' ? option.disabled : false;

          return (
            <option key={optionValue} value={optionValue} disabled={optionDisabled}>
              {optionLabel}
            </option>
          );
        })}
      </select>

      {hint && !error && (
        <div className="form-text">{hint}</div>
      )}

      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
};

export default MobileOptimizedSelect;
