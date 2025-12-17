import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';



// Solution tier definitions - Rensto pricing
const SOLUTION_TIERS = {
    starter: {
        name: 'Starter',
        basePrice: 2997,
        monthlyFee: 97,
        timeline: '1-2 weeks',
        description: 'Essential automation foundation',
        includes: [
            'Core AI workflow (up to 3 automations)',
            'Basic integration setup',
            'Documentation & training',
            '30-day support'
        ],
        ideal: 'Businesses ready to automate their most painful process'
    },
    professional: {
        name: 'Professional',
        basePrice: 4997,
        monthlyFee: 147,
        timeline: '2-3 weeks',
        description: 'Comprehensive automation suite',
        includes: [
            'Full AI system (up to 7 automations)',
            'Multi-platform integrations',
            'Custom dashboard',
            'Voice/SMS capabilities',
            '60-day priority support',
            'Monthly optimization calls'
        ],
        ideal: 'Growing businesses ready for serious automation'
    },
    enterprise: {
        name: 'Enterprise',
        basePrice: 9997,
        monthlyFee: 297,
        timeline: '3-4 weeks',
        description: 'Full-service automation partner',
        includes: [
            'Unlimited automations',
            'Dedicated AI agents',
            'Custom integrations',
            'White-label options',
            'Dedicated success manager',
            'SLA guarantees',
            'Quarterly strategy sessions'
        ],
        ideal: 'Established businesses seeking a complete transformation'
    }
};

// System prompt for solution planning
const SOLUTION_PLANNER_PROMPT = `You are Rensto's Solution Planning AI. Your job is to analyze prospect data and recommend the most appropriate automation solutions.

CONTEXT: You will receive:
1. Qualification answers from the prospect
2. Their qualification score and tier
3. Any voice conversation transcript
4. Their website URL (if provided)

OUTPUT REQUIREMENTS:
Generate a JSON response with this exact structure:
{
  "summary": "2-3 sentence executive summary of the recommended approach",
  "primaryPain": "The main problem we're solving",
  "recommendedTier": "starter" | "professional" | "enterprise",
  "customizations": [
    "Specific customization 1",
    "Specific customization 2"
  ],
  "deliverables": [
    {
      "name": "Deliverable name",
      "description": "What it does",
      "businessImpact": "Expected outcome"
    }
  ],
  "whatWeNeed": [
    "Access to X system",
    "API credentials for Y",
    "Sample data for Z"
  ],
  "estimatedROI": {
    "hoursSavedPerWeek": number,
    "estimatedMonthlySavings": number,
    "breakEvenMonths": number
  },
  "timeline": {
    "phases": [
      {"name": "Discovery", "duration": "1 week"},
      {"name": "Build", "duration": "X weeks"},
      {"name": "Launch", "duration": "1 week"}
    ],
    "totalDuration": "X weeks"
  }
}

PRICING RULES:
- starter ($2,997): Basic automations, simple pain points
- professional ($4,997): Complex workflows, multiple integrations (RECOMMEND MOST OFTEN)
- enterprise ($9,997): Large scale, custom requirements, high-value operations

ALWAYS be specific and personalized. Reference their actual answers.`;

export async function POST(request: NextRequest) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    try {
        const body = await request.json();
        const {
            qualificationAnswers,
            qualificationScore,
            qualificationTier,
            voiceTranscript,
            websiteUrl
        } = body;

        // Build context for GPT
        const contextParts = [];

        if (qualificationAnswers) {
            contextParts.push(`QUALIFICATION ANSWERS:\n${JSON.stringify(qualificationAnswers, null, 2)}`);
        }

        if (qualificationScore !== undefined) {
            contextParts.push(`QUALIFICATION SCORE: ${qualificationScore}%`);
            contextParts.push(`QUALIFICATION TIER: ${qualificationTier || 'unknown'}`);
        }

        if (voiceTranscript) {
            contextParts.push(`VOICE CONVERSATION TRANSCRIPT:\n${voiceTranscript}`);
        }

        if (websiteUrl) {
            contextParts.push(`PROSPECT WEBSITE: ${websiteUrl}`);
        }

        // Generate solution plan using GPT-4
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SOLUTION_PLANNER_PROMPT },
                {
                    role: 'user',
                    content: `Analyze this prospect and generate a custom solution plan:\n\n${contextParts.join('\n\n')}`
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 2000,
            temperature: 0.7,
        });

        const solutionPlan = JSON.parse(completion.choices[0]?.message?.content || '{}');

        // Enrich with tier details
        const tierKey = solutionPlan.recommendedTier as keyof typeof SOLUTION_TIERS;
        const tierDetails = SOLUTION_TIERS[tierKey] || SOLUTION_TIERS.professional;

        // Generate all three pricing options
        const pricingOptions = Object.entries(SOLUTION_TIERS).map(([key, tier]) => ({
            id: key,
            name: tier.name,
            price: tier.basePrice,
            monthlyFee: tier.monthlyFee,
            timeline: tier.timeline,
            description: tier.description,
            includes: tier.includes,
            ideal: tier.ideal,
            isRecommended: key === solutionPlan.recommendedTier
        }));

        return NextResponse.json({
            success: true,
            plan: {
                ...solutionPlan,
                tierDetails,
                pricingOptions,
            },
            generatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Solution generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate solution plan'
            },
            { status: 500 }
        );
    }
}
