import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Template } from '@/types/firestore';
import TemplateDetailClient from './TemplateDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

function serializeData(data: any): any {
    if (!data) return data;
    if (data instanceof Date) return data.toISOString();
    if (typeof data !== 'object') return data;

    // Handle Firestore Timestamp
    if (data.toDate && typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeData(item));
    }

    const serialized: any = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            serialized[key] = serializeData(data[key]);
        }
    }
    return serialized;
}

// Fallback Mock Data from the original implementation
const MOCK_TEMPLATES = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: 'Celebrity Selfie Video Generator',
        outcomeHeadline: 'Drive High-Engagement Brand Awareness with Viral AI Video Experiences',
        description: 'Empower your audience to become the star of your brand\'s cinematic journey. This automated engine generates high-fidelity AI video experiences where users are seamlessly integrated into iconic scenes, perfect for viral marketing campaigns and hyper-personalized customer engagement.',
        category: 'Content Engine',
        price: 297,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'Rensto Labs',
            bio: 'Expert AI automation team specializing in viral content engines.',
            expertise: ['Neural Video Synthesis', 'Social Growth', 'Automation Architecture']
        },
        businessImpact: "Creates high-viral brand awareness that traditional ads can't touch.",
        roiExample: "Generated 1.2M impressions for our last beta user in under 48 hours.",
        oneTimeCost: 2497,
        maintenanceCost: 197,
        maintenanceExplanation: "Includes ongoing Higgsfield API credits, Kling Omni neural model updates, and multi-scene stitching server maintenance.",
        aiPromptScript: "Analyze the user's face structure and map it to the character in the action movie scene. Ensure lighting consistency and 24fps motion smoothing.",
        soraVideoPrompt: "A cinematic cinematic movie trailer featuring a personalized character in a high-speed chase through a futuristic city, hyper-realistic reflections.",
        kpis: [
            { label: 'Brand Retention', value: '85%+', icon: 'Shield' },
            { label: 'Processing Time', value: '< 2 min', icon: 'Clock' },
            { label: 'Viral Potential', value: 'Extreme', icon: 'TrendingUp' }
        ],
        features: [
            { title: 'AI Face Swap', desc: 'State-of-the-art neural mapping for seamless character integration.' },
            { title: 'Multi-Scene Stitching', desc: 'Automatic editing and color grading across legendary movie clips.' },
            { title: 'WhatsApp Discovery', desc: 'Instant delivery to any mobile device without app installation.' },
            { title: 'Custom Movie Presets', desc: 'Growing library of action, sci-fi, and classic cinema themes.' },
            { title: 'ImgBB Integration', desc: 'Secure, ephemeral photo hosting for privacy-first AI processing.' }
        ],
        useCases: [
            { title: 'Viral Marketing', desc: 'Create hyper-personalized ads that stop the scroll instantly.', icon: 'Zap' },
            { title: 'Personalized Gifts', desc: 'Turn friends into movie stars for birthdays or anniversaries.', icon: 'Globe' },
            { title: 'Brand Storytelling', desc: 'Tell your brand story with cinematic high-production value.', icon: 'Rocket' }
        ],
        faqs: [
            { q: 'How many scenes are included?', a: 'By default, each generation stitches 3 iconic scenes together for a 15-second cinematic experience.' },
            { q: 'Is my data safe?', a: 'Yes. We use ephemeral processing. Your source photo is deleted immediately after the video is generated.' },
            { q: 'Can I add my own clips?', a: 'Professional tiers allow custom template creation with your brand\'s specific B-roll or cinematic assets.' },
            { q: 'How does this drive business revenue?', a: 'High-engagement personalized content typically sees 3-5x higher share rates than static ads, significantly reducing your effective CAC.' },
            { q: 'Can we white-label the delivery?', a: 'Absolutely. The WhatsApp delivery module can be fully branded with your logo, business name, and custom messaging templates.' },
            { q: 'Is there an enterprise connection available?', a: 'Yes. For high-volume requirements, we offer direct connection to our neural rendering cluster for seamless app integration.' }
        ],
        video: "/videos/celebrity-selfie-generator.mp4",
        configurationSchema: [
            { id: 'movie_theme', label: 'Movie Theme', type: 'select', required: true, options: ['Action Hero', 'Classic Romance', 'Sci-Fi Explorer', 'Historical Legend'], placeholder: 'Select a theme' },
            { id: 'user_photo', label: 'Upload Portrait', type: 'text', required: true, placeholder: 'URL to your photo', helperText: 'Front-facing portrait for AI mapping' }
        ],
        targetMarket: 'Marketing Agencies',
        setupTime: 'Instant'
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: 'Meta Ad Library Analyzer',
        outcomeHeadline: 'Scale Your Ads with Proven, Competitor-Tested Creative Patterns',
        description: 'Eliminate guesswork from your creative strategy. This engine scrapes active high-performance ads from the Meta Ad Library and uses AI vision to reverse-engineer their winning hooks, scripts, and visual patterns for your own brand.',
        category: 'Lead Machine',
        price: 197,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'Shaf Studio',
            bio: 'Performance marketing engineers with $10M+ in managed ad spend.',
            expertise: ['Competitive Intelligence', 'Ad Hooks', 'Meta Ads']
        },
        businessImpact: "Instantly identifies high-converting creative patterns in your specific niche.",
        roiExample: "Reduced creative testing costs by 40% for home service agencies.",
        features: [
            { title: 'Ad Scraping', desc: 'Automated retrieval of active and historical ads from Meta Library.' },
            { title: 'AI Video Analysis', desc: 'Deep vision processing to extract hook patterns and CTA structures.' },
            { title: 'Template Generation', desc: 'Instant creation of high-converting scripts based on winning ad logic.' },
            { title: 'Boost.Space Storage', desc: 'Organized data sink for competitor research and creative assets.' }
        ],
        oneTimeCost: 1497,
        maintenanceCost: 147,
        maintenanceExplanation: "Covers daily Meta Ad Library scrapes, AI vision processing credits, and creative template database maintenance.",
        video: "/videos/meta-ad-analyzer.mp4",
        configurationSchema: [
            { id: 'competitor_domain', label: 'Competitor Domain', type: 'url', required: true, placeholder: 'https://competitor.com' },
            { i: 'niche', label: 'Advertising Niche', type: 'text', required: true, placeholder: 'e.g. E-commerce, SaaS' }
        ],
        targetMarket: 'E-commerce Brands',
        setupTime: '24 Hours'
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: 'YouTube AI Clone',
        outcomeHeadline: 'Convert Thousands of Hours of Video Into Your Private Intelligence Engine',
        description: 'Transform any YouTube channel into a searchable, conversational persona. This system extracts full transcript data and synthesizes a custom LLM persona that mirrors an expert\'s knowledge base and communication style, accessible via Telegram.',
        category: 'Knowledge Engine',
        price: 347,
        guarantee: 'Satisfaction Guaranteed',
        creator: {
            name: 'Rensto Labs',
            bio: 'Expert AI automation team specializing in knowledge management.',
            expertise: ['Persona Synthesis', 'LLM Fine-tuning', 'Knowledge Retrieval']
        },
        features: [
            { title: 'Transcript Extraction', desc: 'Clean, formatted text retrieval from any video ID or channel URL.' },
            { title: 'Persona Synthesis', desc: 'Training OpenAI models to mirror specific speech patterns and knowledge bases.' },
            { title: 'Telegram Bot Integration', desc: 'Real-time conversational interface for mobile and desktop chat.' },
            { title: 'Perplexity Research', desc: 'Real-time fact checking and source citation for AI generated responses.' }
        ],
        oneTimeCost: 1897,
        maintenanceCost: 197,
        maintenanceExplanation: "Includes transcript extraction throughput, OpenAI persona training tokens, and Perplexity research API integration.",
        video: "/videos/youtube-clone.mp4",
        roiExample: "Synthesized 2,400+ hours of training data into an instant-response advisory bot.",
        configurationSchema: [
            { id: 'channel_url', label: 'YouTube Channel URL', type: 'url', required: true, placeholder: 'https://youtube.com/@channel' },
            { id: 'persona_voice', label: 'Clone Voice Style', type: 'select', required: true, options: ['Enthusiastic', 'Analytical', 'Sarcastic', 'Inspirational'] }
        ],
        targetMarket: 'Content Creators',
        setupTime: '48 Hours'
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: 'Call Audio Lead Analyzer',
        outcomeHeadline: 'Recover Lost Revenue Hidden in Your Voice Recordings',
        description: 'Stop letting sales opportunities slip through the cracks. Our Telnyx-powered engine automatically transcribes call recordings, scores lead intent using sentiment analysis, and syncs qualified opportunities directly to your CRM with intelligent categorization.',
        category: 'Lead Machine',
        price: 497,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'ServiceFlow Pro',
            bio: 'Service industry specialists focused on CRM automation.',
            expertise: ['Workiz Integration', 'Voice AI', 'Lead Capture']
        },
        businessImpact: "Ensures no sales opportunity ever falls through the cracks of your call recordings.",
        roiExample: "Recovered $12,400 in 'missed quote' revenue for a single plumbing client last month.",
        features: [
            { title: 'Telnyx Integration', desc: 'Direct processing for incoming recordings and call logs.' },
            { title: 'Audio Transcription', desc: 'High-fidelity voice-to-text conversion for sales and support calls.' },
            { title: 'Lead Scoring', desc: 'Sentiment analysis and intent detection to prioritize high-value prospects.' },
            { title: 'Workiz CRM Sync', desc: 'Automated entry and categorization within your existing operations stack.' }
        ],
        oneTimeCost: 2497,
        maintenanceCost: 247,
        maintenanceExplanation: "Covers Telnyx recording hooks, AI audio-to-text transcription credits, and secure Workiz CRM lead synchronization.",
        video: "/videos/call-audio-analyzer.mp4",
        configurationSchema: [
            { id: 'crm_type', label: 'Target CRM', type: 'select', required: true, options: ['Workiz', 'PipeDrive', 'Salesforce', 'HubSpot'] },
            { id: 'score_threshold', label: 'Lead Score Threshold', type: 'number', required: true, placeholder: '0-100' }
        ],
        targetMarket: 'Service Businesses',
        setupTime: '3 Days'
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: 'AI Calendar Assistant',
        outcomeHeadline: 'Eliminate Scheduling Friction with an Autonomous Booking Agent',
        description: 'Delegate your entire calendar management to an agent that actually understands your business. Handles complex multi-timezone booking, natural language rescheduling requests, and human-in-the-loop approval workflows via Telegram or Slack.',
        category: 'Voice AI Agent',
        price: 147,
        guarantee: 'Satisfaction Guaranteed',
        creator: {
            name: 'Rensto Labs',
            bio: 'Expert AI automation team specializing in autonomous agents.',
            expertise: ['Agentic Workflows', 'Natural Language Scheduling', 'API Orchestration']
        },
        features: [
            { title: 'Conflict Resolution', desc: 'Intelligent handling of double-bookings and time-zone overlaps.' },
            { title: 'Natural Language', desc: 'Process scheduling requests like "Move my Tuesday 10am to next Monday".' },
            { title: 'Human Approval Flow', desc: 'Optional Slack/WhatsApp confirmation before finalizing bookings.' },
            { title: 'App Triggers', desc: 'Connect to external apps to trigger bookings from lead forms.' }
        ],
        oneTimeCost: 897,
        maintenanceCost: 87,
        maintenanceExplanation: "Includes connection monitoring, natural language scheduling API credits, and conflict resolution logic maintenance.",
        video: "/videos/calendar-assistant.mp4",
        roiExample: "Saved an average of 12 hours per month in administrative coordination per user.",
        configurationSchema: [
            { id: 'calendar_provider', label: 'Calendar Provider', type: 'select', required: true, options: ['Google Calendar', 'Outlook', 'iCloud'] },
            { id: 'timezone', label: 'Primary Timezone', type: 'text', required: true, placeholder: 'e.g. America/New_York' }
        ],
        targetMarket: 'Consultants',
        setupTime: 'Instant'
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: 'Floor Plan to Property Tour',
        outcomeHeadline: 'Sell Properties Faster with Photorealistic AI Video Walkthroughs',
        description: 'Transform flat 2D floor plans into immersive 4K cinematic walkthroughs. This spatial AI engine renders photorealistic room textures in multiple architectural styles and stitches them into a high-production property tour.',
        category: 'Content Engine',
        price: 397,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'VisioReal',
            bio: 'Pioneers in AI-driven architectural visualization.',
            expertise: ['Spatial AI', 'Photorealistic Rendering', 'PropTech']
        },
        features: [
            { title: '2D to 3D Conversion', desc: 'Neural reconstruction of spatial layouts from simple image files.' },
            { title: 'Photorealistic Rendering', desc: 'Ray-traced quality visuals with accurate lighting and material textures.' },
            { title: 'Video Walkthrough', desc: 'Dynamic camera paths that explore the property in 4K resolution.' },
            { title: 'Multi-Style Options', desc: 'Switch between Modern, Industrial and Classic themes instantly.' }
        ],
        oneTimeCost: 1997,
        maintenanceCost: 197,
        maintenanceExplanation: "Includes neural reconstruction processing, 4K rendering cloud credits, and episodic walkthrough stitching maintenance.",
        video: "/videos/floor-plan-tour.mp4",
        roiExample: "Boosted pre-construction sales engagement by 230% for luxury developments.",
        configurationSchema: [
            { id: 'floorplan_url', label: 'Floor Plan Image URL', type: 'url', required: true },
            { id: 'style', label: 'Interior Style', type: 'select', required: true, options: ['Modern', 'Scandinavian', 'Industrial', 'Traditional'] }
        ],
        targetMarket: 'Real Estate Agents',
        setupTime: '24 Hours'
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "Monthly Growth Insights Bot",
        outcomeHeadline: "Automate Your Growth Strategy with Continuous User Experience Audits",
        description: "Turn your website data into a prioritized growth roadmap. This system autonomously identifies revenue leaks, user frustration signals, and conversion bottlenecks, delivering actionable growth recommendations directly to your team via Slack.",
        category: "Knowledge & Research",
        price: 247,
        guarantee: 'Satisfaction Guaranteed',
        rating: 4.8,
        downloads: 112,
        creator: {
            name: 'Shaf Studio',
            bio: 'Data-driven optimization specialists focused on user behavior.',
            expertise: ['UX Analysis', 'Google Analytics 4', 'Conversion Optimization']
        },
        features: ["Drop-off Analysis", "Behavioral Heatmaps", "Monthly Report"],
        tools: ['google', 'n8n', 'openai'],
        tags: ['marketplace'],
        readinessStatus: 'Active',
        deploymentSteps: [
            { title: "Connect Data", desc: "Link your Google Analytics and session recording tools", icon: "Link" },
            { title: "Define Goals", desc: "Set your KPI targets for the audit", icon: "Target" },
            { title: "Receive Insights", desc: "Get your first growth report in Slack", icon: "Zap" }
        ],
        businessImpact: "Agencies charge $2k/mo for this. You get it for $247.",
        roiExample: "Identifying one checkout error saved a client $12k/mo.",
        complexity: "Beginner",
        oneTimeCost: 1297,
        maintenanceCost: 0,
        maintenanceExplanation: "Covers data warehouse storage, automated monthly insight generation, and secure Slack communication maintenance.",
        video: "/videos/cro-insights.mp4",
        configurationSchema: [
            { id: 'ga4_id', label: 'GA4 Measurement ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
            { id: 'domain', label: 'Website Domain', type: 'url', required: true }
        ],
        targetMarket: 'SaaS Companies',
        setupTime: 'Instant'
    }
];

async function getWorkflow(id: string) {
    const db = getFirestoreAdmin();
    try {
        const docRef = db.collection(COLLECTIONS.TEMPLATES).doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data() as Template;

            // Unified Mapping Logic (from original client implementation)
            const mapping: any = {
                ...data,
                id: docSnap.id,
                workflowId: data.id || docSnap.id,
                name: data.name,
                description: data.description,
                outcomeHeadline: data.outcomeHeadline,
                features: data.features || [],
                businessImpact: data.businessImpact,
                roiExample: data.roiExample,
                maintenanceExplanation: data.maintenanceExplanation,
                guarantee: data.guarantee,
                kpis: data.kpis || [],
                useCases: data.useCases || [],
                faqs: data.faqs || [],
                creator: data.creator,
                downloadPrice: data.price || 97,
                installPrice: data.installPrice || 797,
                customPrice: data.customPrice || 1497,
                status: data.readinessStatus || 'Active',
                video: data.video ? data.video.replace('http://172.245.56.50', '') : undefined,
                demoVideo: data.demoVideo ? data.demoVideo.replace('http://172.245.56.50', '') : undefined,
                targetMarket: data.targetMarket || 'SMBs',
                setupTime: data.setupTime || 'Instant',
                deploymentSteps: data.deploymentSteps || undefined,
            };

            if (mapping.features.length > 0 && typeof mapping.features[0] === 'string') {
                mapping.features = mapping.features.map((f: string) => ({
                    title: f,
                    desc: 'Outcome-optimized core module engineered for horizontal scaling and mission-critical reliability.'
                }));
            }
            return serializeData(mapping);
        } else {
            console.log(`Template ${id} not found in Firestore, checking fallback.`);
        }
    } catch (error) {
        console.error('Error fetching workflow from Firestore:', error);
    }

    // Last resort fallback (Mock)
    const mock = MOCK_TEMPLATES.find((m) => m.id === id);
    if (mock) {
        return {
            ...mock,
            downloadPrice: mock.price || 97,
            installPrice: 797,
            customPrice: 1497,
            status: 'Active',
            targetMarket: mock.targetMarket || 'SMBs',
            setupTime: mock.setupTime || 'Instant'
        };
    }

    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const workflow = await getWorkflow(id);
    if (!workflow) return { title: 'Workflow Not Found | Rensto' };

    return {
        title: `${workflow.name} | Automation Marketplace | Rensto`,
        description: workflow.description,
    };
}

export default async function WorkflowDetailPage({ params }: Props) {
    const { id } = await params;
    const workflow = await getWorkflow(id);

    if (!workflow) {
        notFound();
    }

    return <TemplateDetailClient workflow={workflow} />;
}
