import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "http://172.245.56.50:3002";

/** GET /api/video/jobs — list video jobs for the authenticated user. */
export async function GET(request: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WORKER_URL) {
        return NextResponse.json({ jobs: [], error: "Video worker not configured." });
    }

    try {
        const workerBase = WORKER_URL.replace(/\/$/, "");
        const res = await fetch(
            `${workerBase}/api/jobs?userId=${encodeURIComponent(session.clientId)}`
        );
        if (!res.ok) {
            return NextResponse.json({ jobs: [], error: `Worker error: ${res.status}` });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ jobs: [], error: msg });
    }
}
