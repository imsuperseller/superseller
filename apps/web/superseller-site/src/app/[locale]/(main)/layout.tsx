import { AppShell } from '@/components/AppShell';

/**
 * Main route group: full AppShell (GTM, Toaster, Header, Footer, etc).
 * Applied to all routes except /video/* which uses (video) group.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
