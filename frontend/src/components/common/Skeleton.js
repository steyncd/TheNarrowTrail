// components/common/Skeleton.js - Loading skeleton components
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', className = '', style = {} }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
        backgroundImage: isDark
          ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 100%)'
          : 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        ...style
      }}
    />
  );
};

export const HikeCardSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div
        className="card h-100"
        style={{
          background: isDark ? 'var(--card-bg)' : 'white',
          border: isDark ? '1px solid var(--border-color)' : '1px solid #dee2e6'
        }}
      >
        <Skeleton height="200px" borderRadius="0" />
        <div className="card-body">
          <Skeleton height="24px" width="80%" style={{ marginBottom: '12px' }} />
          <Skeleton height="16px" width="40%" style={{ marginBottom: '8px' }} />
          <Skeleton height="16px" width="60%" style={{ marginBottom: '12px' }} />
          <div className="d-flex gap-2 mb-3">
            <Skeleton height="24px" width="80px" borderRadius="12px" />
            <Skeleton height="24px" width="80px" borderRadius="12px" />
          </div>
          <Skeleton height="40px" width="100%" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <Skeleton height="150px" width="150px" borderRadius="50%" style={{ margin: '0 auto 16px' }} />
              <Skeleton height="28px" width="60%" style={{ margin: '0 auto 8px' }} />
              <Skeleton height="20px" width="40%" style={{ margin: '0 auto 16px' }} />
              <Skeleton height="40px" width="100%" style={{ marginBottom: '8px' }} />
              <Skeleton height="40px" width="100%" />
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <Skeleton height="24px" width="40%" style={{ marginBottom: '16px' }} />
              <Skeleton height="16px" width="100%" style={{ marginBottom: '8px' }} />
              <Skeleton height="16px" width="90%" style={{ marginBottom: '8px' }} />
              <Skeleton height="16px" width="80%" />
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <Skeleton height="24px" width="30%" style={{ marginBottom: '16px' }} />
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Skeleton height="60px" borderRadius="8px" />
                </div>
                <div className="col-md-3 mb-3">
                  <Skeleton height="60px" borderRadius="8px" />
                </div>
                <div className="col-md-3 mb-3">
                  <Skeleton height="60px" borderRadius="8px" />
                </div>
                <div className="col-md-3 mb-3">
                  <Skeleton height="60px" borderRadius="8px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <Skeleton height="20px" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <Skeleton height="16px" width={`${60 + Math.random() * 30}%`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="d-flex align-items-center mb-3 pb-3 border-bottom">
          <Skeleton height="50px" width="50px" borderRadius="50%" style={{ marginRight: '16px' }} />
          <div style={{ flex: 1 }}>
            <Skeleton height="20px" width="70%" style={{ marginBottom: '8px' }} />
            <Skeleton height="16px" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Skeleton;
