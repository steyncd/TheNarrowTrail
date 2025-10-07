import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 'medium', color = 'primary', fullScreen = false, message = '' }) => {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60
  };

  const colorMap = {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529',
    white: '#ffffff'
  };

  const iconSize = sizeMap[size] || 40;
  const iconColor = colorMap[color] || colorMap.primary;

  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div style={{ animation: 'spin 1s linear infinite' }}>
        <Loader size={iconSize} color={iconColor} />
      </div>
      {message && (
        <div className="mt-3 text-muted" style={{ fontSize: '0.9rem' }}>
          {message}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          background: 'rgba(255,255,255,0.9)',
          zIndex: 9999
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      {spinner}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
