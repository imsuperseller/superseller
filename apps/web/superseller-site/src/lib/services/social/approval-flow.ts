/**
 * SocialHub — WhatsApp Approval Flow via WAHA Pro
 * Sends content for approval via WhatsApp, processes approve/reject replies.
 */

const WAHA_BASE = process.env.WAHA_BASE_URL || "http://172.245.56.50:3000";
const WAHA_KEY = process.env.WAHA_API_KEY || "${WAHA_API_KEY}";
const WAHA_SESSION = process.env.WAHA_SESSION || "superseller-whatsapp";

export interface ApprovalRequest {
  postId: string;
  approverPhone: string; // WhatsApp number with country code, e.g. "972501234567"
  platform: string;
  contentPreview: string; // First ~200 chars of the post
  imageUrl?: string;
  tenantName?: string; // e.g. "Elite Pro Remodeling", "Rensto"
  igAccount?: string; // e.g. "@myrensto"
}

export interface ApprovalResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a content approval request via WhatsApp.
 * The approver replies "approve" or "reject [reason]".
 */
export async function sendApprovalRequest(
  req: ApprovalRequest
): Promise<ApprovalResult> {
  const chatId = `${req.approverPhone}@c.us`;

  const accountLine = req.tenantName
    ? `Account: *${req.tenantName}*${req.igAccount ? ` (${req.igAccount})` : ""}`
    : null;

  const message = [
    `*SocialHub — Content Approval*`,
    ``,
    accountLine,
    `Platform: *${req.platform}*`,
    `Post ID: \`${req.postId.slice(0, 8)}\``,
    ``,
    `---`,
    req.contentPreview.length > 300
      ? req.contentPreview.slice(0, 300) + "..."
      : req.contentPreview,
    `---`,
    ``,
    `Reply with:`,
    `*approve* — to publish now`,
    `*reject [reason]* — to reject with feedback`,
    `*edit [instructions]* — to request changes`,
  ].filter(Boolean).join("\n");

  try {
    // Send text message
    const textRes = await fetch(`${WAHA_BASE}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_KEY,
      },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        text: message,
      }),
    });

    if (!textRes.ok) {
      const err = await textRes.text();
      return { sent: false, error: `WAHA text error ${textRes.status}: ${err}` };
    }

    const textData = await textRes.json();

    // If there's an image, send it as a follow-up
    if (req.imageUrl) {
      await fetch(`${WAHA_BASE}/api/sendImage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_KEY,
        },
        body: JSON.stringify({
          session: WAHA_SESSION,
          chatId,
          file: { url: req.imageUrl },
          caption: "Preview image for the post above",
        }),
      });
    }

    return {
      sent: true,
      messageId: textData.key?.id || textData.id,
    };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Parse an incoming WhatsApp message as an approval response.
 * Returns the action and optional reason/instructions.
 */
export function parseApprovalResponse(
  messageBody: string
): { action: "approve" | "reject" | "edit" | "unknown"; reason?: string } {
  const text = messageBody.trim().toLowerCase();

  if (text === "approve" || text === "yes" || text === "ok" || text === "אשר") {
    return { action: "approve" };
  }

  if (text.startsWith("reject") || text.startsWith("no") || text.startsWith("דחה")) {
    const reason = messageBody.replace(/^(reject|no|דחה)\s*/i, "").trim();
    return { action: "reject", reason: reason || undefined };
  }

  if (text.startsWith("edit") || text.startsWith("change") || text.startsWith("ערוך")) {
    const reason = messageBody.replace(/^(edit|change|ערוך)\s*/i, "").trim();
    return { action: "edit", reason: reason || undefined };
  }

  return { action: "unknown" };
}

/**
 * Send a notification that content was published.
 */
export async function sendPublishNotification(
  phone: string,
  platform: string,
  postUrl?: string
): Promise<void> {
  const chatId = `${phone}@c.us`;
  const message = postUrl
    ? `*Published!* Your ${platform} post is live: ${postUrl}`
    : `*Published!* Your ${platform} post is live.`;

  await fetch(`${WAHA_BASE}/api/sendText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_KEY,
    },
    body: JSON.stringify({
      session: WAHA_SESSION,
      chatId,
      text: message,
    }),
  }).catch(() => {}); // Best-effort notification
}
