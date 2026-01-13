import MarketplaceClient from './MarketplaceClient';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Template } from '@/types/firestore';

export const metadata = {
    title: 'Automation Marketplace | Rensto',
    description: 'Production-ready automation engines for growing businesses. Skip the development phase and deploy tested systems.',
};

export const dynamic = 'force-dynamic';

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

const MOCK_TEMPLATES_EN: (Template & { videoScripts: any[] })[] = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: "Celebrity Selfie Video Generator",
        outcomeHeadline: "Drive High-Engagement Brand Awareness with Viral AI Video Experiences",
        description: "Empower your audience to become the star of your brand's cinematic journey. This automated engine generates high-fidelity AI video experiences where users are seamlessly integrated into iconic scenes, perfect for viral marketing campaigns and hyper-personalized customer engagement.",
        category: "Creative Content",
        price: 297,
        rating: 5.0,
        downloads: 156,
        popular: true,
        features: ["AI Face Swap", "Multi-Scene Stitching", "WhatsApp Delivery"],
        tools: ['whatsapp', 'n8n', 'higgsfield'],
        video: "/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        videoScripts: [
            {
                persona: 'architect',
                hook: "Stop begging for attention. Start stealing it. I just built a system that turns your customers into movie stars.",
                energy: "High/Aggressive",
                visualDirecting: "Dynamic Crop: Pan from eyes to full avatar (0.8s)."
            }
        ]
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "Meta Ad Library Analyzer",
        outcomeHeadline: "Scale Your Ads with Proven, Competitor-Tested Creative Patterns",
        description: "Eliminate guesswork from your creative strategy. This engine scrapes active high-performance ads from the Meta Ad Library and uses AI vision to reverse-engineer their winning hooks, scripts, and visual patterns for your own brand.",
        category: "Lead & Sales",
        price: 197,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["Ad Scraping", "AI Video Analysis", "Template Generation"],
        tools: ['meta', 'openai', 'n8n'],
        video: "/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        videoScripts: [
            {
                persona: 'specialist',
                hook: "Amateurs guess. Pros scrape. While your competitors are busy 'testing' new ad hooks, I’m reverse-engineering what’s already printing money.",
                energy: "Calm/Systems",
                visualDirecting: "B-Roll Bridge: Overlay screen recordings of meta ad library scraping."
            }
        ]
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "YouTube AI Clone",
        outcomeHeadline: "Convert Thousands of Hours of Video Into Your Private Intelligence Engine",
        description: "Transform any YouTube channel into a searchable, conversational digital expert. This system extracts full transcript data and synthesizes a custom AI personality that mirrors an expert's knowledge base and communication style, accessible via Telegram.",
        category: "Knowledge & Research",
        price: 347,
        rating: 4.7,
        downloads: 64,
        features: ["Knowledge Extraction", "Expert Personality AI", "Telegram Integration"],
        tools: ['youtube', 'telegram', 'perplexity'],
        video: "/videos/youtube-clone.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        videoScripts: [
            {
                persona: 'futurist',
                hook: "I realized I couldn't be in 100 places at once. So I built an AI that could. Transform any YouTube channel into your private intelligence engine.",
                energy: "Story-Driven",
                visualDirecting: "Glow: Use Rensto Purple gradient blur behind the avatar."
            }
        ]
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "Voice AI Lead Analyzer",
        outcomeHeadline: "Scale Your Sales with Autonomous Voice AI Intelligence",
        description: "Part of the Rensto Autonomous Secretary pillar. This engine automatically transcribes call recordings, scores lead intent using sentiment analysis, and syncs qualified opportunities directly to your CRM with intelligent categorization.",
        category: "Lead & Sales",
        price: 497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["Voice Transcription", "Buying Intent Scoring", "CRM Integration"],
        tools: ['telnyx', 'workiz', 'openai'],
        video: "/videos/call-audio-analyzer.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        videoScripts: [
            {
                persona: 'architect',
                hook: "Your sales team is blind. Based on 'vibes.' This AI scans every call and categorizes the revenue before the phone is even hung up.",
                energy: "High/Aggressive",
                visualDirecting: "Text Pop: Bold captions syncing with keywords like 'REVENUE' in red."
            }
        ]
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "AI Appointment Assistant",
        outcomeHeadline: "Eliminate Scheduling Friction with an Autonomous Booking Representative",
        description: "Delegate your entire calendar management to an agent that actually understands your business. Handles complex multi-timezone booking, natural language rescheduling requests, and human-in-the-loop approval workflows.",
        category: "Operations",
        price: 147,
        rating: 4.6,
        downloads: 312,
        features: ["Conflict Resolution", "Natural Language", "Smart Rescheduling"],
        tools: ['google', 'slack', 'n8n'],
        video: "/videos/calendar-assistant.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        videoScripts: [
            {
                persona: 'specialist',
                hook: "The most expensive thing in your business is friction. Reclaim your time with an Autonomous Booking Rep.",
                energy: "Calm/Systems",
                visualDirecting: "Static Shot: Focus on high hand movement settings for realism."
            }
        ]
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "Floor Plan to Property Tour",
        outcomeHeadline: "Sell Properties Faster with Photorealistic AI Video Walkthroughs",
        description: "Transform flat 2D floor plans into immersive 4K cinematic walkthroughs. This spatial AI engine renders photorealistic room textures in multiple architectural styles and stitches them into a high-production property tour.",
        category: "Creative Content",
        price: 397,
        rating: 5.0,
        downloads: 45,
        features: ["2D to 3D Conversion", "Photorealistic Rendering", "Video Walkthrough"],
        tools: ['n8n', 'openai', 'midjourney'],
        video: "/videos/floor-plan-tour.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        videoScripts: [
            {
                persona: 'futurist',
                hook: "Buyers don't buy blueprints; they buy visions. Transform 2D floor plans into photorealistic cinematic tours.",
                energy: "Story-Driven",
                visualDirecting: "Slow Pan: Match the architectural style with the background lighting."
            }
        ]
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "Monthly Growth Insights Bot",
        outcomeHeadline: "Automate Your Growth Strategy with Continuous User Experience Audits",
        description: "Turn your website data into a prioritized growth roadmap. This system autonomously identifies revenue leaks, user frustration signals, and conversion bottlenecks, delivering actionable growth recommendations directly to your team via Slack.",
        category: "Knowledge & Research",
        price: 247,
        rating: 4.8,
        downloads: 112,
        features: ["Drop-off Analysis", "Behavioral Heatmaps", "Monthly Report"],
        tools: ['google', 'n8n', 'openai'],
        video: "/videos/cro-insights.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active',
        videoScripts: [
            {
                persona: 'specialist',
                hook: "Your website is leaking money. This bot audits your user behavior 24/7 and drops a roadmap in your Slack.",
                energy: "Calm/Systems",
                visualDirecting: "Screen Trace: Show behavioral heatmaps as B-Roll."
            }
        ]
    }
];

async function getTemplates(): Promise<Template[]> {
    const db = getFirestoreAdmin();
    try {
        const snapshot = await db.collection(COLLECTIONS.TEMPLATES)
            .where('tags', 'array-contains', 'marketplace')
            .where('readinessStatus', '==', 'Active')
            .get();

        if (snapshot.empty) {
            console.log('No templates found in Firestore marketplace collection, using fallback.');
            return MOCK_TEMPLATES_EN;
        }

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return serializeData({
                ...data,
                id: doc.id,
            }) as Template;
        });
    } catch (error) {
        console.error('Error fetching marketplace templates from Firestore:', error);
        return MOCK_TEMPLATES_EN;
    }
}

export default async function MarketplacePage() {
    const templates = await getTemplates();
    return <MarketplaceClient initialTemplates={templates} />;
}
