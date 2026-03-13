/**
 * SocialHub — WhatsApp Approval Flow via WAHA Pro
 * Sends content for approval via WhatsApp buttons, processes approve/reject replies.
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
 * Send a content approval request via WhatsApp with interactive buttons.
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

  const message = `${header}\n📱 ${req.platform.charAt(0).toUpperCase() + req.platform.slice(1)} post\n\n${preview}`;

  try {
    // Send image first if available (gives visual context before the buttons)
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
          caption: message,
        }),
      }).catch(() => {}); // Best-effort, buttons below are the key part
    }

    // Send buttons message
    const buttonsRes = await fetch(`${WAHA_BASE}/api/sendButtons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_KEY,
      },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        text: req.imageUrl ? "Tap to respond:" : message,
        buttons: [
          { id: "approve", text: "✅ Approve" },
          { id: "reject", text: "❌ Reject" },
          { id: "edit", text: "✏️ Edit" },
        ],
      }),
    });

    if (!buttonsRes.ok) {
      // Fallback to plain text if buttons fail
      const fallbackRes = await fetch(`${WAHA_BASE}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_KEY,
        },
        body: JSON.stringify({
          session: WAHA_SESSION,
          chatId,
          text: `${message}\n\n✅ Reply *approve* to publish\n❌ Reply *reject* to skip\n✏️ Reply *edit [notes]* to revise`,
        }),
      });
      const fallbackData = await fallbackRes.json();
      return {
        sent: fallbackRes.ok,
        messageId: fallbackData.key?.id || fallbackData.id,
        error: fallbackRes.ok ? undefined : "Buttons failed, sent text fallback",
      };
    }

    const buttonsData = await buttonsRes.json();
    return {
      sent: true,
      messageId: buttonsData.key?.id || buttonsData.id,
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
 * Handles both button clicks (buttonId) and text replies.
 */
export async function parseApprovalResponse(
  messageBody: string,
  buttonId?: string
): Promise<{ action: "approve" | "reject" | "edit" | "unknown"; reason?: string }> {
  // Button click — direct mapping
  if (buttonId) {
    if (buttonId === "approve") return { action: "approve" };
    if (buttonId === "reject") return { action: "reject" };
    if (buttonId === "edit") return { action: "edit" };
  }

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
    ? `✅ *Published!* Your ${platform} post is live:\n${postUrl}`
    : `✅ *Published!* Your ${platform} post is live.`;

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
