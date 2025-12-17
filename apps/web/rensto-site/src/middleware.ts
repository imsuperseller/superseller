import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Force www redirect
  const hostname = request.headers.get('host');
  if (hostname === 'rensto.com') {
    return NextResponse.redirect(new URL(`https://www.rensto.com${request.nextUrl.pathname}`, request.url), 301);
  }

  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // TODO: Implement actual authentication check
    // For now, allow access to admin routes
    // In production, check for valid JWT token or session

    const token = request.cookies.get('admin-token');

    // If no token and trying to access admin routes, redirect to login
    if (!token && request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
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