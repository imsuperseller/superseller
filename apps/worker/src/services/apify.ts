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
    /** Resolved Zillow listing URL (hdpUrl or constructed). Use this for display and downstream. */
    zillow_url?: string;
}

const ZILLOW_URL_PATTERN = /^https?:\/\/(www\.)?zillow\.com\//i;

/**
 * Detect if input is a Zillow URL or a physical address.
 */
function isZillowUrl(input: string): boolean {
    return ZILLOW_URL_PATTERN.test(input.trim());
}

/**
 * Scrape Zillow listing by address OR Zillow URL.
 * If address is given, it is resolved to a Zillow URL internally by the Apify actor.
 * Both paths use the same detail scraper; the resolved zillow_url is included in the result.
 */
export async function scrapeZillowListing(
    addressOrUrl: string,
    maxPhotos: number = 30
): Promise<ZillowListingData> {
    const trimmed = addressOrUrl.trim();
    const isUrl = isZillowUrl(trimmed);

    logger.info({ msg: "Starting Zillow scrape", inputType: isUrl ? "url" : "address", value: trimmed });

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

        // Prefer canonical Zillow URL from scrape output; ensure full URL (Apify may return relative path)
        const base = "https://www.zillow.com";
        const rawUrl = raw.url || raw.hdpUrl;
        const slug =
            address !== "Unknown Address" && raw.zpid
                ? [address, city, state, zip].filter(Boolean).join("-").replace(/\s+/g, "-").replace(/,/g, "")
                : null;
        let zillowUrl: string | undefined =
            rawUrl && rawUrl.startsWith("http") ? rawUrl : rawUrl && rawUrl.startsWith("/") ? `${base}${rawUrl}` : undefined;
        zillowUrl = zillowUrl || (isUrl ? trimmed : undefined) || (slug ? `${base}/homedetails/${slug}/${raw.zpid}_zpid/` : undefined);

        // Map Apify data to our internal structure
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
            photos: (raw.photos || raw.responsivePhotos || []).flat().filter(Boolean).slice(0, maxPhotos),
            property_type: raw.homeType,
            mls_number: raw.mlsid || raw.mlsId,
            zillow_url: zillowUrl,
        };
    } catch (err: any) {
        logger.error({ msg: "Zillow scrape failed", input: trimmed, error: err.message });
        throw err;
    }
}
