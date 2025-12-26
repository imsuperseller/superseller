import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory rate limiter (Note: resets on lambda cold start)
// Map<IP, { count: number, resetTime: number }>
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 20; // max requests
const WINDOW = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
    try {
        // 1. Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const record = rateLimit.get(ip);

        if (record) {
            if (now > record.resetTime) {
                rateLimit.set(ip, { count: 1, resetTime: now + WINDOW });
            } else if (record.count >= LIMIT) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please try again later.' },
                    { status: 429 }
                );
            } else {
                record.count++;
            }
        } else {
            rateLimit.set(ip, { count: 1, resetTime: now + WINDOW });
        }

        // 2. Parse Body
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
        }

        // 3. System Prompt (Guardrails)
        const systemPrompt = `
You are the "Rensto Architect", a specialist AI for the Rensto Business Automation Platform.
Your goal is to help potential customers understand the "WhatsApp Operating System" configuration.

PRODUCT CONTEXT:
- Core Product: "Base Platform" ($249/mo). Includes text-based AI agent, hosting, session management.
- Add-ons: 
  - "Media Messaging Pack" (Rich media, catalogs, product cards).
  - "Human Handoff Inbox" (For transferring complex queries to humans).
  - "Extra Numbers" (+$149/mo).
- Integrations: Supports all major CRMs (HubSpot, Salesforce) and E-com (Shopify) via API/Webhooks.
- Security: Enterprise-grade, encrypted, rate-limited to prevent bans.

GUARDRAILS:
1. STRICT SCOPE: Only answer questions related to Rensto, business automation, WhatsApp, CRMs, or technical configuration.
2. REFUSAL: If asked about poetry, politics, coding help (unrelated to Rensto), or off-topic chatter, politely refuse: "I'm tuned specifically to help you architect your Rensto system. Let's focus on your business automation."
3. GREETINGS: If the user says "Hi" or "Hello", respond warmly: "Hello! I am the Rensto Architect. What kind of automation system are you looking to build?"
4. TONE: Professional, confident, concise (under 3 sentences).
5. SALES ORIENTATION: Always pivot back to how the configuration solves their problem.

User Input: ${message}
`;

        // 4. OpenAI Call
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Architect AI Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
