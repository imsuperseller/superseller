import { config } from "../config";
import { logger } from "../utils/logger";

const BASE_URL = config.telnyx.baseUrl;
const API_KEY = config.telnyx.apiKey;

// ─── TYPES ───

export interface TelnyxAssistantConfig {
    name: string;
    instructions: string; // system prompt
    greeting: string; // first message said to caller
    model?: string; // e.g. "meta-llama/Llama-3.3-70B-Instruct"
    voice_settings?: {
        voice: string; // e.g. "Telnyx.KokoroTTS.af_heart" (NaturalHD fails silently)
        voice_speed?: number;
        background_audio?: { type: string; value: string; volume?: number };
    };
    transcription?: {
        model?: string; // e.g. "deepgram/nova-3"
        language?: string;
        settings?: { eot_threshold?: number; eot_timeout_ms?: number; eager_eot_threshold?: number };
    };
    telephony_settings?: {
        default_texml_app_id?: string;
        time_limit_secs?: number;
    };
    tools?: Array<{
        type: string;
        [key: string]: any;
    }>;
}

export interface TelnyxAssistant {
    id: string;
    name: string;
    instructions: string;
    greeting: string;
    model: string;
    voice_settings?: any;
    transcription?: any;
    telephony_settings?: any;
    tools?: any[];
    created_at: string;
    updated_at: string;
}

export interface TelnyxConversation {
    id: string;
    name: string;
    created_at: string;
    last_message_at: string | null;
    number_of_messages: number;
    system_prompt: string;
    metadata: {
        to?: string;
        from?: string;
        assistant_id?: string;
        call_control_id?: string;
        call_session_id?: string;
        call_leg_id?: string;
        telnyx_agent_target?: string;
        telnyx_end_user_target?: string;
        telnyx_conversation_channel?: string;
        assistant_version_id?: string;
    } | null;
    insight_id: string | null;
    insight_group_id: string | null;
}

export interface TelnyxConversationMessage {
    role: "user" | "assistant" | "tool";
    name: string | null;
    text: string;
    created_at: string;
    sent_at: string;
    tool_calls: Array<{ id: string; type: string; function: { name: string; arguments: string } }> | null;
    tool_call_id: string | null;
    metadata: Record<string, string> | null;
}

export interface TelnyxConversationInsight {
    conversation_id: string;
    summary: string;
    sentiment: "positive" | "neutral" | "negative";
    transcript: string;
    key_topics: string[];
    action_items: string[];
}

export interface TelnyxPhoneNumber {
    id: string;
    phone_number: string;
    status: string;
    connection_id?: string;
}

// ─── API CLIENT ───

async function telnyxFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        const body = await res.text();
        logger.error({ msg: "Telnyx API error", status: res.status, path, body });
        throw new Error(`Telnyx API ${res.status}: ${body}`);
    }

    const json = await res.json();
    return json.data ?? json;
}

// ─── AI ASSISTANTS ───

export async function createAssistant(
    cfg: TelnyxAssistantConfig
): Promise<TelnyxAssistant> {
    logger.info({ msg: "Creating Telnyx AI Assistant", name: cfg.name });
    return telnyxFetch<TelnyxAssistant>("/ai/assistants", {
        method: "POST",
        body: JSON.stringify(cfg),
    });
}

export async function getAssistant(
    assistantId: string
): Promise<TelnyxAssistant> {
    return telnyxFetch<TelnyxAssistant>(`/ai/assistants/${assistantId}`);
}

export async function updateAssistant(
    assistantId: string,
    updates: Partial<TelnyxAssistantConfig>
): Promise<TelnyxAssistant> {
    logger.info({ msg: "Updating Telnyx AI Assistant", assistantId });
    return telnyxFetch<TelnyxAssistant>(`/ai/assistants/${assistantId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
}

export async function deleteAssistant(assistantId: string): Promise<void> {
    logger.info({ msg: "Deleting Telnyx AI Assistant", assistantId });
    await telnyxFetch(`/ai/assistants/${assistantId}`, { method: "DELETE" });
}

// ─── CONVERSATIONS ───
// Telnyx conversations live at /ai/conversations (flat, not nested under assistants)
// Valid filter params: id, name, created_at, insight_id, insight_group_id,
// metadata, last_message_at, system_prompt, insights_instructions, use_insights_for_memory

export async function listConversations(
    _assistantId: string,
    opts: { pageSize?: number; pageNumber?: number } = {}
): Promise<TelnyxConversation[]> {
    const params = new URLSearchParams();
    params.set("page[size]", String(opts.pageSize || 50));
    if (opts.pageNumber) params.set("page[number]", String(opts.pageNumber));

    const result = await telnyxFetch<TelnyxConversation[]>(
        `/ai/conversations?${params}`
    );
    return Array.isArray(result) ? result : [];
}

export async function getConversation(
    conversationId: string
): Promise<TelnyxConversation> {
    return telnyxFetch<TelnyxConversation>(
        `/ai/conversations/${conversationId}`
    );
}

export async function getConversationInsights(
    conversationId: string
): Promise<TelnyxConversationInsight> {
    return telnyxFetch<TelnyxConversationInsight>(
        `/ai/conversations/${conversationId}/insights`
    );
}

// ─── PHONE NUMBERS ───

export async function listAvailableNumbers(
    areaCode?: string
): Promise<TelnyxPhoneNumber[]> {
    const params = new URLSearchParams();
    params.set("filter[country_code]", "US");
    params.set("filter[features][]", "voice");
    if (areaCode) params.set("filter[national_destination_code]", areaCode);
    params.set("page[size]", "5");

    return telnyxFetch<TelnyxPhoneNumber[]>(
        `/available_phone_numbers?${params}`
    );
}

export async function orderPhoneNumber(
    phoneNumber: string
): Promise<{ id: string; phone_number: string }> {
    logger.info({ msg: "Ordering Telnyx phone number", phoneNumber });
    const result = await telnyxFetch<any>("/number_orders", {
        method: "POST",
        body: JSON.stringify({
            phone_numbers: [{ phone_number: phoneNumber }],
        }),
    });
    return {
        id: result.phone_numbers?.[0]?.id || result.id,
        phone_number: phoneNumber,
    };
}

export async function assignNumberToAssistant(
    phoneNumberId: string,
    assistantId: string
): Promise<void> {
    logger.info({
        msg: "Assigning phone number to assistant",
        phoneNumberId,
        assistantId,
    });
    await telnyxFetch(`/ai/assistants/${assistantId}/phone_numbers`, {
        method: "POST",
        body: JSON.stringify({ phone_number_id: phoneNumberId }),
    });
}

// ─── CONVERSATION MESSAGES ───

export async function listConversationMessages(
    conversationId: string,
    opts: { pageSize?: number } = {}
): Promise<TelnyxConversationMessage[]> {
    const params = new URLSearchParams();
    params.set("page[size]", String(opts.pageSize || 50));
    const result = await telnyxFetch<TelnyxConversationMessage[]>(
        `/ai/conversations/${conversationId}/messages?${params}`
    );
    return Array.isArray(result) ? result : [];
}

// ─── OUTBOUND CALLS ───

export async function makeOutboundCall(
    texmlAppId: string,
    from: string,
    to: string,
    assistantId: string
): Promise<{ status: string; call_sid: string }> {
    logger.info({ msg: "Making outbound AI call", from, to, assistantId });
    return telnyxFetch<{ status: string; call_sid: string }>(
        `/texml/ai_calls/${texmlAppId}`,
        {
            method: "POST",
            body: JSON.stringify({ From: from, To: to, AIAssistantId: assistantId }),
        }
    );
}

// ─── UTILITY ───

export function isConfigured(): boolean {
    return !!API_KEY;
}
