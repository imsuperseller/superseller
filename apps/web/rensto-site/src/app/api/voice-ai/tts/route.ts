import { NextRequest, NextResponse } from 'next/server';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice IDs for different styles
const VOICE_IDS: Record<string, string> = {
    professional: 'ErXwobaYiN019PkySvjV', // Antoni - professional male
    friendly: 'MF3mGyEYCl7XYWbV9V6O', // Elli - friendly female
    authoritative: 'VR6AewLTigWG4xSOukaG', // Arnold - authoritative
};

export async function POST(request: NextRequest) {
    try {
        const { text, voice = 'professional' } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (!ELEVENLABS_API_KEY) {
            console.error('ELEVENLABS_API_KEY not configured');
            return NextResponse.json(
                { error: 'TTS service not configured' },
                { status: 500 }
            );
        }

        const voiceId = VOICE_IDS[voice] || VOICE_IDS.professional;

        // Call ElevenLabs Text-to-Speech API
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5, // More expressive
                        use_speaker_boost: true
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            return NextResponse.json(
                { error: 'TTS generation failed' },
                { status: response.status }
            );
        }

        // Get the audio data as ArrayBuffer
        const audioBuffer = await response.arrayBuffer();

        // Return audio as blob
        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });

    } catch (error) {
        console.error('TTS error:', error);
        return NextResponse.json(
            { error: 'Failed to generate speech' },
            { status: 500 }
        );
    }
}
