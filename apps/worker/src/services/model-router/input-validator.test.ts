/**
 * input-validator tests — validateImageInput() behavioral coverage
 *
 * Tests:
 * 1. Throws UnrecoverableError for URL ending in .webp
 * 2. Throws UnrecoverableError for URL with .webp?query
 * 3. Throws UnrecoverableError when HEAD returns 404
 * 4. Throws UnrecoverableError when HEAD returns Content-Type image/webp
 * 5. Throws UnrecoverableError when HEAD returns Content-Type text/html
 * 6. Passes for .jpg URL with Content-Type image/jpeg
 * 7. Passes for .png URL with Content-Type image/png
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnrecoverableError } from 'bullmq';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFetchMock(status: number, contentType: string) {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        headers: {
            get: (key: string) => key.toLowerCase() === 'content-type' ? contentType : null,
        },
    });
}

// Import after mocks
import { validateImageInput } from './input-validator';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('validateImageInput()', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('throws UnrecoverableError for URL ending in .webp (no fetch needed)', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await expect(validateImageInput('https://example.com/photo.webp'))
            .rejects.toThrow(UnrecoverableError);

        // Should not even call fetch — fast-path rejection
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws UnrecoverableError for URL with .webp?query param (no fetch needed)', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await expect(validateImageInput('https://cdn.example.com/image.webp?v=2'))
            .rejects.toThrow(UnrecoverableError);

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws UnrecoverableError when HEAD returns 404', async () => {
        vi.stubGlobal('fetch', makeFetchMock(404, 'text/html'));

        await expect(validateImageInput('https://example.com/missing.jpg'))
            .rejects.toThrow(UnrecoverableError);
    });

    it('throws UnrecoverableError when HEAD returns Content-Type image/webp', async () => {
        vi.stubGlobal('fetch', makeFetchMock(200, 'image/webp'));

        await expect(validateImageInput('https://example.com/disguised.jpg'))
            .rejects.toThrow(UnrecoverableError);
    });

    it('throws UnrecoverableError when HEAD returns Content-Type text/html', async () => {
        vi.stubGlobal('fetch', makeFetchMock(200, 'text/html; charset=utf-8'));

        await expect(validateImageInput('https://example.com/redirect.jpg'))
            .rejects.toThrow(UnrecoverableError);
    });

    it('passes for .jpg URL with Content-Type image/jpeg', async () => {
        vi.stubGlobal('fetch', makeFetchMock(200, 'image/jpeg'));

        await expect(validateImageInput('https://example.com/photo.jpg'))
            .resolves.toBeUndefined();
    });

    it('passes for .png URL with Content-Type image/png', async () => {
        vi.stubGlobal('fetch', makeFetchMock(200, 'image/png'));

        await expect(validateImageInput('https://example.com/photo.png'))
            .resolves.toBeUndefined();
    });
});
