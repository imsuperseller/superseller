/**
 * Room → Photo mapping. Single source of truth for which listing photo backs each tour clip.
 *
 * V2 (Feb 2026): Uses ClassifiedPhoto from photo-classifier.ts for type-based mapping.
 * Falls back to legacy heuristic when classifiedPhotos is not provided.
 *
 * @see PIPELINE_STEP_BY_STEP.md Phase 3
 */

import type { HeroFeaturesResult } from "./hero-features";
import type { ClassifiedPhoto } from "./photo-classifier";
import { getBestPhotoUrl, mapPhotosToRooms } from "./photo-classifier";
import { logger } from "../utils/logger";

export interface RoomPhotoInput {
    /** Exterior/hero photo URL (R2). Often first listing photo. */
    exteriorUrl: string | null;
    /** Additional interior/room photos (R2). Order matches listing. */
    additionalPhotos: string[];
    /** From deriveHeroFeatures. Affects pool/backyard photo selection. */
    heroResult: HeroFeaturesResult;
    /** Optional AI vision override: clipIndex -> photoIndex into usePhotos. When set, use instead of heuristic. */
    visionOverride?: Map<number, number>;
    /** V2: Pre-classified photos. When provided, uses type-based mapping instead of index/heuristic. */
    classifiedPhotos?: ClassifiedPhoto[];
}

export interface ClipPhotoAssignment {
    clipNumber: number;
    toRoom: string;
    photoUrl: string;
    /** Where the photo came from (for debugging). */
    source: "exterior" | "additional" | "fallback" | "classified";
    photoIndex: number;
}

/**
 * Assign a photo URL to each clip based on the room being shown.
 *
 * V2 path (classifiedPhotos provided): Uses type-based deterministic mapping.
 * Each photo is pre-classified as interior_kitchen, exterior_front, pool, etc.
 * Rooms are matched to the closest photo type. No index-based guessing.
 *
 * Legacy path: Index-based heuristic + optional visionOverride from Gemini.
 */
export function assignPhotosToClips(
    clips: { clip_number: number; to_room: string }[],
    input: RoomPhotoInput
): ClipPhotoAssignment[] {
    const { classifiedPhotos } = input;

    // V2 path: classified photos with type-based mapping
    if (classifiedPhotos && classifiedPhotos.length > 0) {
        return assignWithClassifiedPhotos(clips, classifiedPhotos);
    }

    // Legacy path: heuristic/vision override
    return assignLegacy(clips, input);
}

// ─── V2: Type-Based Mapping ────────────────────────────────────
function assignWithClassifiedPhotos(
    clips: { clip_number: number; to_room: string }[],
    classified: ClassifiedPhoto[]
): ClipPhotoAssignment[] {
    const roomNames = clips.map(c => c.to_room);
    const roomToUsableIdx = mapPhotosToRooms(roomNames, classified);

    // Build usable photo array (same order as mapPhotosToRooms uses)
    const usable = classified.filter(p =>
        !["floorplan", "aerial", "marketing", "unusable"].includes(p.type)
    );

    return clips.map((clip, i) => {
        const usableIdx = roomToUsableIdx.get(i);
        const photo = usableIdx !== undefined ? usable[usableIdx] : null;
        const url = photo ? getBestPhotoUrl(photo) : (usable[0] ? getBestPhotoUrl(usable[0]) : "");

        return {
            clipNumber: clip.clip_number,
            toRoom: clip.to_room,
            photoUrl: url,
            source: "classified" as const,
            photoIndex: photo?.originalIndex ?? -1,
        };
    });
}

// ─── Legacy: Heuristic + Vision Override ───────────────────────
function buildUsePhotos(exteriorUrl: string | null, additionalPhotos: string[], hasVisionOverride?: boolean): string[] {
    if (hasVisionOverride && exteriorUrl) {
        return [exteriorUrl, ...additionalPhotos];
    }
    if (additionalPhotos.length > 0) return additionalPhotos;
    return exteriorUrl ? [exteriorUrl] : [];
}

function assignLegacy(
    clips: { clip_number: number; to_room: string }[],
    input: RoomPhotoInput
): ClipPhotoAssignment[] {
    const { exteriorUrl, additionalPhotos, heroResult, visionOverride } = input;
    const usePhotos = buildUsePhotos(exteriorUrl, additionalPhotos, !!visionOverride);

    if (usePhotos.length === 0) {
        return clips.map((c) => ({
            clipNumber: c.clip_number,
            toRoom: c.to_room,
            photoUrl: exteriorUrl || "",
            source: "exterior" as const,
            photoIndex: -1,
        }));
    }

    const assignments: ClipPhotoAssignment[] = [];

    for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const toRoom = (clip.to_room || "").toLowerCase();
        const r = toRoom;

        let photoUrl: string;
        let source: "exterior" | "additional" | "fallback" = "additional";
        let photoIndex: number;

        if (visionOverride?.has(i)) {
            photoIndex = Math.min(Math.max(0, visionOverride.get(i)!), usePhotos.length - 1);
            photoUrl = usePhotos[photoIndex] || usePhotos[0];
        } else {
            const poolOrBackyard = r.includes("pool") || r.includes("backyard") || r.includes("patio") || r.includes("deck");
            if (poolOrBackyard && heroResult.hasPool && usePhotos.length > 2) {
                photoIndex = usePhotos.length - 1;
                photoUrl = usePhotos[photoIndex] ?? usePhotos[photoIndex - 1] ?? usePhotos[0];
            } else if ((r.includes("exterior") || r.includes("front")) && r.includes("door")) {
                photoUrl = usePhotos[0] || exteriorUrl || usePhotos[0];
                photoIndex = 0;
                source = exteriorUrl && photoUrl === exteriorUrl ? "exterior" : "additional";
            } else if (r.includes("exterior") && !r.includes("front")) {
                photoUrl = exteriorUrl || usePhotos[0];
                photoIndex = 0;
                source = exteriorUrl ? "exterior" : "additional";
            } else if (r.includes("foyer") || r.includes("entry")) {
                photoIndex = Math.min(1, usePhotos.length - 1);
                photoUrl = usePhotos[photoIndex] || usePhotos[0];
            } else {
                photoIndex = Math.min(i, usePhotos.length - 1);
                photoUrl = usePhotos[photoIndex] || usePhotos[0];
            }
        }

        assignments.push({
            clipNumber: clip.clip_number,
            toRoom: clip.to_room,
            photoUrl,
            source,
            photoIndex,
        });
    }

    return assignments;
}

/**
 * Given opening candidates [exterior, ...additional.slice(0,4)], return the chosen URL.
 * Used when pickBestApproachPhotoForOpening returns an index.
 */
export function resolveOpeningPhoto(
    openingCandidates: string[],
    chosenIndex: number
): string | null {
    if (openingCandidates.length === 0) return null;
    const idx = Math.min(Math.max(0, chosenIndex), openingCandidates.length - 1);
    return openingCandidates[idx] ?? null;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate that every clip has a usable start frame before we spend credits.
 * Clip 0 needs opening photo; clips 1+ get it from previous clip's extracted frame at runtime.
 */
export function validateClipPhotoAssignments(
    assignments: ClipPhotoAssignment[],
    openingPhotoUrl: string | null
): ValidationResult {
    const errors: string[] = [];

    if (assignments.length === 0) {
        errors.push("No clips to validate.");
        return { valid: false, errors };
    }

    if (!openingPhotoUrl || !openingPhotoUrl.startsWith("http")) {
        errors.push("Clip 1 requires a valid opening photo (front-of-house). Ensure exterior_photo_url or additional_photos are fetchable.");
    }

    for (const a of assignments) {
        if (!a.photoUrl || !a.photoUrl.startsWith("http")) {
            errors.push(`Clip ${a.clipNumber} (${a.toRoom}): no photo assigned. Need listing photos for room type.`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
