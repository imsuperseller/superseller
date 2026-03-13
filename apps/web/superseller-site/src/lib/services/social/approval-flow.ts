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

  const preview = req.contentPreview.length > 300
    ? req.contentPreview.slice(0, 300) + "..."
    : req.contentPreview;

  const header = req.tenantName
    ? `📋 *${req.tenantName}*${req.igAccount ? ` → ${req.igAccount}` : ""}`
    : `📋 *Content Approval*`;

  const message = `${header}
📱 ${req.platform.charAt(0).toUpperCase() + req.platform.slice(1)} post

${preview}

✅ Reply *approve* to publish
❌ Reply *reject* to skip
✏️ Reply *edit [notes]* to revise`;

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
export async function parseApprovalResponse(
  messageBody: string
): Promise<{ action: "approve" | "reject" | "edit" | "unknown"; reason?: string }> {
  const text = messageBody.trim().toLowerCase();

  // Fast path: keyword matching
  const approveWords = ["approve", "approved", "yes", "ok", "sure", "go", "publish", "ship", "send", "אשר", "👍", "כן", "yep", "yeah", "lgtm", "looks good"];
  const rejectWords = ["reject", "rejected", "no", "nah", "skip", "nope", "pass", "דחה", "👎", "לא", "delete"];
  const editWords = ["edit", "change", "fix", "revise", "update", "modify", "ערוך", "תקן"];

  if (approveWords.some(w => text === w || text === w + "d" || text === w + "!")) {
    return { action: "approve" };
  }
  if (rejectWords.some(w => text === w || text.startsWith(w + " "))) {
    const reason = messageBody.trim().replace(/^\S+\s*/, "").trim();
    return { action: "reject", reason: reason || undefined };
  }
  if (editWords.some(w => text === w || text.startsWith(w + " "))) {
    const reason = messageBody.trim().replace(/^\S+\s*/, "").trim();
    return { action: "edit", reason: reason || undefined };
  }

  // Natural language: use Claude to interpret intent
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { action: "unknown" };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        system: "You classify WhatsApp replies to a content approval request. Reply with ONLY a JSON object: {\"action\":\"approve|reject|edit\",\"reason\":\"optional reason\"}. If the message is clearly not about approving/rejecting content, return {\"action\":\"unknown\"}.",
        messages: [{ role: "user", content: messageBody }],
      }),
    });

    if (!res.ok) return { action: "unknown" };
    const data = await res.json();
    const content = data.content?.[0]?.text || "";
    const parsed = JSON.parse(content);
    if (["approve", "reject", "edit"].includes(parsed.action)) {
      return { action: parsed.action, reason: parsed.reason || undefined };
    }
  } catch {
    // LLM failed, fall through
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
