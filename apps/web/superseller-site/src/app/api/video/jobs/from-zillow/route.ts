import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { CreditService } from "@/lib/credits";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";
const VIDEO_CREDIT_COST = parseInt(process.env.VIDEO_CREDIT_COST || "50", 10);

/** POST /api/video/jobs/from-zillow — create video from Zillow URL. Requires auth + credits. */
export async function POST(request: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WORKER_URL) {
        return NextResponse.json(
            { error: "Video worker not configured." },
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

        // Check credits before creating job
        const balance = await CreditService.checkBalance(session.clientId);
        if (balance < VIDEO_CREDIT_COST) {
            return NextResponse.json(
                {
                    error: `Insufficient credits. You need ${VIDEO_CREDIT_COST} credits but have ${balance}. Purchase more credits to continue.`,
                    needCredits: true,
                    required: VIDEO_CREDIT_COST,
                    available: balance,
                },
                { status: 402 }
            );
        }

        const workerBase = WORKER_URL.replace(/\/$/, "");
        const userId = session.clientId;

        const payload: Record<string, unknown> = {
            addressOrUrl,
            userId,
            floorplanPath: body.floorplanPath || undefined,
        };
        if (typeof body.floorplanBase64 === "string") {
            payload.floorplanBase64 = body.floorplanBase64;
            if (typeof body.floorplanContentType === "string")
                payload.floorplanContentType = body.floorplanContentType;
        }
        if (typeof body.realtorBase64 === "string") {
            payload.realtorBase64 = body.realtorBase64;
            if (typeof body.realtorContentType === "string")
                payload.realtorContentType = body.realtorContentType;
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

        // Deduct credits after successful job creation
        await CreditService.deductCredits(
            session.clientId,
            VIDEO_CREDIT_COST,
            "video_generation",
            jobId,
            { addressOrUrl }
        );

        return NextResponse.json({ job: { id: jobId }, listing: data.listing });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
