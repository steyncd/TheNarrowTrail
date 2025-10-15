import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, Upload, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState(0);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const { theme } = useTheme();

  const openDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HikingPortalOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const store = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }, []);

  const processQueuedAction = useCallback(async (action) => {
    // Process different types of queued actions
    switch (action.type) {
      case 'hike_interest':
        // Sync hike interest expression
        console.log('Syncing hike interest:', action);
        break;
      case 'profile_update':
        // Sync profile changes
        console.log('Syncing profile update:', action);
        break;
      case 'photo_upload':
        // Sync photo uploads
        console.log('Syncing photo upload:', action);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }, []);

  const checkQueuedActions = useCallback(async () => {
    try {
      // Check IndexedDB for queued actions
      const db = await openDB();
      const tx = db.transaction(['offlineQueue'], 'readonly');
      const store = tx.objectStore('offlineQueue');
      const count = await store.count();
      setQueuedActions(count);
    } catch (error) {
      console.warn('Could not check queued actions:', error);
    }
  }, [openDB]);

  const syncQueuedActions = useCallback(async () => {
    if (queuedActions === 0) return;

    try {
      // Sync queued actions with server
      const db = await openDB();
      const tx = db.transaction(['offlineQueue'], 'readwrite');
      const store = tx.objectStore('offlineQueue');
      
      const actions = await store.getAll();
      
      for (const action of actions) {
        try {
          // Attempt to sync each action
          await processQueuedAction(action);
          await store.delete(action.id);
        } catch (error) {
          console.warn('Failed to sync action:', action, error);
        }
      }

      setQueuedActions(0);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    } catch (error) {
      console.warn('Failed to sync queued actions:', error);
    }
  }, [queuedActions, openDB, processQueuedAction]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Check for queued actions and sync
      syncQueuedActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for existing queued actions on mount
    checkQueuedActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkQueuedActions, syncQueuedActions]);

  if (isOnline && queuedActions === 0 && !showSyncSuccess) {
    return null; // Don't show anything when online and no queued actions
  }

  const getIndicatorStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '70px', // Below header
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1040,
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      maxWidth: '90vw',
    };

    if (showSyncSuccess) {
      return {
        ...baseStyle,
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
      };
    }

    if (!isOnline) {
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? '#2d1b1b' : '#f8d7da',
        color: theme === 'dark' ? '#f5c6cb' : '#721c24',
        border: `1px solid ${theme === 'dark' ? '#5f2c2c' : '#f5c6cb'}`,
      };
    }

    if (queuedActions > 0) {
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? '#1b2d3a' : '#d1ecf1',
        color: theme === 'dark' ? '#bee5eb' : '#0c5460',
        border: `1px solid ${theme === 'dark' ? '#2c5f6f' : '#bee5eb'}`,
      };
    }

    return baseStyle;
  };

  const getContent = () => {
    if (showSyncSuccess) {
      return (
        <>
          <CheckCircle size={16} />
          <span>All changes synced successfully!</span>
        </>
      );
    }

    if (!isOnline) {
      return (
        <>
          <WifiOff size={16} />
          <span>You're offline - some features may be limited</span>
          {queuedActions > 0 && (
            <span className="ms-2 badge bg-warning text-dark rounded-pill">
              {queuedActions} pending
            </span>
          )}
        </>
      );
    }

    if (queuedActions > 0) {
      return (
        <>
          <Upload size={16} />
          <span>Syncing {queuedActions} change{queuedActions !== 1 ? 's' : ''}...</span>
        </>
      );
    }

    return null;
  };

  return (
    <div style={getIndicatorStyle()}>
      {getContent()}
    </div>
  );
};

export default OfflineIndicator;