/**
 * Selective Clip Regeneration — Only regenerate bad clips, keep good ones, re-stitch.
 *
 * Mechanism (research-backed):
 * - Use SAME start_frame_url and end_frame_url for each regen clip → Kling interpolates
 *   → preserves continuity with adjacent clips
 * - Download good clips from R2, regen clips from Kling output
 * - stitchClipsConcat merges in order with boundary frames → seamless result
 */
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { query, queryOne } from "../db/client";
import { config } from "../config";
import {
    stitchClipsConcat,
    addMusicOverlay,
    addTextOverlays,
    generateVariants,
    extractLastFrame,
    getVideoDuration,
    normalizeClip,
} from "./ffmpeg";
import { uploadToR2, buildR2Key } from "./r2";
import { createKlingTask, waitForTask } from "./kie";
import { CreditManager } from "./credits";

async function download(url: string, dest: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

export async function runRegenClips(
    jobId: string,
    clipNumbersToRegen: number[]
): Promise<{ masterUrl: string; duration: number }> {
    const workDir = join(config.temp?.dir ?? "/tmp/tourreel-jobs", `regen-${jobId}`);
    if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true });

    const job = await queryOne<any>("SELECT * FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) throw new Error("Job not found");
    const { user_id: userId, listing_id: listingId } = job;

    const clips = await query<any>(
        "SELECT * FROM clips WHERE video_job_id = $1 AND status = 'complete' ORDER BY clip_number",
        [jobId]
    );
    if (clips.length === 0) throw new Error("No completed clips for job");

    const listing = await queryOne<any>("SELECT * FROM listings WHERE id = $1", [listingId]);
    if (!listing) throw new Error("Listing not found");

    const regenSet = new Set(clipNumbersToRegen);
    const includeRealtor = clips.some(
        (c: any) =>
            (c.start_frame_url && String(c.start_frame_url).includes("realtor")) ||
            (c.end_frame_url && String(c.end_frame_url).includes("realtor"))
    );

    // 1. Regenerate specified clips
    for (const clip of clips) {
        if (!regenSet.has(clip.clip_number)) continue;
        const startFrame = clip.start_frame_url;
        const endFrame = clip.end_frame_url;
        if (!startFrame) throw new Error(`Clip ${clip.clip_number}: missing start_frame_url`);

        const { buildRealtorOnlyKlingPrompt } = await import("./kie");
        const klingPrompt = includeRealtor ? buildRealtorOnlyKlingPrompt(clip) : clip.prompt;

        const taskId = await createKlingTask({
            prompt: klingPrompt,
            image_url: startFrame,
            ...(includeRealtor && endFrame ? { last_frame: endFrame } : {}),
            realtor_in_frame: includeRealtor,
            negative_prompt: (clip as any).negative_prompt,
            mode: "pro",
            aspect_ratio: "16:9",
            model: "kling-3.0/video",
        });
        await CreditManager.deductCredits(userId, 10, "kling_video_regen", jobId, {
            taskId,
            clipIdx: clip.clip_number,
        });

        const status = await waitForTask(taskId, "kling");
        if (!status.result?.video_url) {
            throw new Error(`Kling regen failed for clip ${clip.clip_number}: ${status.error || "no video"}`);
        }

        const videoPath = join(workDir, `clip_${clip.clip_number}.mp4`);
        await download(status.result.video_url, videoPath);

        const lastFramePath = join(workDir, `clip_${clip.clip_number}_last.jpg`);
        await extractLastFrame(videoPath, lastFramePath);

        const lastFrameUrl = await uploadToR2(
            lastFramePath,
            buildR2Key(userId, jobId, `frames/clip_${clip.clip_number}_end.jpg`)
        );
        const normalizedPath = join(workDir, `clip_${clip.clip_number}_norm.mp4`);
        await normalizeClip(videoPath, normalizedPath, {
            width: config.video.outputWidth,
            height: config.video.outputHeight,
        });

        await query("UPDATE clips SET status = 'complete', video_url = $1, end_frame_url = $2 WHERE id = $3", [
            status.result.video_url,
            lastFrameUrl,
            clip.id,
        ]);
    }

    // 2. Download all clips, build boundary paths
    const clipPaths: string[] = [];
    const boundaryFramePaths: string[] = [];
    for (const clip of clips) {
        const normPath = join(workDir, `clip_${clip.clip_number}_norm.mp4`);
        if (regenSet.has(clip.clip_number)) {
            clipPaths.push(normPath);
        } else {
            const dest = join(workDir, `clip_${clip.clip_number}.mp4`);
            await download(clip.video_url, dest);
            await normalizeClip(dest, normPath, {
                width: config.video.outputWidth,
                height: config.video.outputHeight,
            });
            clipPaths.push(normPath);
        }

        if (clips.indexOf(clip) < clips.length - 1) {
            const boundaryPath = join(workDir, `clip_${clip.clip_number}_last.jpg`);
            if (regenSet.has(clip.clip_number)) {
                if (!existsSync(boundaryPath)) await extractLastFrame(clipPaths[clipPaths.length - 1], boundaryPath);
            } else {
                await download(clip.end_frame_url, boundaryPath);
            }
            boundaryFramePaths.push(boundaryPath);
        }
    }

    // 3. Stitch
    const masterSilentPath = join(workDir, "master_silent.mp4");
    await stitchClipsConcat(clipPaths, masterSilentPath, {
        boundaryFramePaths: boundaryFramePaths.length >= clipPaths.length - 1 ? boundaryFramePaths : undefined,
    });

    // 4. Music
    let musicUrl: string | null = null;
    if (listing.music_track_id) {
        const track = await queryOne("SELECT r2_url FROM music_tracks WHERE id = $1", [listing.music_track_id]);
        if (track) musicUrl = (track as any).r2_url;
    }
    if (!musicUrl) {
        const bestTrack = await queryOne("SELECT r2_url FROM music_tracks WHERE is_active = true ORDER BY play_count ASC LIMIT 1", []);
        if (bestTrack) musicUrl = (bestTrack as any).r2_url;
    }
    if (!musicUrl) musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

    const musicPath = join(workDir, "music.mp3");
    await download(musicUrl, musicPath);
    const masterPath = join(workDir, "master.mp4");
    await addMusicOverlay(masterSilentPath, musicPath, masterPath);

    // 5. Overlays (stub)
    const masterWithOverlaysPath = join(workDir, "master_with_overlays.mp4");
    let cumSec = 0;
    const overlaySpecs = clips.map((c: any) => {
        const start = cumSec;
        const dur = c.duration_seconds || 5;
        cumSec += dur;
        return { text: c.to_room || "Room", startSeconds: start, durationSeconds: 2, position: "bottom" as const };
    });
    await addTextOverlays(masterPath, masterWithOverlaysPath, overlaySpecs);
    const masterForExport = overlaySpecs.length > 0 ? masterWithOverlaysPath : masterPath;

    // 6. Variants & upload
    const variants = await generateVariants(masterForExport, workDir);
    const finalMasterUrl = await uploadToR2(masterForExport, buildR2Key(userId, jobId, "master.mp4"));
    const verticalUrl = await uploadToR2(variants.vertical, buildR2Key(userId, jobId, "vertical.mp4"));
    const thumbUrl = await uploadToR2(variants.thumbnail, buildR2Key(userId, jobId, "thumb.jpg"));
    const duration = await getVideoDuration(masterForExport);

    await query(
        `UPDATE video_jobs SET status = 'complete', progress_percent = 100, master_video_url = $1, vertical_video_url = $2, thumbnail_url = $3, video_duration_seconds = $4, completed_at = NOW() WHERE id = $5`,
        [finalMasterUrl, verticalUrl, thumbUrl, duration, jobId]
    );

    return { masterUrl: finalMasterUrl, duration };
}
