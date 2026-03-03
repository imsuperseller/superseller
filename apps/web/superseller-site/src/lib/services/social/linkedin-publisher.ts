/**
 * SocialHub — LinkedIn API Publisher
 * Uses LinkedIn Marketing API v2 for posting to organization or personal pages.
 *
 * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares
 *
 * Requires OAuth 2.0 access token with:
 *  - w_member_social (personal posts)
 *  - w_organization_social (organization posts)
 */

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";
const LINKEDIN_REST_BASE = "https://api.linkedin.com/rest";

export interface LinkedInPublishRequest {
  accessToken: string;
  /** LinkedIn URN: "urn:li:person:XXXXX" or "urn:li:organization:XXXXX" */
  authorUrn: string;
  text: string;
  imageUrl?: string; // Public URL to image
  articleUrl?: string; // URL to share as article
  articleTitle?: string;
}

export interface LinkedInPublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

/**
 * Upload an image to LinkedIn's media assets API.
 * Returns the asset URN for use in a post.
 */
async function uploadImageToLinkedIn(
  imageUrl: string,
  authorUrn: string,
  accessToken: string
): Promise<string | null> {
  try {
    // Step 1: Register upload
    const registerRes = await fetch(
      `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: authorUrn,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent",
              },
            ],
          },
        }),
      }
    );

    const registerData = await registerRes.json();
    if (!registerRes.ok) {
      console.error("[linkedin-publisher] Register upload failed:", registerData);
      return null;
    }

    const uploadUrl =
      registerData.value?.uploadMechanism?.[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ]?.uploadUrl;
    const asset = registerData.value?.asset;

    if (!uploadUrl || !asset) {
      console.error("[linkedin-publisher] No upload URL or asset in response");
      return null;
    }

    // Step 2: Download image and upload to LinkedIn
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": imgRes.headers.get("content-type") || "image/png",
      },
      body: imgBuffer,
    });

    if (!uploadRes.ok) {
      console.error("[linkedin-publisher] Image upload failed:", uploadRes.status);
      return null;
    }

    return asset;
  } catch (err) {
    console.error("[linkedin-publisher] Image upload error:", err);
    return null;
  }
}

/**
 * Publish a post to LinkedIn.
 * Supports text-only, text + image, or text + article link.
 */
export async function publishToLinkedIn(
  req: LinkedInPublishRequest
): Promise<LinkedInPublishResult> {
  try {
    // Build UGC post payload
    const payload: Record<string, any> = {
      author: req.authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: req.text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const shareContent =
      payload.specificContent["com.linkedin.ugc.ShareContent"];

    // Image post
    if (req.imageUrl) {
      const assetUrn = await uploadImageToLinkedIn(
        req.imageUrl,
        req.authorUrn,
        req.accessToken
      );

      if (assetUrn) {
        shareContent.shareMediaCategory = "IMAGE";
        shareContent.media = [
          {
            status: "READY",
            media: assetUrn,
          },
        ];
      }
      // If upload fails, fall through to text-only post
    }

    // Article/link post
    if (req.articleUrl && shareContent.shareMediaCategory === "NONE") {
      shareContent.shareMediaCategory = "ARTICLE";
      shareContent.media = [
        {
          status: "READY",
          originalUrl: req.articleUrl,
          title: { text: req.articleTitle || req.text.slice(0, 100) },
        },
      ];
    }

    const res = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 201) {
      // LinkedIn returns the URN in the x-restli-id header
      const postUrn = res.headers.get("x-restli-id") || "";

      // Construct the post URL — UGC API returns urn:li:ugcPost:NNN or urn:li:share:NNN
      let postUrl = `https://www.linkedin.com/feed/`;
      if (postUrn) {
        postUrl = `https://www.linkedin.com/feed/update/${postUrn}`;
      }

      return {
        success: true,
        postId: postUrn,
        postUrl,
      };
    }

    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      error:
        errorData.message ||
        errorData.serviceErrorCode ||
        `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Get the current user's LinkedIn profile URN.
 * Used to construct "urn:li:person:XXXXX" for personal posts.
 */
export async function getLinkedInProfileUrn(
  accessToken: string
): Promise<{ urn?: string; name?: string; error?: string }> {
  try {
    const res = await fetch(`${LINKEDIN_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.message || `HTTP ${res.status}` };
    }

    return {
      urn: `urn:li:person:${data.id}`,
      name: `${data.localizedFirstName || ""} ${data.localizedLastName || ""}`.trim(),
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
