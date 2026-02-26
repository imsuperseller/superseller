import { telnyxFetch } from "./telnyx";
import { config } from "../config";
import { logger } from "../utils/logger";

// ─── TYPES ───

export interface LeadAnalysis {
    topic: string;
    customerPhoneNumber: string;
    customerAddress: string;
    customerName: string;
    customerEmail: string;
    appointmentTime: string;
    issues: string[];
    keyPoints: string[];
    sentiment: "positive" | "neutral" | "frustrated" | "urgent";
    priority: "high" | "medium" | "low";
    category: string;
    actionItems: string[];
    bookingOutcome: "booked" | "callback_requested" | "declined" | "incomplete";
    callerPhoneNumber: string;
    callDuration: string;
    missingInfo: string[];
    confidenceScore: number;
}

const ANALYSIS_SCHEMA = `{
  "topic": "Main topic or reason for the call",
  "customerPhoneNumber": "Customer phone number",
  "customerAddress": "Full service address",
  "customerName": "Customer full name",
  "customerEmail": "Customer email if mentioned",
  "appointmentTime": "Scheduled or preferred appointment time",
  "issues": ["List of problems/needs mentioned"],
  "keyPoints": ["Key discussion points"],
  "sentiment": "positive | neutral | frustrated | urgent",
  "priority": "high | medium | low",
  "category": "Service type (e.g. repair, installation, inquiry, booking)",
  "actionItems": ["Follow-up actions needed"],
  "bookingOutcome": "booked | callback_requested | declined | incomplete",
  "callerPhoneNumber": "Phone number from caller ID",
  "callDuration": "Length of call if available",
  "missingInfo": ["Critical info NOT collected"],
  "confidenceScore": 0.0
}`;

// ─── ANALYSIS ───

export async function analyzeConversation(
    conversationData: Record<string, unknown>,
    metadata: Record<string, unknown>,
    businessContext?: string
): Promise<LeadAnalysis> {
    const businessInfo = businessContext || "a business automation service";

    const systemPrompt = `You are a lead analysis AI for ${businessInfo}.
Analyze Telnyx conversation insight data and extract lead information.
Extract WHATEVER information is available. If a field is not mentioned, use "UNKNOWN".

CRITICAL: Respond with ONLY a valid JSON object matching this schema. No markdown, no code blocks, no explanation.
${ANALYSIS_SCHEMA}`;

    const userMessage = `Analyze this conversation data:

${JSON.stringify(conversationData, null, 2)}

Conversation metadata (contains caller phone):
${JSON.stringify(metadata, null, 2)}`;

    try {
        const result = await telnyxFetch<any>("/ai/chat/completions", {
            method: "POST",
            body: JSON.stringify({
                model: config.telnyx.voiceChatModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.1,
            }),
        });

        const content = result?.choices?.[0]?.message?.content;
        if (!content) throw new Error("Empty AI response");

        // Parse JSON from response (handle markdown fences if present)
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(jsonStr) as LeadAnalysis;

        logger.info({ msg: "Lead analysis complete", topic: parsed.topic, sentiment: parsed.sentiment, priority: parsed.priority });
        return parsed;
    } catch (err: any) {
        logger.error({ msg: "Lead analysis failed", error: err.message });
        // Return minimal analysis on failure
        return {
            topic: "Analysis failed",
            customerPhoneNumber: (metadata?.from as string) || "UNKNOWN",
            customerAddress: "UNKNOWN",
            customerName: "UNKNOWN",
            customerEmail: "UNKNOWN",
            appointmentTime: "UNKNOWN",
            issues: [],
            keyPoints: ["AI analysis failed — manual review required"],
            sentiment: "neutral",
            priority: "medium",
            category: "unknown",
            actionItems: ["Manual review required"],
            bookingOutcome: "incomplete",
            callerPhoneNumber: (metadata?.telnyx_end_user_target as string) || "UNKNOWN",
            callDuration: "UNKNOWN",
            missingInfo: ["All — analysis failed"],
            confidenceScore: 0,
        };
    }
}
