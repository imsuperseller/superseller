'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/lib/pwa';
import { Download, Smartphone, WifiOff, X, Bell } from 'lucide-react';

export default function PWAInstallPrompt() {
  const { features, installPrompt, installApp, requestNotificationPermission } =
    usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationPromptState, setShowNotificationPromptState] =
    useState(false);
  const [notificationPermission, setNotificationPermission] = useState<{
    granted: boolean;
    denied: boolean;
    default: boolean;
  }>({ granted: false, denied: false, default: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if install prompt should be shown
    if (features.isInstallable && installPrompt && !features.isInstalled) {
      setShowInstallPrompt(true);
    }

    // Check current notification permission status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      setNotificationPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default',
      });
    }

    // Show notification prompt if needed
    if (
      features.canUseNotifications &&
      notificationPermission.default &&
      !showNotificationPromptState
    ) {
      setShowNotificationPromptState(true);
    }
  }, [
    features,
    notificationPermission.default,
    showNotificationPromptState,
    mounted,
  ]);

  const handleInstall = async () => {
    if (installApp) {
      await installApp();
      setShowInstallPrompt(false);
    }
  };

  const handleRequestNotification = async () => {
    if (requestNotificationPermission) {
      await requestNotificationPermission();
      setShowNotificationPromptState(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 style={{ color: 'var(--rensto-blue)' }}" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Install Rensto
                </h3>
                <p className="text-xs text-gray-500">
                  Get quick access to your dashboard
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInstallPrompt(false)}
            >
              Later
            </Button>
          </div>
        </div>
      )}

      {/* Notification Prompt */}
      {showNotificationPromptState && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Enable Notifications
                </h3>
                <p className="text-xs text-gray-500">
                  Stay updated with important alerts
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationPromptState(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={handleRequestNotification}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Enable
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNotificationPromptState(false)}
            >
              Not Now
            </Button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!features.isOnline && (
        <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 z-50">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">You're offline</span>
          </div>
        </div>
      )}

      {/* PWA Status Indicator */}
      {(features.isInstalled || features.isStandalone) && (
        <div className="fixed top-4 left-4 z-50">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Smartphone className="h-3 w-3 mr-1" />
            PWA
          </Badge>
        </div>
      )}
    </>
  );
}
