import React from 'react';
import { formatPhoneNumber, formatCurrency, formatGPSCoordinates } from '../../utils/formatters';

/**
 * Mobile-optimized input component with proper input types and autocomplete
 * Features: Proper keyboards, autocomplete, formatting, validation
 */
const MobileOptimizedInput = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  autoComplete,
  min,
  max,
  step,
  pattern,
  inputMode,
  className = '',
  ...props
}) => {
  // Determine input type and input mode for mobile keyboards
  const getInputAttributes = () => {
    switch (type) {
      case 'email':
        return {
          type: 'email',
          inputMode: 'email',
          autoComplete: autoComplete || 'email',
          pattern: pattern || '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'
        };

      case 'phone':
      case 'tel':
        return {
          type: 'tel',
          inputMode: 'tel',
          autoComplete: autoComplete || 'tel',
          pattern: pattern || '[0-9]{10,15}'
        };

      case 'number':
        return {
          type: 'number',
          inputMode: inputMode || 'numeric',
          pattern: pattern || '[0-9]*'
        };

      case 'currency':
        return {
          type: 'text',
          inputMode: 'decimal',
          pattern: pattern || '[0-9]+(\\.[0-9]{1,2})?'
        };

      case 'url':
        return {
          type: 'url',
          inputMode: 'url',
          autoComplete: autoComplete || 'url',
          pattern: pattern || 'https?://.+'
        };

      case 'date':
        return {
          type: 'date',
          inputMode: 'none'
        };

      case 'time':
        return {
          type: 'time',
          inputMode: 'none'
        };

      case 'password':
        return {
          type: 'password',
          inputMode: 'text',
          autoComplete: autoComplete || 'current-password'
        };

      case 'search':
        return {
          type: 'search',
          inputMode: 'search',
          autoComplete: autoComplete || 'off'
        };

      default:
        return {
          type: type,
          inputMode: inputMode || 'text',
          autoComplete: autoComplete || 'off'
        };
    }
  };

  // Format value based on type
  const handleChange = (e) => {
    let formattedValue = e.target.value;

    switch (type) {
      case 'phone':
      case 'tel':
        formattedValue = formatPhoneNumber(formattedValue);
        break;

      case 'currency':
        // Remove non-numeric characters except decimal point
        formattedValue = formattedValue.replace(/[^0-9.]/g, '');
        // Ensure only one decimal point
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
          formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        // Limit to 2 decimal places
        if (parts[1] && parts[1].length > 2) {
          formattedValue = parseFloat(formattedValue).toFixed(2);
        }
        break;

      default:
        break;
    }

    onChange({ ...e, target: { ...e.target, value: formattedValue } });
  };

  const inputAttributes = getInputAttributes();
  const inputId = props.id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <input
        id={inputId}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        style={{
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          minHeight: '44px', // Touch-friendly minimum height
          ...props.style
        }}
        {...inputAttributes}
        {...props}
      />

      {hint && !error && (
        <div className="form-text">{hint}</div>
      )}

      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
};

export default MobileOptimizedInput;
