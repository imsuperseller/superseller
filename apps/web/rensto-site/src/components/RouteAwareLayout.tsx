'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function RouteAwareLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't render header on dashboard routes, admin routes, app routes, portal routes, or customer portals
  const isDashboardRoute = pathname?.startsWith('/ortal-dashboard') || pathname?.startsWith('/workflow-dashboard') || pathname?.startsWith('/dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAppRoute = pathname?.startsWith('/app');
  const isPortalRoute = pathname?.startsWith('/portal');
  const isCustomerPortalRoute = pathname?.startsWith('/ortal') || pathname?.startsWith('/portal-') || pathname?.startsWith('/portal/');

  // Main service pages and custom landing pages have their own headers (new dark theme design)
  // We check for the base path and its localized version (starts with /he/)
  const isSpecificPath = (basePath: string) => {
    return pathname === basePath || pathname === `/he${basePath === '/' ? '' : basePath}`;
  };

  const startsWithSpecificPath = (basePath: string) => {
    return pathname?.startsWith(basePath) || pathname?.startsWith(`/he${basePath}`);
  };

  const isServicePage =
    isSpecificPath('/') ||
    isSpecificPath('/marketplace') ||
    startsWithSpecificPath('/marketplace/') ||
    startsWithSpecificPath('/custom') ||
    startsWithSpecificPath('/niches') ||
    startsWithSpecificPath('/docs') ||
    startsWithSpecificPath('/subscriptions') ||
    isSpecificPath('/rensto-components') ||
    isSpecificPath('/solutions') ||
    isSpecificPath('/offers') ||
    isSpecificPath('/contact') ||
    isSpecificPath('/whatsapp') ||
    isSpecificPath('/process') ||
    isSpecificPath('/knowledgebase') ||
    startsWithSpecificPath('/case-studies') ||
    isSpecificPath('/success') ||
    isSpecificPath('/cancel') ||
    isSpecificPath('/thank-you') ||
    startsWithSpecificPath('/legal') ||
    isSpecificPath('/demos');

  // Custom Offer and Onboarding pages manage their own layout
  const isCustomLanding = startsWithSpecificPath('/offer') || startsWithSpecificPath('/onboarding');

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
