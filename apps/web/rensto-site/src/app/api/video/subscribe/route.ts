import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifySession } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16" as any,
});

const PRICE_MAP: Record<string, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    team: process.env.STRIPE_TEAM_PRICE_ID,
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
    if (!plan || !PRICE_MAP[plan]) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = PRICE_MAP[plan];
    if (!priceId || priceId === "price_xxx") {
        return NextResponse.json(
            { error: "Stripe pricing not configured yet. Contact admin@rensto.com for early access." },
            { status: 503 }
        );
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://rensto.com";

    const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.email,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/video?subscribed=1`,
        cancel_url: `${origin}/video/pricing`,
        metadata: {
            flowType: "video-subscription",
            plan,
            creditsPerCycle: String(CREDITS_MAP[plan] || 500),
            userId: session.clientId || "",
        },
    });

    return NextResponse.json({ url: checkoutSession.url });
}
