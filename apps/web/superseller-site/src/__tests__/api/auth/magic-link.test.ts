/**
 * Magic Link Authentication Tests
 *
 * Tests:
 * - POST /api/auth/magic-link/send — token generation, email routing, access control
 * - GET /api/auth/magic-link/verify — token validation, session creation, redirects
 * - Auth library — encrypt/decrypt session, verifySession
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/lib/prisma';

// ── Import handlers ─────────────────────────────────────────
import { POST as sendHandler } from '@/app/api/auth/magic-link/send/route';
import { GET as verifyHandler } from '@/app/api/auth/magic-link/verify/route';

// Un-mock auth so we test real encrypt/decrypt logic
vi.unmock('@/lib/auth');
const { encryptSession, decryptSession, ADMIN_EMAILS } = await import('@/lib/auth');

beforeEach(() => {
    vi.clearAllMocks();
    // Default: no RESEND_API_KEY so email goes to console (dev mode)
    delete process.env.RESEND_API_KEY;
    process.env.NEXT_PUBLIC_BASE_URL = 'https://superseller.agency';
});

// Helper: create NextRequest-like for the send endpoint
function makeSendRequest(body: object) {
    return new Request('http://localhost/api/auth/magic-link/send', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'x-real-ip': '127.0.0.1',
            'user-agent': 'test-agent',
        },
    }) as any; // NextRequest-compatible
}

// Helper: create GET request for verify endpoint
function makeVerifyRequest(token: string, redirectTo?: string) {
    let url = `http://localhost/api/auth/magic-link/verify?token=${token}`;
    if (redirectTo) url += `&redirectTo=${encodeURIComponent(redirectTo)}`;
    return new Request(url, { method: 'GET' }) as any;
}

// ── Session Encryption ──────────────────────────────────────

describe('Session Encryption (auth.ts)', () => {
    it('encrypts and decrypts session data (base64 fallback)', () => {
        // Without SESSION_SECRET, uses base64 fallback
        delete process.env.SESSION_SECRET;
        const data = { email: 'test@example.com', clientId: 'u1', authenticatedAt: Date.now() };
        const token = encryptSession(data);
        const decrypted = decryptSession(token);
        expect(decrypted).toMatchObject({ email: 'test@example.com', clientId: 'u1' });
    });

    it('encrypts and decrypts with AES-256-GCM when SESSION_SECRET is set', () => {
        process.env.SESSION_SECRET = 'test-secret-key-for-encryption-32chars!';
        const data = { email: 'admin@superseller.agency', clientId: 'admin-1', authenticatedAt: Date.now() };
        const token = encryptSession(data);

        // Token should be hex string (not base64)
        expect(/^[0-9a-f]+$/i.test(token)).toBe(true);
        expect(token.length).toBeGreaterThan(56);

        const decrypted = decryptSession(token);
        expect(decrypted).toMatchObject({ email: 'admin@superseller.agency', clientId: 'admin-1' });
        delete process.env.SESSION_SECRET;
    });

    it('returns null for corrupted token', () => {
        process.env.SESSION_SECRET = 'test-secret';
        const result = decryptSession('corrupted-garbage-data');
        expect(result).toBeNull();
        delete process.env.SESSION_SECRET;
    });

    it('handles legacy base64 tokens even when SESSION_SECRET is set', () => {
        // Create a base64 token (no SESSION_SECRET)
        delete process.env.SESSION_SECRET;
        const data = { email: 'legacy@test.com', clientId: 'u2', authenticatedAt: Date.now() };
        const legacyToken = encryptSession(data);

        // Now set SESSION_SECRET and try to decrypt the legacy token
        process.env.SESSION_SECRET = 'new-secret';
        const decrypted = decryptSession(legacyToken);
        expect(decrypted).toMatchObject({ email: 'legacy@test.com' });
        delete process.env.SESSION_SECRET;
    });
});

// ── Magic Link Send ─────────────────────────────────────────

describe('POST /api/auth/magic-link/send', () => {
    it('returns 400 when email is missing', async () => {
        const res = await sendHandler(makeSendRequest({}));
        const body = await res.json();
        expect(res.status).toBe(400);
        expect(body.error).toBe('Email is required');
    });

    it('creates token and returns success for admin user', async () => {
        // Mock admin user lookup
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin-1', name: 'Admin' } as any);
        vi.mocked(prisma.magicLinkToken.create).mockResolvedValue({} as any);

        const adminEmail = ADMIN_EMAILS[0]; // Use actual admin email from config
        const res = await sendHandler(makeSendRequest({ email: adminEmail }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(prisma.magicLinkToken.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                email: adminEmail,
                clientId: 'admin-1',
                used: false,
            }),
        });
    });

    it('creates admin user if not in DB', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue({ id: 'new-admin' } as any);
        vi.mocked(prisma.magicLinkToken.create).mockResolvedValue({} as any);

        const adminEmail = ADMIN_EMAILS[0];
        const res = await sendHandler(makeSendRequest({ email: adminEmail }));
        expect(res.status).toBe(200);

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                email: adminEmail,
                name: 'Admin',
                status: 'active',
                emailVerified: true,
            }),
        });
    });

    it('returns success for existing client user', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'client-1', name: 'John' } as any);
        vi.mocked(prisma.magicLinkToken.create).mockResolvedValue({} as any);

        const res = await sendHandler(makeSendRequest({ email: 'client@business.com' }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(prisma.magicLinkToken.create).toHaveBeenCalled();
    });

    it('returns generic success for unknown email (no leak)', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.customSolutionsClient.findFirst).mockResolvedValue(null);

        const res = await sendHandler(makeSendRequest({ email: 'stranger@unknown.com' }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toContain('If your email is registered');
        // Should NOT create a token
        expect(prisma.magicLinkToken.create).not.toHaveBeenCalled();
    });

    it('returns 403 for compete page access without allowlist', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as any);
        vi.mocked(prisma.tenant.findUnique).mockResolvedValue({ id: 'tenant-1', slug: 'acme' } as any);
        vi.mocked(prisma.tenantUser.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.competeAllowlist.findUnique).mockResolvedValue(null);

        const res = await sendHandler(makeSendRequest({
            email: 'notallowed@test.com',
            redirectTo: '/compete/acme',
        }));
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.error).toContain('not authorized');
    });

    it('normalizes email to lowercase and trimmed', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', name: 'Test' } as any);
        vi.mocked(prisma.magicLinkToken.create).mockResolvedValue({} as any);

        await sendHandler(makeSendRequest({ email: '  Test@EXAMPLE.COM  ' }));

        expect(prisma.magicLinkToken.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ email: 'test@example.com' }),
        });
    });

    it('includes devLink in response in development mode', async () => {
        process.env.NODE_ENV = 'development';
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', name: 'Dev' } as any);
        vi.mocked(prisma.magicLinkToken.create).mockResolvedValue({} as any);

        const res = await sendHandler(makeSendRequest({ email: 'dev@test.com' }));
        const body = await res.json();

        expect(body.devLink).toBeDefined();
        expect(body.devLink).toContain('/api/auth/magic-link/verify?token=');
        process.env.NODE_ENV = 'test';
    });
});

// ── Magic Link Verify ───────────────────────────────────────

describe('GET /api/auth/magic-link/verify', () => {
    it('redirects to error on missing token', async () => {
        const req = new Request('http://localhost/api/auth/magic-link/verify', { method: 'GET' }) as any;
        const res = await verifyHandler(req);

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('reason=missing_token');
    });

    it('redirects to error on invalid token', async () => {
        vi.mocked(prisma.magicLinkToken.findUnique).mockResolvedValue(null);

        const res = await verifyHandler(makeVerifyRequest('bad-token'));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('reason=invalid_token');
    });

    it('redirects to error on already-used token', async () => {
        vi.mocked(prisma.magicLinkToken.findUnique).mockResolvedValue({
            id: 'tok-1',
            email: 'test@example.com',
            clientId: 'u1',
            used: true,
            expiresAt: new Date(Date.now() + 86400000),
        } as any);

        const res = await verifyHandler(makeVerifyRequest('tok-1'));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('reason=invalid_token');
    });

    it('redirects to error on expired token', async () => {
        vi.mocked(prisma.magicLinkToken.findUnique).mockResolvedValue({
            id: 'tok-1',
            email: 'test@example.com',
            clientId: 'u1',
            used: false,
            expiresAt: new Date(Date.now() - 1000), // expired
        } as any);
        vi.mocked(prisma.magicLinkToken.delete).mockResolvedValue({} as any);

        const res = await verifyHandler(makeVerifyRequest('tok-1'));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('reason=expired_token');
    });

    it('validates token, sets cookie, and redirects to dashboard', async () => {
        vi.mocked(prisma.magicLinkToken.findUnique).mockResolvedValue({
            id: 'tok-valid',
            email: 'client@biz.com',
            clientId: 'client-1',
            used: false,
            expiresAt: new Date(Date.now() + 86400000),
        } as any);
        vi.mocked(prisma.magicLinkToken.update).mockResolvedValue({} as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ lastLoginAt: new Date(), name: 'Client' } as any);
        vi.mocked(prisma.user.update).mockResolvedValue({} as any);

        const res = await verifyHandler(makeVerifyRequest('tok-valid'));

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('/dashboard/client-1');

        // Token should be marked as used
        expect(prisma.magicLinkToken.update).toHaveBeenCalledWith({
            where: { id: 'tok-valid' },
            data: { used: true },
        });

        // User lastLoginAt updated
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'client-1' },
            data: { lastLoginAt: expect.any(Date) },
        });

        // Session cookie set
        const setCookie = res.headers.get('set-cookie');
        expect(setCookie).toContain('superseller_client_session');
    });

    it('sends welcome email on first login', async () => {
        const { emails } = await import('@/lib/email');

        vi.mocked(prisma.magicLinkToken.findUnique).mockResolvedValue({
            id: 'tok-first',
            email: 'new@client.com',
            clientId: 'new-1',
            used: false,
            expiresAt: new Date(Date.now() + 86400000),
        } as any);
        vi.mocked(prisma.magicLinkToken.update).mockResolvedValue({} as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            lastLoginAt: null, // first login
            name: 'New User',
            businessName: null,
        } as any);
        vi.mocked(prisma.user.update).mockResolvedValue({} as any);

        await verifyHandler(makeVerifyRequest('tok-first'));

        expect(emails.welcome).toHaveBeenCalledWith('new@client.com', 'New User');
    });

    it('redirects to custom path when redirectTo is provided', async () => {
        vi.mocked(prisma.magicLinkToken.findUnique).mockResolvedValue({
            id: 'tok-compete',
            email: 'user@acme.com',
            clientId: 'u-acme',
            used: false,
            expiresAt: new Date(Date.now() + 86400000),
        } as any);
        vi.mocked(prisma.magicLinkToken.update).mockResolvedValue({} as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ lastLoginAt: new Date() } as any);
        vi.mocked(prisma.user.update).mockResolvedValue({} as any);

        const res = await verifyHandler(makeVerifyRequest('tok-compete', '/compete/elite-pro'));

        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toContain('/compete/elite-pro');
    });

    it('redirects admin to admin dashboard', async () => {
        const adminEmail = ADMIN_EMAILS[0];
        vi.mocked(prisma.magicLinkToken.findUnique).mockResolvedValue({
            id: 'tok-admin',
            email: adminEmail,
            clientId: 'admin-1',
            used: false,
            expiresAt: new Date(Date.now() + 86400000),
        } as any);
        vi.mocked(prisma.magicLinkToken.update).mockResolvedValue({} as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ lastLoginAt: new Date() } as any);
        vi.mocked(prisma.user.update).mockResolvedValue({} as any);

        const res = await verifyHandler(makeVerifyRequest('tok-admin'));

        expect(res.status).toBe(307);
        // In non-production, redirects to /admin
        expect(res.headers.get('location')).toContain('/admin');
    });
});
