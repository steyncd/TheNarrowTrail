import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import useSwipeGesture from '../../hooks/useSwipeGesture';
import { haptics } from '../../utils/haptics';
import './SwipeablePhotoModal.css';

/**
 * Full-screen swipeable photo modal with touch gestures
 * Features: Swipe left/right, pinch-to-zoom (future), keyboard navigation
 */
const SwipeablePhotoModal = ({ photos, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentPhoto = photos[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  // Navigate to previous photo
  const goToPrevious = () => {
    if (hasPrevious && !isTransitioning) {
      haptics.light();
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Navigate to next photo
  const goToNext = () => {
    if (hasNext && !isTransitioning) {
      haptics.light();
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Swipe gesture handlers
  const swipeRef = useSwipeGesture({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 50
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="swipeable-photo-modal" onClick={onClose}>
      <div className="swipeable-photo-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="swipeable-photo-modal-close"
          onClick={onClose}
          aria-label="Close photo viewer"
        >
          <X size={24} />
        </button>

        {/* Photo counter */}
        <div className="swipeable-photo-modal-counter">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Previous button */}
        {hasPrevious && (
          <button
            className="swipeable-photo-modal-nav swipeable-photo-modal-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous photo"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Photo container with swipe support */}
        <div
          ref={swipeRef}
          className={`swipeable-photo-modal-image-container ${isTransitioning ? 'transitioning' : ''}`}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.hike_name}
            className="swipeable-photo-modal-image"
          />
        </div>

        {/* Next button */}
        {hasNext && (
          <button
            className="swipeable-photo-modal-nav swipeable-photo-modal-nav-next"
            onClick={goToNext}
            aria-label="Next photo"
          >
            <ChevronRight size={32} />
          </button>
        )}

        {/* Photo info */}
        <div className="swipeable-photo-modal-info">
          <h5 className="mb-1">{currentPhoto.hike_name}</h5>
          <p className="mb-0 text-muted small">
            {new Date(currentPhoto.date).toLocaleDateString()} • By {currentPhoto.uploaded_by}
          </p>
        </div>

        {/* Swipe indicator (only shown on mobile) */}
        <div className="swipeable-photo-modal-hint d-md-none">
          Swipe left or right to navigate
        </div>
      </div>
    </div>
  );
};

export default SwipeablePhotoModal;
