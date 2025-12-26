import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';

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

    // Step 4: Save consultation data to Firestore
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
    const db = getFirestoreAdmin();
    const consultationRef = await db.collection(COLLECTIONS.CONSULTATIONS).add({
      sessionId,
      step,
      userResponse: transcription,
      aiResponse,
      timestamp: Timestamp.now(),
      type: 'voice-ai'
    });

    console.log('Consultation saved to Firestore:', consultationRef.id);
    return { success: true, id: consultationRef.id };

  } catch (error) {
    console.error('Firestore save error:', error);
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
      'Firestore consultation data storage',
      'Step-by-step consultation flow',
      'Session tracking and progress monitoring'
    ]
  });
}