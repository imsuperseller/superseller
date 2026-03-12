import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessType,
      businessName,
      challenge,
      currentStack,
      name,
      phone,
      email,
      source,
      submittedAt,
    } = body;

    if (!businessType || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Save to Requirement table
    const clientId = `discover-${Date.now()}`;
    try {
      await prisma.requirement.upsert({
        where: { id: clientId },
        update: {
          metadata: body,
          status: "submitted",
        },
        create: {
          id: clientId,
          clientId,
          type: "discovery",
          metadata: body,
          status: "submitted",
        },
      });
    } catch (pgError) {
      console.error("[Discover] DB save failed:", pgError);
    }

    // 2. Send WhatsApp notification via WAHA
    const wahaUrl = process.env.WAHA_BASE_URL;
    const wahaKey = process.env.WAHA_API_KEY;
    const wahaSession = process.env.WAHA_SESSION || "superseller-whatsapp";
    const notifyPhone = process.env.LEAD_NOTIFY_PHONE || "18184249911";

    if (wahaUrl && wahaKey) {
      const chatId = `${notifyPhone.replace(/\D/g, "")}@c.us`;
      const message = [
        `🎯 *New Discovery Lead*`,
        ``,
        `*Name:* ${name || "Not provided"}`,
        `*Phone:* ${phone}`,
        `*Email:* ${email || "Not provided"}`,
        `*Business:* ${businessName || "Not provided"}`,
        `*Type:* ${businessType}`,
        `*Challenge:* ${challenge || "Not specified"}`,
        `*Current Setup:* ${currentStack || "Not specified"}`,
        ``,
        `*Source:* Smart Discovery`,
        `*Time:* ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}`,
      ].join("\n");

      fetch(`${wahaUrl}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": wahaKey,
        },
        body: JSON.stringify({ chatId, text: message, session: wahaSession }),
      }).catch((err) => console.error("[Discover] WAHA notification failed:", err));
    }

    // 3. Send email notification via Resend (backup)
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFY_EMAIL || "shai@superseller.agency";

    if (resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SuperSeller AI <leads@superseller.agency>",
          to: [notifyEmail],
          subject: `New Discovery Lead: ${businessName || name || phone}`,
          text: [
            `New lead from Smart Discovery`,
            ``,
            `Name: ${name || "Not provided"}`,
            `Phone: ${phone}`,
            `Email: ${email || "Not provided"}`,
            `Business: ${businessName || "Not provided"}`,
            `Type: ${businessType}`,
            `Challenge: ${challenge || "Not specified"}`,
            `Current Setup: ${currentStack || "Not specified"}`,
            ``,
            `Submitted: ${submittedAt || new Date().toISOString()}`,
          ].join("\n"),
        }),
      }).catch((err) => console.error("[Discover] Resend notification failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Discover Intake Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
