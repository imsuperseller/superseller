import { Router, Request, Response } from "express";
import { z } from "zod";
import { query, queryOne } from "../db/client";
import { videoPipelineQueue, VideoPipelineJobData } from "../queue/queues";
import { logger } from "../utils/logger";
import { scrapeZillowListing } from "../services/apify";
import { uploadToR2, buildR2Key } from "../services/r2";
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
        [listingId, userId, ["kling_3", "veo_31_fast", "veo_31_quality"].includes(model || "") ? model : "kling_3"]
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
});

apiRouter.post("/jobs/from-zillow", async (req: Request, res: Response) => {
    const parsed = fromZillowSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

    const { addressOrUrl, userId, floorplanPath } = parsed.data;

    const user = await queryOne("SELECT id FROM users WHERE id = $1", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const scraped = await scrapeZillowListing(addressOrUrl, 30);
    if (!scraped.photos?.length) return res.status(400).json({ error: "No photos found for listing" });

    const exteriorPhoto = scraped.photos[0];
    const additionalPhotos = scraped.photos.slice(1);

    let floorplanUrl: string | null = null;
    if (floorplanPath) {
        const absPath = join(process.cwd(), floorplanPath.replace(/^\.\//, ""));
        if (existsSync(absPath)) {
            floorplanUrl = await uploadToR2(absPath, buildR2Key(userId, `floorplan-${Date.now()}`, "floorplan.webp"));
        }
    }

    const [listing] = await query(
        `INSERT INTO listings (user_id, address, city, state, zip, property_type, bedrooms, bathrooms, sqft, listing_price, exterior_photo_url, floorplan_url, additional_photos)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
});

// ─── DEV: Ensure test user (for E2E only) ───
apiRouter.post("/dev/ensure-test-user", async (_req: Request, res: Response) => {
    const clerkId = "e2e-test-user";
    const existing = await queryOne("SELECT id FROM users WHERE clerk_id = $1", [clerkId]);
    if (existing) return res.json({ userId: existing.id });
    const [u] = await query(
        `INSERT INTO users (clerk_id, email, full_name) VALUES ($1, $2, $3) RETURNING id`,
        [clerkId, "e2e@test.local", "E2E Test User"]
    );
    res.status(201).json({ userId: u.id });
});

// ─── HEALTH ───
apiRouter.get("/health", (req, res) => res.json({ status: "ok" }));
