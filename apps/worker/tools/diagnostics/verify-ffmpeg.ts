import { logger } from "../../src/utils/logger";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function verifyFFmpeg() {
    logger.info("🔍 Verifying FFmpeg...");

    try {
        const { stdout: pathOut } = await execAsync("which ffmpeg");
        logger.info("✅ FFmpeg Path: " + pathOut.trim());
        const { stdout } = await execAsync("ffmpeg -version");
        const version = stdout.split("\n")[0];
        logger.info("✅ FFmpeg Version: " + version);

        const { stdout: ffprobeOut } = await execAsync("ffprobe -version");
        const ffprobeVersion = ffprobeOut.split("\n")[0];
        logger.info("✅ ffprobe: " + ffprobeVersion);
    } catch (err: any) {
        logger.error("❌ FFmpeg/ffprobe: Not found or failed - " + err.message);
    }

    process.exit(0);
}

verifyFFmpeg();
