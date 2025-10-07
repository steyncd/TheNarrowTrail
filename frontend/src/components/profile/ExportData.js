import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { exportUserData } from '../../utils/exportUtils';

const ExportData = ({ hikes }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [format, setFormat] = useState('json');

  const handleExport = () => {
    exportUserData(currentUser, hikes, format);
  };

  return (
    <div
      className="card shadow-sm"
      style={{
        background: theme === 'dark' ? 'var(--card-bg)' : 'white',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
      }}
    >
      <div className="card-body">
        <h5
          className="card-title mb-3"
          style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
        >
          <Download size={20} className="me-2" />
          Export Your Data
        </h5>

        <p
          className="card-text mb-3"
          style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d' }}
        >
          Download your hiking history and personal data in your preferred format.
        </p>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
          >
            Export Format
          </label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="exportFormat"
                id="formatJson"
                value="json"
                checked={format === 'json'}
                onChange={(e) => setFormat(e.target.value)}
              />
              <label
                className="form-check-label"
                htmlFor="formatJson"
                style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
              >
                <FileJson size={16} className="me-1" />
                JSON
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="exportFormat"
                id="formatCsv"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value)}
              />
              <label
                className="form-check-label"
                htmlFor="formatCsv"
                style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}
              >
                <FileSpreadsheet size={16} className="me-1" />
                CSV
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="btn btn-primary w-100"
        >
          <Download size={18} className="me-2" />
          Download My Data
        </button>

        <div
          className="mt-3 small"
          style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#adb5bd' }}
        >
          Your export will include your profile information and complete hiking history.
        </div>
      </div>
    </div>
  );
};

export default ExportData;
