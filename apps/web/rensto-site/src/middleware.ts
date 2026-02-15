import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;
    const path = url.pathname;

    // Video routes: localhost only until ready for production
    const isProductionHost =
        hostname === 'rensto.com' ||
        hostname === 'www.rensto.com' ||
        hostname.endsWith('.rensto.com');
    if (isProductionHost && path.startsWith('/video')) {
        return new NextResponse(null, { status: 404 });
    }

    const isAdminDomain = hostname === 'admin.rensto.com' || hostname.startsWith('admin.localhost');

    if (isAdminDomain) {
        if (path === '/login') {
            return NextResponse.next();
        }
        if (!path.startsWith('/admin') && !path.startsWith('/_next') && !path.startsWith('/api')) {
            return NextResponse.rewrite(new URL(`/admin${path === '/' ? '' : path}`, request.url));
        }
    }

    const res = NextResponse.next();
    res.headers.set('x-pathname', path);
    return res;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets/|images/).*)'],
};
