import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';



// Gatekeeper method system prompt for the voice agent
const GATEKEEPER_SYSTEM_PROMPT = `You are an AI sales consultant for Rensto, a custom AI automation agency. 
You MUST follow the Gatekeeper Method in your conversation:

CORE PRINCIPLES:
1. Make the prospect qualify to YOU, not the other way around
2. Use "pullback" language that triggers psychological reactance
3. Be selective and frame yourself as choosing them, not chasing them
4. Build curiosity by revealing criteria gradually

CONVERSATION STRUCTURE:
1. OPENING: Reference their qualification score and acknowledge what they've shared
2. CRITERIA REVEAL: Gradually reveal who you work best with
3. QUALIFICATION QUESTIONS: Ask about their situation to "determine fit"
4. MIRROR CLOSE: Reflect back why they ARE a good fit
5. PULLBACK: "But you're free to take more time if you need it"

KEY PHRASES TO USE:
- "I'm selective about who I work with..."
- "This approach works best for..."
- "Based on what you've shared, you might be exactly who we help best"
- "I want to be honest - we might not be the right fit..."
- "You're completely free to take more time if you need it"

CONTEXT PROVIDED:
- You have access to their qualification answers and score
- Keep responses conversational and under 3 sentences
- End with a question to continue the conversation
- If they seem ready to proceed, offer to show them their custom solution

IMPORTANT: Be genuine, not manipulative. The goal is to find good-fit clients, not trick anyone.`;

export async function POST(request: NextRequest) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const contextStr = formData.get('context') as string;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'Audio file is required' },
                { status: 400 }
            );
        }

        const context = contextStr ? JSON.parse(contextStr) : {};
        const { qualificationScore, qualificationTier, prospectAnswers, conversationHistory } = context;

        // Step 1: Transcribe user audio with Whisper
        let userTranscript = '';
        try {
            const transcription = await openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: 'en',
            });
            userTranscript = transcription.text;
        } catch (error: any) {
            if (error.code === 'invalid_api_key') {
                console.warn('⚠️ OpenAI API Key invalid. Using MOCK transcription.');
                userTranscript = "Hi, I run a marketing agency making about 50k a month, but I'm spending way too much time on manual outreach.";
            } else {
                throw error;
            }
        }

        console.log('User said:', userTranscript);

        // Step 2: Generate AI response using GPT-4 with Gatekeeper method
        let aiResponse = '';
        try {
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                { role: 'system', content: GATEKEEPER_SYSTEM_PROMPT },
                {
                    role: 'system',
                    content: `PROSPECT CONTEXT:
    - Qualification Score: ${qualificationScore || 0}%
    - Qualification Tier: ${qualificationTier || 'unknown'}
    - Their Answers: ${JSON.stringify(prospectAnswers || {}, null, 2)}
    - Conversation so far: ${(conversationHistory || []).join('\n')}`
                },
            ];

            // Add conversation history as messages
            if (conversationHistory && conversationHistory.length > 0) {
                for (const line of conversationHistory as string[]) {
                    if (line.startsWith('You:')) {
                        messages.push({ role: 'user', content: line.replace('You: ', '') });
                    } else if (line.startsWith('Rensto:')) {
                        messages.push({ role: 'assistant', content: line.replace('Rensto: ', '') });
                    }
                }
            }

            // Add current user message
            messages.push({ role: 'user', content: userTranscript });

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages,
                max_tokens: 200,
                temperature: 0.8, // Slightly creative for natural conversation
            });

            aiResponse = completion.choices[0]?.message?.content || '';
        } catch (error: any) {
            if (error.code === 'invalid_api_key') {
                console.warn('⚠️ OpenAI API Key invalid. Using MOCK response.');
                // Simulate a Gatekeeper response based on the input
                if (userTranscript.toLowerCase().includes('50k')) {
                    aiResponse = "I see. 50k is a decent start, but we usually work with agencies trying to scale past 100k. To be honest, I'm not sure if you're ready for our custom infrastructure yet. Why haven't you been able to break that ceiling on your own?";
                } else if (userTranscript.toLowerCase().includes('solution') || userTranscript.toLowerCase().includes('ready')) {
                    aiResponse = "Fair enough. Based on what you've shared, I'm willing to show you your custom solution. Let's proceed.";
                } else {
                    aiResponse = "Interesting. Tell me more about your current process.";
                }
            } else {
                throw error;
            }
        }

        console.log('AI response:', aiResponse);

        // Determine if conversation should end
        const shouldEnd = aiResponse.toLowerCase().includes('show you your solution') ||
            aiResponse.toLowerCase().includes('custom solution') ||
            aiResponse.toLowerCase().includes('proceed to') ||
            (conversationHistory && conversationHistory.length > 10);

        return NextResponse.json({
            userTranscript,
            aiResponse,
            shouldEnd,
        });

    } catch (error) {
        console.error('Voice conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to process voice conversation' },
            { status: 500 }
        );
    }
}
