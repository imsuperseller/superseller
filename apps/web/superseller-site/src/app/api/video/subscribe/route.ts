import { NextRequest, NextResponse } from "next/server";
import { createSubscription } from "@/lib/paypal";
import { verifySession } from "@/lib/auth";

const PLAN_MAP: Record<string, string | undefined> = {
    starter: process.env.PAYPAL_STARTER_PLAN_ID,
    pro: process.env.PAYPAL_PRO_PLAN_ID,
    team: process.env.PAYPAL_TEAM_PLAN_ID,
};

const CREDITS_MAP: Record<string, number> = {
    starter: 500,
    pro: 1500,
    team: 4000,
};

export async function POST(req: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || !session.email) {
        return NextResponse.json({ error: "Please log in first" }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan || !PLAN_MAP[plan]) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planId = PLAN_MAP[plan];
    if (!planId) {
        return NextResponse.json(
            { error: "PayPal plans not configured yet. Contact shai@superseller.agency for early access." },
            { status: 503 }
        );
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://superseller.agency";

    const subscription = await createSubscription({
        planId,
        subscriberEmail: session.email,
        returnUrl: `${origin}/video?subscribed=1`,
        cancelUrl: `${origin}/video/pricing`,
        metadata: {
            subscriptionType: "video",
            plan,
            creditsPerCycle: String(CREDITS_MAP[plan] || 500),
            userId: session.clientId || "",
        },
    });

    return NextResponse.json({ url: subscription.approvalUrl });
}
