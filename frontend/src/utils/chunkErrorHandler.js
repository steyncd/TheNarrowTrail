// utils/chunkErrorHandler.js
// Handles chunk loading errors by forcing a cache refresh

/**
 * Detects if error is a chunk loading error
 */
export const isChunkLoadError = (error) => {
  return (
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError')
  );
};

/**
 * Handle chunk load errors by clearing cache and reloading
 */
export const handleChunkError = (error) => {
  console.error('Chunk load error detected:', error);

  // Check if we've already tried reloading recently
  const lastReloadTime = sessionStorage.getItem('chunk_error_reload_time');
  const now = Date.now();

  // Prevent reload loops - only reload once per 30 seconds
  if (lastReloadTime && now - parseInt(lastReloadTime) < 30000) {
    console.warn('Already reloaded recently, not reloading again to prevent loop');
    return false;
  }

  console.log('Chunk error detected - clearing cache and reloading...');

  // Store reload time
  sessionStorage.setItem('chunk_error_reload_time', now.toString());

  // Clear service worker caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }

  // Update service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.update();
      });
    });
  }

  // Clear localStorage version to force version check
  localStorage.removeItem('app_version');

  // Force reload with cache bypass
  setTimeout(() => {
    window.location.reload(true);
  }, 500);

  return true;
};

/**
 * Setup global error handler for chunk errors
 */
export const setupChunkErrorHandler = () => {
  // Handle unhandled promise rejections (common for chunk errors)
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      event.preventDefault(); // Prevent error from showing in console
      handleChunkError(event.reason);
    }
  });

  // Handle regular errors
  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error)) {
      event.preventDefault();
      handleChunkError(event.error);
    }
  });

  console.log('✅ Chunk error handler installed');
};
