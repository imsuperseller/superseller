import { getEnv } from "./env";

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": getEnv().WAHA_API_KEY,
  };
}

function baseUrl(): string {
  return getEnv().WAHA_URL;
}

function session(): string {
  return getEnv().WAHA_SESSION;
}

/** Normalize phone to chatId format: 972501234567@c.us */
export function phoneToChatId(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, "");
  // Israeli number starting with 0 → add 972
  if (clean.startsWith("0")) clean = "972" + clean.slice(1);
  // US number starting with 1 and 10+ digits
  if (clean.length === 10) clean = "1" + clean;
  return clean + "@c.us";
}

export async function sendText(chatId: string, text: string): Promise<string | null> {
  const url = `${baseUrl()}/api/sendText`;
  const payload = { chatId, text, session: session() };
  console.log(`WAHA sendText → ${url} chatId=${chatId}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const responseText = await res.text();
    console.log(`WAHA sendText response: ${res.status} ${responseText.slice(0, 300)}`);
    if (!res.ok) {
      return null;
    }
    const data = JSON.parse(responseText);
    return data.key?.id || data.id || null;
  } catch (err) {
    console.error("WAHA sendText error:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function sendFile(
  chatId: string,
  mediaUrl: string,
  caption?: string,
  filename?: string
): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl()}/api/sendFile`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        chatId,
        file: { url: mediaUrl },
        caption: caption || "",
        fileName: filename || "video.mp4",
        session: session(),
      }),
    });
    if (!res.ok) {
      console.error(`WAHA sendFile failed: ${res.status}`, await res.text());
      return null;
    }
    const data = await res.json();
    return data.key?.id || data.id || null;
  } catch (err) {
    console.error("WAHA sendFile error:", err);
    return null;
  }
}

export async function sendVideo(
  chatId: string,
  videoUrl: string,
  caption?: string
): Promise<string | null> {
  const url = `${baseUrl()}/api/sendVideo`;
  console.log(`WAHA sendVideo → ${url} chatId=${chatId}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        chatId,
        file: { url: videoUrl, mimetype: "video/mp4" },
        caption: caption || "",
        session: session(),
      }),
    });
    const responseText = await res.text();
    console.log(`WAHA sendVideo response: ${res.status} ${responseText.slice(0, 300)}`);
    if (!res.ok) {
      return null;
    }
    const data = JSON.parse(responseText);
    return data.key?.id || data.id || null;
  } catch (err) {
    console.error("WAHA sendVideo error:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function isSessionAlive(): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl()}/api/sessions/${session()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "WORKING";
  } catch {
    return false;
  }
}
