import React, { useRef, useEffect } from 'react';

/**
 * Mobile-optimized textarea with auto-resize and character counting
 */
const MobileOptimizedTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  maxLength,
  minRows = 3,
  maxRows = 10,
  autoResize = true,
  showCharCount = false,
  className = '',
  ...props
}) => {
  const textareaRef = useRef(null);
  const textareaId = props.id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  // Auto-resize textarea based on content
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;

      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, minRows, maxRows]);

  const characterCount = value?.length || 0;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <textarea
        ref={textareaRef}
        id={textareaId}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        rows={minRows}
        style={{
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          minHeight: '100px',
          resize: autoResize ? 'none' : 'vertical',
          ...props.style
        }}
        {...props}
      />

      <div className="d-flex justify-content-between align-items-center">
        {hint && !error && (
          <div className="form-text">{hint}</div>
        )}

        {showCharCount && maxLength && (
          <div
            className={`form-text ms-auto ${
              isOverLimit
                ? 'text-danger'
                : isNearLimit
                ? 'text-warning'
                : 'text-muted'
            }`}
            style={{ fontSize: '0.75rem' }}
          >
            {characterCount} / {maxLength}
          </div>
        )}
      </div>

      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
};

export default MobileOptimizedTextarea;
