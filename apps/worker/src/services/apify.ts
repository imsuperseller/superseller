import { ApifyClient } from "apify-client";
import { logger } from "../utils/logger";

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export interface ZillowListingData {
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    description?: string;
    photos: string[];
    property_type?: string;
    mls_number?: string;
    zillow_url?: string;
    // Deep metadata for spatial reasoning
    yearBuilt?: number;
    lotSize?: string;
    neighborhood?: string;
    amenities?: string[];
    resoFacts?: any;
    homeInsights?: any[];
    attributionInfo?: any;
}

const ZILLOW_URL_PATTERN = /^https?:\/\/(www\.)?zillow\.com\//i;

/**
 * Detect if input is a Zillow URL or a physical address.
 */
function isZillowUrl(input: string): boolean {
    return ZILLOW_URL_PATTERN.test(input.trim());
}

/**
 * Extract photos from all known Zillow Apify response formats.
 * Zillow data comes in many shapes: raw.photos (simple URLs), raw.responsivePhotos
 * (nested mixedSources), raw.hugePhotos, raw.big, raw.mediumImageLink, etc.
 */
function extractZillowPhotos(raw: any, maxPhotos: number): string[] {
    const seen = new Set<string>();
    const urls: string[] = [];

    const addUrl = (u: string) => {
        if (u && typeof u === "string" && u.startsWith("http") && !seen.has(u)) {
            seen.add(u);
            urls.push(u);
        }
    };

    // 1. raw.photos — simple array of URL strings (most common)
    if (Array.isArray(raw.photos)) {
        for (const p of raw.photos.flat()) {
            if (typeof p === "string") addUrl(p);
            else if (p?.url) addUrl(p.url);
        }
    }

    // 2. raw.responsivePhotos — Zillow's responsive format with mixedSources
    if (Array.isArray(raw.responsivePhotos)) {
        for (const photo of raw.responsivePhotos) {
            if (!photo) continue;
            // Direct URL
            if (typeof photo === "string") { addUrl(photo); continue; }
            if (photo.url) { addUrl(photo.url); continue; }
            // Nested: mixedSources.jpeg[] or mixedSources.webp[]
            const sources = photo.mixedSources || photo.sources;
            if (sources) {
                const jpegList = sources.jpeg || sources.jpg || [];
                const webpList = sources.webp || [];
                // Pick largest JPEG, fallback to largest webp
                const best = [...jpegList, ...webpList]
                    .filter((s: any) => s?.url)
                    .sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
                if (best?.url) addUrl(best.url);
            }
        }
    }

    // 3. raw.hugePhotos — large photo URLs
    if (Array.isArray(raw.hugePhotos)) {
        for (const p of raw.hugePhotos) {
            if (typeof p === "string") addUrl(p);
            else if (p?.url) addUrl(p.url);
        }
    }

    // 4. raw.big — another photo array format
    if (Array.isArray(raw.big)) {
        for (const p of raw.big) {
            if (typeof p === "string") addUrl(p);
            else if (p?.url) addUrl(p.url);
        }
    }

    // 5. raw.mediumImageLink / raw.hiResImageLink — single hero image
    if (raw.hiResImageLink) addUrl(raw.hiResImageLink);
    if (raw.mediumImageLink) addUrl(raw.mediumImageLink);

    // 6. raw.originalPhotos
    if (Array.isArray(raw.originalPhotos)) {
        for (const p of raw.originalPhotos) {
            if (typeof p === "string") addUrl(p);
            else if (p?.url) addUrl(p.url);
        }
    }

    return urls.slice(0, maxPhotos);
}

/**
 * Scrape Zillow listing by address OR Zillow URL.
 */
export async function scrapeZillowListing(
    addressOrUrl: string,
    maxPhotos: number = 50
): Promise<ZillowListingData> {
    const trimmed = addressOrUrl.trim();
    const isUrl = isZillowUrl(trimmed);

    logger.info({ msg: "Starting Deep Zillow scrape", inputType: isUrl ? "url" : "address", value: trimmed });

    try {
        const input: Record<string, unknown> = isUrl
            ? { startUrls: [{ url: trimmed }] }
            : { addresses: [trimmed] };

        const run = await apifyClient.actor("maxcopell/zillow-detail-scraper").call(input);
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            throw new Error(`No Zillow data found for ${isUrl ? "URL" : "address"}: ${trimmed}`);
        }

        const raw = items[0] as any;

        const address = raw.address?.streetAddress || raw.streetAddress || "Unknown Address";
        const city = raw.address?.city || raw.city;
        const state = raw.address?.state || raw.state;
        const zip = raw.address?.zipcode || raw.zipcode;

        const base = "https://www.zillow.com";
        const rawUrl = raw.url || raw.hdpUrl;
        const slug =
            address !== "Unknown Address" && raw.zpid
                ? [address, city, state, zip].filter(Boolean).join("-").replace(/\s+/g, "-").replace(/,/g, "")
                : null;
        let zillowUrl: string | undefined =
            rawUrl && rawUrl.startsWith("http") ? rawUrl : rawUrl && rawUrl.startsWith("/") ? `${base}${rawUrl}` : undefined;
        zillowUrl = zillowUrl || (isUrl ? trimmed : undefined) || (slug ? `${base}/homedetails/${slug}/${raw.zpid}_zpid/` : undefined);

        // Extract photos from all known Zillow response formats
        const photos = extractZillowPhotos(raw, maxPhotos);
        logger.info({ msg: "Zillow photos extracted", count: photos.length, sources: { photos: !!raw.photos, responsivePhotos: !!raw.responsivePhotos, hugePhotos: !!raw.hugePhotos, mediumImageLink: !!raw.mediumImageLink } });

        // Map Deep Data
        return {
            address,
            city,
            state,
            zip,
            price: raw.price,
            bedrooms: raw.bedrooms,
            bathrooms: raw.bathrooms,
            sqft: raw.livingArea,
            description: raw.description,
            photos,
            property_type: raw.homeType,
            mls_number: raw.mlsid || raw.mlsId,
            zillow_url: zillowUrl,
            yearBuilt: raw.yearBuilt,
            lotSize: raw.lotSize,
            neighborhood: raw.address?.neighborhood || raw.neighborhood,
            amenities: raw.resoFacts?.atAGlanceFacts?.map((f: any) => `${f.factLabel}: ${f.factValue}`) || [],
            resoFacts: raw.resoFacts,
            homeInsights: raw.homeInsights,
            attributionInfo: raw.attributionInfo,
        };
    } catch (err: any) {
        logger.error({ msg: "Zillow scrape failed", input: trimmed, error: err.message });
        throw err;
    }
}
