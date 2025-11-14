'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function RouteAwareLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't render header on dashboard routes, admin routes, app routes, portal routes, or customer portals
  const isDashboardRoute = pathname?.startsWith('/ortal-dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAppRoute = pathname?.startsWith('/app');
  const isPortalRoute = pathname?.startsWith('/portal');
  const isCustomerPortalRoute = pathname?.startsWith('/ortal') || pathname?.startsWith('/portal-ben-ginati') || pathname?.startsWith('/portal-shelly-mizrahi') || pathname?.startsWith('/portal/ben-ginati') || pathname?.startsWith('/portal/shelly-mizrahi');
  
  // Main service pages have their own headers (new dark theme design)
  const isServicePage = pathname === '/' || 
                        pathname === '/marketplace' || 
                        pathname === '/custom' || 
                        pathname === '/subscriptions' || 
                        pathname === '/solutions';
  
  // Skip global layout for dashboard, admin, app, portal, customer portal, and service pages
  if (isDashboardRoute || isAdminRoute || isAppRoute || isPortalRoute || isCustomerPortalRoute || isServicePage) {
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
