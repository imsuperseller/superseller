import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { CreditService } from "@/lib/credits";

/** GET /api/video/credits — return current user's credit balance. */
export async function GET() {
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const balance = await CreditService.getBalance(session.clientId);
        return NextResponse.json({ balance });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
