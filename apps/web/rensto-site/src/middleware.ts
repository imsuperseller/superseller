import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'rensto_client_session';

export function middleware(request: NextRequest) {
  // Force www redirect
  const hostname = request.headers.get('host');
  if (hostname === 'rensto.com') {
    return NextResponse.redirect(new URL(`https://www.rensto.com${request.nextUrl.pathname}`, request.url), 301);
  }

  const { pathname } = request.nextUrl;

  // Protected Routes
  if (
    pathname.startsWith('/control') ||
    pathname.startsWith('/workflow-dashboard') ||
    pathname.startsWith('/dashboard')
  ) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);

    if (!sessionCookie) {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Basic Session Validation
    try {
      const decoded = JSON.parse(atob(sessionCookie.value));

      // Ensure essential fields exist
      if (!decoded.email || !decoded.clientId) {
        throw new Error('Invalid session structure');
      }

      // Optional: Check if token is too old (e.g. > 30 days)
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      const THIRTY_DAYS = 30 * TWENTY_FOUR_HOURS;
      if (Date.now() - decoded.authenticatedAt > THIRTY_DAYS) {
        throw new Error('Session expired');
      }

      // Admin Route Protection
      if (pathname.startsWith('/control') || pathname.startsWith('/workflow-dashboard')) {
        const ADMIN_EMAILS = ['admin@rensto.com', 'shaifriedman2010@gmail.com'];
        if (!ADMIN_EMAILS.includes(decoded.email)) {
          // If a client tries to access admin, redirect them to THEIR dashboard
          return NextResponse.redirect(new URL(`/dashboard/${decoded.clientId}`, request.url));
        }
      }

    } catch (e) {
      // Invalid or expired session
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};