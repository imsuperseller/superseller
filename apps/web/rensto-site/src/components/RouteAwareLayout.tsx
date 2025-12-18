'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function RouteAwareLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't render header on dashboard routes, admin routes, app routes, portal routes, or customer portals
  const isDashboardRoute = pathname?.startsWith('/ortal-dashboard') || pathname?.startsWith('/workflow-dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAppRoute = pathname?.startsWith('/app');
  const isPortalRoute = pathname?.startsWith('/portal');
  const isCustomerPortalRoute = pathname?.startsWith('/ortal') || pathname?.startsWith('/portal-ben-ginati') || pathname?.startsWith('/portal-shelly-mizrahi') || pathname?.startsWith('/portal/ben-ginati') || pathname?.startsWith('/portal/shelly-mizrahi');

  // Main service pages and custom landing pages have their own headers (new dark theme design)
  const isServicePage =
    pathname === '/marketplace' ||
    pathname?.startsWith('/custom') ||
    pathname?.startsWith('/niches') ||
    pathname === '/solutions';

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
