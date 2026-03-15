import { UnrecoverableError } from 'bullmq';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/jpg']);

/**
 * Validate image URL before provider submission.
 * Rejects WebP (Feb 2026 $8.60 burn), unreachable URLs, and unsupported content types.
 * Throws UnrecoverableError so BullMQ does NOT retry (format issues won't self-fix).
 *
 * This function lives OUTSIDE the FalAdapter (keep adapter clean).
 * Call before FalAdapter.submitJob() in the pipeline code (Phase 08).
 */
export async function validateImageInput(imageUrl: string): Promise<void> {
    // 1. Fast-path: reject WebP from URL extension (no network request needed)
    const lower = imageUrl.toLowerCase();
    if (lower.endsWith('.webp') || lower.includes('.webp?')) {
        throw new UnrecoverableError(
            `Image format rejected: WebP not supported by fal.ai (${imageUrl}). Convert to JPEG/PNG before submission.`
        );
    }

    // 2. HEAD request for reachability + Content-Type confirmation
    const head = await fetch(imageUrl, { method: 'HEAD' });
    if (!head.ok) {
        throw new UnrecoverableError(`Image URL unreachable: ${head.status} ${imageUrl}`);
    }
    const contentType = head.headers.get('content-type') ?? '';
    const baseType = contentType.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(baseType)) {
        throw new UnrecoverableError(
            `Image content-type rejected: ${contentType} not supported. Allowed: image/jpeg, image/png`
        );
    }
}
