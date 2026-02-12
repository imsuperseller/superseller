import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { join } from "path";
import { logger } from "../utils/logger";
import { config } from "../config";

const execFileAsync = promisify(execFile);

// ─── GET VIDEO DURATION ───
export async function getVideoDuration(filePath: string): Promise<number> {
    const { stdout } = await execFileAsync("ffprobe", [
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        filePath,
    ]);
    const data = JSON.parse(stdout);
    return parseFloat(data.format.duration);
}

// ─── NORMALIZE CLIP ───
export async function normalizeClip(
    inputPath: string,
    outputPath: string,
    options?: { width?: number; height?: number; fps?: number }
): Promise<void> {
    const width = options?.width || 1920;
    const height = options?.height || 1080;
    const fps = options?.fps || 24;

    await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
        "-r", String(fps),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-an",
        "-movflags", "+faststart",
        "-y",
        outputPath,
    ], { timeout: 120000 });

    logger.debug({ msg: "Clip normalized", input: inputPath, output: outputPath });
}

// ─── STITCH CLIPS WITH CONCAT (SEAMLESS, NO TRANSITIONS) ───
// Uses concat demuxer: zero-loss hard cuts. Use when clips are generated with
// first+last frame matching (Chain Invariant). No visible xfade between scenes.
export async function stitchClipsConcat(clipPaths: string[], outputPath: string): Promise<{ duration: number }> {
    if (clipPaths.length === 0) throw new Error("No clips to stitch");

    if (clipPaths.length === 1) {
        await execFileAsync("ffmpeg", [
            "-i", clipPaths[0], "-c", "copy", "-y", outputPath,
        ]);
        const duration = await getVideoDuration(outputPath);
        return { duration };
    }

    const listPath = outputPath.replace(/\.(mp4|mkv)$/i, "_list.txt");
    const listContent = clipPaths.map((p) => `file '${p}'`).join("\n");
    const { writeFileSync } = await import("fs");
    writeFileSync(listPath, listContent);

    await execFileAsync("ffmpeg", [
        "-y", "-f", "concat", "-safe", "0", "-i", listPath,
        "-c", "copy",
        "-movflags", "+faststart",
        outputPath,
    ], { timeout: 300000 });

    const { unlinkSync } = await import("fs");
    try { unlinkSync(listPath); } catch (_) {}

    const duration = await getVideoDuration(outputPath);
    logger.info({ msg: "Stitch concat complete", count: clipPaths.length, duration: `${duration.toFixed(1)}s` });
    return { duration };
}

// ─── STITCH CLIPS WITH XFADE (LEGACY - VISIBLE TRANSITIONS) ───
/** @deprecated Use stitchClipsConcat for seamless walkthrough. */
export async function stitchClips(
    clipPaths: string[],
    outputPath: string,
    transition: string = "fade",
    xfadeDuration: number = 0.5
): Promise<{ duration: number }> {
    if (clipPaths.length === 0) throw new Error("No clips to stitch");

    if (clipPaths.length === 1) {
        await execFileAsync("ffmpeg", [
            "-i", clipPaths[0], "-c", "copy", "-y", outputPath,
        ]);
        const duration = await getVideoDuration(outputPath);
        return { duration };
    }

    const durations: number[] = [];
    for (const clip of clipPaths) {
        durations.push(await getVideoDuration(clip));
    }

    const inputs: string[] = [];
    for (const clip of clipPaths) {
        inputs.push("-i", clip);
    }

    const filterParts: string[] = [];
    const n = clipPaths.length;

    let offset = durations[0] - xfadeDuration;
    filterParts.push(
        `[0:v][1:v]xfade=transition=${transition}:duration=${xfadeDuration}:offset=${offset}[v1]`
    );

    let cumulative = durations[0] + durations[1] - xfadeDuration;

    for (let i = 2; i < n; i++) {
        const prevLabel = `v${i - 1}`;
        const currLabel = `v${i}`;
        offset = cumulative - xfadeDuration;
        filterParts.push(
            `[${prevLabel}][${i}:v]xfade=transition=${transition}:duration=${xfadeDuration}:offset=${offset}[${currLabel}]`
        );
        cumulative += durations[i] - xfadeDuration;
    }

    const finalLabel = `v${n - 1}`;
    const filterComplex = filterParts.join(";");

    const args = [
        ...inputs,
        "-filter_complex", filterComplex,
        "-map", `[${finalLabel}]`,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-movflags", "+faststart",
        "-y",
        outputPath,
    ];

    logger.info({ msg: "Stitching clips", count: n, transition });
    await execFileAsync("ffmpeg", args, { timeout: 300000 });
    const duration = await getVideoDuration(outputPath);
    logger.info({ msg: "Stitch complete", duration: `${duration.toFixed(1)}s` });

    return { duration };
}

// ─── ADD MUSIC OVERLAY ───
export async function addMusicOverlay(
    videoPath: string,
    musicPath: string,
    outputPath: string,
    options?: { volume?: number; fadeInSec?: number; fadeOutSec?: number }
): Promise<void> {
    const volume = options?.volume ?? 0.3;
    const fadeIn = options?.fadeInSec ?? 2;
    const fadeOut = options?.fadeOutSec ?? 3;

    const videoDuration = await getVideoDuration(videoPath);
    const fadeOutStart = Math.max(0, videoDuration - fadeOut);

    await execFileAsync("ffmpeg", [
        "-i", videoPath,
        "-i", musicPath,
        "-filter_complex",
        `[1:a]volume=${volume},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}[music]`,
        "-map", "0:v",
        "-map", "[music]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        "-y",
        outputPath,
    ], { timeout: 120000 });

    logger.info({ msg: "Music overlay complete", output: outputPath });
}

// ─── ADD TEXT OVERLAYS (STUB) ───
/**
 * Placeholder for AI-generated text overlays (room labels, hero moments, property details).
 * Per NotebookLM: overlays should align to music beats for rhythm-based editing.
 * Currently a no-op pass-through — implement with drawtext filter or Remotion when ready.
 * @see https://notebooklm.google.com/notebook/0baf5f36-7ff0-4550-a878-923dbf59de5c
 */
export interface TextOverlaySpec {
    text: string;
    startSeconds: number;
    durationSeconds: number;
    position?: "top" | "center" | "bottom";
}

export async function addTextOverlays(
    inputPath: string,
    outputPath: string,
    _overlays: TextOverlaySpec[] = []
): Promise<void> {
    // STUB: No overlays implemented yet. Pass-through copy.
    if (_overlays.length === 0) {
        const { copyFileSync } = await import("fs");
        copyFileSync(inputPath, outputPath);
        logger.debug({ msg: "Text overlays stub: pass-through (no overlays)", input: inputPath });
        return;
    }
    // TODO: Implement with ffmpeg drawtext or Remotion. Align to music beats.
    const { copyFileSync } = await import("fs");
    copyFileSync(inputPath, outputPath);
    logger.debug({ msg: "Text overlays stub: pass-through (overlays not yet implemented)", count: _overlays.length });
}

// ─── GENERATE FORMAT VARIANTS ───
export async function generateVariants(
    masterPath: string,
    outputDir: string
): Promise<{ vertical: string; square: string; portrait: string; thumbnail: string }> {
    const vertical = join(outputDir, "vertical.mp4");
    const square = join(outputDir, "square.mp4");
    const portrait = join(outputDir, "portrait.mp4");
    const thumbnail = join(outputDir, "thumb.jpg");

    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920",
        "-c:v", "libx264", "-crf", "20", "-c:a", "copy",
        "-movflags", "+faststart", "-y", vertical,
    ], { timeout: 120000 });

    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", "crop=ih:ih:(iw-ih)/2:0,scale=1080:1080",
        "-c:v", "libx264", "-crf", "20", "-c:a", "copy",
        "-movflags", "+faststart", "-y", square,
    ], { timeout: 120000 });

    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", "crop=ih*4/5:ih:(iw-ih*4/5)/2:0,scale=1080:1350",
        "-c:v", "libx264", "-crf", "20", "-c:a", "copy",
        "-movflags", "+faststart", "-y", portrait,
    ], { timeout: 120000 });

    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", "select=eq(n\\,0)",
        "-frames:v", "1",
        "-q:v", "2",
        "-y", thumbnail,
    ], { timeout: 30000 });

    logger.info({ msg: "All format variants generated" });

    return { vertical, square, portrait, thumbnail };
}

// ─── EXTRACT LAST FRAME ───
export async function extractLastFrame(
    videoPath: string,
    outputPath: string
): Promise<void> {
    const { stdout } = await execFileAsync("ffprobe", [
        "-v", "quiet",
        "-count_frames",
        "-select_streams", "v:0",
        "-show_entries", "stream=nb_read_frames",
        "-print_format", "json",
        videoPath,
    ]);
    const data = JSON.parse(stdout);
    const totalFrames = parseInt(data.streams[0].nb_read_frames) - 1;

    await execFileAsync("ffmpeg", [
        "-i", videoPath,
        "-vf", `select=eq(n\\,${totalFrames})`,
        "-frames:v", "1",
        "-q:v", "1",
        "-y", outputPath,
    ], { timeout: 30000 });

    logger.debug({ msg: "Last frame extracted", frame: totalFrames, output: outputPath });
}
