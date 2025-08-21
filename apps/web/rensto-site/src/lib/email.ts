import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2F6A92;">Welcome to Rensto!</h1>
        <p>Hi ${userName},</p>
        <p>Welcome to Rensto Business System! We're excited to help you automate your business processes.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Set up your first automation agent</li>
          <li>Connect your data sources</li>
          <li>Explore our marketplace</li>
          <li>Check out our documentation</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Rensto Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Rensto Business System',
      html,
    });
  }

  async sendAgentStatusEmail(userEmail: string, agentName: string, status: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2F6A92;">Agent Status Update</h1>
        <p>Your agent <strong>${agentName}</strong> has changed status to <strong>${status}</strong>.</p>
        <p>You can view the details in your Rensto dashboard.</p>
        <p>Best regards,<br>The Rensto Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Agent Status Update: ${agentName}`,
      html,
    });
  }

  async sendErrorNotification(userEmail: string, error: string, context: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Error Notification</h1>
        <p>An error occurred in your Rensto system:</p>
        <p><strong>Context:</strong> ${context}</p>
        <p><strong>Error:</strong> ${error}</p>
        <p>Our team has been notified and is working to resolve this issue.</p>
        <p>Best regards,<br>The Rensto Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Rensto System Error Notification',
      html,
    });
  }
}

export const emailService = new EmailService();
