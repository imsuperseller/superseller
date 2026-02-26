import { telnyxFetch } from "./telnyx";
import { config } from "../config";
import { logger } from "../utils/logger";

// ─── TYPES ───

export interface TelnyxVoiceConfig {
    voice: string;
    language: string;
    voiceSettings?: { api_key_ref: string };
}

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

// ─── CALL CONTROL ACTIONS ───

export async function answerCall(callControlId: string): Promise<void> {
    logger.info({ msg: "Answering call", callControlId });
    await telnyxFetch(`/calls/${callControlId}/actions/answer`, {
        method: "POST",
        body: JSON.stringify({}),
    });
}

export async function speakText(
    callControlId: string,
    text: string,
    voice: TelnyxVoiceConfig
): Promise<void> {
    await telnyxFetch(`/calls/${callControlId}/actions/speak`, {
        method: "POST",
        body: JSON.stringify({
            payload: text,
            voice: voice.voice,
            language: voice.language,
            voice_settings: voice.voiceSettings,
        }),
    });
}

export async function gatherUsingSpeech(
    callControlId: string,
    text: string,
    voice: TelnyxVoiceConfig
): Promise<void> {
    await telnyxFetch(`/calls/${callControlId}/actions/gather_using_speak`, {
        method: "POST",
        body: JSON.stringify({
            payload: text,
            voice: voice.voice,
            language: voice.language,
            gather_type: "speech",
            voice_settings: voice.voiceSettings,
        }),
    });
}

export async function hangupCall(callControlId: string): Promise<void> {
    await telnyxFetch(`/calls/${callControlId}/actions/hangup`, {
        method: "POST",
        body: JSON.stringify({}),
    });
}

// ─── AI CHAT (via Telnyx AI Gateway → GPT-4o) ───

export async function chatCompletion(
    systemPrompt: string,
    conversationHistory: ChatMessage[],
    model?: string
): Promise<string> {
    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
    ];

    const result = await telnyxFetch<any>("/ai/chat/completions", {
        method: "POST",
        body: JSON.stringify({
            model: model || config.telnyx.voiceChatModel,
            messages,
        }),
    });

    // Telnyx returns OpenAI-compatible format
    const content = result?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Empty AI response from Telnyx chat");
    }
    return content;
}
