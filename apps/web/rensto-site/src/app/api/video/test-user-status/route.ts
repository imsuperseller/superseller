import { NextResponse } from "next/server";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";

export async function GET() {
    if (!WORKER_URL) {
        return NextResponse.json({ hasAvatar: false, error: "Worker not configured" }, { status: 200 });
    }
    try {
        const res = await fetch(`${WORKER_URL.replace(/\/$/, "")}/api/dev/ensure-test-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const d = await res.json().catch(() => ({}));
        return NextResponse.json({
            hasAvatar: !!d.hasAvatar,
            userId: d.userId,
        });
    } catch {
        return NextResponse.json({ hasAvatar: false }, { status: 200 });
    }
}
