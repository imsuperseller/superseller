import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";

/** Ensure test user exists in worker DB; return userId. Used for demo/create flow when no auth. */
async function ensureTestUserId(workerBase: string): Promise<string> {
    const res = await fetch(`${workerBase}/api/dev/ensure-test-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`ensure-test-user failed: ${res.status}`);
    const d = await res.json();
    return d.userId;
}

export async function POST(request: NextRequest) {
    if (!WORKER_URL) {
        return NextResponse.json(
            { error: "Video worker not configured. Set VIDEO_WORKER_URL." },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const addressOrUrl = typeof body.addressOrUrl === "string" ? body.addressOrUrl.trim() : "";
        if (!addressOrUrl) {
            return NextResponse.json(
                { error: "addressOrUrl is required (Zillow URL or address)" },
                { status: 400 }
            );
        }

        const workerBase = WORKER_URL.replace(/\/$/, "");
        const userId = await ensureTestUserId(workerBase);

        const payload: Record<string, unknown> = {
            addressOrUrl,
            userId,
            floorplanPath: body.floorplanPath || undefined,
        };
        if (typeof body.floorplanBase64 === "string") {
            payload.floorplanBase64 = body.floorplanBase64;
            if (typeof body.floorplanContentType === "string") payload.floorplanContentType = body.floorplanContentType;
        }
        if (typeof body.realtorBase64 === "string") {
            payload.realtorBase64 = body.realtorBase64;
            if (typeof body.realtorContentType === "string") payload.realtorContentType = body.realtorContentType;
        }

        const res = await fetch(`${workerBase}/api/jobs/from-zillow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json(
                { error: data.error || `Worker error: ${res.status}` },
                { status: res.status }
            );
        }

        const jobId = data.job?.id;
        if (!jobId) {
            return NextResponse.json(
                { error: "Worker did not return job ID" },
                { status: 502 }
            );
        }

        return NextResponse.json({ job: { id: jobId }, listing: data.listing });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
