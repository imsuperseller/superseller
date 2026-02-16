import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { CreditService } from "@/lib/credits";

const WORKER_URL = process.env.VIDEO_WORKER_URL || "";
const REGEN_CREDIT_COST_PER_CLIP = parseInt(process.env.REGEN_CREDIT_COST || "10", 10);

/** POST /api/video/jobs/[id]/regenerate — regenerate selected clips. Requires auth + credits. */
export async function POST(
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
        return NextResponse.json({ error: "Video worker not configured." }, { status: 503 });
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

        // Check credits for regeneration
        const totalCost = clipNumbers.length * REGEN_CREDIT_COST_PER_CLIP;
        const balance = await CreditService.checkBalance(session.clientId);
        if (balance < totalCost) {
            return NextResponse.json(
                {
                    error: `Insufficient credits for regeneration. Need ${totalCost} credits (${clipNumbers.length} clips x ${REGEN_CREDIT_COST_PER_CLIP}) but have ${balance}.`,
                    needCredits: true,
                    required: totalCost,
                    available: balance,
                },
                { status: 402 }
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

        // Deduct credits after successful regeneration
        await CreditService.deductCredits(
            session.clientId,
            totalCost,
            "clip_regeneration",
            id,
            { clipNumbers, costPerClip: REGEN_CREDIT_COST_PER_CLIP }
        );

        return NextResponse.json({
            success: true,
            master_video_url: data.master_video_url,
            creditsDeducted: totalCost,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
