// hooks/useVersionCheck.js
// Checks for new app versions and prompts user to refresh

import { useState, useEffect, useCallback } from 'react';

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const VERSION_FILE_URL = '/version.json';

export const useVersionCheck = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);

  // Get current version on mount
  useEffect(() => {
    const fetchCurrentVersion = async () => {
      try {
        const response = await fetch(VERSION_FILE_URL + '?t=' + Date.now(), {
          cache: 'no-cache'
        });
        const version = await response.json();
        setCurrentVersion(version);

        // Store in localStorage for comparison
        localStorage.setItem('app_version', JSON.stringify(version));
      } catch (error) {
        console.warn('Failed to fetch current version:', error);
      }
    };

    fetchCurrentVersion();
  }, []);

  // Check for updates periodically
  const checkForUpdates = useCallback(async () => {
    try {
      // Fetch the latest version.json with cache-busting
      const response = await fetch(VERSION_FILE_URL + '?t=' + Date.now(), {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version');
      }

      const latestVersion = await response.json();
      const storedVersion = JSON.parse(localStorage.getItem('app_version') || '{}');

      // Compare build timestamps
      if (storedVersion.buildTimestamp && latestVersion.buildTimestamp) {
        if (latestVersion.buildTimestamp > storedVersion.buildTimestamp) {
          console.log('🆕 New version available!');
          console.log('Current:', new Date(storedVersion.buildTimestamp).toLocaleString());
          console.log('Latest:', new Date(latestVersion.buildTimestamp).toLocaleString());

          setLatestVersion(latestVersion);
          setUpdateAvailable(true);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn('Version check failed:', error);
      return false;
    }
  }, []);

  // Periodic version checking
  useEffect(() => {
    // Check immediately on mount (after 10 seconds to let app load)
    const initialCheckTimer = setTimeout(() => {
      checkForUpdates();
    }, 10000);

    // Then check periodically
    const intervalId = setInterval(() => {
      checkForUpdates();
    }, VERSION_CHECK_INTERVAL);

    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(intervalId);
    };
  }, [checkForUpdates]);

  // Force update by reloading the page
  const refreshApp = useCallback(() => {
    // Update localStorage with new version before reload
    if (latestVersion) {
      localStorage.setItem('app_version', JSON.stringify(latestVersion));
    }

    // Clear service worker cache if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update();
        });
      });
    }

    // Force reload with cache bypass
    window.location.reload(true);
  }, [latestVersion]);

  // Dismiss the update notification
  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);

    // Don't show again for 1 hour
    const dismissUntil = Date.now() + (60 * 60 * 1000);
    sessionStorage.setItem('update_dismissed_until', dismissUntil.toString());
  }, []);

  // Check if update was recently dismissed
  useEffect(() => {
    if (updateAvailable) {
      const dismissedUntil = sessionStorage.getItem('update_dismissed_until');
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
        setUpdateAvailable(false);
      }
    }
  }, [updateAvailable]);

  return {
    updateAvailable,
    currentVersion,
    latestVersion,
    checkForUpdates,
    refreshApp,
    dismissUpdate
  };
};
