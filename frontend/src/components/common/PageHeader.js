import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  action
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h1
            className="d-flex align-items-center gap-3 mb-2"
            style={{
              color: isDark ? '#e8eaed' : '#202124',
              fontSize: '2rem',
              fontWeight: '600',
              letterSpacing: '-0.5px'
            }}
          >
            {Icon && (
              <span
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: isDark
                    ? 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)'
                    : 'linear-gradient(135deg, #5a8c8c 0%, #3d6a8c 100%)',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(74, 124, 124, 0.3)'
                    : '0 4px 12px rgba(74, 124, 124, 0.25)'
                }}
              >
                <Icon size={24} color="white" />
              </span>
            )}
            <span>{title}</span>
          </h1>
          {subtitle && (
            <p
              className="mb-0 ms-0 ms-md-5 ps-0 ps-md-4"
              style={{
                color: isDark ? '#c9cdd1' : '#495057',
                fontSize: '0.95rem',
                marginLeft: Icon ? '60px' : '0'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
      <hr
        className="mt-3 mb-4"
        style={{
          opacity: isDark ? 0.15 : 0.1,
          height: '2px',
          background: isDark
            ? 'linear-gradient(90deg, #4a7c7c 0%, transparent 100%)'
            : 'linear-gradient(90deg, #5a8c8c 0%, transparent 100%)'
        }}
      />
    </div>
  );
};

export default PageHeader;
