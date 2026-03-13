/**
 * Deanna Pitch Video — Sora 2 Pro 1080p via Kie.ai
 *
 * Generates 5 scenes of @shai-lfc in different "worlds" for Deanna's pitch.
 * Uses Sora 2 Pro text-to-video with character cameo reference.
 *
 * Cost: 5 × 10s × $0.10/s (1080p) = ~$5.00
 * Run: cd apps/worker && npx tsx src/scripts/deanna-pitch-video.ts
 */
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = '/tmp/deanna-pitch-video';
const R2 = "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";

// ─── Kie.ai direct (no worker imports needed for standalone script) ───
const KIE_BASE = process.env.KIE_API_BASE_URL || "https://api.kie.ai/api";
const KIE_KEY = process.env.KIE_API_KEY;

if (!KIE_KEY) {
    console.error("Missing KIE_API_KEY env var");
    process.exit(1);
}

const headers = {
    "Authorization": `Bearer ${KIE_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
};

async function createSoraTask(prompt: string, opts: {
    aspect_ratio?: "portrait" | "landscape";
    n_frames?: "10" | "15";
    size?: "standard" | "high";
    remove_watermark?: boolean;
}): Promise<string> {
    const body = {
        model: "sora-2-pro-text-to-video",
        input: {
            prompt,
            aspect_ratio: opts.aspect_ratio || "landscape",
            n_frames: opts.n_frames || "10",
            size: opts.size || "high",
            remove_watermark: opts.remove_watermark ?? true,
        },
    };

    console.log(`  Creating Sora task: ${prompt.slice(0, 80)}...`);

    const response = await fetch(`${KIE_BASE}/v1/jobs/createTask`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Sora task failed (${response.status}): ${errText}`);
    }

    const data = await response.json() as any;
    if (data.code !== 200 && data.code !== 0) {
        throw new Error(`Sora API error (code ${data.code}): ${data.msg}`);
    }

    return data.data.taskId;
}

async function waitForSoraTask(taskId: string, label: string): Promise<string> {
    const maxWait = 10 * 60 * 1000; // 10 min
    const pollInterval = 15_000; // 15s
    const start = Date.now();

    while (Date.now() - start < maxWait) {
        const response = await fetch(`${KIE_BASE}/v1/jobs/recordInfo?taskId=${taskId}`, {
            headers,
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            console.log(`  [${label}] Poll error (${response.status}), retrying...`);
            await new Promise(r => setTimeout(r, pollInterval));
            continue;
        }

        const data = await response.json() as any;
        const sd = data.data;

        if (!sd) {
            console.log(`  [${label}] Pending...`);
            await new Promise(r => setTimeout(r, pollInterval));
            continue;
        }

        const state = (sd.state || sd.status || "").toUpperCase();

        if (sd.successFlag === 1 || state === "SUCCESS" || state === "COMPLETED") {
            // Extract video URL
            const res = sd.response || sd.resultJson;
            let videoUrl: string | undefined;

            if (sd.resultUrls) {
                const urls = typeof sd.resultUrls === 'string' ? JSON.parse(sd.resultUrls) : sd.resultUrls;
                videoUrl = Array.isArray(urls) ? urls[0] : urls;
                if (typeof videoUrl === 'object') videoUrl = (videoUrl as any).url || (videoUrl as any).videoUrl;
            }

            if (!videoUrl && res) {
                const parsed = typeof res === 'string' ? JSON.parse(res) : res;
                videoUrl = parsed.videoUrl || parsed.url || parsed.resultUrls?.[0];
            }

            if (!videoUrl) {
                console.error(`  [${label}] Completed but no video URL!`, JSON.stringify(sd).slice(0, 500));
                throw new Error(`${label}: completed but no video URL`);
            }

            console.log(`  ✓ [${label}] Done: ${typeof videoUrl === 'string' ? videoUrl.slice(0, 80) : videoUrl}...`);
            return videoUrl as string;
        }

        if (sd.successFlag === -1 || state === "FAIL" || state === "FAILED") {
            throw new Error(`${label} failed: ${sd.failMsg || sd.errorMessage || state}`);
        }

        const elapsed = Math.round((Date.now() - start) / 1000);
        console.log(`  [${label}] ${state || 'processing'}... (${elapsed}s)`);
        await new Promise(r => setTimeout(r, pollInterval));
    }

    throw new Error(`${label} timed out after 10 min`);
}

// ─── SCENES ──────────────────────────────────────────────────────

const SCENES = [
    {
        label: "Scene 1 — Salon Hook",
        prompt: `@shai-lfc stands inside a high-end hair salon. Warm ambient lighting, modern styling stations with illuminated mirrors visible behind him. Fresh flowers on the reception counter. He wears a fitted dark henley shirt, casual but intentional. He looks directly into camera with a relaxed confident expression and begins speaking. Cinematic shallow depth of field, the salon environment softly blurred behind him. Warm golden tones throughout. Camera is static, chest-up framing.`,
    },
    {
        label: "Scene 2 — Digital Studio",
        prompt: `@shai-lfc sits at a sleek dark workspace with a large ultrawide monitor glowing in front of him, showing a beautiful website with warm gold tones and hair photography. He gestures toward the screen with one hand while looking into camera, explaining something with enthusiasm. The room is modern and minimal — dark walls, single desk lamp providing warm side light, monitor glow illuminating his face from the front. He alternates between looking at the screen and looking into camera. Cinematic, shallow depth of field.`,
    },
    {
        label: "Scene 3 — Screening Room",
        prompt: `@shai-lfc stands to the side of a large wall-mounted screen in a dark elegant viewing room, like a private screening. The screen shows beautiful hair photography in warm golden tones, cinematic, in motion. He watches it for a moment with genuine appreciation, then turns to camera. Dramatic lighting — the screen casts warm light across half his face. Minimal environment, focus on the screen and him. He gestures toward the screen as if presenting something he is proud of.`,
    },
    {
        label: "Scene 4 — War Room",
        prompt: `@shai-lfc stands in front of a large 4K display showing colorful analytics dashboards — bar charts, comparison graphs, engagement metrics in orange and teal tones on a dark background. The room is dimly lit, the monitor is the primary light source casting a blue-orange glow on his face. He points to a specific section of the dashboard with one hand while looking into camera. His expression is focused and slightly intense — like someone revealing competitive intelligence. Modern dark office environment, minimal furniture. Camera slowly pushes in slightly.`,
    },
    {
        label: "Scene 5 — Salon Close",
        prompt: `@shai-lfc stands in the same high-end hair salon from the opening scene — warm ambient lighting, styling stations and illuminated mirrors behind him. Same dark henley shirt, same position, but now he is slightly more relaxed, a subtle smile. He looks directly into camera and delivers a closing line with calm confidence. Static camera, chest-up framing. The feeling: someone who just showed you something real and is letting it speak for itself.`,
    },
];

async function downloadVideo(url: string, outputPath: string): Promise<void> {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Download failed (${resp.status}): ${url}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log(`  Downloaded: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
}

async function uploadToR2(localPath: string, r2Key: string): Promise<string> {
    // Use the worker's R2 upload service
    const { uploadToR2: upload } = await import('../services/r2');
    return upload(localPath, r2Key, 'video/mp4');
}

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('=== Deanna Pitch Video — Sora 2 Pro 1080p ===\n');
    console.log(`Generating ${SCENES.length} scenes with @shai-lfc cameo...\n`);

    // Generate all 5 scenes in parallel
    const taskIds = await Promise.all(
        SCENES.map(scene => createSoraTask(scene.prompt, {
            aspect_ratio: "landscape",
            n_frames: "10",
            size: "high",
            remove_watermark: true,
        }))
    );

    console.log(`\nAll ${taskIds.length} tasks created. Polling for completion...\n`);

    // Wait for all to complete
    const videoUrls: string[] = [];
    for (let i = 0; i < taskIds.length; i++) {
        const url = await waitForSoraTask(taskIds[i], SCENES[i].label);
        videoUrls.push(url);
    }

    // Download all clips
    console.log(`\nDownloading ${videoUrls.length} clips...\n`);
    const localPaths: string[] = [];
    for (let i = 0; i < videoUrls.length; i++) {
        const localPath = path.join(OUTPUT_DIR, `scene-${i + 1}.mp4`);
        await downloadVideo(videoUrls[i], localPath);
        localPaths.push(localPath);
    }

    // Upload to R2
    console.log(`\nUploading to R2...\n`);
    const r2Urls: string[] = [];
    for (let i = 0; i < localPaths.length; i++) {
        const r2Key = `hair-approach/pitch-video/scene-${i + 1}.mp4`;
        const r2Url = await uploadToR2(localPaths[i], r2Key);
        r2Urls.push(r2Url);
        console.log(`  ✓ Scene ${i + 1}: ${r2Url}`);
    }

    // Concatenate with FFmpeg
    console.log(`\nConcatenating scenes with FFmpeg...\n`);
    const concatListPath = path.join(OUTPUT_DIR, 'concat.txt');
    const concatContent = localPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(concatListPath, concatContent);

    const finalPath = path.join(OUTPUT_DIR, 'deanna-pitch-final.mp4');
    const { execSync } = await import('child_process');
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${finalPath}"`, {
        stdio: 'inherit',
    });

    const finalSize = (fs.statSync(finalPath).size / 1024 / 1024).toFixed(1);
    console.log(`\n✓ Final video: ${finalPath} (${finalSize}MB)`);

    // Upload final to R2
    const finalR2Url = await uploadToR2(finalPath, 'hair-approach/pitch-video/deanna-pitch-final.mp4');
    console.log(`✓ Uploaded: ${finalR2Url}`);

    console.log('\n=== Results ===');
    r2Urls.forEach((url, i) => console.log(`  Scene ${i + 1}: ${url}`));
    console.log(`  Final: ${finalR2Url}`);
    console.log('\n[COST] Sora 2 Pro 1080p × 5 scenes × 10s: ~$5.00');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
