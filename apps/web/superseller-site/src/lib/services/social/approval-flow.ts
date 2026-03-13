/**
 * SocialHub — WhatsApp Approval Flow via WAHA Pro
 * Uses Polls (buttons are deprecated in WAHA) for interactive approval.
 * Polls render natively on all WhatsApp mobile clients.
 */

const WAHA_BASE = process.env.WAHA_BASE_URL || "http://172.245.56.50:3000";
const WAHA_KEY = process.env.WAHA_API_KEY || "${WAHA_API_KEY}";
const WAHA_SESSION = process.env.WAHA_SESSION || "superseller-whatsapp";

// Poll option labels — used to match poll.vote events back to actions
export const POLL_APPROVE = "✅ Approve & Publish";
export const POLL_REJECT = "❌ Reject";
export const POLL_EDIT = "✏️ Request Edit";

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
 * Send a content approval request via WhatsApp.
 *
 * Flow:
 * 1. Send image (if available) with SHORT caption (WhatsApp caps captions ~1024 chars)
 * 2. Send full content as a separate text message (no truncation)
 * 3. Send a Poll with Approve/Reject/Edit options (renders as tappable on mobile)
 *
 * Returns messageId of the poll message for tracking.
 */
export async function sendApprovalRequest(
  req: ApprovalRequest
): Promise<ApprovalResult> {
  const chatId = `${req.approverPhone}@c.us`;

  const header = req.tenantName
    ? `📋 *${req.tenantName}*${req.igAccount ? ` → ${req.igAccount}` : ""}`
    : `📋 *Content Approval*`;

  const platformLabel = req.platform.charAt(0).toUpperCase() + req.platform.slice(1);

  try {
    // Step 1: Send image with short caption (if available)
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
          caption: `${header}\n📱 ${platformLabel} post`,
        }),
      }).catch(() => {});
    }

    // Step 2: Send full content as text message (no caption limit)
    const contentMessage = req.imageUrl
      ? `${req.contentPreview}`
      : `${header}\n📱 ${platformLabel} post\n\n${req.contentPreview}`;

    await fetch(`${WAHA_BASE}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_KEY,
      },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        text: contentMessage,
      }),
    }).catch(() => {});

    // Step 3: Send Poll for approval (renders as tappable options on mobile)
    const pollRes = await fetch(`${WAHA_BASE}/api/sendPoll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_KEY,
      },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        poll: {
          name: `⬆️ Review the ${platformLabel} post above:`,
          options: [POLL_APPROVE, POLL_REJECT, POLL_EDIT],
          multipleAnswers: false,
        },
      }),
    });

    if (!pollRes.ok) {
      const errBody = await pollRes.text().catch(() => "");
      console.warn(`[approval-flow] Poll failed (${pollRes.status}): ${errBody}. Falling back to text.`);
      // Fallback to plain text if poll fails
      const fallbackRes = await fetch(`${WAHA_BASE}/api/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": WAHA_KEY,
        },
        body: JSON.stringify({
          session: WAHA_SESSION,
          chatId,
          text: `⬆️ *Review the post above*\n\n✅ Reply *approve* to publish\n❌ Reply *reject* to skip\n✏️ Reply *edit [notes]* to revise`,
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

    const pollData = await pollRes.json();
    const keyId = pollData._data?.key?.id || pollData.key?.id;
    console.log(`[approval-flow] Poll sent for post ${req.postId.slice(0, 8)}, messageId: ${keyId}`);

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
 * Parse a poll.vote event into an approval action.
 * Maps poll option text to approve/reject/edit.
 */
export function parsePollVote(
  selectedOptions: string[]
): { action: "approve" | "reject" | "edit" | "unknown" } {
  const selected = selectedOptions[0] || "";
  if (selected === POLL_APPROVE) return { action: "approve" };
  if (selected === POLL_REJECT) return { action: "reject" };
  if (selected === POLL_EDIT) return { action: "edit" };
  // Fuzzy match in case of slight differences
  const lower = selected.toLowerCase();
  if (lower.includes("approve") || lower.includes("publish")) return { action: "approve" };
  if (lower.includes("reject")) return { action: "reject" };
  if (lower.includes("edit")) return { action: "edit" };
  return { action: "unknown" };
}

/**
 * Parse an incoming WhatsApp message as an approval response.
 * Handles text replies and NL via Claude.
 */
export async function parseApprovalResponse(
  messageBody: string,
  buttonId?: string
): Promise<{ action: "approve" | "reject" | "edit" | "unknown"; reason?: string; postIdPrefix?: string }> {
  // Legacy button click support
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
