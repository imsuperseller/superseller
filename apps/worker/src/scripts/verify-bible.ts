import { analyzeFloorplan, buildTourSequence } from "../services/floorplan-analyzer";
import { generateClipPrompts } from "../services/prompt-generator";
import { logger } from "../utils/logger";

async function verifyBibleImplementation() {
    const floorplanPath = "/Users/shaifriedman/floor_plan.webp";
    const exteriorPath = "/Users/shaifriedman/474447580_10162710146543846_2609663045130967931_n-removebg-preview.png";

    const listing = {
        property_type: "Single Family House",
        address: "1531 Home Park Dr, Allen, TX 75002",
        bedrooms: 4, // Typical for this area
        bathrooms: 3,
        sqft: 2800,
        city: "Allen",
        state: "TX"
    };

    console.log("\n🚀 STEP 1: Analyzing Floorplan (Project Bible Rule Enforcer) 🚀");
    try {
        const analysis = await analyzeFloorplan(floorplanPath, listing as any);
        console.log("✅ Analysis Complete!");
        console.log("Property Type:", analysis.property_type);
        console.log("Rooms Detected:", analysis.total_rooms);
        console.log("Confidence Score:", analysis.confidence_score);
        console.log("Tour Sequence:", analysis.suggested_tour_sequence.join(" -> "));

        console.log("\n🎬 STEP 2: Building Cinematic Tour Sequence 🎬");
        const tour = buildTourSequence(analysis);
        console.log(`Generated ${tour.length} transitions.`);

        console.log("\n🎞️ STEP 3: Generating Cinematic Prompts (Master Template) 🎞️");
        const prompts = await generateClipPrompts(tour, {
            property_type: listing.property_type,
            exterior_description: "Modern suburban home with brick facade and landscaped yard",
            style: "traditional" // Allen, TX often favors traditional/transitional styles
        });

        console.log(`✅ Generated ${prompts.length} Cinematic Prompts.`);

        // Sample the first room to door transition
        console.log("\n--- Sample Prompt (Clip 1) ---");
        console.log("From:", prompts[0].from_room);
        console.log("To:", prompts[0].to_room);
        console.log("Prompt:", prompts[0].prompt);
        console.log("Negative Prompt (Length):", prompts[0].negative_prompt?.length);

    } catch (error: any) {
        console.error("❌ Test Failed:", error.message);
    }
}

verifyBibleImplementation();
