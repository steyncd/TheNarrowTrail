import { useEffect, useRef } from 'react';
import haptics from '../utils/haptics';

/**
 * Hook for implementing swipe gestures
 * @param {Object} callbacks - Swipe callback functions
 * @param {Object} options - Configuration options
 * @returns {Object} - Ref for swipeable element
 */
const useSwipeGesture = (callbacks = {}, options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = callbacks;

  const {
    threshold = 50, // Minimum distance for swipe
    velocityThreshold = 0.3, // Minimum velocity for swipe
    enableHaptic = true,
    preventDefaultTouch = false
  } = options;

  const elementRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchEnd = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    };

    const handleTouchMove = (e) => {
      touchEnd.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };

      if (preventDefaultTouch) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      const deltaTime = touchEnd.current.time - touchStart.current.time;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Calculate velocity
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

      // Determine if it's a valid swipe
      const isValidSwipe = velocity > velocityThreshold;

      // Horizontal swipe detection
      if (absX > absY && absX > threshold && isValidSwipe) {
        if (enableHaptic) haptics.light();

        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight({ deltaX, deltaY, velocity });
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft({ deltaX, deltaY, velocity });
        }
      }
      // Vertical swipe detection
      else if (absY > absX && absY > threshold && isValidSwipe) {
        if (enableHaptic) haptics.light();

        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown({ deltaX, deltaY, velocity });
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp({ deltaX, deltaY, velocity });
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouch });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold, enableHaptic, preventDefaultTouch]);

  return { swipeRef: elementRef };
};

export default useSwipeGesture;
