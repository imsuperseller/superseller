/**
 * Ken Burns animation patterns per room type.
 * Each defines start/end scale + translate origin to create
 * a cinematic pan/zoom effect on a still photo.
 *
 * Rules to avoid monotony:
 * - Never use same direction for 2 consecutive rooms
 * - Alternate zoom-in / zoom-out / pan
 * - Hero rooms (kitchen, primary bed) get slower, wider movement
 */
import { Easing } from "remotion";

export type KenBurnsConfig = {
    startScale: number;
    endScale: number;
    /** Percentage 0-100, 50 = center */
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    easing: (t: number) => number;
};

// ─── Room-specific default patterns ──────────────────────────────

const PATTERNS: Record<string, KenBurnsConfig> = {
    // Exterior: pull back reveal (start zoomed on door, reveal facade)
    exterior_front: {
        startScale: 1.25, endScale: 1.0,
        startX: 50, startY: 45, endX: 50, endY: 50,
        easing: Easing.inOut(Easing.quad),
    },
    exterior_back: {
        startScale: 1.15, endScale: 1.0,
        startX: 50, startY: 55, endX: 50, endY: 45,
        easing: Easing.inOut(Easing.sin),
    },

    // Entry: zoom in (invite viewer inside)
    interior_hallway: {
        startScale: 1.0, endScale: 1.15,
        startX: 50, startY: 50, endX: 50, endY: 45,
        easing: Easing.inOut(Easing.sin),
    },

    // Living room: right-to-left pan (reveal breadth)
    interior_living: {
        startScale: 1.12, endScale: 1.15,
        startX: 65, startY: 48, endX: 35, endY: 48,
        easing: Easing.inOut(Easing.quad),
    },

    // Kitchen: zoom into counter details
    interior_kitchen: {
        startScale: 1.05, endScale: 1.25,
        startX: 40, startY: 55, endX: 55, endY: 50,
        easing: Easing.inOut(Easing.sin),
    },

    // Dining: gentle zoom out to show table context
    interior_dining: {
        startScale: 1.18, endScale: 1.05,
        startX: 50, startY: 50, endX: 50, endY: 50,
        easing: Easing.inOut(Easing.quad),
    },

    // Primary bedroom: zoom out from center (reveal space)
    interior_bedroom: {
        startScale: 1.20, endScale: 1.0,
        startX: 50, startY: 45, endX: 50, endY: 50,
        easing: Easing.inOut(Easing.quad),
    },

    // Bathroom: left-to-right pan across fixtures
    interior_bathroom: {
        startScale: 1.15, endScale: 1.15,
        startX: 30, startY: 50, endX: 70, endY: 50,
        easing: Easing.inOut(Easing.sin),
    },

    // Office: subtle zoom in
    interior_office: {
        startScale: 1.0, endScale: 1.12,
        startX: 50, startY: 50, endX: 50, endY: 48,
        easing: Easing.inOut(Easing.quad),
    },

    // Closet: quick centered zoom out
    interior_closet: {
        startScale: 1.15, endScale: 1.02,
        startX: 50, startY: 48, endX: 50, endY: 50,
        easing: Easing.inOut(Easing.quad),
    },

    // Laundry: quick diagonal pan
    interior_laundry: {
        startScale: 1.12, endScale: 1.12,
        startX: 35, startY: 40, endX: 65, endY: 55,
        easing: Easing.inOut(Easing.sin),
    },

    // Pool: wide pan across water
    pool: {
        startScale: 1.08, endScale: 1.08,
        startX: 25, startY: 50, endX: 75, endY: 48,
        easing: Easing.inOut(Easing.quad),
    },

    // Generic fallback: simple zoom out
    interior_other: {
        startScale: 1.15, endScale: 1.0,
        startX: 50, startY: 48, endX: 50, endY: 50,
        easing: Easing.inOut(Easing.quad),
    },
};

// ─── Variation alternates (to avoid repetition) ──────────────────

const ALTERNATES: KenBurnsConfig[] = [
    // Pan left-to-right + slight zoom
    { startScale: 1.1, endScale: 1.12, startX: 35, startY: 50, endX: 65, endY: 48, easing: Easing.inOut(Easing.quad) },
    // Zoom in center
    { startScale: 1.0, endScale: 1.18, startX: 50, startY: 50, endX: 50, endY: 48, easing: Easing.inOut(Easing.sin) },
    // Pan right-to-left + zoom out
    { startScale: 1.18, endScale: 1.05, startX: 60, startY: 48, endX: 40, endY: 50, easing: Easing.inOut(Easing.quad) },
    // Diagonal top-left to bottom-right
    { startScale: 1.12, endScale: 1.12, startX: 40, startY: 40, endX: 60, endY: 60, easing: Easing.inOut(Easing.sin) },
    // Zoom out wide
    { startScale: 1.22, endScale: 1.0, startX: 50, startY: 50, endX: 50, endY: 50, easing: Easing.inOut(Easing.quad) },
];

/**
 * Get the Ken Burns config for a given room type + index.
 * Uses room-specific pattern when available, with alternation to avoid
 * using the same direction for consecutive rooms.
 */
export function getKenBurnsConfig(roomType: string, index: number): KenBurnsConfig {
    const base = PATTERNS[roomType] || PATTERNS.interior_other;

    // For even indices, use the room-specific pattern.
    // For odd indices, pick from alternates to vary direction.
    if (index % 2 === 0) {
        return base;
    }

    // Pick an alternate that differs from the base direction
    return ALTERNATES[index % ALTERNATES.length];
}
