import { config } from "../config";
import { logger } from "../utils/logger";

interface VideoCompleteNotification {
  userId: string;
  jobId: string;
  userEmail: string;
  listingAddress?: string;
  masterVideoUrl: string;
  verticalVideoUrl: string;
  squareVideoUrl: string;
  portraitVideoUrl: string;
  durationSeconds: number;
}

interface VideoFailedNotification {
  userId: string;
  jobId: string;
  userEmail: string;
  listingAddress?: string;
  errorMessage: string;
  creditsRefunded: number;
}

/**
 * Customer notification service for VideoForge video pipeline.
 * Sends email notifications via Resend when jobs complete or fail.
 */
export class NotificationService {
  /**
   * Notify customer when their video is ready.
   */
  static async notifyVideoComplete(data: VideoCompleteNotification): Promise<void> {
    if (!config.notifications.resendApiKey) {
      logger.warn({ msg: "RESEND_API_KEY not configured, skipping email notification", userId: data.userId, jobId: data.jobId });
      return;
    }

    try {
      const durationMin = Math.floor(data.durationSeconds / 60);
      const durationSec = Math.round(data.durationSeconds % 60);
      const durationDisplay = durationMin > 0 ? `${durationMin}:${durationSec.toString().padStart(2, '0')}` : `${durationSec}s`;

      const html = this.generateVideoCompleteEmail({
        address: data.listingAddress || "Your Property",
        masterVideoUrl: data.masterVideoUrl,
        verticalVideoUrl: data.verticalVideoUrl,
        squareVideoUrl: data.squareVideoUrl,
        portraitVideoUrl: data.portraitVideoUrl,
        duration: durationDisplay,
      });

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.notifications.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.notifications.fromEmail,
          to: data.userEmail,
          subject: `🎬 Your Property Video is Ready! (${data.listingAddress || "Property Tour"})`,
          html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ msg: "Failed to send video complete email", userId: data.userId, jobId: data.jobId, status: response.status, error: errorText });
        return;
      }

      const result = await response.json();
      logger.info({ msg: "Video complete email sent", userId: data.userId, jobId: data.jobId, emailId: result.id });
    } catch (error: any) {
      logger.error({ msg: "Error sending video complete notification", userId: data.userId, jobId: data.jobId, error: error.message });
    }
  }

  /**
   * Notify customer when their video job fails and credits are refunded.
   */
  static async notifyVideoFailed(data: VideoFailedNotification): Promise<void> {
    if (!config.notifications.resendApiKey) {
      logger.warn({ msg: "RESEND_API_KEY not configured, skipping email notification", userId: data.userId, jobId: data.jobId });
      return;
    }

    try {
      const html = this.generateVideoFailedEmail({
        address: data.listingAddress || "Your Property",
        errorMessage: data.errorMessage,
        creditsRefunded: data.creditsRefunded,
      });

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.notifications.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.notifications.fromEmail,
          to: data.userEmail,
          subject: `⚠️ Video Generation Issue (${data.listingAddress || "Property Tour"}) — Credits Refunded`,
          html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ msg: "Failed to send video failed email", userId: data.userId, jobId: data.jobId, status: response.status, error: errorText });
        return;
      }

      const result = await response.json();
      logger.info({ msg: "Video failed email sent", userId: data.userId, jobId: data.jobId, emailId: result.id });
    } catch (error: any) {
      logger.error({ msg: "Error sending video failed notification", userId: data.userId, jobId: data.jobId, error: error.message });
    }
  }

  /**
   * Generate HTML email for video complete notification.
   */
  private static generateVideoCompleteEmail(data: {
    address: string;
    masterVideoUrl: string;
    verticalVideoUrl: string;
    squareVideoUrl: string;
    portraitVideoUrl: string;
    duration: string;
  }): string {
    const baseStyles = `
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0a061e;
      color: #ffffff;
    `;

    const buttonStyle = `
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 12px 8px;
    `;

    const cardStyle = `
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      margin: 20px 0;
    `;

    return `
      <div style="${baseStyles}">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <img src="https://superseller.agency/superseller-logo.webp" alt="SuperSeller AI" width="120" style="margin-bottom: 24px;" />
          <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">Your Property Video is Ready! 🎬</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
            Great news! Your cinematic property tour video for <strong>${data.address}</strong> has been generated successfully.
          </p>
          <div style="${cardStyle}">
            <h3 style="color: #00d4ff; margin-top: 0;">Video Details</h3>
            <p style="color: #cbd5e1;">Property: <strong>${data.address}</strong></p>
            <p style="color: #cbd5e1;">Duration: <strong>${data.duration}</strong></p>
            <p style="color: #cbd5e1;">Formats: <strong>4 versions</strong> (16:9, 9:16, 1:1, 4:5)</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.masterVideoUrl}" style="${buttonStyle}">📺 Watch 16:9 (Landscape)</a>
            <a href="${data.verticalVideoUrl}" style="${buttonStyle}">📱 Watch 9:16 (Stories)</a>
            <a href="${data.squareVideoUrl}" style="${buttonStyle}">⬜ Watch 1:1 (Square)</a>
            <a href="${data.portraitVideoUrl}" style="${buttonStyle}">🖼️ Watch 4:5 (Portrait)</a>
          </div>
          <div style="${cardStyle}">
            <h3 style="color: #00d4ff; margin-top: 0;">Where to Use Your Video</h3>
            <ul style="color: #cbd5e1; line-height: 1.8;">
              <li><strong>16:9 (Landscape)</strong> — YouTube, website embed, email marketing</li>
              <li><strong>9:16 (Vertical)</strong> — Instagram Stories, TikTok, Facebook Stories</li>
              <li><strong>1:1 (Square)</strong> — Instagram feed, Facebook posts</li>
              <li><strong>4:5 (Portrait)</strong> — Instagram Reels optimized</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #64748b; margin-top: 40px;">
            Questions about your video? Reply to this email or visit <a href="https://superseller.agency/contact" style="color: #00d4ff;">superseller.agency/contact</a>
          </p>
          <p style="font-size: 12px; color: #475569; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
            You're receiving this because you created a video job at SuperSeller AI. <a href="https://superseller.agency/video/account" style="color: #00d4ff;">Manage your account</a>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML email for video failed notification.
   */
  private static generateVideoFailedEmail(data: {
    address: string;
    errorMessage: string;
    creditsRefunded: number;
  }): string {
    const baseStyles = `
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0a061e;
      color: #ffffff;
    `;

    const buttonStyle = `
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    `;

    const cardStyle = `
      background: rgba(254, 61, 81, 0.1);
      border: 1px solid rgba(254, 61, 81, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin: 20px 0;
    `;

    // Sanitize error message for display (remove stack traces, internal paths)
    const displayError = data.errorMessage
      .split('\n')[0] // First line only
      .replace(/\/[^\s]+/g, '') // Remove file paths
      .substring(0, 200); // Limit length

    return `
      <div style="${baseStyles}">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <img src="https://superseller.agency/superseller-logo.webp" alt="SuperSeller AI" width="120" style="margin-bottom: 24px;" />
          <h1 style="color: #fe3d51; font-size: 28px; margin-bottom: 16px;">Video Generation Issue ⚠️</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
            We encountered an issue while generating your property tour video for <strong>${data.address}</strong>.
          </p>
          <div style="${cardStyle}">
            <h3 style="color: #fe3d51; margin-top: 0;">What Happened</h3>
            <p style="color: #cbd5e1; font-family: monospace; font-size: 14px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; overflow-wrap: break-word;">
              ${displayError}
            </p>
          </div>
          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 24px; margin: 20px 0;">
            <h3 style="color: #22c55e; margin-top: 0;">✅ Credits Automatically Refunded</h3>
            <p style="color: #cbd5e1;">
              We've refunded <strong style="color: #22c55e;">${data.creditsRefunded} credits</strong> to your account.
              No charge for failed jobs — ever.
            </p>
          </div>
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; margin: 20px 0;">
            <h3 style="color: #00d4ff; margin-top: 0;">What's Next?</h3>
            <ul style="color: #cbd5e1; line-height: 1.8;">
              <li>Our team has been automatically notified</li>
              <li>You can try creating a new video job</li>
              <li>If the issue persists, we'll reach out within 24 hours</li>
            </ul>
          </div>
          <a href="https://superseller.agency/video/create" style="${buttonStyle}">Try Creating a New Video</a>
          <p style="font-size: 14px; color: #64748b; margin-top: 40px;">
            Need immediate help? Email us at support@superseller.agency with your job ID and we'll prioritize your request.
          </p>
          <p style="font-size: 12px; color: #475569; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
            You're receiving this because your video job at SuperSeller AI encountered an error. <a href="https://superseller.agency/video/account" style="color: #00d4ff;">Manage your account</a>
          </p>
        </div>
      </div>
    `;
  }
}
