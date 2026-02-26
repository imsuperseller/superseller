import { config } from "../config";
import { logger } from "../utils/logger";
import { LeadAnalysis } from "./lead-analysis";

// ─── TYPES ───

export interface LeadNotificationConfig {
    recipientEmail: string;
    businessName: string;
    businessPhone?: string;
    logoUrl?: string;
    brandColor?: string;
}

// ─── EMAIL ───

export async function sendLeadNotificationEmail(
    cfg: LeadNotificationConfig,
    analysis: LeadAnalysis,
    conversationId: string
): Promise<boolean> {
    if (!config.notifications.resendApiKey) {
        logger.warn({ msg: "RESEND_API_KEY not configured, skipping lead notification" });
        return false;
    }

    // Only send if we have phone OR address
    const hasPhone = analysis.customerPhoneNumber && analysis.customerPhoneNumber !== "UNKNOWN";
    const hasAddress = analysis.customerAddress && analysis.customerAddress !== "UNKNOWN";
    if (!hasPhone && !hasAddress) {
        logger.info({ msg: "Skipping lead email — no phone or address extracted", conversationId });
        return false;
    }

    const subject = `New Lead: ${analysis.topic} — ${cfg.businessName}`;
    const html = generateLeadEmail(cfg, analysis);

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.notifications.resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: config.notifications.fromEmail,
                to: cfg.recipientEmail,
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error({ msg: "Failed to send lead email", status: response.status, error: errorText });
            return false;
        }

        const result = await response.json();
        logger.info({ msg: "Lead notification email sent", emailId: result.id, to: cfg.recipientEmail });
        return true;
    } catch (err: any) {
        logger.error({ msg: "Lead notification email error", error: err.message });
        return false;
    }
}

// ─── HTML TEMPLATE ───

function generateLeadEmail(cfg: LeadNotificationConfig, a: LeadAnalysis): string {
    const color = cfg.brandColor || "#1a3a5c";
    const accent = "#a0d468";
    const logo = cfg.logoUrl || "https://superseller.agency/superseller-logo.webp";

    const val = (v: string) => (!v || v === "UNKNOWN" || v === "NOT PROVIDED")
        ? `<span style="color:#e74c3c;font-weight:bold;">NOT PROVIDED — URGENT</span>`
        : `<strong>${v}</strong>`;

    const priorityColor = a.priority === "high" ? "#e74c3c" : a.priority === "medium" ? "#f39c12" : "#27ae60";
    const sentimentColor = a.sentiment === "urgent" ? "#e74c3c" : a.sentiment === "frustrated" ? "#f39c12" : a.sentiment === "positive" ? "#27ae60" : "#95a5a6";

    return `
    <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:650px;margin:0 auto;background:#f8f9fa;">
      <div style="background:${color};padding:20px 30px;border-radius:8px 8px 0 0;">
        <img src="${logo}" alt="${cfg.businessName}" width="80" style="vertical-align:middle;margin-right:15px;border-radius:4px;" />
        <span style="color:white;font-size:22px;font-weight:bold;vertical-align:middle;">${cfg.businessName}</span>
        <div style="background:${accent};color:#1a3a5c;display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold;float:right;margin-top:8px;">
          NEW LEAD
        </div>
      </div>

      <div style="padding:25px 30px;">
        <!-- Critical Contact Info -->
        <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:8px;padding:15px;margin-bottom:20px;">
          <h3 style="margin:0 0 10px;color:#856404;">Critical Contact Information</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:5px 10px;color:#666;">Phone:</td><td style="padding:5px 10px;">${val(a.customerPhoneNumber || a.callerPhoneNumber)}</td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Address:</td><td style="padding:5px 10px;">${val(a.customerAddress)}</td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Name:</td><td style="padding:5px 10px;">${val(a.customerName)}</td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Appointment:</td><td style="padding:5px 10px;">${val(a.appointmentTime)}</td></tr>
          </table>
        </div>

        <!-- Lead Details -->
        <div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:15px;margin-bottom:15px;">
          <h3 style="margin:0 0 10px;color:${color};">Lead Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:5px 10px;color:#666;">Topic:</td><td style="padding:5px 10px;"><strong>${a.topic}</strong></td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Category:</td><td style="padding:5px 10px;">${a.category}</td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Priority:</td><td style="padding:5px 10px;"><span style="color:${priorityColor};font-weight:bold;text-transform:uppercase;">${a.priority}</span></td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Sentiment:</td><td style="padding:5px 10px;"><span style="color:${sentimentColor};">${a.sentiment}</span></td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Booking:</td><td style="padding:5px 10px;">${a.bookingOutcome}</td></tr>
            <tr><td style="padding:5px 10px;color:#666;">Confidence:</td><td style="padding:5px 10px;">${Math.round(a.confidenceScore * 100)}%</td></tr>
          </table>
        </div>

        ${a.issues.length > 0 ? `
        <div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:15px;margin-bottom:15px;">
          <h3 style="margin:0 0 10px;color:${color};">Issues Mentioned</h3>
          <ul style="margin:0;padding-left:20px;">${a.issues.map(i => `<li>${i}</li>`).join("")}</ul>
        </div>` : ""}

        ${a.keyPoints.length > 0 ? `
        <div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:15px;margin-bottom:15px;">
          <h3 style="margin:0 0 10px;color:${color};">Key Points</h3>
          <ul style="margin:0;padding-left:20px;">${a.keyPoints.map(k => `<li>${k}</li>`).join("")}</ul>
        </div>` : ""}

        ${a.actionItems.length > 0 ? `
        <div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:15px;margin-bottom:15px;">
          <h3 style="margin:0 0 10px;color:${color};">Action Items</h3>
          <ul style="margin:0;padding-left:20px;">${a.actionItems.map(i => `<li>${i}</li>`).join("")}</ul>
        </div>` : ""}

        ${a.missingInfo.length > 0 ? `
        <div style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;padding:15px;margin-bottom:15px;">
          <h3 style="margin:0 0 10px;color:#721c24;">Missing Information</h3>
          <ul style="margin:0;padding-left:20px;">${a.missingInfo.map(m => `<li>${m}</li>`).join("")}</ul>
        </div>` : ""}
      </div>

      <div style="background:${color};padding:15px 30px;border-radius:0 0 8px 8px;text-align:center;">
        <p style="color:rgba(255,255,255,0.8);margin:0;font-size:12px;">
          ${cfg.businessName}${cfg.businessPhone ? ` | ${cfg.businessPhone}` : ""} | Powered by SuperSeller AI
        </p>
      </div>
    </div>`;
}
