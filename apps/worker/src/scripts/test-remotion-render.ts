/**
 * Test script: Render a property tour video using Remotion.
 * Usage: npx tsx src/scripts/test-remotion-render.ts
 *
 * Renders the 1531 Home Park Dr property with all its Zillow photos
 * into all 4 aspect ratios. Outputs to /tmp/remotion-test/
 */
import path from "path";
import { mkdirSync } from "fs";
import { renderPropertyTour } from "../services/remotion-renderer";

const OUTPUT_DIR = "/tmp/remotion-test";

async function main() {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log("Starting Remotion property tour render...");
    console.log(`Output: ${OUTPUT_DIR}`);

    const results = await renderPropertyTour({
        props: {
            address: "1531 Home Park Dr",
            city: "Allen",
            state: "TX",
            zip: "75002",
            bedrooms: 4,
            bathrooms: 2,
            sqft: 1797,
            listingPrice: 4500,
            propertyType: "house",
            photos: [
                {
                    url: "https://photos.zillowstatic.com/fp/63a6f601f5b5480566ee474cad5ea08c-p_d.jpg",
                    roomName: "Front Exterior",
                    roomType: "exterior_front",
                    isExterior: true,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/724b8223554fa16fdf5d7b03b89445d2-p_d.jpg",
                    roomName: "Foyer",
                    roomType: "interior_hallway",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/bb88cfb9fa74174da1c4754445988da5-p_d.jpg",
                    roomName: "Living Room",
                    roomType: "interior_living",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/7e015b7f65d65a6e8928c6bd7fe1a997-p_d.jpg",
                    roomName: "Kitchen",
                    roomType: "interior_kitchen",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/08c9df0f59a67568378ff5ed34d5e336-p_d.jpg",
                    roomName: "Dining Area",
                    roomType: "interior_dining",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/71ae7840e6186e4cfe748eed6ea4592d-p_d.jpg",
                    roomName: "Primary Bedroom",
                    roomType: "interior_bedroom",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/da30463872ca05dbf70ac6bee7af5d49-p_d.jpg",
                    roomName: "Primary Bathroom",
                    roomType: "interior_bathroom",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/90a5b79bc03daa876e436e6997a6d6d7-p_d.jpg",
                    roomName: "Bedroom 2",
                    roomType: "interior_bedroom",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/0e322baa3c36e25ff6541c0e6a3c4e8d-p_d.jpg",
                    roomName: "Bathroom 2",
                    roomType: "interior_bathroom",
                    isExterior: false,
                    isSpecialFeature: false,
                },
                {
                    url: "https://photos.zillowstatic.com/fp/544551467a92b31582113214e9b0e3f3-p_d.jpg",
                    roomName: "Backyard & Pool",
                    roomType: "pool",
                    isExterior: true,
                    isSpecialFeature: true,
                    featureType: "pool",
                },
            ],
            // musicUrl omitted — will add after CORS-compatible hosting
            agent: {
                name: "Yaron Friedman",
                phone: "(972) 555-1234",
                email: "yaron@superseller.agency",
                company: "SuperSeller Agency",
            },
            showPrice: true,
            showRoomLabels: true,
            transitionDurationFrames: 15,
            branding: {
                mode: "superseller",
                primaryColor: "#F97316",
                secondaryColor: "#14B8A6",
                textColor: "#FFFFFF",
                overlayBgColor: "rgba(0,0,0,0.55)",
                showPoweredBy: true,
                poweredByText: "Powered by SuperSeller",
                logoWidth: 120,
                logoPosition: "top-right",
            },
        },
        outputDir: OUTPUT_DIR,
        aspectRatios: ["16x9"], // Start with master only for speed
        concurrency: 4,
        crf: 20,
        onProgress: (ratio, percent) => {
            process.stdout.write(`\r  [${ratio}] ${percent}%`);
        },
    });

    console.log("\n\nRender complete!");
    for (const r of results) {
        console.log(`  ${r.ratio}: ${r.outputPath} (${r.durationSeconds.toFixed(1)}s video, rendered in ${r.renderTimeSeconds.toFixed(1)}s)`);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error("Render failed:", err);
    process.exit(1);
});
