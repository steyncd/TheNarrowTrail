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
    <div
      className="mb-3 p-3 rounded"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(45, 45, 45, 0.7) 0%, rgba(26, 26, 26, 0.5) 100%)'
          : 'linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {Icon && (
            <span
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isDark
                  ? 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)'
                  : 'linear-gradient(135deg, #5a8c8c 0%, #3d6a8c 100%)',
                boxShadow: isDark
                  ? '0 2px 6px rgba(74, 124, 124, 0.3)'
                  : '0 2px 6px rgba(74, 124, 124, 0.25)',
                flexShrink: 0
              }}
            >
              <Icon size={20} color="white" />
            </span>
          )}
          <div>
            <h1
              className="mb-0"
              style={{
                color: isDark ? '#ffffff' : '#202124',
                fontSize: '1.5rem',
                fontWeight: '600',
                letterSpacing: '-0.3px',
                lineHeight: '1.3',
                textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mb-0 mt-1"
                style={{
                  color: isDark ? '#d0d0d0' : '#5f6368',
                  fontSize: '0.8rem',
                  lineHeight: '1.2',
                  textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
