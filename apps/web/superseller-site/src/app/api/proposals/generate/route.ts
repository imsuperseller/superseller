import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import OpenAI from 'openai';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import prisma from '@/lib/prisma';
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
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requirements, clientInfo, projectInfo } = await request.json();

    if (!requirements || !clientInfo || !projectInfo) {
      return NextResponse.json(
        { success: false, error: 'Requirements, client info, and project info are required' },
        { status: 400 }
      );
    }

    const requirementsAnalysis = analyzeRequirements(requirements);
    const template = selectTemplate(requirementsAnalysis, projectInfo);
    const proposalSections = await generateProposalSections(requirementsAnalysis, clientInfo, projectInfo, template);
    const pricing = calculatePricing(requirementsAnalysis, projectInfo);
    const finalProposal = assembleProposal(proposalSections, pricing, clientInfo);
    let savedProposal: { success: boolean; recordId: string } = { success: false, recordId: '' };
    try {
      // userId is required; use email as the user identifier
      const userId = clientInfo.email || clientInfo.company || 'unknown';
      const pgProposal = await prisma.consultation.create({
        data: {
          userId,
          clientId: userId,
          type: 'proposal',
          status: 'new',
          metadata: {
            proposalId: finalProposal.id,
            title: finalProposal.title,
            client: clientInfo.company,
            contact: clientInfo.contact,
            email: clientInfo.email,
            project: projectInfo.name,
            content: finalProposal,
          },
        },
      });
      savedProposal = { success: true, recordId: pgProposal.id };
    } catch (pgError) {
      console.error('[Proposals] Postgres save failed:', pgError);
    }
    await auditAgent.log({
      service: 'firebase',
      action: 'proposal_generated',
      status: 'success',
      details: { proposalId: finalProposal.id, client: clientInfo.company, recordId: savedProposal.recordId },
    });

    return NextResponse.json({
      success: true,
      proposal: finalProposal,
      pricing,
      savedProposal,
    });

  } catch (error: any) {
    console.error('Proposal generation error:', error);
    await auditAgent.log({
      service: 'openai',
      action: 'proposal_generation_failed',
      status: 'error',
      errorMessage: error.message,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
}

function analyzeRequirements(requirements: any) {
  return {
    totalRequirements: countTotalRequirements(requirements),
    byCategory: countRequirementsByCategory(requirements),
    byPriority: countRequirementsByPriority(requirements),
    byComplexity: countRequirementsByComplexity(requirements),
    gaps: identifyGaps(requirements),
    conflicts: identifyConflicts(requirements),
    recommendations: generateRecommendations(requirements),
  };
}

function countTotalRequirements(requirements: any) {
  let total = 0;
  for (const category in requirements) {
    if (Array.isArray(requirements[category])) total += requirements[category].length;
  }
  return total;
}

function countRequirementsByCategory(requirements: any) {
  const counts: any = {};
  for (const category in requirements) {
    if (Array.isArray(requirements[category])) counts[category] = requirements[category].length;
  }
  return counts;
}

function countRequirementsByPriority(requirements: any) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const category in requirements) {
    if (Array.isArray(requirements[category])) {
      for (const req of requirements[category]) {
        counts[req.priority as keyof typeof counts] = (counts[req.priority as keyof typeof counts] || 0) + 1;
      }
    }
  }
  return counts;
}

function countRequirementsByComplexity(requirements: any) {
  const counts = { simple: 0, moderate: 0, complex: 0, enterprise: 0 };
  for (const category in requirements) {
    if (Array.isArray(requirements[category])) {
      for (const req of requirements[category]) {
        counts[req.complexity as keyof typeof counts] = (counts[req.complexity as keyof typeof counts] || 0) + 1;
      }
    }
  }
  return counts;
}

function identifyGaps(requirements: any) {
  const gaps = [];
  if (!requirements.business_objectives || requirements.business_objectives.length === 0) gaps.push('Missing business objectives');
  if (!requirements.functional_requirements || requirements.functional_requirements.length === 0) gaps.push('Missing functional requirements');
  if (!requirements.technical_requirements || requirements.technical_requirements.length === 0) gaps.push('Missing technical requirements');
  return gaps;
}

function identifyConflicts(requirements: any) {
  const conflicts = [];
  const highPriorityCount = countRequirementsByPriority(requirements).high;
  if (highPriorityCount > 10) conflicts.push('Too many high priority requirements');
  const constraints = requirements.constraints || [];
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
  const r1 = req1.description.toLowerCase(), r2 = req2.description.toLowerCase();
  if (r1.includes('fast') && r2.includes('slow')) return true;
  if (r1.includes('cheap') && r2.includes('expensive')) return true;
  if (r1.includes('simple') && r2.includes('complex')) return true;
  return false;
}

function generateRecommendations(requirements: any) {
  const recs = [];
  if (!requirements.business_objectives || requirements.business_objectives.length === 0) recs.push('Define clear business objectives');
  if (!requirements.functional_requirements || requirements.functional_requirements.length === 0) recs.push('Specify functional requirements');
  if (!requirements.technical_requirements || requirements.technical_requirements.length === 0) recs.push('Define technical requirements');
  if (countRequirementsByComplexity(requirements).complex > 5) recs.push('Consider breaking down complex requirements');
  return recs;
}

function selectTemplate(_requirementsAnalysis: any, projectInfo: any) {
  if (projectInfo.type === 'automation') return 'automationProposal';
  if (projectInfo.type === 'integration') return 'integrationProposal';
  if (projectInfo.type === 'development') return 'customDevelopment';
  return 'consultingProposal';
}

async function generateProposalSections(requirementsAnalysis: any, clientInfo: any, projectInfo: any, _template: string) {
  const sections: any = {};
  const sectionNames = ['executive-summary', 'project-overview', 'requirements-analysis', 'solution-approach', 'implementation-plan', 'timeline', 'pricing', 'team', 'next-steps'];
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
        { role: 'system', content: 'You are SuperSeller AI\'s Senior Systems Architect and Proposal Writer (The Justin Welsh Style). Your voice is calm, authoritative, and focused on logical systems and long-term leverage. Focus on how these automations build a durable business foundation.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
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
    'next-steps': `Create next steps for ${projectInfo.name} with the timeline and deliverables.`,
  };
  return prompts[section] || `Generate content for the ${section} section.`;
}

function calculatePricing(_requirementsAnalysis: any, _projectInfo: any) {
  const pricing = {
    model: 'fixed-price',
    basePrice: 10000,
    adjustments: { complexity: 1.5, timeline: 1.2, teamSize: 1.3, risk: 1.1 },
    finalPrice: 0,
    breakdown: { development: 0, testing: 0, deployment: 0, support: 0 },
  };
  pricing.finalPrice = pricing.basePrice * pricing.adjustments.complexity * pricing.adjustments.timeline * pricing.adjustments.teamSize * pricing.adjustments.risk;
  pricing.breakdown.development = pricing.finalPrice * 0.6;
  pricing.breakdown.testing = pricing.finalPrice * 0.2;
  pricing.breakdown.deployment = pricing.finalPrice * 0.1;
  pricing.breakdown.support = pricing.finalPrice * 0.1;
  return pricing;
}

function assembleProposal(sections: any, pricing: any, clientInfo: any) {
  return {
    id: generateProposalId(),
    title: `Proposal for ${clientInfo.company}`,
    client: clientInfo,
    sections,
    pricing,
    createdAt: new Date().toISOString(),
    status: 'draft',
  };
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
      GET: '/api/proposals/generate - Get API information',
    },
    features: ['AI-powered proposal generation', 'Automatic section creation', 'Dynamic pricing calculation', 'Template selection', 'PostgreSQL storage'],
  });
}
