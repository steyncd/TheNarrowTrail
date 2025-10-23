import React from 'react';
import { RefreshCw } from 'lucide-react';
import './PullToRefreshIndicator.css';

/**
 * Pull-to-refresh visual indicator
 */
const PullToRefreshIndicator = ({ pullDistance, isReady, isRefreshing }) => {
  if (!pullDistance && !isRefreshing) return null;

  const progress = Math.min(pullDistance / 80, 1);
  const rotation = progress * 360;

  return (
    <div className="pull-to-refresh-indicator" style={{
      opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
      transform: `translateX(-50%) translateY(${Math.min(pullDistance, 80)}px)`
    }}>
      <RefreshCw
        size={24}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isRefreshing ? 'transform 0.8s linear' : 'none',
          animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none'
        }}
        className={isRefreshing ? 'spinning' : ''}
      />
      <span className="pull-to-refresh-text">
        {isRefreshing ? 'Refreshing...' : isReady ? 'Release to refresh' : 'Pull to refresh'}
      </span>
    </div>
  );
};

export default PullToRefreshIndicator;
