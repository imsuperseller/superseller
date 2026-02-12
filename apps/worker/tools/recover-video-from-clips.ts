/**
 * Recover a video from completed clips for a job that failed at music/stitch.
 * No new API calls — uses existing clip URLs. Run from apps/worker.
 *
 * Usage: JOB_ID=575d7071-bf77-454c-a53b-b58e9bdeb1f8 npx tsx tools/recover-video-from-clips.ts
 */
import * as dotenv from "dotenv";
import path from "path";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const JOB_ID = process.env.JOB_ID || "575d7071-bf77-454c-a53b-b58e9bdeb1f8";

async function download(url: string, dest: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
}

async function main() {
    const { query, queryOne } = await import("../src/db/client");
    const { stitchClipsConcat, addMusicOverlay, getVideoDuration } = await import("../src/services/ffmpeg");
    const { uploadToR2, buildR2Key } = await import("../src/services/r2");
    const workDir = join(process.env.TEMP_DIR || "/tmp", `recover-${JOB_ID}`);
    if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true });

    const clips = await query<any>(
        "SELECT clip_number, video_url, duration_seconds FROM clips WHERE video_job_id = $1 AND status = 'complete' ORDER BY clip_number",
        [JOB_ID]
    );
    if (clips.length === 0) {
        console.error("No completed clips found for job", JOB_ID);
        process.exit(1);
    }

    const job = await queryOne<any>("SELECT user_id, listing_id FROM video_jobs WHERE id = $1", [JOB_ID]);
    if (!job) {
        console.error("Job not found:", JOB_ID);
        process.exit(1);
    }

    console.log(`Downloading ${clips.length} clips...`);
    const clipPaths: string[] = [];
    for (const c of clips) {
        const dest = join(workDir, `clip_${c.clip_number}.mp4`);
        await download(c.video_url, dest);
        clipPaths.push(dest);
    }

    console.log("Stitching clips...");
    const masterSilentPath = join(workDir, "master_silent.mp4");
    await stitchClipsConcat(clipPaths, masterSilentPath);

    let masterPath = masterSilentPath;
    try {
        console.log("Adding music...");
        const musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        const musicPath = join(workDir, "music.mp3");
        await download(musicUrl, musicPath);
        masterPath = join(workDir, "master.mp4");
        await addMusicOverlay(masterSilentPath, musicPath, masterPath);
    } catch (e: any) {
        console.warn("Music add failed, using silent video:", e.message);
    }

    const duration = await getVideoDuration(masterPath);
    console.log(`Master video: ${duration.toFixed(1)}s`);

    let finalUrl: string;
    try {
        const r2Key = buildR2Key(job.user_id, JOB_ID, "master_recovered.mp4");
        finalUrl = await uploadToR2(masterPath, r2Key);
        if (finalUrl.startsWith("/")) {
            console.warn("R2_PUBLIC_URL not set — URL is relative. Set R2_PUBLIC_URL for a public link.");
        }
        await query(
            `UPDATE video_jobs SET status = 'complete', progress_percent = 100, master_video_url = $1, video_duration_seconds = $2, completed_at = NOW(), error_message = NULL WHERE id = $3`,
            [finalUrl, duration, JOB_ID]
        );
        console.log("\n✅ VIDEO RECOVERED");
        console.log("Final URL:", finalUrl);
    } catch (e: any) {
        console.warn("R2 upload failed, saving locally:", e.message);
        finalUrl = masterPath;
        console.log("\n✅ VIDEO SAVED LOCALLY");
        console.log("Path:", masterPath);
    }

    console.log("\nDone. Inspect:", finalUrl);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
