'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/lib/pwa';
import { Download, Smartphone, WifiOff } from 'lucide-react';

export default function PWAStatusIndicator() {
  const { features } = usePWA();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (!features.isInstalled && !features.isStandalone) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 border shadow-sm">
        {features.isInstalled && (
          <Badge variant="outline" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Installed
          </Badge>
        )}
        {features.isStandalone && (
          <Badge variant="outline" className="text-xs">
            <Smartphone className="h-3 w-3 mr-1" />
            App
          </Badge>
        )}
        {!features.isOnline && (
          <Badge variant="outline" className="text-xs text-orange-600">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        )}
      </div>
    </div>
  );
}
