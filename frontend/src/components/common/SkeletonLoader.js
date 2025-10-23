import React from 'react';
import './SkeletonLoader.css';

/**
 * Skeleton Loader Component for better perceived performance
 */
const SkeletonLoader = ({ variant = 'card', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`skeleton-card ${className}`}>
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
              <div className="skeleton-footer">
                <div className="skeleton-badge" />
                <div className="skeleton-badge" />
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`skeleton-list-item ${className}`}>
            <div className="skeleton-avatar" />
            <div className="skeleton-list-content">
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`skeleton-text-block ${className}`}>
            <div className="skeleton-text" />
            <div className="skeleton-text" />
            <div className="skeleton-text short" />
          </div>
        );

      case 'header':
        return (
          <div className={`skeleton-header ${className}`}>
            <div className="skeleton-title large" />
            <div className="skeleton-text" />
          </div>
        );

      case 'image':
        return <div className={`skeleton-image ${className}`} />;

      case 'circle':
        return <div className={`skeleton-circle ${className}`} />;

      case 'button':
        return <div className={`skeleton-button ${className}`} />;

      default:
        return <div className={`skeleton-box ${className}`} />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader;
