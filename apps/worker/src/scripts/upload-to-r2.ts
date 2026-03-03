/**
 * One-off script: Upload any local file to R2 and print the public URL.
 * Usage: npx tsx src/scripts/upload-to-r2.ts <localPath> <r2Key>
 * Example: npx tsx src/scripts/upload-to-r2.ts /tmp/remotion-test/16_9.mp4 remotion-test/16_9.mp4
 */
import { uploadToR2 } from "../services/r2";

async function main() {
    const [localPath, r2Key] = process.argv.slice(2);
    if (!localPath || !r2Key) {
        console.error("Usage: npx tsx src/scripts/upload-to-r2.ts <localPath> <r2Key>");
        process.exit(1);
    }

    console.log(`Uploading ${localPath} → R2 key: ${r2Key}`);
    const publicUrl = await uploadToR2(localPath, r2Key, "video/mp4");
    console.log(`\nPublic URL: ${publicUrl}`);

    process.exit(0);
}

main().catch((err) => {
    console.error("Failed:", err.message);
    process.exit(1);
});
