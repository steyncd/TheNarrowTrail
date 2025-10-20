import React, { useState } from 'react';
import { FormGroup, Label, Input, Button, Alert } from 'reactstrap';

/**
 * Reusable JSON Editor Setting Component
 * @param {string} label - Setting label
 * @param {string} description - Setting description (optional)
 * @param {object|array} value - Current JSON value
 * @param {function} onChange - Callback when value changes
 * @param {boolean} disabled - Whether the editor is disabled
 * @param {number} rows - Number of rows for textarea
 */
const SettingJson = ({ 
  label, 
  description, 
  value, 
  onChange, 
  disabled = false,
  rows = 5
}) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState(null);

  const handleChange = (text) => {
    setJsonText(text);
    setError(null);
    
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
    } catch (err) {
      setError('Cannot format invalid JSON');
    }
  };

  return (
    <FormGroup className="mb-3 border-bottom pb-3">
      <Label className="fw-bold">{label}</Label>
      {description && (
        <div className="text-muted small mb-2">{description}</div>
      )}
      <Input
        type="textarea"
        value={jsonText}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        style={{ fontFamily: 'monospace', fontSize: '0.9em' }}
      />
      {error && (
        <Alert color="danger" className="mt-2 mb-0 py-2 px-3 small">
          {error}
        </Alert>
      )}
      <Button
        color="link"
        size="sm"
        onClick={formatJson}
        disabled={disabled || !!error}
        className="mt-1 p-0"
      >
        Format JSON
      </Button>
    </FormGroup>
  );
};

export default SettingJson;
