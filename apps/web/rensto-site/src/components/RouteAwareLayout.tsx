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

  // Don't render global header/footer until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  // Don't render header on dashboard routes, admin routes, app routes, portal routes, or customer portals
  const isDashboardRoute = pathname?.startsWith('/ortal-dashboard') || pathname?.startsWith('/workflow-dashboard') || pathname?.startsWith('/dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAppRoute = pathname?.startsWith('/app');
  const isPortalRoute = pathname?.startsWith('/portal');
  const isCustomerPortalRoute = pathname?.startsWith('/ortal') || pathname?.startsWith('/portal-') || pathname?.startsWith('/portal/');

  // Main service pages and custom landing pages have their own headers
  const isServicePage =
    pathname === '/' ||
    pathname === '/marketplace' ||
    pathname?.startsWith('/marketplace/') ||
    pathname?.startsWith('/custom') ||
    pathname?.startsWith('/niches') ||
    pathname?.startsWith('/docs') ||
    pathname?.startsWith('/subscriptions') ||
    pathname === '/rensto-components' ||
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

  // Skip global layout for dashboard, admin, app, portal, customer portal, service pages, and custom landing pages
  if (isDashboardRoute || isAdminRoute || isAppRoute || isPortalRoute || isCustomerPortalRoute || isServicePage || isCustomLanding) {
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
