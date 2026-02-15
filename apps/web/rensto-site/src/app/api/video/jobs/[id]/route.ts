import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";
const IS_DEV = process.env.NODE_ENV === "development";

/** Mock job for local dev when VIDEO_WORKER_URL is not set. Enables UI testing and wireframe alignment. */
function getMockJob(id: string) {
    return {
        job: {
            id,
            status: "generating_clips",
            progress_percent: 45,
            current_step: "generating_clips",
        },
        listing: {
            address: "123 Mock Street",
            city: "Austin",
            state: "TX",
            zip: "78701",
            exterior_photo_url: undefined,
        },
        clips: [
            { id: "c1", clip_number: 1, status: "completed", prompt: "Realtor on pathway approaching front door...", video_url: undefined },
            { id: "c2", clip_number: 2, status: "completed", prompt: "Entering foyer with guest...", video_url: undefined },
            { id: "c3", clip_number: 3, status: "generating", prompt: "Living room reveal, fireplace focal point..." },
            { id: "c4", clip_number: 4, status: "pending", prompt: "Kitchen island gesture..." },
            { id: "c5", clip_number: 5, status: "pending", prompt: "Master suite reveal..." },
        ],
    };
}

/** Fetch job + listing + clips from DB when worker is unreachable. Returns real data (address, floorplan, exterior) or null. */
async function fetchJobFromDb(jobId: string): Promise<{ job: any; listing: any; clips: any[] } | null> {
    try {
        const job = await prisma.$queryRawUnsafe<any[]>(
            "SELECT * FROM video_jobs WHERE id = $1 LIMIT 1",
            jobId
        );
        if (!job?.[0]) return null;
        const j = job[0];

        const listingRows = await prisma.$queryRawUnsafe<any[]>(
            "SELECT * FROM listings WHERE id = $1 LIMIT 1",
            j.listing_id
        );
        const listing = listingRows?.[0] ?? null;
        if (!listing) return null;

        let realtorAvatarUrl: string | undefined;
        try {
            const userRows = await prisma.$queryRawUnsafe<any[]>(
                "SELECT avatar_url FROM users WHERE id = $1 LIMIT 1",
                j.user_id
            );
            realtorAvatarUrl = userRows?.[0]?.avatar_url ?? undefined;
        } catch {
            // users table may not exist if worker uses separate DB
        }

        const clipsRows = await prisma.$queryRawUnsafe<any[]>(
            "SELECT * FROM clips WHERE video_job_id = $1 ORDER BY clip_number",
            jobId
        );
        const clips = (clipsRows ?? []).map((c: any) => ({
            id: c.id,
            clip_number: c.clip_number,
            status: c.status === "complete" ? "done" : c.status,
            prompt: c.prompt,
            video_url: c.video_url,
        }));

        return {
            job: {
                id: j.id,
                status: j.status,
                progress_percent: j.progress_percent ?? j.progress,
                current_step: j.current_step ?? j.currentStep,
                error_message: j.error_message,
                finalUrl: j.master_video_url ?? j.finalUrl,
            },
            listing: {
                address: listing.address,
                city: listing.city,
                state: listing.state,
                zip: listing.zip,
                exterior_photo_url: listing.exterior_photo_url,
                floorplan_url: listing.floorplan_url,
                realtor_avatar_url: realtorAvatarUrl,
            },
            clips,
        };
    } catch {
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    if (!WORKER_URL) {
        if (IS_DEV) {
            return NextResponse.json(getMockJob(id));
        }
        return NextResponse.json(
            { error: "Video worker not configured. Set VIDEO_WORKER_URL in Vercel." },
            { status: 503 }
        );
    }
    try {
        const res = await fetch(`${WORKER_URL.replace(/\/$/, "")}/api/jobs/${id}`, {
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            // Worker 404/5xx: try DB for real address, floorplan, clips.
            const fromDb = await fetchJobFromDb(id);
            if (fromDb) {
                return NextResponse.json({ ...fromDb, _fallback: true });
            }
            if (IS_DEV) {
                return NextResponse.json(getMockJob(id));
            }
            return NextResponse.json(data, { status: res.status });
        }
        return NextResponse.json(data);
    } catch (err: any) {
        // Worker unreachable: try DB fallback for real address, floorplan, exterior, clips.
        const fromDb = await fetchJobFromDb(id);
        if (fromDb) {
            return NextResponse.json({ ...fromDb, _fallback: true });
        }
        // No DB record or DB error: use mock so page at least loads.
        const mock = { ...getMockJob(id), _fallback: true };
        if (IS_DEV) {
            return NextResponse.json(getMockJob(id));
        }
        return NextResponse.json(mock);
    }
}
