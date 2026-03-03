/**
 * Timing constants and helpers for the property tour composition.
 * All durations specified in seconds — convert to frames via sec * FPS.
 */

export const FPS = 30;

/** Convert seconds to frame count */
export const sec = (s: number) => Math.round(s * FPS);

// ─── Segment Durations (seconds) ─────────────────────────────────

export const INTRO_DURATION = 5;
export const OUTRO_DURATION = 10;
export const EXTERIOR_DURATION = 6;

/** Hero rooms get more time */
const HERO_ROOM_TYPES = new Set([
    "interior_kitchen", "interior_living", "pool",
    "interior_bedroom", // primary only (first bedroom in sequence)
]);

/** Duration per room photo in seconds */
export function getRoomDuration(roomType: string, index: number, totalRooms: number): number {
    // Scale down if many rooms to keep total under 90s
    const baseDuration = HERO_ROOM_TYPES.has(roomType) ? 5.5 : 4.0;

    if (totalRooms > 10) {
        return Math.max(2.5, baseDuration * 0.7);
    }
    if (totalRooms > 7) {
        return Math.max(3.0, baseDuration * 0.85);
    }
    return baseDuration;
}

/** Calculate total video duration from photo count */
export function calculateTotalDuration(photoCount: number, roomTypes: string[]): number {
    const roomsDuration = roomTypes.reduce(
        (sum, type, i) => sum + getRoomDuration(type, i, roomTypes.length),
        0
    );
    return INTRO_DURATION + roomsDuration + OUTRO_DURATION;
}

// ─── Transition Durations (frames) ───────────────────────────────

export const TRANSITION_INTRO_TO_FIRST = sec(0.67);   // 20 frames
export const TRANSITION_ROOM_TO_ROOM = sec(0.4);      // 12 frames
export const TRANSITION_LAST_TO_OUTRO = sec(0.83);     // 25 frames

// ─── Text Overlay Timing ─────────────────────────────────────────

/** Room label appears this many frames into each room segment */
export const ROOM_LABEL_DELAY_FRAMES = sec(0.6);       // 18 frames
export const ROOM_LABEL_DURATION = sec(2.5);            // 75 frames
export const ROOM_LABEL_FADE_IN = sec(0.3);             // 9 frames
export const ROOM_LABEL_FADE_OUT = sec(0.4);            // 12 frames

/** Property address in intro */
export const ADDRESS_APPEAR_FRAME = sec(1.0);           // 30 frames
export const ADDRESS_DURATION = sec(3.5);               // 105 frames

/** Stats bar (beds/baths/sqft) in intro */
export const STATS_APPEAR_FRAME = sec(2.5);             // 75 frames

// ─── Music ───────────────────────────────────────────────────────

export const MUSIC_FADE_IN_FRAMES = sec(1.5);          // 45 frames
export const MUSIC_FADE_OUT_FRAMES = sec(3.0);         // 90 frames
export const MUSIC_VOLUME = 0.25;
