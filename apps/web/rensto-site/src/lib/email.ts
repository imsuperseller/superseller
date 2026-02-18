import { Resend } from 'resend';
// Lazy initialize Resend client
let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Email template types
export type EmailTemplate =
  | 'welcome'
  | 'download-delivery'
  | 'fulfillment-started'
  | 'fulfillment-complete'
  | 'subscription-renewal'
  | 'support-ticket'
  | 'invoice-receipt'
  | 'retention-reengagement'
  | 'system-alert';

interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

// Template subjects
const SUBJECTS: Record<EmailTemplate, string> = {
  'welcome': '🚀 Welcome to Rensto - Your Automation Journey Begins',
  'download-delivery': '📦 Your Rensto Template is Ready to Download',
  'fulfillment-started': '⚙️ We\'re Building Your Automation System',
  'fulfillment-complete': '✅ Your Rensto System is Live!',
  'subscription-renewal': '🔄 Your Rensto Subscription Renewal',
  'support-ticket': '🎫 Support Ticket Created - We\'re On It',
  'invoice-receipt': '🧾 Your Rensto Receipt',
  'retention-reengagement': '👋 We Miss You at Rensto',
  'system-alert': '🔴 System Alert — Rensto Monitoring',
};

// Generate HTML for each template
function generateEmailHtml(template: EmailTemplate, data: Record<string, any>): string {
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
  `;

  switch (template) {
    case 'welcome':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">Welcome to Rensto!</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Hey ${data.customerName || 'there'}! 🎉
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Thank you for joining the Rensto ecosystem. You've just taken the first step toward 
              automating your business with AI-powered systems that work 24/7.
            </p>
            <div style="${cardStyle}">
              <h3 style="color: #00d4ff; margin-top: 0;">What happens next?</h3>
              <ul style="color: #cbd5e1; line-height: 1.8;">
                <li>Our team is setting up your automation environment</li>
                <li>You'll receive access credentials within 24 hours</li>
                <li>A dedicated specialist will reach out to onboard you</li>
              </ul>
            </div>
            <a href="https://rensto.com/dashboard" style="${buttonStyle}">Go to Dashboard</a>
            <p style="font-size: 14px; color: #64748b; margin-top: 40px;">
              Questions? Reply to this email or reach us at support@rensto.com
            </p>
          </div>
        </div>
      `;

    case 'download-delivery':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">Your Template is Ready! 📦</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Great news! Your purchase of <strong>${data.productName || 'Rensto Template'}</strong> is complete.
            </p>
            <div style="${cardStyle}">
              <h3 style="color: #00d4ff; margin-top: 0;">Download Details</h3>
              <p style="color: #cbd5e1;">Product: <strong>${data.productName}</strong></p>
              <p style="color: #cbd5e1;">Order ID: <code style="background: rgba(0,212,255,0.1); padding: 2px 8px; border-radius: 4px;">${data.orderId}</code></p>
            </div>
            <a href="${data.downloadUrl || 'https://rensto.com/marketplace'}" style="${buttonStyle}">Download Now</a>
            <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
              This link expires in 7 days. Need help installing? Check our <a href="https://rensto.com/docs" style="color: #00d4ff;">documentation</a>.
            </p>
          </div>
        </div>
      `;

    case 'fulfillment-started':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">We're Building Your System ⚙️</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Hey ${data.customerName || 'there'}! Your <strong>${data.productName}</strong> is now being set up.
            </p>
            <div style="${cardStyle}">
              <h3 style="color: #00d4ff; margin-top: 0;">What's happening now?</h3>
              <ul style="color: #cbd5e1; line-height: 1.8;">
                <li>✅ Payment confirmed</li>
                <li>⏳ Environment provisioning</li>
                <li>⏳ Custom configuration</li>
                <li>⏳ Testing & quality check</li>
              </ul>
              <p style="color: #94a3b8; font-size: 14px;">Estimated completion: 24-48 hours</p>
            </div>
            <a href="https://rensto.com/dashboard" style="${buttonStyle}">Track Progress</a>
          </div>
        </div>
      `;

    case 'fulfillment-complete':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #22c55e; font-size: 28px; margin-bottom: 16px;">Your System is Live! ✅</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Congratulations ${data.customerName || ''}! Your <strong>${data.productName}</strong> is now fully operational.
            </p>
            <div style="${cardStyle}">
              <h3 style="color: #22c55e; margin-top: 0;">Your Access Details</h3>
              <p style="color: #cbd5e1;">Dashboard: <a href="${data.dashboardUrl || 'https://rensto.com/dashboard'}" style="color: #00d4ff;">${data.dashboardUrl || 'Click here'}</a></p>
              ${data.credentials ? `<p style="color: #cbd5e1;">Credentials sent separately for security.</p>` : ''}
            </div>
            <a href="${data.dashboardUrl || 'https://rensto.com/dashboard'}" style="${buttonStyle}">Access Your Dashboard</a>
            <p style="font-size: 14px; color: #64748b; margin-top: 40px;">
              Need a walkthrough? <a href="https://rensto.com/contact" style="color: #00d4ff;">Book an onboarding call</a>
            </p>
          </div>
        </div>
      `;

    case 'support-ticket':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">We've Got Your Request 🎫</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Your support ticket has been created. Our team is on it!
            </p>
            <div style="${cardStyle}">
              <p style="color: #94a3b8; margin: 0;">Ticket ID</p>
              <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 4px 0 16px 0;">${data.ticketId}</p>
              <p style="color: #94a3b8; margin: 0;">Subject</p>
              <p style="color: #ffffff; margin: 4px 0;">${data.subject}</p>
            </div>
            <p style="font-size: 14px; color: #64748b;">
              Expected response time: <strong style="color: #cbd5e1;">Within 24 hours</strong>
            </p>
          </div>
        </div>
      `;

    case 'invoice-receipt':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">Payment Receipt 🧾</h1>
            <div style="${cardStyle}">
              <table style="width: 100%; color: #cbd5e1;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Date</td>
                  <td style="padding: 8px 0; text-align: right;">${data.date || new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Product</td>
                  <td style="padding: 8px 0; text-align: right;">${data.productName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Amount</td>
                  <td style="padding: 8px 0; text-align: right; font-size: 20px; color: #22c55e;">$${data.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Transaction ID</td>
                  <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${data.transactionId}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 14px; color: #64748b;">
              This receipt is for your records. Questions about billing? Email billing@rensto.com
            </p>
          </div>
        </div>
      `;

    case 'subscription-renewal':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">Subscription Renewal 🔄</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Your ${data.planName || 'Rensto'} subscription has been renewed.
            </p>
            <div style="${cardStyle}">
              <p style="color: #94a3b8; margin: 0;">Plan</p>
              <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 4px 0 16px 0;">${data.planName}</p>
              <p style="color: #94a3b8; margin: 0;">Next billing date</p>
              <p style="color: #ffffff; margin: 4px 0;">${data.nextBillingDate}</p>
              <p style="color: #94a3b8; margin: 0;">Amount</p>
              <p style="color: #22c55e; font-size: 20px; margin: 4px 0;">$${data.amount}/month</p>
            </div>
            <a href="https://rensto.com/subscriptions" style="${buttonStyle}">Manage Subscription</a>
          </div>
        </div>
      `;

    case 'retention-reengagement':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 16px;">We Miss You! 👋</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Hey ${data.customerName || 'there'}! It's been a while since you visited Rensto.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Your automation systems are still working 24/7, but we'd love to show you what's new!
            </p>
            <div style="${cardStyle}">
              <h3 style="color: #00d4ff; margin-top: 0;">What's New?</h3>
              <ul style="color: #cbd5e1; line-height: 1.8;">
                <li>🚀 New AI agents in the marketplace</li>
                <li>📊 Enhanced dashboard analytics</li>
                <li>🤖 Improved automation templates</li>
              </ul>
            </div>
            <a href="https://rensto.com/marketplace" style="${buttonStyle}">Explore New Features</a>
            <p style="font-size: 14px; color: #64748b; margin-top: 40px;">
              Not interested? <a href="${data.unsubscribeUrl || '#'}" style="color: #64748b;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `;

    case 'system-alert':
      return `
        <div style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <img src="https://rensto.com/rensto-logo.webp" alt="Rensto" width="120" style="margin-bottom: 24px;" />
            <h1 style="color: ${data.severity === 'critical' ? '#fe3d51' : '#f59e0b'}; font-size: 28px; margin-bottom: 16px;">
              System Alert ${data.severity === 'critical' ? '🔴' : '🟡'}
            </h1>
            <div style="${cardStyle}; border-color: ${data.severity === 'critical' ? 'rgba(254,61,81,0.3)' : 'rgba(245,158,11,0.3)'};">
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase;">Service</p>
              <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 4px 0 16px 0;">${data.serviceName || data.serviceId || 'Unknown'}</p>
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase;">Condition</p>
              <p style="color: #ffffff; margin: 4px 0 16px 0;">${data.condition || 'service_down'}</p>
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase;">Message</p>
              <p style="color: #ffffff; margin: 4px 0;">${data.message || 'No details available'}</p>
            </div>
            <a href="https://admin.rensto.com" style="${buttonStyle}">Open Admin Dashboard</a>
            <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
              This alert was generated by the Rensto System Monitor at ${new Date().toLocaleString()}.
            </p>
          </div>
        </div>
      `;

    default:
      return `<p>Email template not found.</p>`;
  }
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, template, data }: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error('[EMAIL] RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const resend = getResend(); // Initialize Resend lazily only when sending
    if (!resend) {
      return { success: false, error: 'Resend client initialization failed' };
    }
    const result = await resend.emails.send({
      from: 'Rensto <notifications@rensto.com>',
      to,
      subject: SUBJECTS[template],
      html: generateEmailHtml(template, data),
    });

    console.log(`[EMAIL] Sent ${template} to ${to}, id: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.error(`[EMAIL] Failed to send ${template} to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Convenience functions for common emails
 */
export const emails = {
  welcome: (to: string, customerName?: string) =>
    sendEmail({ to, template: 'welcome', data: { customerName } }),

  downloadDelivery: (to: string, productName: string, downloadUrl: string, orderId: string) =>
    sendEmail({ to, template: 'download-delivery', data: { productName, downloadUrl, orderId } }),

  fulfillmentStarted: (to: string, customerName: string, productName: string) =>
    sendEmail({ to, template: 'fulfillment-started', data: { customerName, productName } }),

  fulfillmentComplete: (to: string, customerName: string, productName: string, dashboardUrl?: string) =>
    sendEmail({ to, template: 'fulfillment-complete', data: { customerName, productName, dashboardUrl } }),

  supportTicket: (to: string, ticketId: string, subject: string) =>
    sendEmail({ to, template: 'support-ticket', data: { ticketId, subject } }),

  invoiceReceipt: (to: string, productName: string, amount: number, transactionId: string) =>
    sendEmail({ to, template: 'invoice-receipt', data: { productName, amount, transactionId, date: new Date().toLocaleDateString() } }),

  subscriptionRenewal: (to: string, planName: string, amount: number, nextBillingDate: string) =>
    sendEmail({ to, template: 'subscription-renewal', data: { planName, amount, nextBillingDate } }),

  reengagement: (to: string, customerName?: string) =>
    sendEmail({ to, template: 'retention-reengagement', data: { customerName } }),

  systemAlert: (to: string, serviceId: string, severity: 'critical' | 'warning', condition: string, message: string) =>
    sendEmail({ to, template: 'system-alert', data: { serviceId, severity, condition, message } }),
};
