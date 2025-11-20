import { Resend } from 'resend';

export async function sendScorecardEmail(email: string, name: string, pdfUrl: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email not sent.');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: 'Rensto <service@rensto.com>',
            to: email,
            subject: 'Your Automation Readiness Scorecard 🚀',
            html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Here is your Scorecard, ${name}!</h1>
          <p>Thank you for completing the Automation Readiness Scorecard.</p>
          <p>Based on your answers, we've generated a personalized report for you.</p>
          <p><strong><a href="${pdfUrl}">Download Your Scorecard PDF</a></strong></p>
          <br>
          <p>Ready to take the next step?</p>
          <p><a href="https://rensto.com/custom-solutions">Book a Business Audit</a></p>
        </div>
      `,
            attachments: [
                {
                    filename: 'Automation_Readiness_Scorecard.pdf',
                    path: pdfUrl,
                },
            ],
        });
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}
