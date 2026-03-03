/**
 * Remotion Server-Side Renderer for TourReel.
 *
 * Bundles the Remotion project once at startup, then renders
 * property tour videos on demand via renderMedia().
 *
 * Integration: Called from BullMQ worker jobs. Outputs MP4 to disk,
 * which is then uploaded to R2 by the pipeline.
 */
import path from "path";
import { logger } from "../utils/logger";
import type { PropertyTourProps } from "../../remotion/src/types/composition-props";

// Lazy-loaded to avoid import issues on non-rendering workers
let bundleLocation: string | null = null;
let bundlePromise: Promise<string> | null = null;

/**
 * Bundle the Remotion project (once). Reuses the bundle across renders.
 * Takes ~10-30 seconds on first call, then instant.
 */
async function ensureBundle(): Promise<string> {
    if (bundleLocation) return bundleLocation;
    if (bundlePromise) return bundlePromise;

    bundlePromise = (async () => {
        const { bundle } = await import("@remotion/bundler");
        // Use process.cwd() (worker root) rather than __dirname (which shifts with rootDir config)
        const entryPoint = path.resolve(process.cwd(), "remotion/src/index.ts");

        logger.info({ msg: "Remotion: Bundling project (one-time)...", entryPoint });
        const start = Date.now();

        const location = await bundle({
            entryPoint,
            // @ts-ignore — webpackOverride signature varies
            webpackOverride: (config: any) => config,
        });

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        logger.info({ msg: `Remotion: Bundle ready (${elapsed}s)`, location });

        bundleLocation = location;
        return location;
    })();

    return bundlePromise;
}

// ─── Composition IDs ─────────────────────────────────────────────
const COMPOSITIONS = {
    "16x9": "PropertyTour-16x9",
    "9x16": "PropertyTour-9x16",
    "1x1": "PropertyTour-1x1",
    "4x5": "PropertyTour-4x5",
} as const;

type AspectRatio = keyof typeof COMPOSITIONS;

// ─── Render Options ──────────────────────────────────────────────
type RenderOptions = {
    props: PropertyTourProps;
    outputDir: string;
    /** Which aspect ratios to render. Default: all four. */
    aspectRatios?: AspectRatio[];
    /** Parallel frame count. Default: 2 (safe for 6GB VPS). */
    concurrency?: number;
    /** H.264 CRF quality (lower = better, bigger). Default: 20. */
    crf?: number;
    /** Progress callback */
    onProgress?: (ratio: AspectRatio, percent: number) => void;
};

type RenderResult = {
    ratio: AspectRatio;
    outputPath: string;
    durationSeconds: number;
    renderTimeSeconds: number;
};

/**
 * Render property tour video(s) using Remotion.
 * Returns paths to rendered MP4 files.
 */
export async function renderPropertyTour(options: RenderOptions): Promise<RenderResult[]> {
    const {
        props,
        outputDir,
        aspectRatios = ["16x9", "9x16", "1x1", "4x5"],
        concurrency = 2,
        crf = 20,
        onProgress,
    } = options;

    const serveUrl = await ensureBundle();

    const { selectComposition } = await import("@remotion/renderer");
    const { renderMedia } = await import("@remotion/renderer");

    const results: RenderResult[] = [];

    for (const ratio of aspectRatios) {
        const compositionId = COMPOSITIONS[ratio];
        const outputPath = path.join(outputDir, `${ratio.replace("x", "_")}.mp4`);

        logger.info({ msg: "Remotion: Rendering", ratio, compositionId, outputPath });
        const start = Date.now();

        // Select composition (resolves calculateMetadata)
        const composition = await selectComposition({
            serveUrl,
            id: compositionId,
            inputProps: props,
        });

        // Render
        await renderMedia({
            composition,
            serveUrl,
            codec: "h264",
            outputLocation: outputPath,
            inputProps: props,
            concurrency,
            crf,
            onProgress: ({ renderedFrames, encodedFrames }) => {
                const percent = Math.round((encodedFrames / composition.durationInFrames) * 100);
                onProgress?.(ratio, percent);
            },
        });

        const renderTime = (Date.now() - start) / 1000;
        const durationSeconds = composition.durationInFrames / composition.fps;

        logger.info({
            msg: "Remotion: Render complete",
            ratio,
            duration: `${durationSeconds.toFixed(1)}s`,
            renderTime: `${renderTime.toFixed(1)}s`,
            frames: composition.durationInFrames,
        });

        results.push({
            ratio,
            outputPath,
            durationSeconds,
            renderTimeSeconds: renderTime,
        });
    }

    return results;
}

/**
 * Render any Remotion composition by ID with arbitrary props.
 * Used for CrewReveal, CrewDemo, and any future non-PropertyTour compositions.
 */
export async function renderComposition(options: {
    compositionId: string;
    inputProps: Record<string, unknown>;
    outputPath: string;
    concurrency?: number;
    crf?: number;
    onProgress?: (percent: number) => void;
}): Promise<{ outputPath: string; durationSeconds: number; renderTimeSeconds: number }> {
    const {
        compositionId,
        inputProps,
        outputPath,
        concurrency = 2,
        crf = 20,
        onProgress,
    } = options;

    const serveUrl = await ensureBundle();
    const { selectComposition, renderMedia } = await import("@remotion/renderer");

    logger.info({ msg: "Remotion: Rendering composition", compositionId, outputPath });
    const start = Date.now();

    const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        inputProps,
    });

    await renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        outputLocation: outputPath,
        inputProps,
        concurrency,
        crf,
        onProgress: ({ encodedFrames }) => {
            const percent = Math.round((encodedFrames / composition.durationInFrames) * 100);
            onProgress?.(percent);
        },
    });

    const renderTime = (Date.now() - start) / 1000;
    const durationSeconds = composition.durationInFrames / composition.fps;

    logger.info({
        msg: "Remotion: Composition render complete",
        compositionId,
        duration: `${durationSeconds.toFixed(1)}s`,
        renderTime: `${renderTime.toFixed(1)}s`,
    });

    return { outputPath, durationSeconds, renderTimeSeconds: renderTime };
}

/**
 * Pre-warm the Remotion bundle at worker startup.
 * Non-blocking — returns immediately, bundles in background.
 */
export function warmupRemotionBundle(): void {
    ensureBundle().catch((err) => {
        logger.error({ msg: "Remotion: Bundle warmup failed", error: err.message });
    });
}
