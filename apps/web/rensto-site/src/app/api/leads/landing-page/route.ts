import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, name, phone, email } = body;

    if (!slug || !name || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields: slug, name, phone, email" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Find the landing page + owner email for fallback notification
    const landingPage = await prisma.landingPage.findUnique({
      where: { slug, active: true },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!landingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Create the lead linked to the landing page owner
    const lead = await prisma.lead.create({
      data: {
        userId: landingPage.userId,
        source: "landing_page",
        sourceId: slug,
        name,
        phone,
        email,
        status: "new",
        qualificationStatus: "unqualified",
        metadata: {
          landingPageId: landingPage.id,
          landingPageSlug: slug,
          submittedAt: new Date().toISOString(),
          userAgent: req.headers.get("user-agent") || "",
        },
      },
    });

    // Increment submission counter
    await prisma.landingPage.update({
      where: { id: landingPage.id },
      data: { submissions: { increment: 1 } },
    });

    // Notify page owner (fire-and-forget): WAHA WhatsApp first, Resend email fallback
    notifyPageOwner(landingPage, { name, phone, email }).catch(
      (err) => console.error("Lead notification failed:", err)
    );

    return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
  } catch (err) {
    console.error("Lead submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function notifyPageOwner(
  page: {
    whatsappNumber: string | null;
    email: string | null;
    businessName: string;
    slug: string;
    user: { email: string; name: string | null } | null;
  },
  lead: { name: string; phone: string; email: string }
) {
  const message = [
    `*ליד חדש מדף הנחיתה* (${page.slug})`,
    ``,
    `*שם:* ${lead.name}`,
    `*טלפון:* ${lead.phone}`,
    `*אימייל:* ${lead.email}`,
    ``,
    `_${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}_`,
  ].join("\n");

  let whatsappSent = false;

  // 1. Try WAHA WhatsApp (self-hosted, on RackNerd)
  const wahaUrl = process.env.WAHA_BASE_URL;
  const wahaKey = process.env.WAHA_API_KEY;
  const wahaSession = process.env.WAHA_SESSION || "rensto-whatsapp";

  if (wahaUrl && wahaKey && page.whatsappNumber) {
    try {
      // Normalize phone to chatId: strip non-digits, append @c.us
      let chatId = page.whatsappNumber.replace(/[^0-9]/g, "");
      if (!chatId.includes("@")) chatId = chatId + "@c.us";

      const res = await fetch(`${wahaUrl}/api/sendText`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": wahaKey },
        body: JSON.stringify({ chatId, text: message, session: wahaSession }),
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) {
        whatsappSent = true;
        console.log(`[Lead Notification] WhatsApp sent to ${chatId} for ${page.slug}`);
      } else {
        console.warn(`[Lead Notification] WAHA returned ${res.status} for ${page.slug}`);
      }
    } catch (err) {
      console.warn(`[Lead Notification] WAHA failed for ${page.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  // 2. Resend email fallback (always send — page owner should get email too)
  const ownerEmail = page.email || page.user?.email;
  if (ownerEmail) {
    try {
      await sendEmail({
        to: ownerEmail,
        template: "system-alert" as any,
        data: {
          severity: "warning",
          serviceName: `דף נחיתה: ${page.businessName}`,
          condition: "ליד חדש",
          message: `שם: ${lead.name}\nטלפון: ${lead.phone}\nאימייל: ${lead.email}`,
        },
      });
      console.log(`[Lead Notification] Email sent to ${ownerEmail} for ${page.slug}`);
    } catch (err) {
      console.warn(`[Lead Notification] Email failed for ${page.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  if (!whatsappSent && !ownerEmail) {
    console.log(
      `[Lead Notification] No delivery channel for ${page.businessName} (${page.slug}):`,
      `${lead.name} | ${lead.phone} | ${lead.email}`
    );
  }
}
