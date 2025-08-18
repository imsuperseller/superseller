'use client';

import { useState, useEffect } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAFeatures {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  canUseNotifications: boolean;
  canUseBackgroundSync: boolean;
  canUsePushNotifications: boolean;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class PWAService {
  private installPrompt: PWAInstallPrompt | null = null;
  private features: PWAFeatures = {
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isStandalone:
      typeof window !== 'undefined'
        ? window.matchMedia('(display-mode: standalone)').matches
        : false,
    canUseNotifications:
      typeof window !== 'undefined' ? 'Notification' in window : false,
    canUseBackgroundSync:
      typeof window !== 'undefined'
        ? 'serviceWorker' in navigator &&
          'sync' in window.ServiceWorkerRegistration.prototype
        : false,
    canUsePushNotifications:
      typeof window !== 'undefined' ? 'PushManager' in window : false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.installPrompt = e as PWAInstallPrompt;
      this.features.isInstallable = true;
      this.dispatchEvent('installable');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.features.isInstalled = true;
      this.features.isInstallable = false;
      this.installPrompt = null;
      this.dispatchEvent('installed');
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.features.isOnline = true;
      this.dispatchEvent('online');
    });

    window.addEventListener('offline', () => {
      this.features.isOnline = false;
      this.dispatchEvent('offline');
    });

    // Listen for display mode changes
    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', e => {
        this.features.isStandalone = e.matches;
        this.dispatchEvent('displayModeChanged');
      });

    // Register service worker
    this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                this.dispatchEvent('updateAvailable');
              }
            });
          }
        });

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', event => {
          this.handleServiceWorkerMessage(event.data);
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private handleServiceWorkerMessage(data: unknown) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.dispatchEvent('cacheUpdated', data);
        break;
      case 'BACKGROUND_SYNC':
        this.dispatchEvent('backgroundSync', data);
        break;
      case 'PUSH_RECEIVED':
        this.dispatchEvent('pushReceived', data);
        break;
    }
  }

  private dispatchEvent(type: string, data?: unknown) {
    window.dispatchEvent(new CustomEvent(`pwa:${type}`, { detail: data }));
  }

  // Public methods
  async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      return choice.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.features.canUseNotifications) {
      return { granted: false, denied: false, default: true };
    }

    try {
      const permission = await Notification.requestPermission();
      return {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      };
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return { granted: false, denied: false, default: true };
    }
  }

  getNotificationPermission(): NotificationPermission {
    if (!this.features.canUseNotifications) {
      return { granted: false, denied: false, default: true };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    };
  }

  async subscribeToPushNotifications(
    vapidPublicKey: string
  ): Promise<PushSubscription | null> {
    if (!this.features.canUsePushNotifications) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.features.canUsePushNotifications) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  async registerBackgroundSync(
    tag: string,
    options?: BackgroundSyncOptions
  ): Promise<boolean> {
    if (!this.features.canUseBackgroundSync) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag, options);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  async cacheUrls(urls: string[]): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
          type: 'CACHE_URLS',
          urls,
        });
      } catch (error) {
        console.error('Cache URLs failed:', error);
      }
    }
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        this.dispatchEvent('cacheCleared');
      } catch (error) {
        console.error('Clear cache failed:', error);
      }
    }
  }

  async updateApp(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        this.dispatchEvent('updateRequested');
      } catch (error) {
        console.error('App update failed:', error);
      }
    }
  }

  getFeatures(): PWAFeatures {
    return { ...this.features };
  }

  isInstallable(): boolean {
    return this.features.isInstallable;
  }

  isInstalled(): boolean {
    return this.features.isInstalled;
  }

  isOnline(): boolean {
    return this.features.isOnline;
  }

  isStandalone(): boolean {
    return this.features.isStandalone;
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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
}

// Create singleton instance
const pwaService = new PWAService();

// React hook for PWA features
export function usePWA() {
  const [features, setFeatures] = useState<PWAFeatures>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    isStandalone: false,
    canUseNotifications: false,
    canUseBackgroundSync: false,
    canUsePushNotifications: false,
  });
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Only update features on the client side
    const updateFeatures = () => setFeatures(pwaService.getFeatures());
    const handleInstallable = () => {
      setInstallPrompt(pwaService['installPrompt']);
      updateFeatures();
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      updateFeatures();
    };
    const handleOnline = updateFeatures;
    const handleOffline = updateFeatures;
    const handleDisplayModeChanged = updateFeatures;

    // Initial update
    updateFeatures();

    // Listen for PWA events
    window.addEventListener('pwa:installable', handleInstallable);
    window.addEventListener('pwa:installed', handleInstalled);
    window.addEventListener('pwa:online', handleOnline);
    window.addEventListener('pwa:offline', handleOffline);
    window.addEventListener('pwa:displayModeChanged', handleDisplayModeChanged);

    return () => {
      window.removeEventListener('pwa:installable', handleInstallable);
      window.removeEventListener('pwa:installed', handleInstalled);
      window.removeEventListener('pwa:online', handleOnline);
      window.removeEventListener('pwa:offline', handleOffline);
      window.removeEventListener(
        'pwa:displayModeChanged',
        handleDisplayModeChanged
      );
    };
  }, [mounted]);

  return {
    features,
    installPrompt,
    installApp: () => pwaService.installApp(),
    requestNotificationPermission: () =>
      pwaService.requestNotificationPermission(),
    subscribeToPushNotifications: (key: string) =>
      pwaService.subscribeToPushNotifications(key),
    unsubscribeFromPushNotifications: () =>
      pwaService.unsubscribeFromPushNotifications(),
    registerBackgroundSync: (tag: string, options?: BackgroundSyncOptions) =>
      pwaService.registerBackgroundSync(tag, options),
    cacheUrls: (urls: string[]) => pwaService.cacheUrls(urls),
    clearCache: () => pwaService.clearCache(),
    updateApp: () => pwaService.updateApp(),
  };
}

// Export the service instance
export default pwaService;
