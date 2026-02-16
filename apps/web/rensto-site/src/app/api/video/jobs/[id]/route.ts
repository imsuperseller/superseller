import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";
const IS_DEV = process.env.NODE_ENV === "development";

/** Fetch job + listing + clips from DB when worker is unreachable. */
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
            // users table schema may differ
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
            to_room: c.to_room,
        }));

        return {
            job: {
                id: j.id,
                user_id: j.user_id,
                status: j.status,
                progress_percent: j.progress_percent ?? j.progress,
                current_step: j.current_step ?? j.currentStep,
                error_message: j.error_message,
                finalUrl: j.master_video_url ?? j.finalUrl,
                vertical_video_url: j.vertical_video_url,
                square_video_url: j.square_video_url,
                portrait_video_url: j.portrait_video_url,
                thumbnail_url: j.thumbnail_url,
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
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

    if (!WORKER_URL) {
        if (IS_DEV) {
            const fromDb = await fetchJobFromDb(id);
            if (fromDb) return NextResponse.json(fromDb);
        }
        return NextResponse.json(
            { error: "Video worker not configured." },
            { status: 503 }
        );
    }

    try {
        const res = await fetch(`${WORKER_URL.replace(/\/$/, "")}/api/jobs/${id}`, {
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const fromDb = await fetchJobFromDb(id);
            if (fromDb) {
                return NextResponse.json({ ...fromDb, _fallback: true });
            }
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        const fromDb = await fetchJobFromDb(id);
        if (fromDb) {
            return NextResponse.json({ ...fromDb, _fallback: true });
        }
        return NextResponse.json(
            { error: err.message || "Worker unreachable" },
            { status: 503 }
        );
    }
}
