
import { objectExists, buildR2Key } from "../services/r2";

async function main() {
    const userId = "c60b6d2f-856d-49fd-8737-7e1fee3fa848";
    const jobId = "d31f0082-4efb-4681-abaa-1383b6aba676";

    const files = [
        "frames/realtor_exterior_opening.png",
        "frames/room_1.png",
        "frames/room_2.png",
        "frames/room_3.png",
        "frames/room_4.png",
        "frames/room_5.png",
        "frames/room_6.png"
    ];

    console.log(`Checking frames for Job ${jobId}...`);

    for (const f of files) {
        const key = buildR2Key(userId, jobId, f);
        const exists = await objectExists(key);
        console.log(`${f}: ${exists ? "✅ EXISTS" : "❌ MISSING"}`);
    }
}

main().catch(console.error);
