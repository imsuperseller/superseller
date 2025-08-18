'use client';

import dynamic from 'next/dynamic';

// Dynamically import PWA components with no SSR to prevent hydration errors
const PWAInstallPrompt = dynamic(
  () => import('@/components/PWAInstallPrompt'),
  { ssr: false }
);

const PWAStatusIndicator = dynamic(
  () => import('@/components/PWAStatusIndicator'),
  { ssr: false }
);

export default function PWAWrapper() {
  return (
    <>
      <PWAStatusIndicator />
      <PWAInstallPrompt />
    </>
  );
}
