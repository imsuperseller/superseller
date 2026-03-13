/**
 * SocialHub — WhatsApp Approval Flow via WAHA Pro
 * Interactive buttons with post-specific IDs, message editing, read tracking.
 */

const WAHA_BASE = process.env.WAHA_BASE_URL || "http://172.245.56.50:3000";
const WAHA_KEY = process.env.WAHA_API_KEY || "${WAHA_API_KEY}";
const WAHA_SESSION = process.env.WAHA_SESSION || "superseller-whatsapp";

export interface ApprovalRequest {
  postId: string;
  approverPhone: string;
  platform: string;
  contentPreview: string;
  imageUrl?: string;
  tenantName?: string;
  igAccount?: string;
}

export interface ApprovalResult {
  sent: boolean;
  messageId?: string; // WAHA message key ID
  serializedMessageId?: string; // Full format: true_phone@c.us_ID (for editing)
  error?: string;
}

/**
 * Send a content approval request via WhatsApp with interactive buttons.
 * Button IDs include the postId for exact matching on reply.
 * Returns messageId for later editing (status updates).
 */
export async function sendApprovalRequest(
  req: ApprovalRequest
): Promise<ApprovalResult> {
  const chatId = `${req.approverPhone}@c.us`;

  const preview = req.contentPreview.length > 1000
    ? req.contentPreview.slice(0, 1000) + "..."
    : req.contentPreview;

  const header = req.tenantName
    ? `📋 *${req.tenantName}*${req.igAccount ? ` → ${req.igAccount}` : ""}`
    : `📋 *Content Approval*`;

  const message = `${header}\n📱 ${req.platform.charAt(0).toUpperCase() + req.platform.slice(1)} post\n\n${preview}`;

  // Short ID for button payload (first 8 chars of UUID)
  const shortId = req.postId.slice(0, 8);

  try {
    // Send image first if available
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
      }).catch(() => {});
    }

    // Send buttons with postId embedded in button IDs
    const buttonsRes = await fetch(`${WAHA_BASE}/api/sendButtons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_KEY,
      },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        text: req.imageUrl ? `⬆️ Post preview above. Tap to respond:` : message,
        buttons: [
          { id: `approve_${shortId}`, text: "✅ Approve" },
          { id: `reject_${shortId}`, text: "❌ Reject" },
          { id: `edit_${shortId}`, text: "✏️ Edit" },
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
      const keyId = fallbackData.key?.id;
      return {
        sent: fallbackRes.ok,
        messageId: keyId,
        serializedMessageId: keyId ? `true_${req.approverPhone}@c.us_${keyId}` : undefined,
      };
    }

    const buttonsData = await buttonsRes.json();
    const keyId = buttonsData.key?.id;

    return {
      sent: true,
      messageId: keyId,
      serializedMessageId: keyId ? `true_${req.approverPhone}@c.us_${keyId}` : undefined,
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
 * Handles button clicks (with postId), text replies, and NL via Claude.
 * Returns action + optional postId extracted from button.
 */
export async function parseApprovalResponse(
  messageBody: string,
  buttonId?: string
): Promise<{ action: "approve" | "reject" | "edit" | "unknown"; reason?: string; postIdPrefix?: string }> {
  // Button click — extract action and postId from "action_shortId" format
  if (buttonId) {
    const [action, postIdPrefix] = buttonId.split("_");
    if (action === "approve") return { action: "approve", postIdPrefix };
    if (action === "reject") return { action: "reject", postIdPrefix };
    if (action === "edit") return { action: "edit", postIdPrefix };
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
 * Edit an existing WhatsApp message (e.g., update approval status after action).
 */
export async function editApprovalMessage(
  serializedMessageId: string,
  chatId: string,
  newText: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${WAHA_BASE}/api/${WAHA_SESSION}/chats/${chatId}/messages/${serializedMessageId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_KEY,
        },
        body: JSON.stringify({ text: newText }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * React to a message with an emoji.
 */
export async function reactToMessage(
  chatId: string,
  messageId: string,
  emoji: string
): Promise<boolean> {
  try {
    const res = await fetch(`${WAHA_BASE}/api/reaction`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_KEY,
      },
      body: JSON.stringify({
        session: WAHA_SESSION,
        me: { id: chatId },
        key: { id: messageId, fromMe: true, remoteJid: chatId.replace("@c.us", "@s.whatsapp.net") },
        reaction: emoji,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
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
  }).catch(() => {});
}
