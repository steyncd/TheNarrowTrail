// Offline Queue Utility for The Narrow Trail PWA
// Manages offline actions and synchronization

class OfflineQueue {
  constructor() {
    this.dbName = 'HikingPortalOffline';
    this.dbVersion = 1;
    this.storeName = 'offlineQueue';
  }

  // Open IndexedDB connection
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
        }
      };
    });
  }

  // Add action to offline queue
  async addAction(type, data, options = {}) {
    try {
      const db = await this.openDB();
      const tx = db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);

      const action = {
        type,
        data,
        timestamp: Date.now(),
        priority: options.priority || 0,
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
        ...options
      };

      await store.add(action);
      console.log('Offline action queued:', type, data);
      
      // Notify the service worker if we're back online
      if (navigator.onLine && 'serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.sync) {
          await registration.sync.register('sync-offline-actions');
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      return false;
    }
  }

  // Get all queued actions
  async getActions() {
    try {
      const db = await this.openDB();
      const tx = db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore('offlineQueue');
      return await store.getAll();
    } catch (error) {
      console.error('Failed to get queued actions:', error);
      return [];
    }
  }

  // Get actions count
  async getActionsCount() {
    try {
      const db = await this.openDB();
      const tx = db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore('offlineQueue');
      return await store.count();
    } catch (error) {
      console.error('Failed to get actions count:', error);
      return 0;
    }
  }

  // Clear all actions (after successful sync)
  async clearActions() {
    try {
      const db = await this.openDB();
      const tx = db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore('offlineQueue');
      await store.clear();
      console.log('Offline queue cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
      return false;
    }
  }

  // Remove specific action
  async removeAction(id) {
    try {
      const db = await this.openDB();
      const tx = db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore('offlineQueue');
      await store.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to remove action:', error);
      return false;
    }
  }

  // Sync actions manually (for testing or immediate sync)
  async syncActions() {
    if (!navigator.onLine) {
      console.log('Cannot sync: offline');
      return false;
    }

    try {
      const actions = await this.getActions();
      console.log('Syncing', actions.length, 'offline actions');

      for (const action of actions) {
        try {
          const success = await this.processAction(action);
          if (success) {
            await this.removeAction(action.id);
          } else {
            // Increment retry count
            await this.incrementRetryCount(action.id);
          }
        } catch (error) {
          console.error('Failed to process action:', action, error);
          await this.incrementRetryCount(action.id);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to sync actions:', error);
      return false;
    }
  }

  // Process individual action
  async processAction(action) {
    switch (action.type) {
      case 'hike_interest':
        return await this.syncHikeInterest(action.data);
      
      case 'profile_update':
        return await this.syncProfileUpdate(action.data);
      
      case 'photo_upload':
        return await this.syncPhotoUpload(action.data);
      
      case 'feedback_submit':
        return await this.syncFeedback(action.data);
      
      default:
        console.warn('Unknown action type:', action.type);
        return false;
    }
  }

  // Sync hike interest
  async syncHikeInterest(data) {
    try {
      const response = await fetch(`/api/hikes/${data.hikeId}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify({ interested: data.interested })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync hike interest:', error);
      return false;
    }
  }

  // Sync profile update
  async syncProfileUpdate(data) {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify(data.profileData)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync profile update:', error);
      return false;
    }
  }

  // Sync photo upload
  async syncPhotoUpload(data) {
    try {
      const formData = new FormData();
      formData.append('photo', data.photo);
      formData.append('hikeId', data.hikeId);
      formData.append('description', data.description || '');

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.token}`
        },
        body: formData
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync photo upload:', error);
      return false;
    }
  }

  // Sync feedback
  async syncFeedback(data) {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify({
          category: data.category,
          message: data.message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync feedback:', error);
      return false;
    }
  }

  // Increment retry count for failed actions
  async incrementRetryCount(id) {
    try {
      const db = await this.openDB();
      const tx = db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore('offlineQueue');
      
      const action = await store.get(id);
      if (action) {
        action.retryCount = (action.retryCount || 0) + 1;
        
        // Remove action if max retries exceeded
        if (action.retryCount >= (action.maxRetries || 3)) {
          console.warn('Max retries exceeded for action:', action);
          await store.delete(id);
        } else {
          await store.put(action);
        }
      }
    } catch (error) {
      console.error('Failed to increment retry count:', error);
    }
  }

  // Register background sync if supported
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-actions');
        console.log('Background sync registered');
        return true;
      } catch (error) {
        console.error('Failed to register background sync:', error);
        return false;
      }
    }
    return false;
  }
}

// Create singleton instance
const offlineQueue = new OfflineQueue();

export default offlineQueue;