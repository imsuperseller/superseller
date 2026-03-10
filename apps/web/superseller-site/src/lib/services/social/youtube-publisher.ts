/**
 * SocialHub — YouTube Data API v3 Publisher
 * Supports Community Posts (text/image) via YouTube's API.
 *
 * NOTE: YouTube Community Posts API is limited. For video uploads,
 * use the resumable upload endpoint (not implemented here — that's VideoForge's domain).
 *
 * For text/image social posts, YouTube doesn't have a public API for community posts.
 * Instead, we support:
 *  1. Video upload with description (for video content)
 *  2. Playlist management
 *  3. Comment posting (on own videos)
 *
 * The primary use case for SocialHub is uploading short-form content (Shorts)
 * with optimized titles, descriptions, and tags.
 *
 * Docs: https://developers.google.com/youtube/v3
 */

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_UPLOAD_BASE = "https://www.googleapis.com/upload/youtube/v3";

export interface YouTubePublishRequest {
  accessToken: string;
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string; // YouTube category (22 = People & Blogs)
  privacyStatus?: "public" | "private" | "unlisted";
  /** For Shorts: video file URL to upload */
  videoUrl?: string;
  /** For community-style: post as a comment on a specified video */
  commentOnVideoId?: string;
}

export interface YouTubePublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

/**
 * Upload a video to YouTube (Shorts or regular).
 * Uses resumable upload for reliability.
 */
export async function publishToYouTube(
  req: YouTubePublishRequest
): Promise<YouTubePublishResult> {
  try {
    // If we have a video URL, upload it
    if (req.videoUrl) {
      return await uploadVideoToYouTube(req);
    }

    // If commenting on a video (community-style engagement)
    if (req.commentOnVideoId) {
      return await commentOnYouTubeVideo(req);
    }

    // Text-only posts — YouTube doesn't have a public API for community posts
    // Fall back to creating a video description placeholder
    return {
      success: false,
      error:
        "YouTube requires video content for publishing. Text-only community posts are not supported via API.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Upload a video to YouTube using the resumable upload protocol.
 */
async function uploadVideoToYouTube(
  req: YouTubePublishRequest
): Promise<YouTubePublishResult> {
  try {
    if (!req.videoUrl) {
      return { success: false, error: "videoUrl is required for YouTube upload" };
    }

    // Step 1: Download the video
    const videoRes = await fetch(req.videoUrl);
    if (!videoRes.ok) {
      return { success: false, error: `Failed to download video: ${videoRes.status}` };
    }
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    const contentType = videoRes.headers.get("content-type") || "video/mp4";

    // Step 2: Initiate resumable upload
    const metadata = {
      snippet: {
        title: req.title,
        description: req.description,
        tags: req.tags || [],
        categoryId: req.categoryId || "22", // People & Blogs
      },
      status: {
        privacyStatus: req.privacyStatus || "public",
        selfDeclaredMadeForKids: false,
      },
    };

    const initiateRes = await fetch(
      `${YOUTUBE_UPLOAD_BASE}/videos?uploadType=resumable&part=snippet,status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Length": videoBuffer.length.toString(),
          "X-Upload-Content-Type": contentType,
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initiateRes.ok) {
      const errData = await initiateRes.json().catch(() => ({}));
      return {
        success: false,
        error:
          errData.error?.message ||
          `Upload initiation failed: ${initiateRes.status}`,
      };
    }

    const uploadUrl = initiateRes.headers.get("location");
    if (!uploadUrl) {
      return { success: false, error: "No upload URL returned from YouTube" };
    }

    // Step 3: Upload the video content
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": videoBuffer.length.toString(),
      },
      body: videoBuffer,
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || uploadData.error) {
      return {
        success: false,
        error:
          uploadData.error?.message ||
          `Upload failed: ${uploadRes.status}`,
      };
    }

    const videoId = uploadData.id;
    const postUrl = videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : undefined;

    return {
      success: true,
      postId: videoId,
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
 * Post a comment on a YouTube video (useful for engagement/community interaction).
 */
async function commentOnYouTubeVideo(
  req: YouTubePublishRequest
): Promise<YouTubePublishResult> {
  try {
    if (!req.commentOnVideoId) {
      return { success: false, error: "commentOnVideoId is required" };
    }

    const res = await fetch(
      `${YOUTUBE_API_BASE}/commentThreads?part=snippet`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            videoId: req.commentOnVideoId,
            topLevelComment: {
              snippet: {
                textOriginal: req.description || req.title,
              },
            },
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `HTTP ${res.status}`,
      };
    }

    const commentId = data.id;
    return {
      success: true,
      postId: commentId,
      postUrl: `https://www.youtube.com/watch?v=${req.commentOnVideoId}&lc=${commentId}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Get the authenticated user's YouTube channel info.
 */
export async function getYouTubeChannelInfo(
  accessToken: string
): Promise<{
  channelId?: string;
  channelTitle?: string;
  error?: string;
}> {
  try {
    const res = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet&mine=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await res.json();
    if (!res.ok || data.error) {
      return { error: data.error?.message || `HTTP ${res.status}` };
    }

    const channel = data.items?.[0];
    if (!channel) {
      return { error: "No YouTube channel found for this account" };
    }

    return {
      channelId: channel.id,
      channelTitle: channel.snippet?.title,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
