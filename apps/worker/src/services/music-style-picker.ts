/**
 * Music Style Picker — Selects Suno music style based on property characteristics.
 *
 * Prevents all TourReel videos from sounding the same by diversifying the Suno
 * prompt based on: property type, price bracket, architectural style, and listing
 * description keywords.
 *
 * Returns an array of 2 styles: primary (best match) + fallback (safe alternative).
 */

import { logger } from "../utils/logger";

interface ListingForMusic {
    music_style?: string | null;
    property_type?: string | null;
    price?: string | number | null;
    description?: string | null;
    address?: string | null;
    floorplan_analysis?: {
        property_characteristics?: {
            architectural_style?: string;
            total_sqft?: number;
        };
        rooms?: Array<{ name: string }>;
    } | null;
}

/** Style = Suno prompt fragment describing the musical vibe */
interface MusicStyleResult {
    styles: [string, string]; // [primary, fallback]
    reason: string;           // for logging
}

// Price bracket thresholds (USD)
const ULTRA_LUXURY = 2_000_000;
const LUXURY = 1_000_000;
const MID_RANGE = 500_000;

// Keyword → style mapping (checked against description + property_type)
const KEYWORD_STYLES: Array<{ keywords: string[]; style: string; label: string }> = [
    { keywords: ["beach", "ocean", "waterfront", "seaside", "coastal"], style: "tropical ambient lounge, gentle waves, island vibes", label: "beachfront" },
    { keywords: ["mountain", "cabin", "lodge", "rustic", "retreat"], style: "warm acoustic guitar, folk ambient, nature sounds", label: "mountain/cabin" },
    { keywords: ["penthouse", "skyline", "high-rise", "downtown", "urban"], style: "sleek electronic ambient, deep house undertones, metropolitan", label: "urban/penthouse" },
    { keywords: ["farm", "ranch", "barn", "country", "acre"], style: "acoustic folk, warm strings, open field atmosphere", label: "farmhouse/ranch" },
    { keywords: ["modern", "contemporary", "minimalist"], style: "minimal electronic ambient, clean synth pads, architectural", label: "modern" },
    { keywords: ["victorian", "colonial", "historic", "classic", "traditional"], style: "classical strings quartet, elegant chamber music", label: "traditional/classic" },
    { keywords: ["mediterranean", "spanish", "tuscan", "villa"], style: "spanish guitar ambient, Mediterranean warmth, classical", label: "mediterranean" },
    { keywords: ["condo", "apartment", "studio", "loft"], style: "chill electronic, lo-fi ambient, city vibes", label: "condo/apartment" },
    { keywords: ["pool", "resort", "tropical", "paradise"], style: "tropical house, poolside ambient, warm bass", label: "resort/tropical" },
    { keywords: ["golf", "country club", "estate", "gated"], style: "refined jazz ambient, sophisticated piano, upscale lounge", label: "country club/estate" },
];

// Architecture style → music style
const ARCHITECTURE_STYLES: Record<string, string> = {
    "modern": "minimal electronic ambient, clean synth pads, architectural soundscape",
    "contemporary": "electronic ambient, subtle beat, sophisticated production",
    "traditional": "classical piano, warm strings, timeless elegance",
    "craftsman": "warm acoustic, folk-inspired, handcrafted feel",
    "colonial": "classical chamber music, refined strings, stately",
    "mediterranean": "spanish guitar, classical warmth, stone and sun",
    "mid-century": "retro-modern jazz, vintage vibes, clean lines",
    "farmhouse": "acoustic guitar, warm folk, open spaces",
    "industrial": "deep ambient electronic, concrete atmosphere, raw",
    "art deco": "jazz lounge, brass accents, golden era elegance",
    "tudor": "english classical, pastoral strings, old world charm",
    "ranch": "western acoustic, open landscape ambient, earthy",
};

// Price bracket → fallback styles
const PRICE_STYLES: Array<{ min: number; max: number; style: string; label: string }> = [
    { min: ULTRA_LUXURY, max: Infinity, style: "orchestral cinematic, sweeping strings, luxury crescendo", label: "ultra-luxury" },
    { min: LUXURY, max: ULTRA_LUXURY, style: "elegant piano cinematic, sophisticated ambient, high-end", label: "luxury" },
    { min: MID_RANGE, max: LUXURY, style: "cinematic ambient, warm production, aspirational", label: "mid-range" },
    { min: 0, max: MID_RANGE, style: "upbeat pop instrumental, bright and inviting, modern energy", label: "starter/affordable" },
];

/**
 * Pick music styles based on property characteristics.
 * Returns [primary, fallback] styles for Suno generation.
 */
export function pickMusicStyle(listing: ListingForMusic): MusicStyleResult {
    // If user explicitly set a music_style, honor it as primary
    if (listing.music_style?.trim()) {
        return {
            styles: [listing.music_style.trim(), "luxury cinematic piano ambient"],
            reason: `user-specified: "${listing.music_style}"`,
        };
    }

    const description = [
        listing.description || "",
        listing.property_type || "",
        listing.address || "",
    ].join(" ").toLowerCase();

    const archStyle = listing.floorplan_analysis?.property_characteristics?.architectural_style?.toLowerCase();

    // 1. Try keyword matching against description
    for (const kw of KEYWORD_STYLES) {
        if (kw.keywords.some(k => description.includes(k))) {
            const fallback = getArchitectureStyle(archStyle) || getPriceStyle(listing.price) || "cinematic ambient piano, elegant";
            logger.debug({ msg: "Music style: keyword match", label: kw.label });
            return {
                styles: [kw.style, fallback],
                reason: `keyword-match: ${kw.label}`,
            };
        }
    }

    // 2. Try architectural style
    if (archStyle) {
        const archMusic = getArchitectureStyle(archStyle);
        if (archMusic) {
            const fallback = getPriceStyle(listing.price) || "cinematic ambient piano, elegant";
            logger.debug({ msg: "Music style: architecture match", archStyle });
            return {
                styles: [archMusic, fallback],
                reason: `architecture: ${archStyle}`,
            };
        }
    }

    // 3. Fall back to price bracket
    const priceStyle = getPriceStyle(listing.price);
    if (priceStyle) {
        logger.debug({ msg: "Music style: price bracket", price: listing.price });
        return {
            styles: [priceStyle, "cinematic ambient piano, elegant"],
            reason: `price-bracket`,
        };
    }

    // 4. Absolute fallback: randomize from a diverse set so not every video sounds the same
    const diverseDefaults = [
        "elegant cinematic piano, warm strings, luxury",
        "modern ambient electronic, sophisticated, clean",
        "cinematic orchestral, sweeping, aspirational",
        "warm acoustic ambient, inviting, organic",
        "jazz-infused lounge, smooth, upscale",
    ];
    const idx = hashCode(listing.address || listing.description || String(Date.now())) % diverseDefaults.length;
    return {
        styles: [diverseDefaults[idx], "cinematic ambient piano, elegant"],
        reason: "diverse-default",
    };
}

function getArchitectureStyle(archStyle?: string): string | null {
    if (!archStyle) return null;
    for (const [key, style] of Object.entries(ARCHITECTURE_STYLES)) {
        if (archStyle.includes(key)) return style;
    }
    return null;
}

function getPriceStyle(price?: string | number | null): string | null {
    if (price == null) return null;
    const numPrice = typeof price === "number" ? price : parseInt(String(price).replace(/[^0-9]/g, ""), 10);
    if (isNaN(numPrice)) return null;
    for (const bracket of PRICE_STYLES) {
        if (numPrice >= bracket.min && numPrice < bracket.max) return bracket.style;
    }
    return null;
}

/** Simple string hash for deterministic-but-varied selection */
function hashCode(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
