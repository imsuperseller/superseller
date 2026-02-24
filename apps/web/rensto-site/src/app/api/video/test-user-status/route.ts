import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";

export async function GET() {
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
