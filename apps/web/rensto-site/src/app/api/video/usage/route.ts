import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/video/usage — return usage events for the authenticated user. */
export async function GET() {
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const events = await prisma.usageEvent.findMany({
            where: { userId: session.clientId },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        return NextResponse.json({ events });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
