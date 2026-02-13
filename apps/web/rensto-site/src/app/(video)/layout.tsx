/**
 * Video route group: minimal layout, no AppShell.
 * Server-rendered branch - no usePathname(), no client-side layout switching.
 * Eliminates hydration mismatch and page/error flash for /video/* routes.
 */
export default function VideoRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#110d28" }}
    >
      {children}
    </div>
  );
}
