import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔄 SUBDOMAIN ROUTING MIDDLEWARE
 * Automatically redirects customer subdomains to their respective portals
 */

// Customer subdomain mappings
const CUSTOMER_SUBDOMAIN_MAP: Record<string, string> = {
    'tax4us': 'tax4us',
    'shelly-mizrahi': 'shelly-mizrahi',
    'test-customer': 'test-customer',
    'ben-ginati': 'tax4us', // Legacy mapping for ben-ginati → tax4us
};

// Routes that should be excluded from subdomain redirection
const EXCLUDED_PATHS = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/admin',
    '/portal', // Already handled by dynamic routing
];

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Skip processing for excluded paths
    if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Extract subdomain from hostname
    const subdomain = extractSubdomain(hostname);

    // If no subdomain or it's not a customer subdomain, continue normally
    if (!subdomain || !CUSTOMER_SUBDOMAIN_MAP[subdomain]) {
        return NextResponse.next();
    }

    // Get the customer slug for this subdomain
    const customerSlug = CUSTOMER_SUBDOMAIN_MAP[subdomain];

    // If already on the correct portal path, continue
    if (pathname.startsWith(`/portal/${customerSlug}`)) {
        return NextResponse.next();
    }

    // Redirect to the customer portal
    const portalPath = `/portal/${customerSlug}`;
    const redirectUrl = new URL(portalPath + search, request.url);

    // Log subdomain redirect for debugging
    if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Subdomain redirect: ${hostname}${pathname} → ${portalPath}`);
    }

    return NextResponse.redirect(redirectUrl);
}

/**
 * Extract subdomain from hostname
 * Examples:
 * - tax4us.rensto.com → tax4us
 * - shelly-mizrahi.rensto.com → shelly-mizrahi
 * - www.rensto.com → null
 * - rensto.com → null
 */
function extractSubdomain(hostname: string): string | null {
    // Remove port if present
    const cleanHostname = hostname.split(':')[0];

    // Split hostname into parts
    const parts = cleanHostname.split('.');

    // If it's not a subdomain (less than 3 parts), return null
    if (parts.length < 3) {
        return null;
    }

    // Get the first part (subdomain)
    const subdomain = parts[0];

    // Skip common non-customer subdomains
    if (subdomain === 'www' || subdomain === 'api' || subdomain === 'admin') {
        return null;
    }

    return subdomain;
}

// Configure which paths this middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api routes (API endpoints)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
};
