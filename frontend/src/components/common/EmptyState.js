import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const EmptyState = ({ icon: Icon, title, message, action, actionLabel }) => {
  const { theme } = useTheme();

  return (
    <div
      className="card shadow-sm"
      style={{
        background: theme === 'dark' ? 'var(--card-bg)' : 'white',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
      }}
    >
      <div className="card-body text-center py-5">
        {Icon && (
          <div className="mb-4">
            <Icon
              size={64}
              style={{
                color: theme === 'dark' ? 'var(--text-muted)' : '#adb5bd',
                opacity: 0.5
              }}
            />
          </div>
        )}

        {title && (
          <h5
            className="mb-3"
            style={{
              color: theme === 'dark' ? 'var(--text-primary)' : '#212529'
            }}
          >
            {title}
          </h5>
        )}

        {message && (
          <p
            className="mb-4"
            style={{
              color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d'
            }}
          >
            {message}
          </p>
        )}

        {action && actionLabel && (
          <button
            onClick={action}
            className="btn btn-primary"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
