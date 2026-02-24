import { getEnv } from "./env";

export async function sendMagicLink(email: string, token: string): Promise<boolean> {
  const env = getEnv();
  const verifyUrl = `${env.APP_URL}/verify?token=${token}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: email,
        subject: "Rensto Studio — Login Link",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #3A388E;">Rensto Studio</h2>
            <p>Click below to sign in:</p>
            <a href="${verifyUrl}"
               style="display: inline-block; padding: 12px 32px; background: #3A388E; color: white;
                      text-decoration: none; border-radius: 8px; font-weight: 600;">
              Sign In
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This link expires in 15 minutes. If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Resend error:", err);
    return false;
  }
}
