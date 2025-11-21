import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    // Parse FormData instead of JSON
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const step = formData.get('step') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    // Step 1: Transcribe audio using OpenAI Whisper
    const transcription = await transcribeAudio(audioFile);

    // Step 2: Generate AI response using OpenAI GPT
    const aiResponse = await generateAIResponse(transcription, step);

    // Step 3: Generate TTS audio using OpenAI TTS
    const ttsAudio = await generateTTSAudio(aiResponse);

    // Step 4: Save consultation data to Airtable
    await saveConsultationData(sessionId, step, transcription, aiResponse);

    // Step 5: Update consultation progress
    const progress = updateConsultationProgress(step);

    return NextResponse.json({
      success: true,
      transcription,
      aiResponse,
      ttsAudio,
      progress,
      nextStep: getNextStep(step)
    });

  } catch (error) {
    console.error('Voice AI consultation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process voice consultation' },
      { status: 500 }
    );
  }
}

async function transcribeAudio(audioFile: File) {
  try {
    // Transcribe using OpenAI Whisper - audioFile is already a File object from FormData
    const openai = getOpenAI();
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      prompt: 'This is a business consultation about automation needs.'
    });

    return transcription.text;

  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

async function generateAIResponse(transcription: string, step: string) {
  try {
    const stepPrompts = {
      'business-type': 'The user is describing their business. Acknowledge their business and ask for more details about their specific operations.',
      'challenges': 'The user is describing their operational challenges. Acknowledge their pain points and ask for specific examples.',
      'goals': 'The user is describing their automation goals. Acknowledge their goals and ask about their desired outcomes.',
      'budget': 'The user is discussing their budget. Acknowledge their budget range and ask about their investment priorities.',
      'timeline': 'The user is discussing their timeline. Acknowledge their timeline and ask about their urgency and priorities.'
    };

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automation consultant helping businesses identify their automation needs. Be conversational, helpful, and ask follow-up questions when appropriate.'
        },
        {
          role: 'user',
          content: `${stepPrompts[step as keyof typeof stepPrompts] || 'The user is responding to a consultation question.'} User said: "${transcription}"`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0].message.content || 'I understand. Let me help you with that.';

  } catch (error) {
    console.error('AI response generation error:', error);
    throw new Error('Failed to generate AI response');
  }
}

async function generateTTSAudio(text: string) {
  try {
    const openai = getOpenAI();
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      speed: 1.0
    });

    const buffer = await mp3.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');

    return base64Audio;

  } catch (error) {
    console.error('TTS generation error:', error);
    throw new Error('Failed to generate TTS audio');
  }
}

async function saveConsultationData(sessionId: string, step: string, transcription: string, aiResponse: string) {
  try {
    // Save to Boost.space using note module (Space 45: n8n Workflows Notes)
    // This provides flexibility for consultation data storage
    const boostSpaceApiKey = process.env.BOOST_SPACE_API_KEY;

    if (!boostSpaceApiKey) {
      console.warn('Boost.space API key missing, skipping save');
      return { success: false, message: 'Configuration missing' };
    }

    // Create consultation record using Boost.space MCP pattern
    const consultationNote = {
      name: `Voice Consultation - ${sessionId} - Step ${step}`,
      description: `**Session ID**: ${sessionId}\n**Step**: ${step}\n**User Response**: ${transcription}\n**AI Response**: ${aiResponse}\n**Timestamp**: ${new Date().toISOString()}`,
      spaces: [45], // n8n Workflows (Notes) space
      labels: ['voice-consultation', step, 'active']
    };

    // Use Boost.space API directly
    const response = await fetch('https://superseller.boost.space/api/note', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${boostSpaceApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(consultationNote)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Boost.space save error:', errorText);
      throw new Error(`Failed to save consultation data: ${response.status}`);
    }

    const result = await response.json();
    console.log('Consultation saved to Boost.space:', result);
    return result;

  } catch (error) {
    console.error('Boost.space save error:', error);
    // Don't throw - allow consultation to continue even if save fails
    return { success: false, error: String(error) };
  }
}

function updateConsultationProgress(step: string) {
  const steps = ['business-type', 'challenges', 'goals', 'budget', 'timeline'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return {
    currentStep: step,
    progress: Math.round(progress),
    completed: currentIndex === steps.length - 1,
    nextStep: currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
  };
}

function getNextStep(currentStep: string) {
  const steps = ['business-type', 'challenges', 'goals', 'budget', 'timeline'];
  const currentIndex = steps.indexOf(currentStep);

  if (currentIndex < steps.length - 1) {
    return steps[currentIndex + 1];
  }

  return 'complete';
}

export async function GET() {
  return NextResponse.json({
    message: 'Voice AI Consultation API',
    endpoints: {
      POST: '/api/voice-ai/consultation - Process voice consultation',
      GET: '/api/voice-ai/consultation - Get API information'
    },
    features: [
      'OpenAI Whisper transcription',
      'OpenAI GPT-4o response generation',
      'OpenAI TTS audio generation',
      'Boost.space consultation data storage (Space 45, note module)',
      'Step-by-step consultation flow',
      'Session tracking and progress monitoring'
    ]
  });
}