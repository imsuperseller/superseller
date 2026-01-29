import { Target, Workflow, Users, Zap, Shield, HelpCircle, LayoutGrid, Phone } from 'lucide-react';
import { env } from '@/lib/env';
import { FormField } from '@/types/firestore';

export type PillarId = 'lead-machine' | 'autonomous-secretary' | 'knowledge-engine' | 'content-engine';

export interface ProductDefinition {
    id: string;
    name: string;
    headline: string; // Catchy, outcome-driven headline
    price: number; // Default one-time credit buy (or base setup)
    subscriptionPrice?: number; // Monthly scale price
    usageCredits?: number; // How many runs/credits in the one-time buy
    description: string;
    features: string[];
    cta: string;
    benefit?: string;
    popular?: boolean;
    icon: any;
    pillarId?: PillarId;
    flowType: 'applet' | 'managed-engine' | 'strategic-plan'; // Simplified types
    stripePriceId?: string; // For credits
    stripeSubId?: string;   // For subscription
    n8nWebhookId?: string;
    n8nWorkflowId?: string;
    adminLabel?: string;    // Internal name (e.g., "Salah", "Macca")
    configurationSchema?: FormField[]; // Dynamic onboarding questions
    entitlements: {
        featureFlags: string[];
        quotaUpdates?: Record<string, number>;
    };
    // Enhanced Conversion Data (v2.7.0)
    metrics?: { label: string; value: string; sublabel: string }[];
    useCases?: { title: string; description: string }[];
    faqs?: { q: string; a: string }[];
    comparisons?: { feature: string; human: string; agent: string }[];
    logicMap?: { title: string; icon: string; desc: string }[];
    integrations?: string[]; // New integration marquee data
    status: 'active' | 'beta' | 'hidden'; // New: Product Certification Status
}

export const PRODUCT_REGISTRY: Record<string, ProductDefinition> = {
    'automation-audit': {
        id: 'automation-audit',
        status: 'hidden',
        name: 'Strategic Audit',
        headline: 'Find the Invisible $25,000+ Efficiency Leak in Your Business',
        price: 497,
        description: 'A deep strategic review of your current operations. We identify annual efficiency leaks and map your path to scale.',
        features: [
            'Full Operations Analysis',
            'Revenue Leak Identification',
            'Automation Roadmap',
            'Tech Stack Review',
            'ROI Projection Model'
        ],
        cta: 'Start Transformation',
        benefit: 'Stop guessing where you lose money.',
        icon: 'Crosshair',
        flowType: 'strategic-plan',
        stripePriceId: env.NEXT_PUBLIC_STRIPE_LINK_AUDIT,
        entitlements: {
            featureFlags: ['audit_access']
        }
    },
    'lead-machine': {
        id: 'lead-machine',
        status: 'active',
        name: 'Abraham-Reach',
        headline: 'Automated Lead Extraction & Outreach Velocity',
        price: 297, // Credit pack (1000 leads)
        usageCredits: 1000,
        subscriptionPrice: 997, // Unlimited
        description: 'A 24/7 outbound engine that sources leads, enriches data, and sends custom outreach at scale while you sleep.',
        features: [
            'Automated Lead Sourcing',
            'AI Data Enrichment',
            'Multi-Channel Outreach',
            'Smart CRM Sync',
            'Daily Performance Reports'
        ],
        cta: 'Hire Abraham',
        pillarId: 'lead-machine',
        adminLabel: 'Salah',
        icon: 'Crosshair',
        flowType: 'managed-engine',
        stripePriceId: 'price_abe_credits',
        stripeSubId: 'price_abe_sub',
        n8nWebhookId: 'lead-machine-v3-shai-final',
        n8nWorkflowId: 'x7GwugG3fzdpuC4f',
        configurationSchema: [
            { id: 'niche', label: 'Target Niche', type: 'text', required: true, placeholder: 'e.g., Marketing Agencies, HVAC' },
            { id: 'city', label: 'Target City', type: 'text', required: true, placeholder: 'e.g., Dallas' },
            { id: 'state', label: 'Target State', type: 'text', required: true, placeholder: 'e.g., TX' },
            { id: 'source_type', label: 'Lead Source', type: 'select', required: true, options: ['google_maps', 'linkedin'], placeholder: 'Select Source' },
            { id: 'url', label: 'Search URL (LinkedIn Only)', type: 'url', required: false, placeholder: 'Paste LinkedIn Search URL if selected', helperText: 'Required if Source is LinkedIn' }
        ],
        entitlements: {
            featureFlags: ['lead-machine']
        },
        metrics: [
            { label: 'Outreach Volume', value: '10,000+', sublabel: 'Mails/Week' },
            { label: 'Response Rate', value: '18.4%', sublabel: 'Avg. AI-Enriched' },
            { label: 'Cost Reduction', value: '88%', sublabel: 'vs. Manual BDR' }
        ],
        useCases: [
            { title: 'Agency Scaling', description: 'Automatically source and reach out to local businesses needing digital services.' },
            { title: 'Real Estate Hunting', description: 'Extract off-market properties and contact owners with personalized neural messages.' }
        ],
        comparisons: [
            { feature: 'Search Speed', human: '50/day', agent: '5,000/hour' },
            { feature: 'Cost per Lead', human: '$4.50', agent: '$0.12' },
            { feature: 'Scalability', human: 'Linear (Hire more)', agent: 'Exponential (Instant)' },
            { feature: 'Availability', human: '8h workdays', agent: '24/7 Always On' }
        ],
        logicMap: [
            { title: 'Extraction', icon: 'Crosshair', desc: 'Sourcing data from Maps/LinkedIn.' },
            { title: 'Enrichment', icon: 'Zap', desc: 'Verifying emails & phone numbers.' },
            { title: 'Scoring', icon: 'Shield', desc: 'Neural AI checking lead quality.' },
            { title: 'Outreach', icon: 'Users', desc: 'Sending personalized 1:1 messages.' }
        ],
        integrations: ['HubSpot', 'Salesforce', 'Pipedrive', 'GoHighLevel', 'Slack', 'Gmail', 'Outlook'],
        faqs: [
            { q: 'How does Abraham ensure high deliverability?', a: 'We use dynamic IP rotation and human-simulated typing speeds to bypass spam filters.' },
            { q: 'Can I connect my own CRM?', a: 'Yes, Abraham natively syncs with HubSpot, Pipedrive, and GoHighLevel.' }
        ]
    },
    'autonomous-secretary': {
        id: 'autonomous-secretary',
        status: 'beta',
        name: 'Sarah-Inbound',
        headline: '24/7 Autonomous Communication & Scheduling Intelligence',
        price: 197, // Base setup + 1 week run
        subscriptionPrice: 497, // Monthly
        description: 'The core of your communication department. Sarah manages calendars, answers messages, and handles bookings autonomously.',
        features: [
            '24/7 Call Handling',
            'WhatsApp Response Agent',
            'Calendar Management',
            'Multi-Language Support',
            'Buying Intent Qualification'
        ],
        cta: 'Hire Sarah',
        pillarId: 'autonomous-secretary',
        adminLabel: 'Sarah',
        icon: Workflow,
        flowType: 'managed-engine',
        stripeSubId: 'price_gabi_sub',
        n8nWebhookId: 'secretary-init',
        configurationSchema: [
            { id: 'agentName', label: 'Agent Name', type: 'text', required: true, placeholder: 'e.g., Sarah, Dom, Ron' },
            { id: 'greeting', label: 'First Greeting', type: 'textarea', required: true, placeholder: 'How should the agent answer the phone?' },
            { id: 'transferNumber', label: 'human Fallback Number', type: 'text', required: true, placeholder: '+1...' },
            { id: 'voiceId', label: 'Voice Personality', type: 'select', required: true, options: ['Sarah (Professional)', 'Rachel (Friendly)', 'Callum (Deep)'], placeholder: 'Select Voice' }
        ],
        entitlements: {
            featureFlags: ['autonomous-secretary']
        },
        metrics: [
            { label: 'Missed Calls', value: '0%', sublabel: 'Instant Answer' },
            { label: 'Booking Rate', value: '+40%', sublabel: 'vs. Voicemail' },
            { label: 'Response Time', value: '<2s', sublabel: 'Voice & Text' }
        ],
        comparisons: [
            { feature: 'Availability', human: '8 Hours/Day', agent: '24/7/365' },
            { feature: 'Memory', human: 'Forgetful', agent: 'Perfect CRM Recall' },
            { feature: 'Multitasking', human: '1 Call at a time', agent: 'Unlimited Concurrent' },
            { feature: 'Response Time', human: 'Minutes/Hours', agent: 'Instant (<2s)' }
        ],
        logicMap: [
            { title: 'Inbound', icon: 'Phone', desc: 'Receives Call or WhatsApp.' },
            { title: 'Analysis', icon: 'HelpCircle', desc: 'Intent classification & lookup.' },
            { title: 'Action', icon: 'Workflow', desc: 'Booking, Q&A, or CRM update.' },
            { title: 'Handover', icon: 'Users', desc: 'Escalates to human if complex.' }
        ],
        integrations: ['WhatsApp', 'Twilio', 'Google Calendar', 'Calendly', 'Zoom', 'Slack'],
        faqs: [
            { q: 'Does Sarah sound robotic?', a: 'No, we use ElevenLabs turbo v2.5 models for near-human latency and intonation.' },
            { q: 'Can it handle rescheduling?', a: 'Yes, it checks your calendar in real-time and negotiates new times autonomously.' }
        ]
    },
    'knowledge-engine': {
        id: 'knowledge-engine',
        status: 'beta',
        name: 'Solomon-Brain',
        headline: 'Infinite Memory & Private Organization Intelligence',
        price: 497, // Setup fee (Initial RAG sync)
        subscriptionPrice: 1497,
        description: 'The pillar of wisdom in your ecosystem. Connect Solomon to your company data for a private intelligence system with perfect memory.',
        features: [
            'Live Data Sync',
            'Private Knowledge Base',
            'Internal Workflow Logic',
            'Context-Aware Assistance',
            'Enterprise Security'
        ],
        cta: 'Hire Solomon',
        pillarId: 'knowledge-engine',
        adminLabel: 'Macca',
        icon: Workflow,
        flowType: 'managed-engine',
        stripeSubId: 'price_solly_sub',
        n8nWebhookId: 'knowledge-engine-init',
        configurationSchema: [
            { id: 'primarySource', label: 'Knowledge Source', type: 'select', required: true, options: ['YouTube Channel', 'Document Uploads', 'Website URL'], placeholder: 'Select Source' },
            { id: 'sourceUrl', label: 'Source URL', type: 'url', required: false, placeholder: 'Enter URL if applicable' },
            { id: 'instruction', label: 'Special Instructions', type: 'textarea', required: true, placeholder: 'What should the AI remember most?' }
        ],
        entitlements: {
            featureFlags: ['knowledge-engine']
        },
        metrics: [
            { label: 'Search Time', value: '0.4s', sublabel: 'Across All Docs' },
            { label: 'Accuracy', value: '99.8%', sublabel: 'RAG Verified' },
            { label: 'Onboarding', value: '-90%', sublabel: 'Training Time' }
        ],
        comparisons: [
            { feature: 'Knowledge Limit', human: 'Limited Context', agent: 'Infinite Storage' },
            { feature: 'Answer Speed', human: 'Minutes/Hours', agent: 'Milliseconds' },
            { feature: 'Bias', human: 'Subjective', agent: 'Objective Data' },
            { feature: 'Security', human: 'Data Leak Risk', agent: 'Isolated Containers' }
        ],
        logicMap: [
            { title: 'Ingest', icon: 'LayoutGrid', desc: 'PDFs, Sites, Notion synced.' },
            { title: 'Vectorize', icon: 'Zap', desc: 'Converted to semantic embeddings.' },
            { title: 'Retrieval', icon: 'Crosshair', desc: 'Finds exact context match.' },
            { title: 'Synthesis', icon: 'HelpCircle', desc: 'Generates cite-backed answer.' }
        ],
        integrations: ['Google Drive', 'Notion', 'Slack', 'Microsoft Teams', 'Confluence', 'OneDrive'],
        faqs: [
            { q: 'Is my data secure?', a: 'Yes, Solomon runs on isolated vector containers. Your data is never used to train public models.' },
            { q: 'Can it read scanned PDFs?', a: 'Yes, built-in OCR handles images and scanned documents automatically.' }
        ]
    },
    'content-engine': {
        id: 'content-engine',
        status: 'active',
        name: 'Abraham-Impact',
        headline: 'Neural Content Orchestration & Omnichannel Authority',
        price: 397, // Video Credit Pack (20 videos)
        usageCredits: 20,
        subscriptionPrice: 1497,
        description: 'AI-powered content pipeline that handles research, ideation, and generation of high-authority content across all channels.',
        features: [
            'Content Research & Ideation',
            'Automated Video/Image Generation',
            'Multi-Channel Distribution',
            'Authority Building Logic',
            'Weekly Growth Reports'
        ],
        cta: 'Hire Samson',
        pillarId: 'content-engine',
        adminLabel: 'Konate',
        icon: Users,
        flowType: 'managed-engine',
        stripePriceId: 'price_samson_credits',
        stripeSubId: 'price_samson_sub',
        n8nWebhookId: 'content-engine-init',
        configurationSchema: [
            { id: 'contentTheme', label: 'Content Theme', type: 'text', required: true, placeholder: 'e.g., Luxury Real Estate, AI Tech' },
            { id: 'platforms', label: 'Target Platforms', type: 'text', required: true, placeholder: 'e.g., Instagram, TikTok, LinkedIn' }
        ],
        entitlements: {
            featureFlags: ['content-engine']
        },
        metrics: [
            { label: 'Output', value: '50/mo', sublabel: 'High-Fidelity Videos' },
            { label: 'Cost/Video', value: '$8', sublabel: 'vs. $150 Agency' },
            { label: 'Growth', value: '3.5x', sublabel: 'Faster Traffic' }
        ],
        comparisons: [
            { feature: 'Editing Time', human: '4 Hours/Video', agent: '3 Minutes/Video' },
            { feature: 'Trend Spotting', human: 'Delayed/Lag', agent: 'Real-Time API' },
            { feature: 'Consistency', human: 'Burnout Risk', agent: 'Infinite Stamina' },
            { feature: 'Cost', human: '$2,000/mo+', agent: 'Fractional Cost' }
        ],
        logicMap: [
            { title: 'Trend Spy', icon: 'Crosshair', desc: 'Scrapes viral hooks/topics.' },
            { title: 'Scripting', icon: 'HelpCircle', desc: 'Writes engagement-focused scripts.' },
            { title: 'Production', icon: 'Zap', desc: 'Generates Voice, Video, Captions.' },
            { title: 'Posting', icon: 'Users', desc: 'Auto-uploads to TikTok/IG/YT.' }
        ],
        integrations: ['TikTok', 'Instagram', 'YouTube Shorts', 'LinkedIn', 'Twitter/X'],
        faqs: [
            { q: 'What kind of videos can it make?', a: 'Faceless viral shorts, educational explainers, and property walkthroughs.' },
            { q: 'Does it write the captions?', a: 'Yes, it generates SEO-optimized captions and hashtags for every platform.' }
        ]
    },
    'full-ecosystem': {
        id: 'full-ecosystem',
        status: 'beta',
        name: 'Full Ecosystem',
        headline: 'Total Autonomy. End-to-End Strategic Scale.',
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
        flowType: 'strategic-plan',
        stripePriceId: env.NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM,
        entitlements: {
            featureFlags: ['lead-machine', 'autonomous-secretary', 'knowledge-engine', 'content-engine']
        }
    },
    // Marketplace Products
    'celebrity-selfie': {
        id: 'celebrity-selfie',
        status: 'beta',
        name: 'David-Image',
        headline: 'Viral Engagement Through Cinematic AI Selfies',
        price: 297,
        usageCredits: 50,
        description: 'Viral AI Video Experiences. Integrate users into cinematic journeys.',
        features: ['AI Face Swap', 'Multi-Scene Stitching', 'WhatsApp Delivery'],
        cta: 'Launch Campaign',
        pillarId: 'content-engine',
        adminLabel: 'Lucho',
        icon: Users,
        flowType: 'applet',
        n8nWorkflowId: '4OYGXXMYeJFfAo6X',
        configurationSchema: [
            { id: 'selfieUrl', label: 'Your Reference Photo URL', type: 'url', required: true, placeholder: 'Link to a clear face photo' },
            { id: 'targetScene', label: 'Desired Scene', type: 'select', required: true, options: ['Movie Star', 'News Anchor', 'Stadium Crowd', 'Space Explorer'] }
        ],
        entitlements: {
            featureFlags: ['celebrity-selfie']
        }
    },
    'meta-ad-analyzer': {
        id: 'meta-ad-analyzer',
        status: 'beta',
        name: 'Joseph-Spy',
        headline: 'Reverse-Engineer Winning Ad Patterns in Real-Time',
        price: 47, // per run
        description: 'Reverse-engineer winning ad hooks and patterns using AI vision.',
        features: ['Ad Scraping', 'AI Video Analysis', 'Template Generation'],
        cta: 'Start Analyzing',
        pillarId: 'lead-machine',
        adminLabel: 'Ibou',
        icon: 'Crosshair',
        flowType: 'applet',
        configurationSchema: [
            { id: 'competitorUrl', label: 'Meta Ad Library Link', type: 'url', required: true, placeholder: 'Link to competitor active ads' }
        ],
        entitlements: {
            featureFlags: ['meta-ad-analyzer']
        }
    },
    'youtube-clone': {
        id: 'youtube-clone',
        status: 'beta',
        name: 'Elijah-Clone',
        headline: 'Extract Infinite Knowledge from Any YouTube Channel',
        price: 197,
        description: 'Convert any channel into a searchable conversational digital expert.',
        features: ['Knowledge Extraction', 'Expert Personality AI', 'Telegram Integration'],
        cta: 'Activate Clone',
        pillarId: 'knowledge-engine',
        adminLabel: 'Ryan',
        icon: Workflow,
        flowType: 'applet',
        n8nWorkflowId: '5pMi01SwffYB6KeX',
        configurationSchema: [
            { id: 'youtubeUrl', label: 'YouTube Channel URL', type: 'url', required: true, placeholder: 'https://youtube.com/@...' },
            { id: 'telegramToken', label: 'Telegram Bot Token', type: 'password', required: true, placeholder: 'Get from @BotFather' }
        ],
        entitlements: {
            featureFlags: ['youtube-clone']
        }
    },
    'voice-lead-analyzer': {
        id: 'voice-lead-analyzer',
        status: 'beta',
        name: 'Martha-Ear',
        headline: 'Autonomous Call Intent Scoring & CRM Sync',
        price: 97,
        usageCredits: 100, // calls
        description: 'Autonomous call transcription and intent scoring for your sales department.',
        features: ['Voice Transcription', 'Buying Intent Scoring', 'CRM Integration'],
        cta: 'Connect Calls',
        pillarId: 'autonomous-secretary',
        adminLabel: 'Trent',
        icon: Workflow,
        flowType: 'applet',
        configurationSchema: [
            { id: 'crmType', label: 'CRM System', type: 'select', required: true, options: ['GoHighLevel', 'Hubspot', 'Pipedrive', 'None'], placeholder: 'Select your CRM' },
            { id: 'telnyxKey', label: 'Telnyx API Key', type: 'password', required: true, placeholder: 'For call recording access' }
        ],
        entitlements: {
            featureFlags: ['voice-lead-analyzer']
        }
    },
    'appointment-assistant': {
        id: 'appointment-assistant',
        status: 'beta',
        name: 'Naomi-Sync',
        headline: 'Autonomous Calendar Management & Frictionless Booking',
        price: 47,
        description: 'Delegate calendar management to an agent that understands your family business.',
        features: ['Conflict Resolution', 'Natural Language', 'Smart Rescheduling'],
        cta: 'Sync Calendar',
        pillarId: 'autonomous-secretary',
        adminLabel: 'Harvey',
        icon: Zap,
        flowType: 'applet',
        configurationSchema: [
            { id: 'calendarUrl', label: 'TidyCal/Calendly URL', type: 'url', required: true, placeholder: 'Your booking link' }
        ],
        entitlements: {
            featureFlags: ['appointment-assistant']
        }
    },
    'property-tour-gen': {
        id: 'property-tour-gen',
        status: 'beta',
        name: 'David-Tour',
        headline: 'Cinematic 4K Real Estate Walkthroughs from 2D Plans',
        price: 197,
        usageCredits: 1, // per tour
        description: 'Transform 2D floor plans into photorealistic cinematic 4K walkthroughs.',
        features: ['2D to 3D Conversion', 'Photorealistic Rendering', 'Video Walkthrough'],
        cta: 'Render Tour',
        pillarId: 'content-engine',
        adminLabel: 'Cody',
        icon: LayoutGrid,
        flowType: 'applet',
        configurationSchema: [
            { id: 'floorPlanUrl', label: 'Floor Plan Image URL', type: 'url', required: true, placeholder: 'Direct link to 2D plan' },
            { id: 'style', label: 'Interior Style', type: 'select', required: true, options: ['Modern', 'Rustic', 'Scandinavian', 'Industrial'] }
        ],
        entitlements: {
            featureFlags: ['property-tour-gen']
        }
    },
    'growth-insights-bot': {
        id: 'growth-insights-bot',
        status: 'beta',
        name: 'Solomon-Insights',
        headline: '24/7 Website Audit & Behavioral Revenue Leak Scanning',
        price: 47,
        description: 'Autonomous website audits and revenue leak identification.',
        features: ['Drop-off Analysis', 'Behavioral Heatmaps', 'Monthly Report'],
        cta: 'Start Audit',
        pillarId: 'knowledge-engine',
        adminLabel: 'Curtis',
        icon: 'Crosshair',
        flowType: 'applet',
        n8nWorkflowId: 'vCxY2DXUZ8vUb30f',
        configurationSchema: [
            { id: 'websiteUrl', label: 'Website URL', type: 'url', required: true, placeholder: 'https://...' },
            { id: 'slackWebhook', label: 'Slack Webhook URL', type: 'url', required: true, placeholder: 'For report delivery' }
        ],
        entitlements: {
            featureFlags: ['growth-insights-bot']
        }
    },
    'david-marketplace': {
        id: 'david-marketplace',
        status: 'active',
        name: 'David-Marketplace',
        headline: 'Automated FB Marketplace Lister & Lead Capture',
        price: 197, // Setup + 100 listings
        usageCredits: 100,
        description: 'Autonomous Facebook Marketplace automation. List items, manage inquiries, and sync leads to your CRM without lifting a finger.',
        features: [
            'Auto-Listing Generation',
            'Lead Inquiry Capture',
            'Image Optimization',
            'Price Intelligence',
            'Multi-Account Support'
        ],
        cta: 'Launch Lister',
        pillarId: 'lead-machine',
        adminLabel: 'Marketplace-Lucho',
        icon: 'LayoutGrid',
        flowType: 'applet',
        n8nWebhookId: 'marketplace-lister-v1',
        configurationSchema: [
            { id: 'fbProfile', label: 'FB Account Link', type: 'url', required: true, placeholder: 'Link to FB Profile' },
            { id: 'niche', label: 'Listing Niche', type: 'text', required: true, placeholder: 'e.g., Garage Doors, Furniture' }
        ],
        entitlements: {
            featureFlags: ['marketplace-lister']
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
