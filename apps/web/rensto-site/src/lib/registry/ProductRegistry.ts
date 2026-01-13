import { Target, Workflow, Users, Zap, Shield, HelpCircle } from 'lucide-react';
import { env } from '@/lib/env';

export type PillarId = 'lead-machine' | 'autonomous-secretary' | 'knowledge-engine' | 'content-engine';

export interface ProductDefinition {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    cta: string;
    benefit?: string;
    popular?: boolean;
    icon: any;
    pillarId?: PillarId;
    flowType: 'marketplace-template' | 'managed-plan' | 'service-purchase' | 'pillar-purchase';
    stripeLink?: string;
    n8nWebhookId?: string;
    entitlements: {
        featureFlags: string[];
        quotaUpdates?: Record<string, number>;
    };
}

export const PRODUCT_REGISTRY: Record<string, ProductDefinition> = {
    'automation-audit': {
        id: 'automation-audit',
        name: 'Strategic Audit',
        price: 497,
        description: 'A deep strategic review of your current operations. We identify $25,000+ in annual efficiency leaks and map your path to scale.',
        features: [
            'Full Operations Analysis',
            'Revenue Leak Identification',
            'Automation Roadmap',
            'Tech Stack Review',
            'ROI Projection Model'
        ],
        cta: 'Start Transformation',
        benefit: 'Stop guessing where you lose money.',
        icon: Target,
        flowType: 'service-purchase',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_AUDIT,
        entitlements: {
            featureFlags: ['audit_access']
        }
    },
    'lead-machine': {
        id: 'lead-machine',
        name: 'The Lead Machine',
        price: 997,
        description: 'A 24/7 outbound engine that sources leads, enriches data, and sends custom outreach at scale while you sleep.',
        features: [
            'Automated Lead Sourcing',
            'AI Data Enrichment',
            'Multi-Channel Outreach',
            'Smart CRM Sync',
            'Daily Performance Reports'
        ],
        cta: 'Activate Lead Machine',
        pillarId: 'lead-machine',
        icon: Target,
        flowType: 'pillar-purchase',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
        n8nWebhookId: 'lead-machine-init',
        entitlements: {
            featureFlags: ['lead-machine']
        }
    },
    'autonomous-secretary': {
        id: 'autonomous-secretary',
        name: 'Autonomous Secretary',
        price: 497,
        description: '24/7 autonomous receptionist and sales representative that manages calendars, answers messages, and handles bookings.',
        features: [
            '24/7 Call Handling',
            'WhatsApp Response Agent',
            'Calendar Management',
            'Multi-Language Support',
            'Buying Intent Qualification'
        ],
        cta: 'Activate Secretary',
        pillarId: 'autonomous-secretary',
        icon: Workflow,
        flowType: 'pillar-purchase',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
        n8nWebhookId: 'secretary-init',
        entitlements: {
            featureFlags: ['autonomous-secretary']
        }
    },
    'knowledge-engine': {
        id: 'knowledge-engine',
        name: 'Knowledge Engine',
        price: 1497,
        description: 'Connect AI to your company data. A private intelligence system with the "perfect memory" of your organization.',
        features: [
            'Live Data Sync',
            'Private Knowledge Base',
            'Internal Workflow Logic',
            'Context-Aware Assistance',
            'Enterprise Security'
        ],
        cta: 'Activate Knowledge Engine',
        pillarId: 'knowledge-engine',
        icon: Workflow,
        flowType: 'pillar-purchase',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
        n8nWebhookId: 'knowledge-engine-init',
        entitlements: {
            featureFlags: ['knowledge-engine']
        }
    },
    'content-engine': {
        id: 'content-engine',
        name: 'The Content Engine',
        price: 1497,
        description: 'AI-powered content pipeline that handles research, ideation, and generation of high-authority content across all channels.',
        features: [
            'Content Research & Ideation',
            'Automated Video/Image Generation',
            'Multi-Channel Distribution',
            'Authority Building Logic',
            'Weekly Growth Reports'
        ],
        cta: 'Activate The Engine',
        pillarId: 'content-engine',
        icon: Users,
        flowType: 'pillar-purchase',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER,
        n8nWebhookId: 'content-engine-init',
        entitlements: {
            featureFlags: ['content-engine']
        }
    },
    'full-ecosystem': {
        id: 'full-ecosystem',
        name: 'Full Ecosystem',
        price: 5497,
        description: 'All 4 pillars plus premium support, custom integrations, and a dedicated expert for end‑to‑end automation.',
        features: [
            'Lead Machine Engine',
            'Voice AI Agent System',
            'Knowledge Engine (RAG)',
            'The Content Engine',
            'Strategic Roadmap',
            'Dedicated Automation Partner',
            '24/7 Priority Support'
        ],
        cta: 'Activate Full Ecosystem',
        popular: true,
        icon: Zap,
        flowType: 'service-purchase',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM,
        entitlements: {
            featureFlags: ['lead-machine', 'autonomous-secretary', 'knowledge-engine', 'content-engine']
        }
    }
};

export const CARE_PLANS = [
    {
        id: 'starter-care',
        name: 'Starter Care',
        price: 497,
        period: 'month',
        description: 'Perfect for small teams needing monitoring',
        features: ['Monitor automations & Fix breaks', '1 monthly check-in (15 min)', 'Update FAQs & Responses', 'Basic performance report', '5 hours/mo included'],
        cta: 'Start Care Plan',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER,
        flowType: 'managed-plan'
    },
    {
        id: 'growth-care',
        name: 'Growth Care',
        price: 997,
        period: 'month',
        description: 'Our most popular plan for active scaling',
        features: ['Create 1-2 new automations/mo', 'Optimize flows & A/B test', 'Quarterly strategy call (1h)', 'CRM integration maintenance', '15 hours/mo included'],
        cta: 'Get Growth Care',
        popular: true,
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH,
        flowType: 'managed-plan'
    },
    {
        id: 'scale-care',
        name: 'Scale Care',
        price: 2497,
        period: 'month',
        description: 'A dedicated automation engineer for your team',
        features: ['Dedicated engineer (same person)', 'Add custom features on request', 'Weekly sync calls', 'Full analytics dashboard', 'Priority response (<4 hrs)'],
        cta: 'Get Scale Care',
        stripeLink: env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE,
        flowType: 'managed-plan'
    }
];
// Export a unified registry for easier lookup in checkout/provisioning
export const ALL_PRODUCTS: Record<string, ProductDefinition | any> = {
    ...PRODUCT_REGISTRY,
    ...Object.fromEntries(CARE_PLANS.map(p => [p.id, { ...p, id: p.id }]))
};

export const PRODUCT_PRICES = Object.fromEntries(
    Object.values(ALL_PRODUCTS).map(p => [p.id, p.price])
);
