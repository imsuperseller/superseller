import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    if (!WORKER_URL) {
        return NextResponse.json(
            { error: "Video worker not configured. Set VIDEO_WORKER_URL." },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const clipNumbers = Array.isArray(body.clipNumbers) ? body.clipNumbers : [];
        if (clipNumbers.length === 0 || !clipNumbers.every((n: unknown) => typeof n === "number" && n >= 1)) {
            return NextResponse.json(
                { error: "clipNumbers required: array of clip numbers to regenerate (e.g. [2, 3])" },
                { status: 400 }
            );
        }

        const workerBase = WORKER_URL.replace(/\/$/, "");
        const res = await fetch(`${workerBase}/api/jobs/${id}/regenerate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clipNumbers }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json(
                { error: data.error || `Worker error: ${res.status}` },
                { status: res.status }
            );
        }

        return NextResponse.json({
            success: true,
            master_video_url: data.master_video_url,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
