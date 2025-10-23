import { useEffect, useRef, useState } from 'react';
import haptics from '../utils/haptics';

/**
 * Hook for implementing pull-to-refresh functionality
 * @param {Function} onRefresh - Callback function when refresh is triggered
 * @param {Object} options - Configuration options
 * @returns {Object} - Ref for container and refresh state
 */
const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 80, // Distance to pull before triggering refresh
    resistance = 2.5, // Pull resistance factor
    maxPullDistance = 150,
    enabled = true
  } = options;

  const containerRef = useRef(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const touchStart = useRef({ y: 0, scrollTop: 0 });
  const currentTouch = useRef({ y: 0 });

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    let rafId = null;

    const handleTouchStart = (e) => {
      // Check if we're at the top of the page (window scroll)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 5) return; // Allow small tolerance

      touchStart.current = {
        y: e.touches[0].clientY,
        scrollTop: scrollTop
      };
    };

    const handleTouchMove = (e) => {
      if (isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStart.current.y;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Only pull down when at top and pulling downward
      if (deltaY > 0 && scrollTop <= 5) {
        currentTouch.current.y = currentY;

        // Cancel the animation frame if it exists
        if (rafId) cancelAnimationFrame(rafId);

        // Use RAF for smooth animation
        rafId = requestAnimationFrame(() => {
          const distance = Math.min(deltaY / resistance, maxPullDistance);
          setPullDistance(distance);
          setIsPulling(distance > 10);

          // Haptic feedback at threshold
          if (distance >= threshold && deltaY / resistance < threshold + 5) {
            haptics.light();
          }
        });

        // Prevent default scrolling when pulling
        if (deltaY > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (rafId) cancelAnimationFrame(rafId);

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        haptics.success();

        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
          haptics.error();
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, threshold, resistance, maxPullDistance, onRefresh, isRefreshing, pullDistance]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    isReady: pullDistance >= threshold
  };
};

export default usePullToRefresh;
