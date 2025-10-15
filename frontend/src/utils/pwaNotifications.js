// PWA Notification Manager
// Handles both in-app notifications and PWA push notifications

class PWANotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window && typeof Notification !== 'undefined';
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.vapidPublicKey = null; // Will be set from environment
    this.registration = null;
  }

  // Initialize the notification manager
  async initialize() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('[PWA Notifications] Service worker ready');
      } catch (error) {
        console.error('[PWA Notifications] Service worker not ready:', error);
      }
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('[PWA Notifications] Notifications not supported');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log('[PWA Notifications] Permission:', this.permission);
      return this.permission === 'granted';
    } catch (error) {
      console.error('[PWA Notifications] Permission request failed:', error);
      return false;
    }
  }

  // Show local notification
  async showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('[PWA Notifications] Cannot show notification - no permission');
      return false;
    }

    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      tag: 'general',
      renotify: false,
    };

    try {
      if (this.registration) {
        // Use service worker notification for better control
        await this.registration.showNotification(title, {
          ...defaultOptions,
          ...options
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          ...defaultOptions,
          ...options
        });
      }
      
      console.log('[PWA Notifications] Notification shown:', title);
      return true;
    } catch (error) {
      console.error('[PWA Notifications] Failed to show notification:', error);
      return false;
    }
  }

  // Show hike-related notifications
  async showHikeNotification(type, data) {
    const notificationConfig = {
      'new_hike': {
        title: '🥾 New Hike Available!',
        body: `${data.title} - ${data.location}`,
        tag: 'new-hike',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details',
            icon: '/logo192.png'
          },
          {
            action: 'dismiss',
            title: 'Later',
            icon: '/logo192.png'
          }
        ],
        data: {
          url: `/hike/${data.id}`,
          hikeId: data.id
        }
      },
      'hike_reminder': {
        title: '⏰ Hike Reminder',
        body: `${data.title} is tomorrow at ${data.time}`,
        tag: 'hike-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details',
            icon: '/logo192.png'
          }
        ],
        data: {
          url: `/hike/${data.id}`,
          hikeId: data.id
        }
      },
      'weather_alert': {
        title: '🌦️ Weather Alert',
        body: `Weather update for ${data.hikeTitle}: ${data.weather}`,
        tag: 'weather-alert',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Hike',
            icon: '/logo192.png'
          }
        ],
        data: {
          url: `/hike/${data.hikeId}`,
          hikeId: data.hikeId
        }
      },
      'spot_available': {
        title: '🎯 Spot Available!',
        body: `A spot opened up for ${data.hikeTitle}`,
        tag: 'spot-available',
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300],
        actions: [
          {
            action: 'register',
            title: 'Register Now',
            icon: '/logo192.png'
          },
          {
            action: 'view',
            title: 'View Details',
            icon: '/logo192.png'
          }
        ],
        data: {
          url: `/hike/${data.hikeId}`,
          hikeId: data.hikeId,
          action: 'register'
        }
      },
      'hike_cancelled': {
        title: '❌ Hike Cancelled',
        body: `${data.hikeTitle} has been cancelled. ${data.reason}`,
        tag: 'hike-cancelled',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details',
            icon: '/logo192.png'
          }
        ],
        data: {
          url: `/hike/${data.hikeId}`,
          hikeId: data.hikeId
        }
      }
    };

    const config = notificationConfig[type];
    if (!config) {
      console.warn('[PWA Notifications] Unknown notification type:', type);
      return false;
    }

    return await this.showNotification(config.title, config);
  }

  // Schedule notification for later
  async scheduleNotification(title, options, delay) {
    if (!this.isSupported || this.permission !== 'granted') {
      return false;
    }

    setTimeout(async () => {
      await this.showNotification(title, options);
    }, delay);

    return true;
  }

  // Handle notification interactions (used in service worker context)
  static getNotificationClickHandler() {
    return function(event) {
      const notification = event.notification;
      const data = notification.data || {};

      console.log('[PWA Notifications] Notification clicked:', notification.tag, event.action);

      notification.close();

      // Handle different actions
      switch (event.action) {
        case 'view':
          if (data.url) {
            // eslint-disable-next-line no-restricted-globals
            self.clients.openWindow(data.url);
          }
          break;
          
        case 'register':
          if (data.hikeId) {
            // Handle registration action
            // eslint-disable-next-line no-restricted-globals
            self.clients.openWindow(`/hike/${data.hikeId}?action=register`);
          }
          break;
          
        case 'dismiss':
          // Just close the notification
          break;
          
        default:
          // Default action - open the app
          if (data.url) {
            // eslint-disable-next-line no-restricted-globals
            self.clients.openWindow(data.url);
          } else {
            // eslint-disable-next-line no-restricted-globals
            self.clients.openWindow('/');
          }
      }
    };
  }

  // Clear all notifications with specific tag
  async clearNotifications(tag) {
    if (!this.registration) return false;

    try {
      const notifications = await this.registration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
      console.log('[PWA Notifications] Cleared notifications with tag:', tag);
      return true;
    } catch (error) {
      console.error('[PWA Notifications] Failed to clear notifications:', error);
      return false;
    }
  }

  // Get current notifications
  async getNotifications() {
    if (!this.registration) return [];

    try {
      return await this.registration.getNotifications();
    } catch (error) {
      console.error('[PWA Notifications] Failed to get notifications:', error);
      return [];
    }
  }

  // Subscribe to push notifications (for future implementation)
  async subscribeToPush() {
    if (!this.registration || !this.vapidPublicKey) {
      console.warn('[PWA Notifications] Cannot subscribe to push - missing requirements');
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('[PWA Notifications] Push subscription created');
      return subscription;
    } catch (error) {
      console.error('[PWA Notifications] Push subscription failed:', error);
      return false;
    }
  }

  // Helper function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test notification system
  async testNotification() {
    return await this.showNotification('🧪 Test Notification', {
      body: 'PWA notifications are working correctly!',
      tag: 'test',
      requireInteraction: false,
      actions: [
        {
          action: 'ok',
          title: 'OK',
          icon: '/logo192.png'
        }
      ]
    });
  }
}

// Create singleton instance
const pwaNotificationManager = new PWANotificationManager();

// Initialize when service worker is ready
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    pwaNotificationManager.initialize();
  });
}

export default pwaNotificationManager;