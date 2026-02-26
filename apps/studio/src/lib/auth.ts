import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { query, queryRow } from "./db";
import { setJson, getJson, del } from "./redis";
import { sendMagicLink } from "./resend";
import { sendText, phoneToChatId } from "./waha";
import type { WinnerUser } from "@/types";

const SESSION_COOKIE = "winner_session";
const SESSION_TTL_DAYS = 7;

// ── Session Management ──────────────────────────────────────────

export async function getSessionFromCookies(): Promise<WinnerUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await queryRow<{ user_id: string; expires_at: string }>(
    `UPDATE winner_sessions SET last_active = NOW()
     WHERE token = $1 AND expires_at > NOW()
     RETURNING user_id, expires_at`,
    [token]
  );
  if (!session) return null;

  return queryRow<WinnerUser>(
    "SELECT * FROM winner_users WHERE id = $1 AND is_active = TRUE",
    [session.user_id]
  );
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO winner_sessions (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );

  // Update last login
  await query("UPDATE winner_users SET last_login = NOW() WHERE id = $1", [userId]);

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("DELETE FROM winner_sessions WHERE token = $1", [token]);
    cookieStore.delete(SESSION_COOKIE);
  }
}

// ── Magic Link Auth ─────────────────────────────────────────────

export async function sendMagicLinkEmail(email: string): Promise<boolean> {
  // Find or create user
  let user = await queryRow<WinnerUser>(
    "SELECT * FROM winner_users WHERE email = $1",
    [email]
  );

  if (!user) {
    const rows = await query<WinnerUser>(
      `INSERT INTO winner_users (email, auth_method, tenant_id)
       VALUES ($1, 'email', 'mivnim')
       RETURNING *`,
      [email]
    );
    user = rows[0];
    // Create credits row
    await query(
      `INSERT INTO winner_user_credits (user_id, tier, total_credits, monthly_cap)
       VALUES ($1, 'starter', 3, 30)`,
      [user.id]
    );
  }

  const token = randomBytes(32).toString("hex");
  await setJson(`magic:${token}`, { userId: user.id, email }, 900); // 15 min TTL

  return sendMagicLink(email, token);
}

export async function verifyMagicLink(token: string): Promise<string | null> {
  const data = await getJson<{ userId: string; email: string }>(`magic:${token}`);
  if (!data) return null;

  await del(`magic:${token}`); // one-time use

  const sessionToken = await createSession(data.userId);
  return sessionToken;
}

// ── WhatsApp OTP Auth ───────────────────────────────────────────

export async function sendWhatsAppOtp(phone: string): Promise<boolean> {
  // Normalize phone: strip non-digits, add country code
  const chatId = phoneToChatId(phone);
  const normalizedPhone = "+" + chatId.replace("@c.us", "");

  // Find user by normalized phone OR raw phone
  let user = await queryRow<WinnerUser>(
    "SELECT * FROM winner_users WHERE phone = $1 OR phone = $2",
    [normalizedPhone, phone]
  );

  if (!user) {
    const rows = await query<WinnerUser>(
      `INSERT INTO winner_users (phone, whatsapp_jid, auth_method, tenant_id)
       VALUES ($1, $2, 'whatsapp', 'mivnim')
       RETURNING *`,
      [normalizedPhone, chatId]
    );
    user = rows[0];
    await query(
      `INSERT INTO winner_user_credits (user_id, tier, total_credits, monthly_cap)
       VALUES ($1, 'starter', 3, 30)`,
      [user.id]
    );
  } else if (!user.whatsapp_jid) {
    // Ensure whatsapp_jid is set
    await query(
      "UPDATE winner_users SET whatsapp_jid = $1 WHERE id = $2",
      [chatId, user.id]
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  await setJson(
    `otp:${phone}`,
    { code, userId: user.id, attempts: 0 },
    300 // 5 min TTL
  );

  const msgId = await sendText(chatId, `SuperSeller AI Studio login code: ${code}\nValid for 5 minutes.`);
  return msgId !== null;
}

export async function verifyOtp(phone: string, code: string): Promise<string | null> {
  const data = await getJson<{ code: string; userId: string; attempts: number }>(`otp:${phone}`);
  if (!data) return null;

  if (data.attempts >= 3) {
    await del(`otp:${phone}`);
    return null;
  }

  if (data.code !== code) {
    await setJson(`otp:${phone}`, { ...data, attempts: data.attempts + 1 }, 300);
    return null;
  }

  await del(`otp:${phone}`); // one-time use
  const sessionToken = await createSession(data.userId);
  return sessionToken;
}
