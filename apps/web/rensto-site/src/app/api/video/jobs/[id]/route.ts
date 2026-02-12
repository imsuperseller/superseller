import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    if (!WORKER_URL) {
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
            return NextResponse.json(data, { status: res.status });
        }
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message || "Worker unreachable" },
            { status: 502 }
        );
    }
}
