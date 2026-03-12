import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WAHA_URL = "http://172.245.56.50:3000";
const WAHA_KEY = "4fc7e008d7d24fc995475029effc8fa8";
const SHAI_PHONE = "14695885133@c.us";

// ---------------------------------------------------------------------------
// WhatsApp helper — fire-and-forget, never throws
// ---------------------------------------------------------------------------
async function notifyWhatsApp(message: string): Promise<void> {
  try {
    await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WAHA_KEY}`,
      },
      body: JSON.stringify({
        session: "default",
        chatId: SHAI_PHONE,
        text: message,
      }),
    });
    console.log("[esignatures] WhatsApp notification sent");
  } catch (err) {
    console.error("[esignatures] WhatsApp notification failed:", err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/esignatures
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[esignatures] Webhook received:", JSON.stringify(body, null, 2));

    const { status: event } = body;
    const contractData = body.data?.contract;
    const signerData = body.data?.signer;

    const contractId: string | undefined = contractData?.id;
    const signerName: string = signerData?.name || "Unknown";
    const signerEmail: string = signerData?.email || "Unknown";
    const contractTitle: string = contractData?.title || "Untitled";
    const metadata: string | undefined = contractData?.metadata;

    if (!contractId) {
      console.log("[esignatures] No contract ID in payload, skipping");
      return NextResponse.json({ received: true });
    }

    // Map eSignatures event names to our status values
    const statusMap: Record<string, string> = {
      "contract.signed": "signed",
      "contract.viewed": "viewed",
      "contract.declined": "declined",
    };

    const newStatus = statusMap[event];
    if (!newStatus) {
      console.log(`[esignatures] Unhandled event: ${event}`);
      return NextResponse.json({ received: true });
    }

    console.log(`[esignatures] Event=${event} contractId=${contractId} signer=${signerEmail}`);

    // ------------------------------------------------------------------
    // 1. Update CustomSolutionsClient where contractId matches
    // ------------------------------------------------------------------
    try {
      const updateData: Record<string, unknown> = {
        contractStatus: newStatus,
        updatedAt: new Date(),
      };

      // On signed, also advance the client status
      if (event === "contract.signed") {
        updateData.status = "signed";
      }

      const updated = await prisma.customSolutionsClient.updateMany({
        where: { contractId },
        data: updateData,
      });

      console.log(`[esignatures] CustomSolutionsClient updated: ${updated.count} row(s)`);
    } catch (err) {
      console.error("[esignatures] CustomSolutionsClient update failed:", err);
    }

    // ------------------------------------------------------------------
    // 2. Update Tenant.settings where contractId is stored (raw query)
    //    settings is a JSONB column — look for contractId inside it
    // ------------------------------------------------------------------
    try {
      const result = await prisma.$executeRaw`
        UPDATE "Tenant"
        SET
          settings = jsonb_set(
            COALESCE(settings, '{}'::jsonb),
            '{contractStatus}',
            ${JSON.stringify(newStatus)}::jsonb
          ),
          "updatedAt" = NOW()
        WHERE settings->>'contractId' = ${contractId}
      `;
      if (result > 0) {
        console.log(`[esignatures] Tenant settings updated: ${result} row(s)`);
      }
    } catch (err) {
      console.error("[esignatures] Tenant raw query failed:", err);
    }

    // ------------------------------------------------------------------
    // 3. WhatsApp notifications for signed / declined
    // ------------------------------------------------------------------
    if (event === "contract.signed") {
      await notifyWhatsApp(
        `✅ Contract SIGNED!\n\n` +
          `📄 ${contractTitle}\n` +
          `👤 ${signerName} (${signerEmail})\n` +
          `🆔 ${contractId}\n` +
          (metadata ? `📎 ${metadata}\n` : "") +
          `\nTime to onboard! 🚀`
      );
    }

    if (event === "contract.declined") {
      await notifyWhatsApp(
        `❌ Contract DECLINED\n\n` +
          `📄 ${contractTitle}\n` +
          `👤 ${signerName} (${signerEmail})\n` +
          `🆔 ${contractId}\n` +
          (metadata ? `📎 ${metadata}\n` : "") +
          `\nFollow up ASAP.`
      );
    }
  } catch (error) {
    console.error("[esignatures] Webhook processing error:", error);
  }

  // Always return 200 — webhook best practice
  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// GET — health check
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json({ status: "eSignatures webhook active" });
}
