import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;
    const path = url.pathname;

    // Define the admin domains
    const isAdminDomain = hostname === 'admin.rensto.com' || hostname.startsWith('admin.localhost');

    // Logic for Admin Subdomain
    if (isAdminDomain) {
        // If we are already on an internal /admin path, let it pass (or rewrite to keep URL clean? usually rewrite)
        // Actually, if the user hits `admin.rensto.com/dashboard`, we want to serve `src/app/admin/dashboard`
        // So we rewrite `/*` -> `/admin/*`

        // Prevent infinite loops if the path already starts with /admin (though technically users shouldn't see /admin in the URL)
        // If the internal structure is /admin/..., and we rewrite / -> /admin, then /foo -> /admin/foo.

        if (!path.startsWith('/admin') && !path.startsWith('/_next') && !path.startsWith('/api')) {
            return NextResponse.rewrite(new URL(`/admin${path === '/' ? '' : path}`, request.url));
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
         * - assets/ (public assets)
         * - images/ (public images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets/|images/).*)',
    ],
};
