import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AirtableApi } from '@/lib/airtable';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const airtable = new AirtableApi();

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
    
    // Step 4: Save to Airtable
    const savedRequirements = await saveRequirementsToAirtable(sessionId, categorizedRequirements, analysis);
    
    // Step 5: Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(categorizedRequirements);
    
    return NextResponse.json({
      success: true,
      requirements: categorizedRequirements,
      analysis: analysis,
      followUpQuestions: followUpQuestions,
      savedRequirements: savedRequirements
    });

  } catch (error) {
    console.error('Requirements capture error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to capture requirements' },
      { status: 500 }
    );
  }
}

async function extractRequirementsWithAI(transcription: string) {
  try {
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
      max_tokens: 1000,
      temperature: 0.7
    });
    
    const aiResponse = response.choices[0].message.content || '';
    
    // Parse AI response to extract requirements
    const requirements = parseAIResponse(aiResponse);
    
    return requirements;
    
  } catch (error) {
    console.error('AI requirements extraction error:', error);
    throw new Error('Failed to extract requirements with AI');
  }
}

function parseAIResponse(aiResponse: string) {
  try {
    // Try to parse as JSON first
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to text parsing
    const requirements = {
      business_objectives: [],
      functional_requirements: [],
      technical_requirements: [],
      constraints: [],
      stakeholders: []
    };
    
    // Simple text parsing logic
    const lines = aiResponse.split('\n');
    let currentCategory: string | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase().includes('business objective')) {
        currentCategory = 'business_objectives';
      } else if (trimmedLine.toLowerCase().includes('functional')) {
        currentCategory = 'functional_requirements';
      } else if (trimmedLine.toLowerCase().includes('technical')) {
        currentCategory = 'technical_requirements';
      } else if (trimmedLine.toLowerCase().includes('constraint')) {
        currentCategory = 'constraints';
      } else if (trimmedLine.toLowerCase().includes('stakeholder')) {
        currentCategory = 'stakeholders';
      } else if (currentCategory && trimmedLine.startsWith('-')) {
        (requirements as any)[currentCategory].push(trimmedLine.substring(1).trim());
      }
    }
    
    return requirements;
    
  } catch (error) {
    console.error('AI response parsing error:', error);
    return {
      business_objectives: [],
      functional_requirements: [],
      technical_requirements: [],
      constraints: [],
      stakeholders: []
    };
  }
}

function categorizeRequirements(requirements: any) {
  const categorizedRequirements = {
    business_objectives: requirements.business_objectives.map((obj: string) => ({
      id: generateRequirementId(),
      type: 'business_objective',
      description: obj,
      priority: 'high',
      status: 'draft',
      complexity: 'moderate'
    })),
    functional_requirements: requirements.functional_requirements.map((req: string) => ({
      id: generateRequirementId(),
      type: 'functional_requirement',
      description: req,
      priority: 'medium',
      status: 'draft',
      complexity: 'moderate'
    })),
    technical_requirements: requirements.technical_requirements.map((req: string) => ({
      id: generateRequirementId(),
      type: 'technical_requirement',
      description: req,
      priority: 'medium',
      status: 'draft',
      complexity: 'complex'
    })),
    constraints: requirements.constraints.map((constraint: string) => ({
      id: generateRequirementId(),
      type: 'constraint',
      description: constraint,
      priority: 'high',
      status: 'draft',
      complexity: 'simple'
    })),
    stakeholders: requirements.stakeholders.map((stakeholder: string) => ({
      id: generateRequirementId(),
      type: 'stakeholder',
      description: stakeholder,
      priority: 'high',
      status: 'draft',
      complexity: 'simple'
    }))
  };
  
  return categorizedRequirements;
}

function analyzeRequirements(requirements: any) {
  const analysis = {
    totalRequirements: countTotalRequirements(requirements),
    byCategory: countRequirementsByCategory(requirements),
    byPriority: countRequirementsByPriority(requirements),
    byComplexity: countRequirementsByComplexity(requirements),
    gaps: identifyGaps(requirements),
    conflicts: identifyConflicts(requirements),
    recommendations: generateRecommendations(requirements)
  };
  
  return analysis;
}

function countTotalRequirements(requirements: any) {
  let total = 0;
  for (const category in requirements) {
    total += requirements[category].length;
  }
  return total;
}

function countRequirementsByCategory(requirements: any) {
  const counts: any = {};
  for (const category in requirements) {
    counts[category] = requirements[category].length;
  }
  return counts;
}

function countRequirementsByPriority(requirements: any) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const category in requirements) {
    for (const req of requirements[category]) {
      counts[req.priority as keyof typeof counts] = (counts[req.priority as keyof typeof counts] || 0) + 1;
    }
  }
  return counts;
}

function countRequirementsByComplexity(requirements: any) {
  const counts = { simple: 0, moderate: 0, complex: 0, enterprise: 0 };
  for (const category in requirements) {
    for (const req of requirements[category]) {
      counts[req.complexity as keyof typeof counts] = (counts[req.complexity as keyof typeof counts] || 0) + 1;
    }
  }
  return counts;
}

function identifyGaps(requirements: any) {
  const gaps = [];
  
  // Check for missing business objectives
  if (requirements.business_objectives.length === 0) {
    gaps.push('Missing business objectives');
  }
  
  // Check for missing functional requirements
  if (requirements.functional_requirements.length === 0) {
    gaps.push('Missing functional requirements');
  }
  
  // Check for missing technical requirements
  if (requirements.technical_requirements.length === 0) {
    gaps.push('Missing technical requirements');
  }
  
  return gaps;
}

function identifyConflicts(requirements: any) {
  const conflicts = [];
  
  // Check for conflicting priorities
  const highPriorityCount = countRequirementsByPriority(requirements).high;
  if (highPriorityCount > 10) {
    conflicts.push('Too many high priority requirements');
  }
  
  // Check for conflicting constraints
  const constraints = requirements.constraints;
  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      if (areConflicting(constraints[i], constraints[j])) {
        conflicts.push(`Conflicting constraints: ${constraints[i].description} vs ${constraints[j].description}`);
      }
    }
  }
  
  return conflicts;
}

function areConflicting(req1: any, req2: any) {
  // Simple conflict detection logic
  const req1Lower = req1.description.toLowerCase();
  const req2Lower = req2.description.toLowerCase();
  
  if (req1Lower.includes('fast') && req2Lower.includes('slow')) {
    return true;
  }
  if (req1Lower.includes('cheap') && req2Lower.includes('expensive')) {
    return true;
  }
  if (req1Lower.includes('simple') && req2Lower.includes('complex')) {
    return true;
  }
  
  return false;
}

function generateRecommendations(requirements: any) {
  const recommendations = [];
  
  // Recommend based on gaps
  if (requirements.business_objectives.length === 0) {
    recommendations.push('Define clear business objectives');
  }
  
  if (requirements.functional_requirements.length === 0) {
    recommendations.push('Specify functional requirements');
  }
  
  if (requirements.technical_requirements.length === 0) {
    recommendations.push('Define technical requirements');
  }
  
  // Recommend based on complexity
  const complexCount = countRequirementsByComplexity(requirements).complex;
  if (complexCount > 5) {
    recommendations.push('Consider breaking down complex requirements');
  }
  
  return recommendations;
}

async function saveRequirementsToAirtable(sessionId: string, requirements: any, analysis: any) {
  try {
    const allRequirements = [];
    
    // Flatten requirements
    for (const category in requirements) {
      for (const req of requirements[category]) {
        allRequirements.push({
          'Session ID': sessionId,
          'Category': category,
          'Type': req.type,
          'Description': req.description,
          'Priority': req.priority,
          'Status': req.status,
          'Complexity': req.complexity,
          'Created': new Date().toISOString()
        });
      }
    }
    
    // Save to Airtable
    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_REQUIREMENTS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: allRequirements.map(req => ({ fields: req }))
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save requirements to Airtable');
    }
    
    const data = await response.json();
    
    return {
      success: true,
      records: data.records
    };
    
  } catch (error) {
    console.error('Airtable save error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function generateFollowUpQuestions(requirements: any) {
  const questions = [];
  
  // Generate questions based on gaps
  if (requirements.business_objectives.length === 0) {
    questions.push('What are your primary business objectives?');
  }
  
  if (requirements.functional_requirements.length === 0) {
    questions.push('What specific features do you need?');
  }
  
  if (requirements.technical_requirements.length === 0) {
    questions.push('What are your technical requirements?');
  }
  
  // Generate questions based on complexity
  const complexRequirements = getComplexRequirements(requirements);
  if (complexRequirements.length > 0) {
    questions.push('Can you provide more details about these complex requirements?');
  }
  
  return questions;
}

function getComplexRequirements(requirements: any) {
  const complexRequirements = [];
  for (const category in requirements) {
    for (const req of requirements[category]) {
      if (req.complexity === 'complex' || req.complexity === 'enterprise') {
        complexRequirements.push(req);
      }
    }
  }
  return complexRequirements;
}

function generateRequirementId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `REQ-${timestamp}-${random}`.toUpperCase();
}

export async function GET() {
  return NextResponse.json({
    message: 'Requirements Capture API',
    endpoints: {
      POST: '/api/requirements/capture - Capture requirements from consultation',
      GET: '/api/requirements/capture - Get API information'
    },
    features: [
      'AI-powered requirement extraction',
      'Automatic categorization',
      'Gap analysis',
      'Conflict detection',
      'Follow-up question generation'
    ]
  });
}
