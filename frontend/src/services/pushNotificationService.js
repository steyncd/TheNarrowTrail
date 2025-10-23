// Push Notification Service
import { api } from './api';

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  // Check if push notifications are supported
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check current permission status
  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Request permission from user
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  async subscribe(token) {
    try {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported');
      }

      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await this.registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

        // For now, if no VAPID key is configured, just track permission
        if (!vapidPublicKey) {
          console.log('Push notifications: Permission granted, awaiting backend VAPID configuration');
          // Save permission status to backend
          await api.updateNotificationPermission(token, 'push', true);
          return null;
        }

        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });

        this.subscription = subscription;

        // Send subscription to backend
        await api.savePushSubscription(token, subscription);
      }

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(token) {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }

      const subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Notify backend
        await api.removePushSubscription(token);
      }

      this.subscription = null;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  // Test push notification
  async sendTestNotification() {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Push notification permission not granted');
    }

    // Send a local notification as a test
    if (this.registration) {
      await this.registration.showNotification('The Narrow Trail', {
        body: 'Push notifications are working! You\'ll receive alerts for event updates, deadlines, and more.',
        icon: '/hiking-logo.png',
        badge: '/hiking-icon.svg',
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          url: '/'
        }
      });
    }
  }

  // Helper: Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default new PushNotificationService();
