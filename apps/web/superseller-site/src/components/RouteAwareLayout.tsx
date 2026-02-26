'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function RouteAwareLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skip routes: return immediately, no mounted delay (avoids re-render flash)
  const isDashboardRoute = pathname?.startsWith('/ortal-dashboard') || pathname?.startsWith('/workflow-dashboard') || pathname?.startsWith('/dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAppRoute = pathname?.startsWith('/app');
  const isPortalRoute = pathname?.startsWith('/portal');
  const isCustomerPortalRoute = pathname?.startsWith('/ortal') || pathname?.startsWith('/portal-') || pathname?.startsWith('/portal/');
  const isProductRoute = pathname?.startsWith('/products/');
  const isVideoRoute = pathname?.startsWith('/video');

  // Main service pages and custom landing pages have their own headers
  const isServicePage =
    pathname === '/' ||
    pathname === '/marketplace' ||
    pathname?.startsWith('/marketplace/') ||
    pathname?.startsWith('/custom') ||
    pathname?.startsWith('/niches') ||
    pathname?.startsWith('/docs') ||
    pathname?.startsWith('/subscriptions') ||
    pathname === '/superseller.agencyponents' ||
    pathname === '/solutions' ||
    pathname === '/offers' ||
    pathname === '/contact' ||
    pathname === '/whatsapp' ||
    pathname === '/process' ||
    pathname === '/knowledgebase' ||
    pathname?.startsWith('/case-studies') ||
    pathname === '/success' ||
    pathname === '/cancel' ||
    pathname === '/thank-you' ||
    pathname?.startsWith('/legal') ||
    pathname === '/demos';

  // Custom Offer and Onboarding pages manage their own layout
  const isCustomLanding = pathname?.startsWith('/offer') || pathname?.startsWith('/onboarding');

  const isSkipRoute = isDashboardRoute || isAdminRoute || isAppRoute || isPortalRoute || isCustomerPortalRoute || isServicePage || isCustomLanding || isProductRoute || isVideoRoute;

  // Skip routes: no header/footer, return immediately (avoids mounted transition flash)
  if (isSkipRoute) {
    return <>{children}</>;
  }

  // Routes that need header/footer: wait for mounted to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
