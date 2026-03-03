---
name: Respond to Customer
description: Draft a professional response to a customer issue using SuperSeller brand voice
---

# Respond to Customer

Draft a professional, on-brand response to a customer support issue. The response should be ready to send via WhatsApp or email.

## Input

The user will provide:
1. The customer issue or question (from triage or direct)
2. The channel: WhatsApp or Email
3. Any additional context (what was already tried, internal notes)

## Brand Voice Guidelines

SuperSeller AI brand voice is:
- **Confident** — We know our stuff. No hedging or over-apologizing.
- **Practical** — Get to the point. Provide actionable next steps.
- **Empathetic** — Acknowledge the frustration without being sycophantic.
- **Direct** — Israeli/Jewish business owners appreciate directness. No corporate fluff.
- **Warm but professional** — First name basis, conversational tone, but not overly casual.

### Do:
- Use the customer's first name
- Acknowledge the issue in the first sentence
- Provide a clear timeline for resolution
- Include specific next steps
- End with a concrete action or commitment

### Do NOT:
- Over-apologize ("We're SO sorry for the inconvenience...")
- Use corporate jargon ("We're escalating this to our team...")
- Be vague about timelines ("We'll get back to you soon...")
- Use emojis excessively (one or two max for WhatsApp, none for email)
- Promise things we cannot deliver

## WhatsApp Response Format

WhatsApp messages should be:
- **Short** — 2-4 paragraphs max
- **Scannable** — Use line breaks between thoughts
- **Actionable** — End with what happens next

Template:
```
Hey [First Name],

[Acknowledge the issue in 1 sentence.]

[What we found / what's happening — 1-2 sentences.]

[What we're doing about it / next steps — 1-2 sentences.]

[Timeline and what they can expect.]
```

## Email Response Format

Emails can be slightly more detailed:
- **Subject line**: Clear and specific (not "Re: Support")
- **Body**: 3-5 paragraphs
- **Signature**: SuperSeller AI Support

Template:
```
Subject: [Specific issue] — [Resolution/Status]

Hi [First Name],

[Acknowledge the issue.]

[Explanation of what happened and why.]

[What we've done to fix it.]

[Next steps and timeline.]

[Closing — what they should do if the issue persists.]

Best,
SuperSeller AI Support
superseller.agency
```

## Response Examples by Product

### TourReel Issue
"Hey [Name], I see the video render got stuck — looks like the Kling API had a hiccup on that listing. I've restarted the job and it's processing now. You should have the finished video within 20 minutes. I'll send it over as soon as it's ready."

### FB Bot Issue
"Hey [Name], the marketplace posting paused because the GoLogin session expired — this happens every few days with Facebook's security. I've refreshed the session and your listings are going back up now. You'll see new posts within the hour."

### Billing Issue
"Hey [Name], I checked your account and the payment went through on PayPal's end but our system hadn't synced yet. I've manually updated your credits — you should see your full balance now. Let me know if anything looks off."

## Process

1. **Identify the issue type** from the triage or user description.
2. **Check customer context** — use `/customer-status` if needed to understand their history.
3. **Draft the response** using the appropriate channel format.
4. **Include specific details** — don't be generic. Reference their product, their issue, their timeline.
5. **Present the draft** to the user for approval before sending.

## Sending

After user approves:
- **WhatsApp**: Send via WAHA API to the customer's phone number.
- **Email**: Send via Resend API to the customer's email.

Always confirm delivery status after sending.
