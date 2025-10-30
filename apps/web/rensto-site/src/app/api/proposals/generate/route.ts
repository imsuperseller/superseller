import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AirtableApi } from '@/lib/airtable';

// Ensure this API route is always dynamic and not statically evaluated at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazily initialize OpenAI at request time to avoid build-time env access
function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

const airtable = new AirtableApi();

export async function POST(request: NextRequest) {
  try {
    const { requirements, clientInfo, projectInfo } = await request.json();

    if (!requirements || !clientInfo || !projectInfo) {
      return NextResponse.json(
        { success: false, error: 'Requirements, client info, and project info are required' },
        { status: 400 }
      );
    }

    // Step 1: Analyze requirements
    const requirementsAnalysis = analyzeRequirements(requirements);
    
    // Step 2: Select appropriate template
    const template = selectTemplate(requirementsAnalysis, projectInfo);
    
    // Step 3: Generate proposal sections
    const proposalSections = await generateProposalSections(requirementsAnalysis, clientInfo, projectInfo, template);
    
    // Step 4: Calculate pricing
    const pricing = calculatePricing(requirementsAnalysis, projectInfo);
    
    // Step 5: Assemble final proposal
    const finalProposal = assembleProposal(proposalSections, pricing, clientInfo);
    
    // Step 6: Save proposal to Airtable
    const savedProposal = await saveProposalToAirtable(finalProposal, clientInfo, projectInfo);
    
    return NextResponse.json({
      success: true,
      proposal: finalProposal,
      pricing: pricing,
      savedProposal: savedProposal
    });

  } catch (error) {
    console.error('Proposal generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
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

function selectTemplate(requirementsAnalysis: any, projectInfo: any) {
  // Simple template selection logic
  if (projectInfo.type === 'automation') {
    return 'automationProposal';
  } else if (projectInfo.type === 'integration') {
    return 'integrationProposal';
  } else if (projectInfo.type === 'development') {
    return 'customDevelopment';
  } else {
    return 'consultingProposal';
  }
}

async function generateProposalSections(requirementsAnalysis: any, clientInfo: any, projectInfo: any, template: string) {
  const sections: any = {};
  
  // Generate each section using AI
  const sectionNames = [
    'executive-summary',
    'project-overview',
    'requirements-analysis',
    'solution-approach',
    'implementation-plan',
    'timeline',
    'pricing',
    'team',
    'next-steps'
  ];
  
  for (const section of sectionNames) {
    sections[section] = await generateSection(section, requirementsAnalysis, clientInfo, projectInfo);
  }
  
  return sections;
}

async function generateSection(section: string, requirementsAnalysis: any, clientInfo: any, projectInfo: any) {
  try {
    const prompt = getSectionPrompt(section, requirementsAnalysis, clientInfo, projectInfo);
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert proposal writer. Create professional, compelling proposal content that addresses client needs and demonstrates value.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });
    
    return response.choices[0].message.content;
    
  } catch (error) {
    console.error(`Failed to generate ${section} section:`, error);
    return `[Error generating ${section} section]`;
  }
}

function getSectionPrompt(section: string, requirementsAnalysis: any, clientInfo: any, projectInfo: any) {
  const prompts: any = {
    'executive-summary': `Create an executive summary for ${projectInfo.name} that highlights the key benefits and value proposition for ${clientInfo.company}.`,
    'project-overview': `Write a project overview for ${projectInfo.name} that includes the objectives and scope.`,
    'requirements-analysis': `Analyze the following requirements and create a requirements analysis: ${JSON.stringify(requirementsAnalysis)}`,
    'solution-approach': `Describe the solution approach for ${projectInfo.name} using the proposed methodology and technologies.`,
    'implementation-plan': `Create an implementation plan for ${projectInfo.name} with clear phases and milestones.`,
    'timeline': `Create a project timeline for ${projectInfo.name} with the estimated duration and key dates.`,
    'pricing': `Generate pricing for ${projectInfo.name} with the estimated complexity and timeline.`,
    'team': `Describe the project team for ${projectInfo.name} with the required expertise and experience.`,
    'next-steps': `Create next steps for ${projectInfo.name} with the timeline and deliverables.`
  };
  
  return prompts[section] || `Generate content for the ${section} section.`;
}

function calculatePricing(requirementsAnalysis: any, projectInfo: any) {
  const pricing = {
    model: 'fixed-price',
    basePrice: 10000,
    adjustments: {
      complexity: 1.5,
      timeline: 1.2,
      teamSize: 1.3,
      risk: 1.1
    },
    finalPrice: 0,
    breakdown: {
      development: 0,
      testing: 0,
      deployment: 0,
      support: 0
    }
  };
  
  // Calculate base price
  pricing.basePrice = 10000;
  
  // Apply adjustments
  pricing.finalPrice = pricing.basePrice * pricing.adjustments.complexity * pricing.adjustments.timeline * pricing.adjustments.teamSize * pricing.adjustments.risk;
  
  // Calculate breakdown
  pricing.breakdown.development = pricing.finalPrice * 0.6;
  pricing.breakdown.testing = pricing.finalPrice * 0.2;
  pricing.breakdown.deployment = pricing.finalPrice * 0.1;
  pricing.breakdown.support = pricing.finalPrice * 0.1;
  
  return pricing;
}

function assembleProposal(sections: any, pricing: any, clientInfo: any) {
  const proposal = {
    id: generateProposalId(),
    title: `Proposal for ${clientInfo.company}`,
    client: clientInfo,
    sections: sections,
    pricing: pricing,
    createdAt: new Date().toISOString(),
    status: 'draft'
  };
  
  return proposal;
}

async function saveProposalToAirtable(proposal: any, clientInfo: any, projectInfo: any) {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_PROPOSALS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Proposal ID': proposal.id,
          'Title': proposal.title,
          'Client': clientInfo.company,
          'Contact': clientInfo.contact,
          'Email': clientInfo.email,
          'Project': projectInfo.name,
          'Status': '🆕 New Proposal',
          'Created': new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save proposal to Airtable');
    }
    
    const data = await response.json();
    
    return {
      success: true,
      recordId: data.id
    };
    
  } catch (error) {
    console.error('Failed to save proposal to Airtable:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function generateProposalId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PROP-${timestamp}-${random}`.toUpperCase();
}

export async function GET() {
  return NextResponse.json({
    message: 'Proposal Generation API',
    endpoints: {
      POST: '/api/proposals/generate - Generate AI-powered proposal',
      GET: '/api/proposals/generate - Get API information'
    },
    features: [
      'AI-powered proposal generation',
      'Automatic section creation',
      'Dynamic pricing calculation',
      'Template selection',
      'Airtable integration'
    ]
  });
}
