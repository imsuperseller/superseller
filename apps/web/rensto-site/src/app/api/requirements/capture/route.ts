import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
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
    const { transcription, sessionId, method = 'voice-consultation' } = await request.json();

    if (!transcription || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Transcription and session ID are required' },
        { status: 400 }
      );
    }

    // Step 1: Extract requirements using AI
    const extractedRequirements = await extractRequirementsWithAI(transcription);

    // Step 2: Categorize requirements
    const categorizedRequirements = categorizeRequirements(extractedRequirements);

    // Step 3: Analyze requirements
    const analysis = analyzeRequirements(categorizedRequirements);

    // Step 4: Save to Firestore
    const savedRequirements = await saveRequirementsToFirestore(sessionId, categorizedRequirements, analysis, transcription);

    // Step 5: Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(categorizedRequirements);

    await auditAgent.log({
      service: 'firebase',
      action: 'requirements_captured',
      status: 'success',
      details: { sessionId, requirementCount: analysis.totalRequirements }
    });

    return NextResponse.json({
      success: true,
      requirements: categorizedRequirements,
      analysis: analysis,
      followUpQuestions: followUpQuestions,
      savedRequirements: savedRequirements
    });

  } catch (error: any) {
    console.error('Requirements capture error:', error);
    await auditAgent.log({
      service: 'firebase',
      action: 'requirements_capture_failed',
      status: 'error',
      errorMessage: error.message,
      details: { sessionId: (await request.clone().json().catch(() => ({}))).sessionId }
    });
    return NextResponse.json(
      { success: false, error: 'Failed to capture requirements' },
      { status: 500 }
    );
  }
}

async function extractRequirementsWithAI(transcription: string) {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst. Extract and categorize requirements from the following consultation transcript. Return a structured JSON response with categories: business_objectives, functional_requirements, technical_requirements, constraints, and stakeholders.'
        },
        {
          role: 'user',
          content: `Extract requirements from this consultation: ${transcription}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.3
    });

    const aiResponse = response.choices[0].message.content || '{}';
    return JSON.parse(aiResponse);

  } catch (error) {
    console.error('AI requirements extraction error:', error);
    throw new Error('Failed to extract requirements with AI');
  }
}

function categorizeRequirements(requirements: any) {
  const categories = ['business_objectives', 'functional_requirements', 'technical_requirements', 'constraints', 'stakeholders'];
  const categorized: any = {};

  categories.forEach(cat => {
    const items = requirements[cat] || [];
    categorized[cat] = items.map((desc: string) => ({
      id: generateRequirementId(),
      description: desc,
      priority: 'medium',
      status: 'draft',
      complexity: cat === 'technical_requirements' ? 'complex' : 'moderate'
    }));
  });

  return categorized;
}

function analyzeRequirements(requirements: any) {
  let total = 0;
  const byCategory: any = {};

  for (const cat in requirements) {
    total += requirements[cat].length;
    byCategory[cat] = requirements[cat].length;
  }

  return {
    totalRequirements: total,
    byCategory,
    timestamp: new Date().toISOString()
  };
}

async function saveRequirementsToFirestore(sessionId: string, requirements: any, analysis: any, transcription: string) {
  const db = getFirestoreAdmin();
  const docRef = db.collection('requirements').doc(sessionId);

  const data = {
    sessionId,
    transcription,
    requirements,
    analysis,
    updatedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    status: 'active'
  };

  await docRef.set(data, { merge: true });

  return {
    success: true,
    id: sessionId
  };
}

function generateFollowUpQuestions(requirements: any) {
  const questions = [];
  if (requirements.business_objectives.length === 0) questions.push('What are the primary business goals for this project?');
  if (requirements.technical_requirements.length === 0) questions.push('Are there any specific technical platforms or integrations required?');
  return questions;
}

function generateRequirementId() {
  return `REQ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
}

export async function GET() {
  return NextResponse.json({
    message: 'Requirements Capture API (Firestore)',
    features: ['AI Extraction', 'Firestore Persistence', 'Audit Logging']
  });
}
