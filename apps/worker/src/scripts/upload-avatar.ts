/**
 * One-off script: Upload realtor headshot to R2 and update user avatar_url
 * Usage: npx tsx src/scripts/upload-avatar.ts <localImagePath> <userId>
 */
import { uploadToR2 } from "../services/r2";
import { query } from "../db/client";

async function main() {
    const [localPath, userId] = process.argv.slice(2);
    if (!localPath || !userId) {
        console.error("Usage: npx tsx src/scripts/upload-avatar.ts <localImagePath> <userId>");
        process.exit(1);
    }

    const r2Key = `avatars/${userId}/headshot.jpg`;
    console.log(`Uploading ${localPath} → R2 key: ${r2Key}`);

    const publicUrl = await uploadToR2(localPath, r2Key, "image/jpeg");
    console.log(`R2 URL: ${publicUrl}`);

    await query('UPDATE "User" SET avatar_url = $1 WHERE id = $2', [publicUrl, userId]);
    console.log(`Updated avatar_url for user ${userId}`);

    process.exit(0);
}

main().catch((err) => {
    console.error("Failed:", err.message);
    process.exit(1);
});
