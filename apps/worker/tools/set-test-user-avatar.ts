/**
 * Upload avatar image to R2 and set user.avatar_url.
 * Kie.ai can only fetch from public URLs; Clerk/Facebook CDNs often fail.
 *
 * Usage: npx tsx tools/set-test-user-avatar.ts [imagePath] [userId]
 * Default: apps/worker/assets/realtor-avatar.png (run from apps/worker)
 * Override: AVATAR_IMAGE_PATH env or first arg
 */
import "dotenv/config";
import { existsSync } from "fs";
import { join } from "path";
import { uploadToR2 } from "../src/services/r2";
import { queryOne, query } from "../src/db/client";

const DEFAULT_IMAGE = process.env.AVATAR_IMAGE_PATH ||
    join(process.cwd(), "assets/realtor-avatar.png");

async function main() {
    const imagePath = process.argv[2] || DEFAULT_IMAGE;
    let userId = process.argv[3];

    if (!existsSync(imagePath)) {
        console.error("Image not found:", imagePath);
        process.exit(1);
    }

    if (!userId) {
        const u = await queryOne("SELECT id FROM users WHERE clerk_id = $1", ["e2e-test-user"]);
        if (!u) {
            console.error("No test user. Run ensure-test-user first.");
            process.exit(1);
        }
        userId = u.id;
    }

    const r2Key = `${userId}/avatar/avatar.png`;
    const publicUrl = await uploadToR2(imagePath, r2Key);
    await query("UPDATE users SET avatar_url = $1 WHERE id = $2", [publicUrl, userId]);
    console.log("✅ Avatar set:", publicUrl);
    console.log("   User:", userId);
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
