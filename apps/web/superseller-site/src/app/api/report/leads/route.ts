import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RateLimiter } from "@/lib/rate-limiter";

const leadRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many submissions. Please try again later.",
});

export async function POST(req: NextRequest) {
  try {
    // Origin check — only allow requests from superseller.agency domains
    const origin = req.headers.get("origin") || "";
    if (
      origin &&
      !origin.endsWith(".superseller.agency") &&
      origin !== "https://superseller.agency"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = leadRateLimiter.check(req);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { slug, phone, name } = body;
    let { email } = body;

    if (!slug || !email) {
      return NextResponse.json(
        { error: "Missing required fields: slug, email" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (typeof slug !== "string" || !/^[a-z0-9-]{3,100}$/.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    // Validate email: max 254 chars, proper format
    email = String(email).trim();
    if (
      email.length > 254 ||
      !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Validate phone if provided
    if (phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(String(phone))) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Validate name if provided: max 255 chars, trimmed
    const sanitizedName = name ? String(name).trim().slice(0, 255) : null;

    // Find the prospect report
    const report = await prisma.prospectReport.findFirst({
      where: { slug, active: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Create Lead record — use a system userId since prospect reports are not user-owned
    const systemUserId = process.env.SYSTEM_USER_ID || "system";

    const lead = await prisma.lead.create({
      data: {
        userId: systemUserId,
        source: "prospect_report",
        sourceId: slug,
        name: sanitizedName,
        email,
        phone: phone || null,
        status: "new",
        qualificationStatus: "unqualified",
        metadata: {
          prospectReportId: report.id,
          prospectReportSlug: slug,
          businessName: report.businessName,
          vertical: report.vertical,
          recommendedProduct: report.recommendedProduct,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    // Increment leadsCaptured counter (fire-and-forget)
    prisma.prospectReport
      .update({
        where: { id: report.id },
        data: { leadsCaptured: { increment: 1 } },
      })
      .catch(() => {});

    // Notify via WAHA (fire-and-forget, don't fail if WAHA is down)
    notifyNewProspectLead(report, { email, phone, name }).catch((err) =>
      console.error("[ProspectReport] Lead notification failed:", err)
    );

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (err) {
    console.error("[ProspectReport] Lead submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function notifyNewProspectLead(
  report: { slug: string; businessName: string; vertical: string },
  lead: { email: string; phone?: string; name?: string }
) {
  const wahaUrl = process.env.WAHA_BASE_URL;
  const wahaKey = process.env.WAHA_API_KEY;
  const wahaSession = process.env.WAHA_SESSION || "superseller-whatsapp";
  const notifyNumber = process.env.SUPERSELLER_NOTIFY_WHATSAPP;

  if (!wahaUrl || !wahaKey || !notifyNumber) return;

  const message = [
    `*New Prospect Report Lead*`,
    ``,
    `*Report:* ${report.businessName} (${report.vertical})`,
    `*Slug:* ${report.slug}`,
    ``,
    lead.name ? `*Name:* ${lead.name}` : null,
    `*Email:* ${lead.email}`,
    lead.phone ? `*Phone:* ${lead.phone}` : null,
    ``,
    `_${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}_`,
  ]
    .filter(Boolean)
    .join("\n");

  let chatId = notifyNumber.replace(/[^0-9]/g, "");
  if (!chatId.includes("@")) chatId = chatId + "@c.us";

  try {
    const res = await fetch(`${wahaUrl}/api/sendText`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": wahaKey },
      body: JSON.stringify({ chatId, text: message, session: wahaSession }),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      console.log(`[ProspectReport] WhatsApp notification sent for ${report.slug}`);
    } else {
      console.warn(`[ProspectReport] WAHA returned ${res.status} for ${report.slug}`);
    }
  } catch (err) {
    console.warn(
      `[ProspectReport] WAHA failed for ${report.slug}:`,
      err instanceof Error ? err.message : err
    );
  }
}
