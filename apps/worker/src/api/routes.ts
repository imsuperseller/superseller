import { Router, Request, Response } from "express";
import { z } from "zod";
import { query, queryOne } from "../db/client";
import { videoPipelineQueue, VideoPipelineJobData } from "../queue/queues";
import { logger } from "../utils/logger";
import { scrapeZillowListing } from "../services/apify";
import { uploadToR2, uploadBufferToR2, buildR2Key } from "../services/r2";
import { existsSync } from "fs";
import { join } from "path";

function mapPropertyType(raw: string | undefined): string {
    const v = (raw || "").toLowerCase();
    if (v.includes("condo")) return "condo";
    if (v.includes("apartment")) return "apartment";
    if (v.includes("townhouse") || v.includes("town house")) return "townhouse";
    if (v.includes("commercial")) return "commercial";
    if (v.includes("land")) return "land";
    return "house";
}

export const apiRouter = Router();

// ─── LIST JOBS ───
apiRouter.get("/jobs", async (req: Request, res: Response) => {
    const userId = req.query.userId as string; // For POC, we take userId from query. In prod use Clerk JWT.
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const rows = await query(
        `SELECT vj.*, l.address, l.city, l.state 
     FROM video_jobs vj
     JOIN listings l ON l.id = vj.listing_id
     WHERE vj.user_id = $1
     ORDER BY vj.created_at DESC LIMIT 50`,
        [userId]
    );

    // Map to JobCard expectations: finalUrl, progress, currentStep
    const jobs = rows.map((j: any) => ({
        ...j,
        finalUrl: j.master_video_url ?? j.finalUrl,
        progress: j.progress_percent ?? j.progress,
        currentStep: j.current_step ?? j.currentStep,
        zillowUrl: j.zillow_url ?? j.zillowUrl ?? (j.address ? `https://zillow.com/homedetails/${j.address}` : undefined),
    }));

    res.json({ jobs });
});

// ─── GET SINGLE JOB ───
apiRouter.get("/jobs/:id", async (req: Request, res: Response) => {
    const jobId = req.params.id;

    const job = await queryOne("SELECT * FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const clips = await query("SELECT * FROM clips WHERE video_job_id = $1 ORDER BY clip_number", [jobId]);
    const listing = await queryOne("SELECT * FROM listings WHERE id = $1", [job.listing_id]);

    // Map to JobCard expectations
    const jobData = {
        ...job,
        finalUrl: job.master_video_url ?? job.finalUrl,
        progress: job.progress_percent ?? job.progress,
        currentStep: job.current_step ?? job.currentStep,
    };
    // Map clips to JobCard: clipIdx (0-based), resultUrl/resultR2Key, status (complete→done)
    const clipsForUi = clips.map((c: any) => ({
        ...c,
        clipIdx: (c.clip_number ?? 0) - 1,
        resultUrl: c.video_url ?? c.resultUrl,
        resultR2Key: c.video_url ?? c.resultR2Key,
        status: c.status === "complete" ? "done" : c.status,
    }));

    res.json({ job: jobData, clips: clipsForUi, listing });
});

// ─── CREATE JOB ───
const createJobSchema = z.object({
    listingId: z.string().uuid(),
    userId: z.string(),
    model: z.string().optional(),
});

apiRouter.post("/jobs", async (req: Request, res: Response) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

    const { listingId, userId, model } = parsed.data;

    // Create job record
    const [job] = await query(
        `INSERT INTO video_jobs (listing_id, user_id, status, model_preference)
     VALUES ($1, $2, 'pending', $3)
     RETURNING *`,
        [listingId, userId, "kling_3"]
    );

    // Enqueue
    const jobData: VideoPipelineJobData = { jobId: job.id, listingId, userId };
    await videoPipelineQueue.add(`video-${job.id}`, jobData);

    logger.info({ msg: "Enqueued job", jobId: job.id });
    res.status(201).json({ job });
});

// ─── CREATE JOB FROM ZILLOW (scrape → listing → job in one) ───
const fromZillowSchema = z.object({
    addressOrUrl: z.string().min(1),
    userId: z.string().uuid(),
    floorplanPath: z.string().optional(),
    floorplanBase64: z.string().optional(),
    floorplanContentType: z.string().optional(),
    realtorBase64: z.string().optional(),
    realtorContentType: z.string().optional(),
});

apiRouter.post("/jobs/from-zillow", async (req: Request, res: Response) => {
    try {
        const parsed = fromZillowSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const { addressOrUrl, userId, floorplanPath, floorplanBase64, floorplanContentType, realtorBase64, realtorContentType } = parsed.data;

        const user = await queryOne("SELECT id, avatar_url FROM users WHERE id = $1", [userId]);
        if (!user) return res.status(404).json({ error: "User not found" });
        const hasAvatar = !!user.avatar_url && user.avatar_url.length > 0;
        if (!hasAvatar && !realtorBase64) return res.status(400).json({
            error: "Realtor photo required. Upload via the form or run: cd apps/worker && npx tsx tools/set-test-user-avatar.ts [path/to/photo.png]",
        });

        // Floorplan is required — either uploaded directly or auto-detected from listing photos later in the pipeline.
        // If not provided here, the pipeline will attempt to detect it from listing photos.
        // If neither source yields a floorplan, the job will fail with a clear error.
        const hasFloorplanUpload = !!(floorplanBase64 || floorplanPath);
        if (!hasFloorplanUpload) {
            logger.info({ msg: "No floorplan uploaded — pipeline will attempt auto-detection from listing photos" });
        }

        const scraped = await scrapeZillowListing(addressOrUrl, 30);
        if (!scraped.photos?.length) return res.status(400).json({ error: "No photos found for listing" });

        const exteriorPhoto = scraped.photos[0];
        const additionalPhotos = scraped.photos.slice(1);

        const safeImageType = (t: string | undefined) =>
            /^image\/(jpeg|png|webp)$/i.test(t || "") ? t! : "image/png";

        // Realtor avatar from web dropzone → upload to R2, set user.avatar_url
        if (realtorBase64) {
            try {
                const buf = Buffer.from(realtorBase64, "base64");
                const r2Key = `${userId}/avatar/avatar.png`;
                const avatarUrl = await uploadBufferToR2(buf, r2Key, safeImageType(realtorContentType));
                await query("UPDATE users SET avatar_url = $1 WHERE id = $2", [avatarUrl, userId]);
                logger.info({ msg: "Realtor avatar set from web upload", userId });
            } catch (e) {
                logger.warn({ msg: "Realtor avatar upload failed", error: (e as Error).message });
            }
        }

        let floorplanUrl: string | null = null;
        if (floorplanBase64) {
            try {
                const buf = Buffer.from(floorplanBase64, "base64");
                const ct = safeImageType(floorplanContentType);
                const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
                floorplanUrl = await uploadBufferToR2(buf, buildR2Key(userId, `floorplan-${Date.now()}`, `floorplan.${ext}`), ct);
            } catch (e) {
                logger.warn({ msg: "Floorplan upload from base64 failed", error: (e as Error).message });
            }
        } else if (floorplanPath) {
            const isAbs = floorplanPath.startsWith("/");
            const absPath = isAbs ? floorplanPath : join(process.cwd(), floorplanPath.replace(/^\.\//, ""));

            if (existsSync(absPath)) {
                floorplanUrl = await uploadToR2(absPath, buildR2Key(userId, `floorplan-${Date.now()}`, "floorplan.webp"));
            } else {
                logger.warn({ msg: "Floorplan file not found", path: absPath });
            }
        }

        const amenitiesJson = Array.isArray(scraped.amenities) ? JSON.stringify(scraped.amenities) : JSON.stringify([]);
        const resoFactsJson = scraped.resoFacts ? JSON.stringify(scraped.resoFacts) : null;

        const [listing] = await query(
            `INSERT INTO listings (user_id, address, city, state, zip, property_type, bedrooms, bathrooms, sqft, listing_price, exterior_photo_url, floorplan_url, additional_photos, description, amenities, reso_facts)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
            [
                userId,
                scraped.address,
                scraped.city ?? null,
                scraped.state ?? null,
                scraped.zip ?? null,
                mapPropertyType(scraped.property_type),
                scraped.bedrooms ?? null,
                scraped.bathrooms ?? null,
                scraped.sqft ?? null,
                scraped.price ?? null,
                exteriorPhoto,
                floorplanUrl,
                JSON.stringify(additionalPhotos),
                scraped.description ?? null,
                amenitiesJson,
                resoFactsJson,
            ]
        );

        const [job] = await query(
            `INSERT INTO video_jobs (listing_id, user_id, status, model_preference)
         VALUES ($1, $2, 'pending', 'kling_3')
         RETURNING *`,
            [listing.id, userId]
        );

        const jobData: VideoPipelineJobData = { jobId: job.id, listingId: listing.id, userId };
        await videoPipelineQueue.add(`video-${job.id}`, jobData);

        logger.info({ msg: "Enqueued from-zillow job", jobId: job.id, listingId: listing.id });
        res.status(201).json({ job, listing });

    } catch (err: any) {
        logger.error({ msg: "API Error in /jobs/from-zillow", error: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
});

// ─── DEV: Ensure test user (for E2E only) ───
apiRouter.post("/dev/ensure-test-user", async (_req: Request, res: Response) => {
    const clerkId = "e2e-test-user";
    const existing = await queryOne("SELECT id, avatar_url FROM users WHERE clerk_id = $1", [clerkId]);
    if (existing) return res.json({
        userId: existing.id,
        hasAvatar: !!existing.avatar_url && existing.avatar_url.length > 0,
    });
    const [u] = await query(
        `INSERT INTO users (clerk_id, email, full_name) VALUES ($1, $2, $3) RETURNING id`,
        [clerkId, "e2e@test.local", "E2E Test User"]
    );
    res.status(201).json({ userId: u.id, hasAvatar: false });
});

// ─── REGENERATE CLIPS (SELECTIVE) ───
/**
 * Regenerate only specified clips, keep good ones, re-stitch.
 * Mechanism: Same start/end frames → Kling interpolates → continuity preserved.
 * Usage: POST /api/jobs/:id/regenerate { "clipNumbers": [2, 3] }
 */
const regenSchema = z.object({
    clipNumbers: z.array(z.number().int().min(1)).min(1).max(20),
});
apiRouter.post("/jobs/:id/regenerate", async (req: Request, res: Response) => {
    const jobId = req.params.id as string;
    const parsed = regenSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

    const job = await queryOne("SELECT * FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if ((job as any).status !== "complete") return res.status(400).json({ error: "Job must be complete to regenerate clips" });

    const clips = await query("SELECT clip_number FROM clips WHERE video_job_id = $1 AND status = 'complete'", [jobId]);
    const validNumbers = new Set((clips as any[]).map((c) => c.clip_number));
    const invalid = parsed.data.clipNumbers.filter((n) => !validNumbers.has(n));
    if (invalid.length > 0) {
        return res.status(400).json({ error: `Invalid clip numbers: ${invalid.join(", ")}` });
    }

    // Enqueue regen job (runs regen-clips logic; for now spawn script or run inline)
    // TODO: Add regen-clip-queue for async processing. For MVP, run inline.
    try {
        const { runRegenClips } = await import("../services/regen-clips");
        const result = await runRegenClips(jobId, parsed.data.clipNumbers as number[]);
        return res.json({ success: true, master_video_url: result.masterUrl });
    } catch (err: any) {
        logger.error({ msg: "Regenerate clips failed", jobId, error: err.message });
        return res.status(500).json({ error: err.message });
    }
});

// ─── RETRY JOB FRESH (clears clips, re-runs full pipeline) ───
apiRouter.post("/jobs/:id/retry-fresh", async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const job = await queryOne("SELECT * FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) return res.status(404).json({ error: "Job not found" });

    await query("DELETE FROM clips WHERE video_job_id = $1", [jobId]);
    await query(
        "UPDATE video_jobs SET status = 'pending', error_message = NULL, progress_percent = 0, current_step = NULL, master_video_url = NULL, vertical_video_url = NULL, thumbnail_url = NULL, video_duration_seconds = NULL, completed_at = NULL WHERE id = $1",
        [jobId]
    );
    await videoPipelineQueue.add("video-pipeline", {
        jobId,
        listingId: job.listing_id,
        userId: job.user_id,
    });
    logger.info({ msg: "Fresh retry enqueued", jobId });
    return res.json({ success: true, message: "Job reset and re-queued" });
});

// ─── RESUME JOB (keep completed clips, re-generate stuck/pending) ───
apiRouter.post("/jobs/:id/resume", async (req: Request, res: Response) => {
    const jobId = req.params.id;
    const job = await queryOne("SELECT * FROM video_jobs WHERE id = $1", [jobId]);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.status === "complete" && job.master_video_url) {
        return res.status(400).json({ error: "Job already complete" });
    }

    // Reset stuck/generating clips back to pending (keep completed ones)
    const resetResult = await query(
        "UPDATE clips SET status = 'pending', external_task_id = NULL WHERE video_job_id = $1 AND status != 'complete' RETURNING id",
        [jobId]
    );
    const completedClips = await query(
        "SELECT id FROM clips WHERE video_job_id = $1 AND status = 'complete'",
        [jobId]
    );

    await query(
        "UPDATE video_jobs SET status = 'pending', error_message = NULL, progress_percent = 0, current_step = NULL WHERE id = $1",
        [jobId]
    );

    await videoPipelineQueue.add("video-pipeline", {
        jobId,
        listingId: job.listing_id,
        userId: job.user_id,
    });

    logger.info({ msg: "Resume enqueued", jobId, resetClips: resetResult.length, keptClips: completedClips.length });
    return res.json({
        success: true,
        message: `Job resumed: ${completedClips.length} clips kept, ${resetResult.length} clips reset to pending`,
        keptClips: completedClips.length,
        resetClips: resetResult.length,
    });
});

// ─── RAG: INGEST ───
const ingestSchema = z.object({
    tenantId: z.string().min(1),
    source: z.string().min(1),
    title: z.string().optional(),
    content: z.string().min(1),
    metadata: z.record(z.string(), z.unknown()).optional(),
    chunkSize: z.number().int().min(50).max(2000).optional(),
    chunkOverlap: z.number().int().min(0).max(500).optional(),
});
apiRouter.post("/rag/ingest", async (req: Request, res: Response) => {
    try {
        const parsed = ingestSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const { ingestDocument } = await import("../services/rag");
        const result = await ingestDocument(
            parsed.data.tenantId,
            parsed.data.source,
            parsed.data.title ?? null,
            parsed.data.content,
            parsed.data.metadata,
            { chunkSize: parsed.data.chunkSize, chunkOverlap: parsed.data.chunkOverlap },
        );
        res.status(201).json(result);
    } catch (err: any) {
        logger.error({ msg: "RAG ingest failed", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── RAG: SEARCH ───
const searchSchema = z.object({
    tenantId: z.string().min(1),
    query: z.string().min(1),
    limit: z.number().int().min(1).max(20).optional(),
    hybrid: z.boolean().optional(),
});
apiRouter.post("/rag/search", async (req: Request, res: Response) => {
    try {
        const parsed = searchSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const { search, hybridSearch } = await import("../services/rag");
        const limit = parsed.data.limit ?? 5;

        const results = parsed.data.hybrid
            ? await hybridSearch(parsed.data.tenantId, parsed.data.query, limit)
            : await search(parsed.data.tenantId, parsed.data.query, limit);

        res.json({ results, count: results.length });
    } catch (err: any) {
        logger.error({ msg: "RAG search failed", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── RAG: LIST DOCUMENTS ───
apiRouter.get("/rag/documents", async (req: Request, res: Response) => {
    const tenantId = req.query.tenantId as string;
    if (!tenantId) return res.status(400).json({ error: "tenantId required" });

    const { listDocuments } = await import("../services/rag");
    const source = (req.query.source as string) || undefined;
    const docs = await listDocuments(tenantId, source);
    res.json({ documents: docs, count: docs.length });
});

// ─── RAG: DELETE ───
apiRouter.delete("/rag/documents/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { deleteDocument } = await import("../services/rag");
    const deleted = await deleteDocument(id);
    if (!deleted) return res.status(404).json({ error: "Document not found" });
    res.json({ success: true });
});

apiRouter.delete("/rag/documents", async (req: Request, res: Response) => {
    const tenantId = req.query.tenantId as string;
    const source = req.query.source as string;
    if (!tenantId || !source) return res.status(400).json({ error: "tenantId and source required" });

    const { deleteBySource } = await import("../services/rag");
    const count = await deleteBySource(tenantId, source);
    res.json({ success: true, deleted: count });
});

// ─── HEALTH ───
apiRouter.get("/health", (req, res) => res.json({ status: "ok" }));
