/**
 * SocialHub — Facebook Graph API Publisher
 * Handles publishing to Facebook Pages and Instagram (via same Graph API).
 * Requires a Page Access Token with publish_pages + manage_pages permissions.
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

export interface FacebookPublishRequest {
  pageId: string;
  accessToken: string;
  message: string;
  imageUrl?: string; // Public URL to image
  link?: string; // Link to attach
}

export interface FacebookPublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface InstagramPublishRequest {
  igUserId: string; // Instagram Business Account ID (from Graph API)
  accessToken: string;
  caption: string;
  imageUrl: string; // Public URL (required for IG)
}

/**
 * Publish a text or photo post to a Facebook Page.
 */
export async function publishToFacebook(
  req: FacebookPublishRequest
): Promise<FacebookPublishResult> {
  try {
    let url: string;
    let body: Record<string, string>;

    if (req.imageUrl) {
      // Photo post
      url = `${GRAPH_API_BASE}/${req.pageId}/photos`;
      body = {
        url: req.imageUrl,
        message: req.message,
        access_token: req.accessToken,
      };
    } else if (req.link) {
      // Link post
      url = `${GRAPH_API_BASE}/${req.pageId}/feed`;
      body = {
        message: req.message,
        link: req.link,
        access_token: req.accessToken,
      };
    } else {
      // Text-only post
      url = `${GRAPH_API_BASE}/${req.pageId}/feed`;
      body = {
        message: req.message,
        access_token: req.accessToken,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${response.status}`,
      };
    }

    const postId = data.id || data.post_id;
    // Fetch the actual permalink from Graph API
    let postUrl: string | undefined;
    if (postId) {
      try {
        const permalinkRes = await fetch(
          `${GRAPH_API_BASE}/${postId}?fields=permalink_url&access_token=${req.accessToken}`
        );
        const permalinkData = await permalinkRes.json();
        postUrl = permalinkData.permalink_url || `https://www.facebook.com/${postId}`;
      } catch {
        postUrl = `https://www.facebook.com/${postId}`;
      }
    }
    return {
      success: true,
      postId,
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
 * Publish a photo post to Instagram Business via Graph API.
 * Two-step process: 1) Create media container 2) Publish container
 */
export async function publishToInstagram(
  req: InstagramPublishRequest
): Promise<FacebookPublishResult> {
  try {
    // Step 1: Create media container
    const containerUrl = `${GRAPH_API_BASE}/${req.igUserId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        image_url: req.imageUrl,
        caption: req.caption,
        access_token: req.accessToken,
      }),
    });

    const containerData = await containerRes.json();
    if (!containerRes.ok || containerData.error) {
      return {
        success: false,
        error: `Container creation failed: ${containerData.error?.message || containerRes.status}`,
      };
    }

    const containerId = containerData.id;

    // Step 2: Publish the container
    const publishUrl = `${GRAPH_API_BASE}/${req.igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: req.accessToken,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || publishData.error) {
      return {
        success: false,
        error: `Publish failed: ${publishData.error?.message || publishRes.status}`,
      };
    }

    return {
      success: true,
      postId: publishData.id,
      postUrl: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Verify a Page Access Token is valid and get page info.
 */
export async function verifyPageToken(
  pageId: string,
  accessToken: string
): Promise<{ valid: boolean; pageName?: string; error?: string }> {
  try {
    const url = `${GRAPH_API_BASE}/${pageId}?fields=name,id&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      return { valid: false, error: data.error?.message || `HTTP ${res.status}` };
    }

    return { valid: true, pageName: data.name };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Get a long-lived Page Access Token from a short-lived User Token.
 * Flow: Short-lived User Token → Long-lived User Token → Page Token
 */
export async function exchangeForLongLivedToken(
  appId: string,
  appSecret: string,
  shortLivedToken: string
): Promise<{ token?: string; expiresIn?: number; error?: string }> {
  try {
    // Step 1: Exchange for long-lived user token
    const url = `${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      return { error: data.error?.message || `HTTP ${res.status}` };
    }

    return {
      token: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
