import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Find the landing page
    const landingPage = await prisma.landingPage.findUnique({
      where: { slug, active: true },
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

    // WhatsApp notification (fire-and-forget)
    if (landingPage.whatsappNumber) {
      sendWhatsAppNotification(landingPage, { name, phone, email }).catch(
        (err) => console.error("WhatsApp notification failed:", err)
      );
    }

    return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
  } catch (err) {
    console.error("Lead submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendWhatsAppNotification(
  page: { whatsappNumber: string | null; businessName: string; slug: string },
  lead: { name: string; phone: string; email: string }
) {
  // Simple WhatsApp Cloud API notification to the page owner
  // Uses the WhatsApp Business API if configured, otherwise logs
  const waToken = process.env.WHATSAPP_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!waToken || !waPhoneId || !page.whatsappNumber) {
    console.log(
      `[Lead Notification] New lead for ${page.businessName} (${page.slug}):`,
      `${lead.name} | ${lead.phone} | ${lead.email}`
    );
    return;
  }

  const message = [
    `*ליד חדש מדף הנחיתה* (${page.slug})`,
    ``,
    `*שם:* ${lead.name}`,
    `*טלפון:* ${lead.phone}`,
    `*אימייל:* ${lead.email}`,
    ``,
    `_${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}_`,
  ].join("\n");

  await fetch(
    `https://graph.facebook.com/v19.0/${waPhoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: page.whatsappNumber,
        type: "text",
        text: { body: message },
      }),
    }
  );
}
