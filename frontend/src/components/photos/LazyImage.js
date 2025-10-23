import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '../common/Skeleton';

/**
 * LazyImage Component - Optimized image loading with Intersection Observer
 *
 * Features:
 * - Lazy loads images only when they enter viewport
 * - Shows animated skeleton placeholder while image loads
 * - Handles loading and error states
 * - Reduces initial page load time
 * - Saves bandwidth by not loading off-screen images
 * - Smooth fade-in animation when image loads
 */
function LazyImage({ src, alt, className, style, placeholder }) {
  const [imageSrc, setImageSrc] = useState(placeholder || null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Create an Intersection Observer to detect when image enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When image is in viewport, load it
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect(); // Stop observing once loaded
          }
        });
      },
      {
        // Load image slightly before it enters viewport for smoother experience
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={`lazy-image-wrapper ${className || ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        ...style,
      }}
    >
      {!imageLoaded && !imageError && (
        <div
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Skeleton width="100%" height="100%" borderRadius={style?.borderRadius || '0'} />
        </div>
      )}

      {imageError ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Failed to load image
        </div>
      ) : (
        <img
          src={imageSrc || placeholder}
          alt={alt}
          className={className}
          style={{
            ...style,
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

export default LazyImage;
