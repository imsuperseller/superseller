import { Router, Request, Response } from "express";
import { z } from "zod";
import { query, queryOne } from "../db/client";
import { videoPipelineQueue, VideoPipelineJobData, remotionQueue, RemotionJobData, crewVideoQueue, CrewVideoJobData } from "../queue/queues";
import { logger } from "../utils/logger";
import { scrapeZillowListing } from "../services/apify";
import { uploadToR2, uploadBufferToR2, buildR2Key } from "../services/r2";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

// Rate-limit map for unauthorized phone log spam (phone -> last log timestamp)
const unauthorizedPhoneLog = new Map<string, number>();

function mapPropertyType(raw: string | undefined): string {
    const v = (raw || "").toLowerCase();
    if (v.includes("condo")) return "condo";
    if (v.includes("apartment")) return "apartment";
    if (v.includes("townhouse") || v.includes("town house")) return "townhouse";
    if (v.includes("commercial")) return "commercial";
    if (v.includes("land")) return "land";
    return "house";
}

import { telnyxVoiceRouter } from "./telnyx-voice-webhook";

export const apiRouter = Router();

// Mount Telnyx voice webhook (migrated from n8n)
apiRouter.use(telnyxVoiceRouter);

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

        const user = await queryOne('SELECT id, avatar_url FROM "User" WHERE id = $1', [userId]);
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
                await query('UPDATE "User" SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);
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

// ─── CREATE REMOTION COMPOSITION JOB ───
const remotionJobSchema = z.object({
    listingId: z.string().uuid(),
    userId: z.string(),
    aspectRatios: z.array(z.enum(["16x9", "9x16", "1x1", "4x5"])).optional(),
});

apiRouter.post("/jobs/remotion", async (req: Request, res: Response) => {
    try {
        const parsed = remotionJobSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const { listingId, userId, aspectRatios } = parsed.data;

        // Verify listing exists
        const listing = await queryOne("SELECT id, address FROM listings WHERE id = $1", [listingId]);
        if (!listing) return res.status(404).json({ error: "Listing not found" });

        // Create job record
        const [job] = await query(
            `INSERT INTO video_jobs (listing_id, user_id, status, model_preference)
             VALUES ($1, $2, 'pending', 'remotion')
             RETURNING *`,
            [listingId, userId]
        );

        // Enqueue Remotion composition
        const jobData: RemotionJobData = { jobId: job.id, listingId, userId, aspectRatios };
        await remotionQueue.add(`remotion-${job.id}`, jobData);

        logger.info({ msg: "Enqueued Remotion composition job", jobId: job.id, listingId, ratios: aspectRatios });
        res.status(201).json({ job, pipeline: "remotion" });
    } catch (err: any) {
        logger.error({ msg: "API Error in /jobs/remotion", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── CREATE REMOTION JOB FROM ZILLOW (scrape → listing → Remotion composition) ───
const remotionFromZillowSchema = z.object({
    addressOrUrl: z.string().min(1),
    userId: z.string().uuid(),
    aspectRatios: z.array(z.enum(["16x9", "9x16", "1x1", "4x5"])).optional(),
});

apiRouter.post("/jobs/remotion/from-zillow", async (req: Request, res: Response) => {
    try {
        const parsed = remotionFromZillowSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const { addressOrUrl, userId, aspectRatios } = parsed.data;

        const user = await queryOne('SELECT id FROM "User" WHERE id = $1', [userId]);
        if (!user) return res.status(404).json({ error: "User not found" });

        const scraped = await scrapeZillowListing(addressOrUrl, 30);
        if (!scraped.photos?.length) return res.status(400).json({ error: "No photos found for listing" });

        const exteriorPhoto = scraped.photos[0];
        const additionalPhotos = scraped.photos.slice(1);
        const amenitiesJson = Array.isArray(scraped.amenities) ? JSON.stringify(scraped.amenities) : JSON.stringify([]);
        const resoFactsJson = scraped.resoFacts ? JSON.stringify(scraped.resoFacts) : null;

        const [listing] = await query(
            `INSERT INTO listings (user_id, address, city, state, zip, property_type, bedrooms, bathrooms, sqft, listing_price, exterior_photo_url, additional_photos, description, amenities, reso_facts)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
                JSON.stringify(additionalPhotos),
                scraped.description ?? null,
                amenitiesJson,
                resoFactsJson,
            ]
        );

        const [job] = await query(
            `INSERT INTO video_jobs (listing_id, user_id, status, model_preference)
             VALUES ($1, $2, 'pending', 'remotion')
             RETURNING *`,
            [listing.id, userId]
        );

        const jobData: RemotionJobData = { jobId: job.id, listingId: listing.id, userId, aspectRatios };
        await remotionQueue.add(`remotion-${job.id}`, jobData);

        logger.info({ msg: "Enqueued Remotion from-zillow job", jobId: job.id, listingId: listing.id });
        res.status(201).json({ job, listing, pipeline: "remotion" });
    } catch (err: any) {
        logger.error({ msg: "API Error in /jobs/remotion/from-zillow", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── RENDER CREW COMPOSITION (CrewReveal or CrewDemo) ───
const crewRenderSchema = z.object({
    compositionId: z.enum(["CrewReveal-16x9", "CrewReveal-9x16", "CrewDemo-16x9", "CrewDemo-9x16"]),
    inputProps: z.record(z.string(), z.unknown()).optional(),
});
apiRouter.post("/jobs/remotion/crew", async (req: Request, res: Response) => {
    try {
        const parsed = crewRenderSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const { compositionId, inputProps } = parsed.data;

        // Enqueue as a Remotion job with composition override
        const jobData = {
            jobId: `crew-${Date.now()}`,
            listingId: 0,
            userId: "system",
            compositionId,
            inputProps: inputProps || {},
        };
        await remotionQueue.add(`crew-${compositionId}-${Date.now()}`, jobData);

        logger.info({ msg: "Enqueued crew composition render", compositionId });
        res.status(201).json({ queued: true, compositionId });
    } catch (err: any) {
        logger.error({ msg: "API Error in /jobs/remotion/crew", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── DEV: Ensure test user (for E2E only) ───
apiRouter.post("/dev/ensure-test-user", async (_req: Request, res: Response) => {
    const clerkId = "e2e-test-user";
    const existing = await queryOne('SELECT id, avatar_url FROM "User" WHERE clerk_id = $1', [clerkId]);
    if (existing) return res.json({
        userId: existing.id,
        hasAvatar: !!existing.avatar_url && existing.avatar_url.length > 0,
    });
    const [u] = await query(
        'INSERT INTO "User" (id, clerk_id, email, name) VALUES (gen_random_uuid()::text, $1, $2, $3) RETURNING id',
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

    // Pre-flight: probe Kie.ai credits before queuing (avoids wasted BullMQ cycles)
    try {
        const { probeKieCredits } = await import("../services/kie");
        const probe = await probeKieCredits();
        if (!probe.ok) {
            return res.status(402).json({ error: probe.error || "Kie.ai credits insufficient — top up before resuming" });
        }
    } catch (probeErr: any) {
        logger.warn({ msg: "Kie.ai probe failed, proceeding anyway", error: probeErr.message });
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

        const { search, hybridSearch, textSearch } = await import("../services/rag");
        const limit = parsed.data.limit ?? 5;

        // Try vector/hybrid search first, fall back to text-only if it fails or returns empty
        let results: any[];
        try {
            results = parsed.data.hybrid
                ? await hybridSearch(parsed.data.tenantId, parsed.data.query, limit)
                : await search(parsed.data.tenantId, parsed.data.query, limit);
        } catch {
            results = [];
        }
        if (results.length < limit) {
            // Supplement with text search results (dedup by id)
            const textResults = await textSearch(parsed.data.tenantId, parsed.data.query, limit);
            const existingIds = new Set(results.map((r: any) => r.id));
            for (const tr of textResults) {
                if (!existingIds.has(tr.id) && results.length < limit) {
                    results.push(tr);
                }
            }
        }

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

// ─── CLAUDECLAW WAHA WEBHOOK ───
/**
 * Receives inbound WhatsApp messages from WAHA webhook(s).
 * Personal:  POST /api/whatsapp/claude          — only allowed phones
 * Business:  POST /api/whatsapp/claude/superseller    — all customers welcome
 *
 * Each WAHA instance sends its own webhook URL including ?waha_url= to route responses.
 */
async function handleClaudeClawWebhook(req: Request, res: Response, mode: "personal" | "business") {
    try {
        const { config: appConfig } = await import("../config");
        if (!appConfig.claudeclaw.enabled) {
            return res.status(404).json({ error: "ClaudeClaw not enabled" });
        }

        const event = req.body?.event;
        const payload = req.body?.payload || req.body;

        // Only process incoming text/media messages (not status updates, acks, etc.)
        if (event && event !== "message" && event !== "message.any") {
            return res.json({ status: "ignored", event });
        }

        const chatId = payload?.from || payload?.chatId;
        const body = payload?.body || "";
        const fromMe = payload?.fromMe ?? false;
        const hasMedia = payload?.hasMedia ?? false;
        const mediaUrl = payload?.mediaUrl || payload?.media?.url || null;
        const mediaType = payload?.type || "chat"; // chat, image, video, audio, document
        // Message ID for reactions/replies + sender display name
        // WAHA webhook: payload.id is a plain string e.g. "true_120363...@g.us_3EB0..."
        const messageId: string | null =
            typeof payload?.id === "string"
                ? payload.id
                : payload?.id?._serialized || payload?.id?.id || payload?.messageId || null;
        const senderName = payload?.notifyName || payload?.pushName || null;

        // Ignore our own messages
        if (fromMe) {
            return res.json({ status: "ignored", reason: "own_message" });
        }

        // Group messages: route to group agent if registered, otherwise ignore
        if (chatId && chatId.includes("@g.us")) {
            const { isRegisteredGroup } = await import("../services/group-agent");
            if (!isRegisteredGroup(chatId)) {
                return res.json({ status: "ignored", reason: "unregistered_group" });
            }

            // Only respond (text) to slash commands or explicit @mentions.
            // BUT: always ingest media — Saar's team may send photos without addressing the agent.
            const isSlashCommand = body.startsWith("/");
            const mentionedIds: string[] = payload?.mentionedIds || [];
            const botJid = appConfig.claudeclaw.botJid;
            const isMentioned =
                (botJid && mentionedIds.some((id: string) => id.includes(botJid))) ||
                body.toLowerCase().includes("@superseller");
            const needsTextResponse = isSlashCommand || isMentioned;

            if (!needsTextResponse && !hasMedia) {
                // Pure text not addressed to agent — ignore
                return res.json({ status: "ignored", reason: "not_addressed" });
            }

            // Extract sender from WAHA payload (participant field in group messages)
            const senderChatId = payload?.participant || payload?.author || "";

            // Enqueue as group message
            const { claudeclawQueue } = await import("../queue/queues");
            await claudeclawQueue.add(`group-${Date.now()}`, {
                chatId,
                messageBody: body,
                hasMedia,
                mediaUrl: mediaUrl || undefined,
                mediaType: mediaType !== "chat" ? mediaType : undefined,
                timestamp: Date.now(),
                wahaUrl: (req.query.waha_url as string) || undefined,
                wahaSession: (req.query.waha_session as string) || undefined,
                mode,
                isGroup: true,
                senderChatId,
                senderName: senderName || undefined,
                messageId: messageId || undefined,
            });

            logger.info({ msg: "Group message enqueued", groupId: chatId, sender: senderChatId, bodyLength: body.length });
            return res.json({ status: "enqueued", type: "group" });
        }

        if (!chatId) {
            return res.status(400).json({ error: "Missing chatId/from in payload" });
        }

        // Auth: personal mode checks allowed phones, business mode allows everyone
        if (mode === "personal") {
            const phone = chatId.replace("@c.us", "").replace("@s.whatsapp.net", "");
            const allowed = appConfig.claudeclaw.allowedPhones;
            if (allowed.length > 0 && !allowed.some((p: string) => phone.includes(p) || p.includes(phone))) {
                // Rate-limit unauthorized phone logs: 1 per 60s per phone
                const now = Date.now();
                const lastLog = unauthorizedPhoneLog.get(phone) || 0;
                if (now - lastLog > 60_000) {
                    logger.warn({ msg: "ClaudeClaw: unauthorized phone", phone });
                    unauthorizedPhoneLog.set(phone, now);
                }
                return res.status(403).json({ error: "Unauthorized" });
            }
        }

        // Ignore empty messages (status updates, reactions, etc.)
        if (!body && !hasMedia) {
            return res.json({ status: "ignored", reason: "empty" });
        }

        // Intercept approval responses (generic approval system first, then crew-specific)
        if (mode === "personal" && body) {
            try {
                const { handleApprovalResponse } = await import("../services/approval-service");
                const handled = await handleApprovalResponse(chatId, body);
                if (handled) {
                    return res.json({ status: "handled", handler: "approval" });
                }
            } catch {
                // Non-critical
            }

            try {
                const { handleWhatsAppCrewApproval } = await import("../queue/workers/crew-video.worker");
                const handled = await handleWhatsAppCrewApproval(body);
                if (handled) {
                    return res.json({ status: "handled", handler: "crew-video-approval" });
                }
            } catch {
                // Non-critical — fall through to ClaudeClaw
            }
        }

        // Extract WAHA target from query params (set by webhook URL config)
        const wahaUrl = (req.query.waha_url as string) || undefined;
        const wahaSession = (req.query.waha_session as string) || undefined;

        // Enqueue for processing
        const { claudeclawQueue } = await import("../queue/queues");
        const jobData = {
            chatId,
            messageBody: body,
            hasMedia,
            mediaUrl: mediaUrl || undefined,
            mediaType: mediaType !== "chat" ? mediaType : undefined,
            timestamp: Date.now(),
            wahaUrl,
            wahaSession,
            mode,
            messageId: messageId || undefined,
            senderName: senderName || undefined,
        };

        await claudeclawQueue.add(`claude-${Date.now()}`, jobData);

        logger.info({ msg: "ClaudeClaw message enqueued", chatId, bodyLength: body.length, hasMedia, mode });
        res.json({ status: "queued" });
    } catch (err: any) {
        logger.error({ msg: "ClaudeClaw webhook error", error: err.message });
        res.status(500).json({ error: err.message });
    }
}

apiRouter.post("/whatsapp/claude", (req, res) => handleClaudeClawWebhook(req, res, "personal"));
apiRouter.post("/whatsapp/claude/superseller", (req, res) => handleClaudeClawWebhook(req, res, "business"));

// ─── OPS WEBHOOK (superseller-ops session — approvals only) ───
apiRouter.post("/whatsapp/ops", async (req: Request, res: Response) => {
    try {
        const event = req.body?.event;
        const payload = req.body?.payload || req.body;

        if (event && event !== "message" && event !== "message.any") {
            return res.json({ status: "ignored", event });
        }

        const chatId = payload?.from || payload?.chatId;
        const body = payload?.body || "";
        const fromMe = payload?.fromMe ?? false;

        if (fromMe || !chatId || !body) {
            return res.json({ status: "ignored" });
        }

        // Only handle approval responses on the ops session
        const { handleApprovalResponse } = await import("../services/approval-service");
        const handled = await handleApprovalResponse(chatId, body);

        if (handled) {
            return res.json({ status: "handled", handler: "approval" });
        }

        // If not an approval command, ignore (ops session is alerts-only)
        return res.json({ status: "ignored", reason: "not_approval_command" });
    } catch (err: any) {
        logger.error({ msg: "Ops webhook error", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── APPROVALS API ───
apiRouter.get("/approvals/pending", async (_req: Request, res: Response) => {
    try {
        const { getPendingApprovals } = await import("../services/approval-service");
        const pending = await getPendingApprovals();
        res.json({ approvals: pending, count: pending.length });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ─── CREW VIDEO BATCH RENDER + APPROVAL ───
const crewVideoSchema = z.object({
    notifyPhone: z.string().optional(),
    compositions: z.array(z.string()).optional(),
    trigger: z.enum(["manual", "schedule"]).default("manual"),
});

apiRouter.post("/crew-videos", async (req: Request, res: Response) => {
    try {
        const parsed = crewVideoSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const batchId = randomUUID();
        const jobData: CrewVideoJobData = {
            batchId,
            trigger: parsed.data.trigger,
            notifyPhone: parsed.data.notifyPhone,
            compositions: parsed.data.compositions,
        };

        await crewVideoQueue.add(`crew-batch-${batchId}`, jobData);
        logger.info({ msg: "Crew video batch enqueued", batchId, trigger: parsed.data.trigger });
        res.status(201).json({ batchId, queued: true });
    } catch (err: any) {
        logger.error({ msg: "API Error in /crew-videos", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── CREW VIDEO V3 — AI-GENERATED FULL-SCREEN VIDEO PER SCENE ───
const crewVideoV3Schema = z.object({
    notifyPhone: z.string().optional(),
    compositions: z.array(z.string()).optional(),
    trigger: z.enum(["manual", "schedule"]).default("manual"),
    forceStdMode: z.boolean().optional(),
});

apiRouter.post("/crew-videos/v3", async (req: Request, res: Response) => {
    try {
        const parsed = crewVideoV3Schema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

        const batchId = randomUUID();
        const jobData: CrewVideoJobData = {
            batchId,
            trigger: parsed.data.trigger,
            notifyPhone: parsed.data.notifyPhone,
            compositions: parsed.data.compositions,
            v3: true,
            forceStdMode: parsed.data.forceStdMode,
        };

        await crewVideoQueue.add(`crew-v3-${batchId}`, jobData);
        logger.info({ msg: "Crew video V3 batch enqueued", batchId, trigger: parsed.data.trigger, compositions: parsed.data.compositions });

        // Estimate cost
        const agentCount = parsed.data.compositions?.length || 7;
        const costPerAgent = parsed.data.forceStdMode ? 0.24 : 0.44;
        const estimatedCost = agentCount * costPerAgent;

        res.status(201).json({
            batchId,
            queued: true,
            version: "v3",
            estimatedCost: `$${estimatedCost.toFixed(2)}`,
            agents: agentCount,
        });
    } catch (err: any) {
        logger.error({ msg: "API Error in /crew-videos/v3", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post("/crew-videos/:batchId/approve", async (req: Request, res: Response) => {
    try {
        const batchId = req.params.batchId as string;
        const { approveCrewBatch } = await import("../queue/workers/crew-video.worker");
        const result = await approveCrewBatch(batchId);
        res.json({ success: true, published: result.published });
    } catch (err: any) {
        logger.error({ msg: "Crew video approve failed", error: err.message });
        res.status(400).json({ error: err.message });
    }
});

apiRouter.post("/crew-videos/:batchId/reject", async (req: Request, res: Response) => {
    try {
        const batchId = req.params.batchId as string;
        const reason = req.body?.reason as string | undefined;
        const { rejectCrewBatch } = await import("../queue/workers/crew-video.worker");
        await rejectCrewBatch(batchId, reason);
        res.json({ success: true });
    } catch (err: any) {
        logger.error({ msg: "Crew video reject failed", error: err.message });
        res.status(400).json({ error: err.message });
    }
});

apiRouter.get("/crew-videos/status", async (req: Request, res: Response) => {
    try {
        const { redisConnection } = await import("../queue/connection");
        const pendingBatchId = await redisConnection.get("crew-batch:latest-pending");
        if (!pendingBatchId) {
            return res.json({ pending: false });
        }
        const raw = await redisConnection.get(`crew-batch:${pendingBatchId}`);
        if (!raw) return res.json({ pending: false });
        res.json({ pending: true, batch: JSON.parse(raw) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ─── DIAGNOSTICS (for Mission Control) ───
apiRouter.get("/diagnostics", async (_req, res) => {
    try {
        const { execSync } = await import("child_process");
        const run = (cmd: string) => { try { return execSync(cmd, { timeout: 3000 }).toString().trim(); } catch { return ""; } };

        // Disk
        const dfLine = run("df -h / | tail -1");
        const dfParts = dfLine.split(/\s+/);
        const disk = { used: dfParts[2] || "?", total: dfParts[1] || "?", percent: dfParts[4] || "?" };

        // Memory
        const memLine = run("free -h | awk '/Mem:/{print $2\"|\"$3\"|\"$7}'");
        const [memTotal, memUsed, memAvail] = (memLine || "|||").split("|");

        // Uptime
        const uptime = run("uptime -p") || `${Math.floor(process.uptime())}s (node)`;

        // PM2
        let pm2Processes: { name: string; status: string; restarts: number; pid: number; memory: string; uptime: number }[] = [];
        try {
            const pm2Raw = run("pm2 jlist");
            if (pm2Raw) {
                const pm2Data = JSON.parse(pm2Raw);
                pm2Processes = pm2Data.map((p: any) => ({
                    name: p.name,
                    status: p.pm2_env?.status || "unknown",
                    restarts: p.pm2_env?.restart_time || 0,
                    pid: p.pid || 0,
                    memory: `${Math.round((p.monit?.memory || 0) / 1024 / 1024)}MB`,
                    uptime: p.pm2_env?.pm_uptime || 0,
                }));
            }
        } catch {}

        // Systemd services
        const systemdServices = ["rensto", "video-merge", "nginx"].map(svc => ({
            name: svc,
            active: run(`systemctl is-active ${svc}`) === "active",
        }));

        // BullMQ queue depths
        const { videoPipelineQueue, clipGenerationQueue, claudeclawQueue, remotionQueue, crewVideoQueue, marketplaceReplenisherQueue } = await import("../queue/queues");
        const queueStats = await Promise.all([
            { name: "video-pipeline", q: videoPipelineQueue },
            { name: "clip-generation", q: clipGenerationQueue },
            { name: "claudeclaw", q: claudeclawQueue },
            { name: "remotion", q: remotionQueue },
            { name: "crew-video", q: crewVideoQueue },
            { name: "marketplace-replenisher", q: marketplaceReplenisherQueue },
        ].map(async ({ name, q }) => {
            try {
                const counts = await q.getJobCounts("active", "waiting", "completed", "failed", "delayed");
                return { name, ...counts };
            } catch { return { name, active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }; }
        }));

        // WAHA sessions
        let wahaSessions: { name: string; status: string }[] = [];
        try {
            const wahaKey = process.env.WAHA_API_KEY || "4fc7e008d7d24fc995475029effc8fa8";
            const wahaRes = await fetch("http://localhost:3000/api/sessions", {
                headers: { "X-Api-Key": wahaKey },
                signal: AbortSignal.timeout(3000),
            });
            if (wahaRes.ok) {
                const sessions = await wahaRes.json();
                wahaSessions = (Array.isArray(sessions) ? sessions : []).map((s: any) => ({
                    name: s.name || "unknown",
                    status: s.status || "unknown",
                }));
            }
        } catch {}

        // SSL certs
        let sslCerts: { domain: string; expiry: string }[] = [];
        try {
            const certDirs = run("ls /etc/letsencrypt/live/ 2>/dev/null").split("\n").filter(d => d && d !== "README");
            sslCerts = certDirs.map(domain => {
                const expiry = run(`openssl x509 -enddate -noout -in /etc/letsencrypt/live/${domain}/fullchain.pem 2>/dev/null`);
                return { domain, expiry: expiry.replace("notAfter=", "") };
            });
        } catch {}

        // Cron jobs
        const cronJobs = run("crontab -l 2>/dev/null || echo 'none'");

        // DB stats
        let dbStats: any = { tables: 0, connections: 0, dbSize: "" };
        try {
            const tableCount = await queryOne("SELECT count(*) as c FROM information_schema.tables WHERE table_schema = 'public'");
            const connCount = await queryOne("SELECT count(*) as c FROM pg_stat_activity WHERE datname = 'app_db'");
            const sizeResult = await queryOne("SELECT pg_size_pretty(pg_database_size('app_db')) as s");
            dbStats = { tables: tableCount?.c || 0, connections: connCount?.c || 0, dbSize: sizeResult?.s || "?" };
        } catch {}

        // Business data
        let businessData: any = {};
        try {
            const userCount = await queryOne('SELECT count(*) as c FROM "User"');
            const videoJobStats = await queryOne("SELECT count(*) as total, count(*) FILTER (WHERE status='complete') as completed, count(*) FILTER (WHERE status='failed') as failed, count(*) FILTER (WHERE status='pending' OR status='processing') as active FROM video_jobs");
            const clipCount = await queryOne("SELECT count(*) as c FROM clips");
            const listingCount = await queryOne("SELECT count(*) as c FROM listings");

            let expenseData: any = null;
            try {
                expenseData = await queryOne("SELECT count(*) as total_calls, COALESCE(SUM(cost_usd), 0) as total_spend, COALESCE(SUM(cost_usd) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'), 0) as month_spend, COALESCE(SUM(cost_usd) FILTER (WHERE created_at > NOW() - INTERVAL '1 day'), 0) as today_spend FROM api_expenses");
            } catch {}

            let ragDocs: any = null;
            try {
                ragDocs = await queryOne("SELECT count(*) as docs, count(DISTINCT tenant_id) as tenants FROM rag_documents");
            } catch {}

            let leadCount: any = null;
            try {
                leadCount = await queryOne("SELECT count(*) as c FROM leads");
            } catch {}

            let groupAgentConfigs: any = null;
            try {
                groupAgentConfigs = await queryOne("SELECT count(*) as c FROM group_agent_config");
            } catch {}

            let modelCount: any = null;
            try {
                modelCount = await queryOne("SELECT count(*) as c FROM model_catalog");
            } catch {}

            businessData = {
                users: userCount?.c || 0,
                videoJobs: videoJobStats || { total: 0, completed: 0, failed: 0, active: 0 },
                clips: clipCount?.c || 0,
                listings: listingCount?.c || 0,
                expenses: expenseData,
                ragDocuments: ragDocs,
                leads: leadCount?.c || 0,
                groupAgentConfigs: groupAgentConfigs?.c || 0,
                modelCatalog: modelCount?.c || 0,
            };
        } catch {}

        // n8n instances
        let n8nInstances: { name: string; port: number; status: string }[] = [];
        for (const inst of [{ name: "production", port: 5678 }, { name: "personal", port: 5679 }]) {
            try {
                const r = await fetch(`http://localhost:${inst.port}/healthz`, { signal: AbortSignal.timeout(2000) });
                n8nInstances.push({ ...inst, status: r.ok ? "online" : `HTTP ${r.status}` });
            } catch {
                try {
                    const r2 = await fetch(`http://localhost:${inst.port}`, { signal: AbortSignal.timeout(2000) });
                    n8nInstances.push({ ...inst, status: r2.status > 0 ? "online" : "offline" });
                } catch {
                    n8nInstances.push({ ...inst, status: "offline" });
                }
            }
        }

        res.json({
            timestamp: new Date().toISOString(),
            server: { disk, memory: { total: memTotal, used: memUsed, available: memAvail }, uptime },
            pm2: pm2Processes,
            systemd: systemdServices,
            queues: queueStats,
            wahaSessions,
            sslCerts,
            cronJobs,
            database: dbStats,
            business: businessData,
            n8nInstances,
        });
    } catch (err: any) {
        logger.error({ msg: "Diagnostics error", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── OPS CENTER (detailed queue + job data for admin dashboard) ───
apiRouter.get("/ops", async (_req, res) => {
    try {
        const { videoPipelineQueue, clipGenerationQueue, claudeclawQueue, remotionQueue, crewVideoQueue, marketplaceReplenisherQueue } = await import("../queue/queues");

        const allQueues = [
            { name: "video-pipeline", q: videoPipelineQueue },
            { name: "clip-generation", q: clipGenerationQueue },
            { name: "claudeclaw", q: claudeclawQueue },
            { name: "remotion-composition", q: remotionQueue },
            { name: "crew-video", q: crewVideoQueue },
            { name: "marketplace-replenisher", q: marketplaceReplenisherQueue },
        ];

        const queues = await Promise.all(allQueues.map(async ({ name, q }) => {
            try {
                const counts = await q.getJobCounts("active", "waiting", "completed", "failed", "delayed", "paused");
                const failed = await q.getFailed(0, 4);
                const active = await q.getActive(0, 4);
                const completed = await q.getCompleted(0, 4);
                const waiting = await q.getWaiting(0, 4);

                const mapJob = (j: any) => ({
                    id: j.id,
                    name: j.name,
                    data: { jobId: j.data?.jobId, chatId: j.data?.chatId, productId: j.data?.productId },
                    status: j.finishedOn ? (j.failedReason ? "failed" : "completed") : j.processedOn ? "active" : "waiting",
                    createdAt: j.timestamp ? new Date(j.timestamp).toISOString() : null,
                    processedAt: j.processedOn ? new Date(j.processedOn).toISOString() : null,
                    finishedAt: j.finishedOn ? new Date(j.finishedOn).toISOString() : null,
                    duration: j.finishedOn && j.processedOn ? j.finishedOn - j.processedOn : null,
                    failedReason: j.failedReason || null,
                    attemptsMade: j.attemptsMade || 0,
                    attemptsTotal: j.opts?.attempts || 1,
                });

                return {
                    name,
                    counts,
                    isPaused: await q.isPaused(),
                    recentFailed: failed.map(mapJob),
                    recentActive: active.map(mapJob),
                    recentCompleted: completed.map(mapJob),
                    recentWaiting: waiting.map(mapJob),
                };
            } catch {
                return { name, counts: { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0, paused: 0 }, isPaused: false, recentFailed: [], recentActive: [], recentCompleted: [], recentWaiting: [] };
            }
        }));

        // Scheduler info
        const { getSchedulerStatus } = await import("../services/scheduler");
        let schedulerJobs: { name: string; intervalMs: number; lastRun: string | null; nextRun: string | null; runCount: number }[] = [];
        try {
            schedulerJobs = getSchedulerStatus();
        } catch {}

        let recentVideoJobs: any[] = [];
        try {
            recentVideoJobs = await query(
                `SELECT vj.id, vj.status, vj.created_at, vj.updated_at, vj.error_message,
                        vj.progress_percent, vj.total_api_cost, vj.model_preference,
                        l.address as listing_address
                 FROM video_jobs vj
                 LEFT JOIN listings l ON vj.listing_id = l.id
                 ORDER BY vj.created_at DESC LIMIT 10`
            );
        } catch {}

        let recentExpenses: any[] = [];
        try {
            recentExpenses = await query(
                `SELECT service, operation, estimated_cost as cost_usd, created_at
                 FROM api_expenses ORDER BY created_at DESC LIMIT 10`
            );
        } catch {}

        res.json({
            timestamp: new Date().toISOString(),
            queues,
            schedulerJobs,
            recentVideoJobs,
            recentExpenses,
        });
    } catch (err: any) {
        logger.error({ msg: "Ops endpoint error", error: err.message });
        res.status(500).json({ error: err.message });
    }
});

// ─── HEALTH ───
apiRouter.get("/health", async (req, res) => {
    const checks: Record<string, string> = { api: "ok" };

    // Check Redis
    try {
        const { redisConnection } = await import("../queue/connection");
        await redisConnection.ping();
        checks.redis = "ok";
    } catch {
        checks.redis = "error";
    }

    // Check Postgres
    try {
        await query("SELECT 1");
        checks.postgres = "ok";
    } catch {
        checks.postgres = "error";
    }

    const allOk = Object.values(checks).every(v => v === "ok");
    res.status(allOk ? 200 : 503).json({ status: allOk ? "ok" : "degraded", checks });
});
