import { fal } from "@fal-ai/client";

const FAL_KEY = "dc63dbcb-36ec-4af2-ad7a-d64dad3c91af:5bccc6209bfc63d8862fe5164dde8802";
fal.config({ credentials: FAL_KEY });

async function test() {
    console.log("Testing Fal.ai Kling 3.0 Standard...");
    try {
        const result = await fal.subscribe("fal-ai/kling-video/v3/standard/image-to-video", {
            input: {
                prompt: "Cinematic real estate tour tracking shot of a luxury living room.",
                image_url: "https://raw.githubusercontent.com/shaifriedman/main/floor_plan.webp",
                duration: "5"
            }
        });
        console.log("Fal Success:", result);
    } catch (err: any) {
        console.error("Fal Error:", err.message);
    }
}

test();
