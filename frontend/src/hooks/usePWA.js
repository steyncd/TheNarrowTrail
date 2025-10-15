import { useState, useEffect } from 'react';

// Custom hook for PWA functionality
export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator.standalone === true);
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA install error:', error);
      return false;
    }
  };

  return {
    isInstalled,
    isInstallable,
    isOnline,
    install
  };
};

// Custom hook for offline queue management
export const useOfflineQueue = () => {
  const [queuedActions, setQueuedActions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateQueueCount = async () => {
      try {
        // Import dynamically to avoid issues during SSR
        const { default: offlineQueue } = await import('../utils/offlineQueue');
        const count = await offlineQueue.getActionsCount();
        setQueuedActions(count);
      } catch (error) {
        console.warn('Failed to get queue count:', error);
      }
    };

    updateQueueCount();

    // Update count when online status changes
    const handleOnline = () => {
      updateQueueCount();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const syncQueue = async () => {
    setIsSyncing(true);
    try {
      const { default: offlineQueue } = await import('../utils/offlineQueue');
      await offlineQueue.syncActions();
      setQueuedActions(0);
    } catch (error) {
      console.error('Failed to sync queue:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToQueue = async (type, data, options) => {
    try {
      const { default: offlineQueue } = await import('../utils/offlineQueue');
      const success = await offlineQueue.addAction(type, data, options);
      if (success) {
        setQueuedActions(prev => prev + 1);
      }
      return success;
    } catch (error) {
      console.error('Failed to add to queue:', error);
      return false;
    }
  };

  return {
    queuedActions,
    isSyncing,
    syncQueue,
    addToQueue
  };
};

// Custom hook for PWA notifications
export const usePWANotifications = () => {
  const [permission, setPermission] = useState(() => {
    return ('Notification' in window && typeof Notification !== 'undefined') 
      ? Notification.permission 
      : 'denied';
  });
  const [isSupported, setIsSupported] = useState('Notification' in window && typeof Notification !== 'undefined');

  useEffect(() => {
    const supported = 'Notification' in window && typeof Notification !== 'undefined';
    setIsSupported(supported);
    setPermission(supported ? Notification.permission : 'denied');
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const showNotification = async (title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification
  };
};

// Custom hook for app sharing
export const useWebShare = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('share' in navigator);
  }, []);

  const share = async (data) => {
    if (!isSupported) {
      // Fallback to copy to clipboard or other sharing method
      return fallbackShare(data);
    }

    try {
      await navigator.share({
        title: data.title || 'The Narrow Trail',
        text: data.text || 'Join us for amazing hiking adventures!',
        url: data.url || window.location.href
      });
      return true;
    } catch (error) {
      console.error('Web Share failed:', error);
      return fallbackShare(data);
    }
  };

  const fallbackShare = async (data) => {
    try {
      const shareUrl = data.url || window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (error) {
      console.error('Fallback share failed:', error);
      return false;
    }
  };

  return { isSupported, share };
};

// Custom hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection type if available
    if ('connection' in navigator) {
      setConnectionType(navigator.connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(navigator.connection.effectiveType || 'unknown');
      };
      
      navigator.connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        navigator.connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};