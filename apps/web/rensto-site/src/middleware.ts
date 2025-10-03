import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
    '/admin/:path*',
  ],
};