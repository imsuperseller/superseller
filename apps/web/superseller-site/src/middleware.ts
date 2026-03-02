import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

// Root domain variants (not tenant subdomains)
const ROOT_HOSTS = new Set([
    'superseller.agency',
    'www.superseller.agency',
    'localhost:3000',
    'localhost:3002',
]);

// Reserved subdomains that are NOT tenant slugs
const RESERVED_SUBDOMAINS = new Set([
    'admin',
    'api',
    'www',
    'staging',
    'dev',
]);

function extractSubdomain(hostname: string): string | null {
    // Local dev: tenant.localhost:3002
    const localhostMatch = hostname.match(/^([^.]+)\.localhost/);
    if (localhostMatch) {
        const sub = localhostMatch[1];
        return RESERVED_SUBDOMAINS.has(sub) ? null : sub;
    }

    // Production: tenant.superseller.agency
    const prodMatch = hostname.match(/^([^.]+)\.superseller\.agency$/);
    if (prodMatch) {
        const sub = prodMatch[1];
        return RESERVED_SUBDOMAINS.has(sub) ? null : sub;
    }

    return null;
}

// Create the next-intl middleware for locale handling
const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;
    const path = url.pathname;

    // --- Admin subdomain (existing) ---
    const isAdminDomain = hostname === 'admin.superseller.agency' || hostname.startsWith('admin.localhost');

    if (isAdminDomain) {
        if (path === '/login') {
            return NextResponse.next();
        }
        if (!path.startsWith('/admin') && !path.startsWith('/_next') && !path.startsWith('/api')) {
            return NextResponse.rewrite(new URL(`/admin${path === '/' ? '' : path}`, request.url));
        }
        const res = NextResponse.next();
        res.headers.set('x-pathname', path);
        return res;
    }

    // --- Tenant subdomain routing ---
    const tenantSlug = extractSubdomain(hostname);

    if (tenantSlug) {
        // Skip static assets and API routes
        if (path.startsWith('/_next') || path.startsWith('/api') || path.startsWith('/favicon')) {
            const res = NextResponse.next();
            res.headers.set('x-tenant-slug', tenantSlug);
            return res;
        }

        // Rewrite tenant root to /portal/[slug] route group
        const portalPath = `/portal/${tenantSlug}${path === '/' ? '' : path}`;
        const res = NextResponse.rewrite(new URL(portalPath, request.url));
        res.headers.set('x-tenant-slug', tenantSlug);
        res.headers.set('x-pathname', path);
        return res;
    }

    // --- Skip locale handling for non-page routes ---
    if (
        path.startsWith('/api/') ||
        path.startsWith('/admin') ||
        path.startsWith('/portal/') ||
        path.startsWith('/video/') ||
        path.startsWith('/app/') ||
        path.startsWith('/lp/')
    ) {
        const res = NextResponse.next();
        res.headers.set('x-pathname', path);
        return res;
    }

    // --- Default: root domain with i18n locale handling ---
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|images/|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|woff|woff2|ttf|eot|css|js|json|xml|txt|webmanifest)).*)'],
};
