import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync, writeFileSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import { logger } from "../utils/logger";
import { config } from "../config";
import type { TransitionType } from "./transition-planner";

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
    let width = options?.width;
    let height = options?.height;
    const fps = options?.fps || 24;

    // If width/height not explicitly requested, detect native Kling 3.0 resolution
    if (!width || !height) {
        const { stdout } = await execFileAsync("ffprobe", [
            "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0",
            inputPath
        ]);
        const [origW, origH] = stdout.trim().split("x").map(Number);
        if (origW && origH) {
            width = origW;
            height = origH;
            logger.debug({ msg: "Detected native Kling 3.0 resolution", width, height });
        } else {
            width = 1920;
            height = 1080;
        }
    }

    // Ensure dimensions are even (libx264 requirement)
    const evenW = Math.ceil(width / 2) * 2;
    const evenH = Math.ceil(height / 2) * 2;

    await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-vf", `scale=${evenW}:${evenH}:force_original_aspect_ratio=increase,crop=${evenW}:${evenH},format=yuv420p`,
        "-r", String(fps),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-profile:v", "high",
        "-level", "4.0",
        "-an",
        "-movflags", "+faststart",
        "-y",
        outputPath,
    ], { timeout: 120000 });

    logger.debug({ msg: "Clip normalized", input: inputPath, output: outputPath, width: evenW, height: evenH });
}

// ─── STITCH CLIPS WITH CONCAT (SEAMLESS, NO TRANSITIONS) ───
// Uses concat demuxer. When boundaryFramePaths provided: insert extracted last-frame as 1-frame segment
// at each boundary so clip N+1 starts with the EXACT same frame clip N ended on (Kling may alter first frame).
export async function stitchClipsConcat(
    clipPaths: string[],
    outputPath: string,
    options?: { boundaryFramePaths?: string[] }
): Promise<{ duration: number }> {
    if (clipPaths.length === 0) throw new Error("No clips to stitch");

    if (clipPaths.length === 1) {
        await execFileAsync("ffmpeg", [
            "-i", clipPaths[0], "-c", "copy", "-y", outputPath,
        ]);
        const duration = await getVideoDuration(outputPath);
        return { duration };
    }

    const boundaryFrames = options?.boundaryFramePaths;
    const useBoundaryFrames = boundaryFrames && boundaryFrames.length >= clipPaths.length - 1;

    if (useBoundaryFrames) {
        // Build: clip0 + frame0 + clip1_trim1 + frame1 + clip2_trim1 + ... for perfect continuity.
        const { join } = await import("path");
        const { writeFileSync, unlinkSync } = await import("fs");
        const outDir = join(outputPath, "..");
        const segments: string[] = [clipPaths[0]];
        const fps = 24;
        const width = config.video.outputWidth;
        const height = config.video.outputHeight;
        for (let i = 1; i < clipPaths.length; i++) {
            const framePath = resolve(boundaryFrames![i - 1]);
            const oneFrameVideo = join(outDir, `_boundary_${i}.mp4`);
            await execFileAsync("ffmpeg", [
                "-y", "-loop", "1", "-i", framePath,
                "-t", String(1 / fps), "-r", String(fps),
                "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p`,
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                "-profile:v", "high", "-level", "4.0",
                "-an",
                oneFrameVideo,
            ], { timeout: 30000 });
            segments.push(oneFrameVideo);
            const trimmed = join(outDir, `_clip${i}_trim.mp4`);
            await execFileAsync("ffmpeg", [
                "-y", "-i", clipPaths[i],
                "-vf", `select=gte(n\\,1),setpts=PTS-STARTPTS,format=yuv420p`, "-r", String(fps),
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                "-profile:v", "high", "-level", "4.0",
                "-an", trimmed,
            ], { timeout: 120000 });
            segments.push(trimmed);
        }
        const listPath = outputPath.replace(/\.(mp4|mkv)$/i, "_list.txt");
        const listContent = segments.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
        writeFileSync(listPath, listContent);
        await execFileAsync("ffmpeg", [
            "-y", "-f", "concat", "-safe", "0", "-i", listPath,
            "-c", "copy", "-movflags", "+faststart", outputPath,
        ], { timeout: 300000 });
        try {
            for (let i = 1; i < clipPaths.length; i++) {
                try { unlinkSync(join(outDir, `_boundary_${i}.mp4`)); } catch (_) { }
                try { unlinkSync(join(outDir, `_clip${i}_trim.mp4`)); } catch (_) { }
            }
        } catch (_) { }
        try { unlinkSync(listPath); } catch (_) { }
    } else {
        const listPath = outputPath.replace(/\.(mp4|mkv)$/i, "_list.txt");
        const listContent = clipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
        const { writeFileSync, unlinkSync } = await import("fs");
        writeFileSync(listPath, listContent);
        await execFileAsync("ffmpeg", [
            "-y", "-f", "concat", "-safe", "0", "-i", listPath,
            "-c", "copy", "-movflags", "+faststart", outputPath,
        ], { timeout: 300000 });
        try { unlinkSync(listPath); } catch (_) { }
    }

    const duration = await getVideoDuration(outputPath);
    logger.info({ msg: "Stitch concat complete", count: clipPaths.length, duration: `${duration.toFixed(1)}s` });
    return { duration };
}

// ─── STITCH CLIPS WITH XFADE (DISSOLVE CROSSFADE) ───
/** Stitch clips with smooth crossfade transitions. dissolve/fade hides seams between clips. */
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
        "-crf", "16",  // CRF 16 for dissolve xfade — higher quality since re-encoding is unavoidable
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

// ─── STITCH CLIPS MIXED (SEAMLESS + DISSOLVE PER BOUNDARY) ───
/**
 * Mixed stitching: groups consecutive clips that share 'seamless' transitions,
 * concats each group with stitchClipsConcat, then joins groups with dissolve xfade.
 *
 * This gives walkthrough continuity within adjacent rooms while using dissolve
 * only where needed (floor changes, distant rooms).
 *
 * @param clipPaths - Ordered normalized clip file paths
 * @param outputPath - Output master video path
 * @param transitionMap - Per-boundary transition type ('seamless' | 'dissolve')
 * @param boundaryFramePaths - Optional boundary frame images for seamless concat
 * @returns Duration of final stitched video
 */
export async function stitchClipsMixed(
    clipPaths: string[],
    outputPath: string,
    transitionMap: TransitionType[],
    boundaryFramePaths?: string[]
): Promise<{ duration: number }> {
    if (clipPaths.length === 0) throw new Error("No clips to stitch");
    if (clipPaths.length === 1) {
        await execFileAsync("ffmpeg", ["-i", clipPaths[0], "-c", "copy", "-y", outputPath]);
        return { duration: await getVideoDuration(outputPath) };
    }
    if (transitionMap.length !== clipPaths.length - 1) {
        throw new Error(`Transition map length (${transitionMap.length}) must equal clips-1 (${clipPaths.length - 1})`);
    }

    // Check if all same type — use optimized single-pass
    const allSeamless = transitionMap.every((t) => t === "seamless");
    const allDissolve = transitionMap.every((t) => t === "dissolve");

    if (allSeamless) {
        logger.info({ msg: "All transitions seamless — using pure concat" });
        return stitchClipsConcat(clipPaths, outputPath, {
            boundaryFramePaths: boundaryFramePaths,
        });
    }
    if (allDissolve) {
        logger.info({ msg: "All transitions dissolve — using pure xfade" });
        return stitchClips(clipPaths, outputPath, "dissolve", 0.3);
    }

    // Mixed mode: group consecutive seamless clips into segments
    logger.info({
        msg: "Mixed stitching",
        transitions: transitionMap.join(","),
        clipCount: clipPaths.length,
    });

    const outDir = join(outputPath, "..");
    const segments: string[] = [];
    let groupStart = 0;

    for (let i = 0; i <= transitionMap.length; i++) {
        // End of clips OR hit a dissolve boundary → close current group
        const isEnd = i === transitionMap.length;
        const isDissolve = !isEnd && transitionMap[i] === "dissolve";

        if (isEnd || isDissolve) {
            const groupEnd = i; // inclusive
            const groupClips = clipPaths.slice(groupStart, groupEnd + 1);

            if (groupClips.length === 1) {
                // Single clip segment — no stitching needed
                segments.push(groupClips[0]);
            } else {
                // Multiple clips in seamless group — concat them
                const segPath = join(outDir, `_segment_${segments.length}.mp4`);
                // Extract boundary frames for this group
                const groupBoundaryFrames = boundaryFramePaths
                    ? boundaryFramePaths.slice(groupStart, groupEnd)
                    : undefined;

                await stitchClipsConcat(groupClips, segPath, {
                    boundaryFramePaths: groupBoundaryFrames,
                });
                segments.push(segPath);
            }

            if (isDissolve) {
                groupStart = i + 1; // Next group starts after the dissolve boundary
            }
        }
    }

    // Now stitch segments together with dissolve transitions
    let result: { duration: number };
    if (segments.length === 1) {
        await execFileAsync("ffmpeg", ["-i", segments[0], "-c", "copy", "-y", outputPath]);
        result = { duration: await getVideoDuration(outputPath) };
    } else {
        result = await stitchClips(segments, outputPath, "dissolve", 0.3);
    }

    // Clean up temporary segment files
    for (const seg of segments) {
        if (seg.includes("_segment_")) {
            try { unlinkSync(seg); } catch (_) { }
        }
    }

    logger.info({
        msg: "Mixed stitch complete",
        segmentCount: segments.length,
        duration: `${result.duration.toFixed(1)}s`,
    });

    return result;
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

// ─── ADD TEXT OVERLAYS ───
/**
 * Marketing-layer text overlays aligned to music beats.
 * Uses FFmpeg drawtext dynamically based on provided specs.
 */
export interface TextOverlaySpec {
    text: string;
    startSeconds: number;
    durationSeconds: number;
    position?: "top" | "center" | "bottom";
    fontSize?: "small" | "medium" | "large" | "xlarge";
    fadeInSeconds?: number;
    fadeOutSeconds?: number;
}

export async function addTextOverlays(
    inputPath: string,
    outputPath: string,
    overlays: TextOverlaySpec[] = []
): Promise<void> {
    if (overlays.length === 0) {
        const { copyFileSync } = await import("fs");
        copyFileSync(inputPath, outputPath);
        logger.debug({ msg: "Text overlays skip (no overlays provided)", input: inputPath });
        return;
    }

    // System font detection (Ubuntu/Debian). Falls back to FFmpeg default.
    const fontCandidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ];
    const fontFile = fontCandidates.find((f) => existsSync(f));

    const FONT_SIZES: Record<string, string> = {
        small: "(h/30)",
        medium: "(h/22)",
        large: "(h/16)",
        xlarge: "(h/12)",
    };

    // Build drawtext filter chain
    const drawtextFilters = overlays.map((overlay) => {
        const start = overlay.startSeconds;
        const end = start + overlay.durationSeconds;
        const fadeIn = overlay.fadeInSeconds ?? 0.5;
        const fadeOut = overlay.fadeOutSeconds ?? 0.5;

        const sanitizedText = overlay.text
            .replace(/'/g, "\\\\\\'")
            .replace(/:/g, "\\:")
            .replace(/,/g, "\\,");

        const fontSize = FONT_SIZES[overlay.fontSize ?? "medium"] || FONT_SIZES.medium;

        let yPos = "(h-text_h)/2";
        if (overlay.position === "bottom") yPos = "h-(h/8)-text_h";
        if (overlay.position === "top") yPos = "h/8";

        const fontParam = fontFile ? `:fontfile='${fontFile}'` : "";

        // Alpha expression for smooth fade in/out
        let alphaExpr = "";
        if (fadeIn > 0 || fadeOut > 0) {
            const fi = Math.max(fadeIn, 0.001);
            const fo = Math.max(fadeOut, 0.001);
            alphaExpr = `:alpha='if(lt(t-${start}\\,${fi})\\,(t-${start})/${fi}\\,if(gt(t-(${end}-${fo})\\,0)\\,(${end}-t)/${fo}\\,1))'`;
        }

        return `drawtext=text='${sanitizedText}'${fontParam}:fontcolor=white:fontsize=${fontSize}:box=1:boxcolor=black@0.5:boxborderw=18:x=(w-text_w)/2:y=${yPos}:enable='between(t\\,${start}\\,${end})'${alphaExpr}`;
    }).join(",");

    try {
        await execFileAsync("ffmpeg", [
            "-i", inputPath,
            "-vf", drawtextFilters,
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "18",
            "-c:a", "copy",
            "-movflags", "+faststart",
            "-y",
            outputPath,
        ], { timeout: 180000 });
        logger.info({ msg: "Applied text overlays", count: overlays.length, output: outputPath });
    } catch (err: any) {
        // NO SILENT DOWNGRADES: text overlays (address, price, room labels, CTA) are essential
        // for property marketing videos. Skipping them degrades the product.
        throw new Error(`Text overlay failed: ${err.message?.slice(0, 200)}. Cannot deliver video without marketing text.`);
    }
}

// ─── GENERATE FORMAT VARIANTS ───
// Applies text overlays AFTER cropping so text is never cut off at edges.
export async function generateVariants(
    masterPath: string,
    outputDir: string,
    overlaySpecs: TextOverlaySpec[] = []
): Promise<{ vertical: string; square: string; portrait: string; thumbnail: string }> {
    const vertical = join(outputDir, "vertical.mp4");
    const square = join(outputDir, "square.mp4");
    const portrait = join(outputDir, "portrait.mp4");
    const thumbnail = join(outputDir, "thumb.jpg");

    // Build overlay filter string for appending after crop+scale
    const buildOverlayFilter = (overlays: TextOverlaySpec[]): string => {
        if (overlays.length === 0) return "";

        const fontCandidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        ];
        const fontFile = fontCandidates.find((f) => existsSync(f));
        const fontParam = fontFile ? `:fontfile='${fontFile}'` : "";

        const FONT_SIZES: Record<string, string> = {
            small: "(h/30)", medium: "(h/22)", large: "(h/16)", xlarge: "(h/12)",
        };

        const filters = overlays.map((o) => {
            const start = o.startSeconds;
            const end = start + o.durationSeconds;
            const fadeIn = o.fadeInSeconds ?? 0.5;
            const fadeOut = o.fadeOutSeconds ?? 0.5;
            const sanitizedText = o.text.replace(/'/g, "\\\\\\'").replace(/:/g, "\\:").replace(/,/g, "\\,");
            const fontSize = FONT_SIZES[o.fontSize ?? "medium"] || FONT_SIZES.medium;
            let yPos = "(h-text_h)/2";
            if (o.position === "bottom") yPos = "h-(h/8)-text_h";
            if (o.position === "top") yPos = "h/8";
            const fi = Math.max(fadeIn, 0.001);
            const fo = Math.max(fadeOut, 0.001);
            const alphaExpr = `:alpha='if(lt(t-${start}\\,${fi})\\,(t-${start})/${fi}\\,if(gt(t-(${end}-${fo})\\,0)\\,(${end}-t)/${fo}\\,1))'`;
            return `drawtext=text='${sanitizedText}'${fontParam}:fontcolor=white:fontsize=${fontSize}:box=1:boxcolor=black@0.5:boxborderw=18:x=(w-text_w)/2:y=${yPos}:enable='between(t\\,${start}\\,${end})'${alphaExpr}`;
        });
        return "," + filters.join(",");
    };

    const overlayFilter = buildOverlayFilter(overlaySpecs);

    // Use -threads 2 and -preset veryfast to prevent OOM on low-memory VPS (5.8G RAM)
    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", `crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920${overlayFilter}`,
        "-c:v", "libx264", "-crf", "22", "-preset", "veryfast", "-threads", "2", "-c:a", "copy",
        "-movflags", "+faststart", "-y", vertical,
    ], { timeout: 300000 });

    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", `crop=ih:ih:(iw-ih)/2:0,scale=1080:1080${overlayFilter}`,
        "-c:v", "libx264", "-crf", "22", "-preset", "veryfast", "-threads", "2", "-c:a", "copy",
        "-movflags", "+faststart", "-y", square,
    ], { timeout: 300000 });

    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", `crop=ih*4/5:ih:(iw-ih*4/5)/2:0,scale=1080:1350${overlayFilter}`,
        "-c:v", "libx264", "-crf", "22", "-preset", "veryfast", "-threads", "2", "-c:a", "copy",
        "-movflags", "+faststart", "-y", portrait,
    ], { timeout: 300000 });

    await execFileAsync("ffmpeg", [
        "-i", masterPath,
        "-vf", "select=eq(n\\,0)",
        "-frames:v", "1",
        "-q:v", "2",
        "-y", thumbnail,
    ], { timeout: 30000 });

    logger.info({ msg: "All format variants generated", withOverlays: overlaySpecs.length > 0 });

    return { vertical, square, portrait, thumbnail };
}

// ─── HSV POOL DETECTION HEURISTIC ───
/**
 * Detect pool photos without AI using color analysis.
 * Crops the bottom half of the image (where water appears), averages to 1x1 pixel,
 * and checks if blue/cyan dominates. Returns true if likely a pool photo.
 * Cost: zero (FFmpeg only). Latency: <1s.
 */
export async function detectPoolHeuristic(imagePath: string): Promise<boolean> {
    try {
        const tmpPixel = imagePath + "_pool_check.raw";
        await execFileAsync("ffmpeg", [
            "-y", "-i", imagePath,
            "-vf", "crop=iw:ih/2:0:ih/2,scale=1:1:flags=area",
            "-frames:v", "1",
            "-f", "rawvideo", "-pix_fmt", "rgb24",
            tmpPixel,
        ], { timeout: 10000 });

        const { readFileSync, unlinkSync } = await import("fs");
        const buf = readFileSync(tmpPixel);
        try { unlinkSync(tmpPixel); } catch { }

        if (buf.length < 3) return false;

        const r = buf[0], g = buf[1], b = buf[2];
        // Pool detection: blue/cyan dominant in bottom half
        // Typical pool: R=80-140, G=140-200, B=200-255 (cyan/turquoise)
        const isBlue = b > r + 30 && b > g && b > 120;
        const isCyan = g > r + 20 && b > r + 20 && g > 120 && b > 120;

        logger.debug({ msg: "Pool heuristic check", r, g, b, isBlue, isCyan });
        return isBlue || isCyan;
    } catch {
        return false; // If detection fails, assume not pool (safe default)
    }
}

// ─── EXTRACT LAST FRAME ───
export async function extractLastFrame(
    videoPath: string,
    outputPath: string
): Promise<void> {
    // Try frame-count first; fallback to duration-based when nb_read_frames is N/A (VFR, etc.)
    const { stdout } = await execFileAsync("ffprobe", [
        "-v", "quiet",
        "-count_frames",
        "-select_streams", "v:0",
        "-show_entries", "stream=nb_read_frames,r_frame_rate",
        "-show_entries", "format=duration",
        "-print_format", "json",
        videoPath,
    ]);
    const data = JSON.parse(stdout);
    const stream = data.streams?.[0];
    const nbFrames = stream?.nb_read_frames != null ? parseInt(String(stream.nb_read_frames), 10) : NaN;
    let lastFrameIdx = Number.isFinite(nbFrames) ? nbFrames - 1 : -1;

    if (lastFrameIdx < 0) {
        const duration = parseFloat(data.format?.duration ?? "0");
        const fpsMatch = (stream?.r_frame_rate ?? "24/1").split("/");
        const fps = fpsMatch.length === 2
            ? parseFloat(fpsMatch[0]) / parseFloat(fpsMatch[1])
            : 24;
        lastFrameIdx = Math.max(0, Math.floor(duration * fps) - 1);
    }

    await execFileAsync("ffmpeg", [
        "-i", videoPath,
        "-vf", `select=eq(n\\,${lastFrameIdx})`,
        "-frames:v", "1",
        "-q:v", "1",
        "-y", outputPath,
    ], { timeout: 30000 });

    logger.debug({ msg: "Last frame extracted", frame: lastFrameIdx, output: outputPath });
}
