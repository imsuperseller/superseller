import { NextRequest, NextResponse } from "next/server";

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
            // Dev fallback: 404 or 5xx → return mock so UI always loads. User gets working page, not "Failed to fetch job".
            if (IS_DEV) {
                return NextResponse.json(getMockJob(id));
            }
            return NextResponse.json(data, { status: res.status });
        }
        return NextResponse.json(data);
    } catch (err: any) {
        // Dev: return mock so UI loads. Prod: return mock with _fallback so page loads with demo + banner (worker offline).
        const mock = { ...getMockJob(id), _fallback: true };
        if (IS_DEV) {
            return NextResponse.json(getMockJob(id));
        }
        return NextResponse.json(mock);
    }
}
