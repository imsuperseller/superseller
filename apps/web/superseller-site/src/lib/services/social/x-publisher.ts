/**
 * SocialHub — X (Twitter) API v2 Publisher
 * Uses OAuth 1.0a (API Key + Secret + Access Token + Access Token Secret)
 * for posting tweets on behalf of the @iamsupersel account.
 *
 * X API v2: https://developer.x.com/en/docs/x-api/tweets/manage-tweets
 */
import crypto from "crypto";

export interface XPublishRequest {
  text: string;
  mediaUrl?: string; // Image URL to upload (optional)
  /** OAuth 2.0 Bearer token (from PKCE flow) — preferred */
  bearerToken?: string;
  /** Username for URL construction (from account metadata) */
  username?: string;
  /** OAuth 1.0a credentials from PlatformAccount or env (fallback) */
  apiKey: string;
  apiKeySecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface XPublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

// ─── OAuth 1.0a Signature ───────────────────────────────────────

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

function buildOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  token: string,
  tokenSecret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: token,
    oauth_version: "1.0",
  };

  // Combine all params for signature base
  const allParams = { ...params, ...oauthParams };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join("&");

  const signatureBase = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

// ─── Media Upload (v1.1 — required for images) ─────────────────

async function uploadMediaToX(
  imageUrl: string,
  apiKey: string,
  apiKeySecret: string,
  accessToken: string,
  accessTokenSecret: string
): Promise<string | null> {
  try {
    // Download image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;

    const buffer = Buffer.from(await imgRes.arrayBuffer());

    // 5MB limit for simple upload — skip if too large
    if (buffer.length > 5 * 1024 * 1024) {
      console.error("[x-publisher] Image too large for simple upload:", buffer.length);
      return null;
    }

    const contentType = imgRes.headers.get("content-type") || "image/png";

    // Upload to X media endpoint (v1.1) using multipart/form-data
    // For multipart, body params are NOT included in OAuth signature base
    const uploadUrl = "https://upload.twitter.com/1.1/media/upload.json";

    const authHeader = buildOAuthHeader(
      "POST",
      uploadUrl,
      {},
      apiKey,
      apiKeySecret,
      accessToken,
      accessTokenSecret
    );

    // Use FormData for multipart upload (binary-safe, proper content type)
    const formData = new FormData();
    formData.append("media_data", buffer.toString("base64"));

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.media_id_string) {
      console.error("[x-publisher] Media upload failed:", data);
      return null;
    }

    return data.media_id_string;
  } catch (err) {
    console.error("[x-publisher] Media upload error:", err);
    return null;
  }
}

// ─── Tweet Publishing (v2) ──────────────────────────────────────

/**
 * Publish a tweet to X (Twitter).
 * Supports text-only or text + image.
 */
export async function publishToX(req: XPublishRequest): Promise<XPublishResult> {
  try {
    const tweetUrl = "https://api.x.com/2/tweets";

    // Build tweet payload
    const tweetBody: Record<string, any> = { text: req.text };

    // Upload media if provided
    if (req.mediaUrl) {
      const mediaId = await uploadMediaToX(
        req.mediaUrl,
        req.apiKey,
        req.apiKeySecret,
        req.accessToken,
        req.accessTokenSecret
      );
      if (mediaId) {
        tweetBody.media = { media_ids: [mediaId] };
      }
    }

    const jsonBody = JSON.stringify(tweetBody);

    // Use OAuth 2.0 Bearer if available (from PKCE flow), otherwise OAuth 1.0a
    let authHeader: string;
    if (req.bearerToken) {
      authHeader = `Bearer ${req.bearerToken}`;
    } else {
      authHeader = buildOAuthHeader(
        "POST",
        tweetUrl,
        {},
        req.apiKey,
        req.apiKeySecret,
        req.accessToken,
        req.accessTokenSecret
      );
    }

    const res = await fetch(tweetUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: jsonBody,
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      const errorMsg =
        data.errors?.[0]?.message ||
        data.detail ||
        `HTTP ${res.status}`;
      return { success: false, error: errorMsg };
    }

    const tweetId = data.data?.id;
    const username = req.username || process.env.X_USERNAME || "iamsupersel";
    const postUrl = tweetId
      ? `https://x.com/${username}/status/${tweetId}`
      : undefined;

    return {
      success: true,
      postId: tweetId,
      postUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Delete a tweet by ID.
 */
export async function deleteXPost(
  tweetId: string,
  apiKey: string,
  apiKeySecret: string,
  accessToken: string,
  accessTokenSecret: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.x.com/2/tweets/${tweetId}`;
    const authHeader = buildOAuthHeader(
      "DELETE",
      url,
      {},
      apiKey,
      apiKeySecret,
      accessToken,
      accessTokenSecret
    );

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
