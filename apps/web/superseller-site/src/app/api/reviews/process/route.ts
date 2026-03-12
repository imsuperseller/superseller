import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const maxDuration = 30;

export async function GET(request: Request) {
  // Verify cron secret (Vercel crons send this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find pending review requests that are due
    const pending = await prisma.reviewRequest.findMany({
      where: {
        status: "pending",
        scheduledFor: { lte: new Date() },
      },
      take: 10, // Process in batches
      orderBy: { scheduledFor: "asc" },
    });

    if (pending.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    const results: { id: string; status: string }[] = [];

    for (const review of pending) {
      let whatsappSent = false;
      let emailSent = false;
      let errorLog = "";

      // Send WhatsApp via WAHA
      if (review.clientPhone) {
        try {
          whatsappSent = await sendWhatsAppReview(review);
        } catch (err) {
          errorLog += `WhatsApp error: ${err instanceof Error ? err.message : String(err)}. `;
        }
      }

      // Send email via Resend
      if (review.clientEmail) {
        try {
          emailSent = await sendEmailReview(review);
        } catch (err) {
          errorLog += `Email error: ${err instanceof Error ? err.message : String(err)}. `;
        }
      }

      const sent = whatsappSent || emailSent;
      await prisma.reviewRequest.update({
        where: { id: review.id },
        data: {
          status: sent ? "sent" : "failed",
          sentAt: sent ? new Date() : null,
          whatsappSent,
          emailSent,
          errorLog: errorLog || null,
        },
      });

      results.push({ id: review.id, status: sent ? "sent" : "failed" });
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("[Review Process Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

interface ReviewData {
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  businessName: string;
  googleReviewUrl: string | null;
  yelpReviewUrl: string | null;
}

async function sendWhatsAppReview(review: ReviewData): Promise<boolean> {
  const wahaUrl = process.env.WAHA_BASE_URL;
  const wahaKey = process.env.WAHA_API_KEY;
  const wahaSession = process.env.WAHA_SESSION || "superseller-whatsapp";

  if (!wahaUrl || !wahaKey || !review.clientPhone) return false;

  const phone = review.clientPhone.replace(/\D/g, "");
  const chatId = `${phone}@c.us`;

  const lines = [
    `Hi ${review.clientName}!`,
    ``,
    `Thank you for visiting ${review.businessName} today. We hope you loved your experience!`,
    ``,
    `If you have a moment, we'd really appreciate a quick review — it helps other clients find us:`,
  ];

  if (review.googleReviewUrl) {
    lines.push(``, `Google Review: ${review.googleReviewUrl}`);
  }
  if (review.yelpReviewUrl) {
    lines.push(`Yelp Review: ${review.yelpReviewUrl}`);
  }

  lines.push(``, `Thank you so much! We look forward to seeing you again.`);

  const res = await fetch(`${wahaUrl}/api/sendText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": wahaKey,
    },
    body: JSON.stringify({
      chatId,
      text: lines.join("\n"),
      session: wahaSession,
    }),
  });

  if (!res.ok) {
    throw new Error(`WAHA ${res.status}: ${await res.text()}`);
  }
  return true;
}

async function sendEmailReview(review: ReviewData): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !review.clientEmail) return false;

  const reviewLinks: string[] = [];
  if (review.googleReviewUrl) {
    reviewLinks.push(
      `<a href="${review.googleReviewUrl}" style="display:inline-block;padding:12px 28px;background:#C9A96E;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:8px 4px;">Leave a Google Review</a>`
    );
  }
  if (review.yelpReviewUrl) {
    reviewLinks.push(
      `<a href="${review.yelpReviewUrl}" style="display:inline-block;padding:12px 28px;background:#D32323;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:8px 4px;">Leave a Yelp Review</a>`
    );
  }

  const html = `
    <div style="font-family:'Playfair Display',Georgia,serif;max-width:500px;margin:0 auto;padding:40px 20px;background:#0d0d0d;color:#fff;border-radius:12px;">
      <h1 style="font-size:24px;margin-bottom:8px;color:#C9A96E;">Thank You, ${review.clientName}!</h1>
      <p style="color:#ccc;line-height:1.6;font-family:sans-serif;">
        We loved having you at <strong>${review.businessName}</strong> today. Your satisfaction means the world to us.
      </p>
      <p style="color:#ccc;line-height:1.6;font-family:sans-serif;">
        If you have a moment, we'd be so grateful if you could share your experience:
      </p>
      <div style="text-align:center;margin:24px 0;">
        ${reviewLinks.join("\n")}
      </div>
      <p style="color:#999;font-size:13px;margin-top:32px;font-family:sans-serif;">
        Thank you for choosing ${review.businessName}. We look forward to seeing you again!
      </p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${review.businessName} <reviews@superseller.agency>`,
      to: [review.clientEmail],
      subject: `How was your visit, ${review.clientName}?`,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
  return true;
}
