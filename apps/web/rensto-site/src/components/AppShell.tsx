'use client';

import { GTMProvider } from '@/components/analytics/GTMProvider';
import Providers from '@/components/Providers';
import { RouteAwareLayout } from '@/components/RouteAwareLayout';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ClientOnly } from '@/components/ClientOnly';
import { Schema, organizationSchema, websiteSchema } from '@/components/seo/Schema';

/**
 * Full shell for (main) routes. /video/* uses (video) route group and never hits this.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GTMProvider>
      <Providers>
        <RouteAwareLayout>
          <Schema type="Organization" data={organizationSchema} />
          <Schema type="WebSite" data={websiteSchema} />
          {children}
          <ClientOnly>
            <StickyMobileCTA />
            <WhatsAppButton />
          </ClientOnly>
        </RouteAwareLayout>
      </Providers>
    </GTMProvider>
  );
}
