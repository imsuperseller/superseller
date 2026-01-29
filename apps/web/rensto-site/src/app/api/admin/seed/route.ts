import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Template } from '@/types/firestore';

const MOCK_TEMPLATES_EN: (Partial<Template> & { id: string })[] = [
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
    },
    {
        id: 'fb-marketplace-autoposter',
        name: "Facebook Marketplace Autoposter",
        outcomeHeadline: "Scale Your Real Estate or Auto Business with Autonomous Marketplace Fulfillment",
        description: "The universal engine for high-volume Facebook Marketplace sellers. Automatically posts, manages browser fingerprints via GoLogin, and ensures 24/7 visibility with randomized intervals to protect your accounts.",
        category: "Lead & Sales",
        price: 497,
        rating: 5.0,
        downloads: 842,
        popular: true,
        features: ["Anti-Detection Browser Sync", "Randomized Post Intervals", "Image Metadata Scrubbing", "Auto-Renewal Engine"],
        tools: ['meta', 'gologin', 'n8n'],
        tags: ['marketplace', 'managed-solution'],
        readinessStatus: 'Active',
        technicalRequirements: [
            { id: 'fb_email', label: 'Facebook Email', type: 'email', required: true, secret: true },
            { id: 'fb_password', label: 'Facebook Password', type: 'password', required: true, secret: true },
            { id: 'gologin_profile_id', label: 'GoLogin Profile ID', type: 'text', required: true },
            { id: 'gologin_api_key', label: 'GoLogin API Key', type: 'password', required: true, secret: true }
        ],
        pricing: {
            builder: { price: 497, currency: 'USD' },
            bundle: { price: 297, currency: 'USD', interval: 'month' }
        }
    },
    {
        id: 'uad-fb-autoposter',
        name: "UAD Facebook Autoposter",
        outcomeHeadline: "Scale Your Garage Door Business with Autonomous Marketplace Fulfillment",
        description: "Specialized for UAD Garage Doors. This engine automatically generates high-converting Facebook Marketplace listings, manages images with photorealistic text overlays, and routes calls to your Telnyx AI Assistant which syncs appointments directly to Workiz CRM.",
        category: "Lead & Sales",
        price: 497,
        rating: 5.0,
        downloads: 12,
        features: ["Marketplace Scraping", "Telnyx + Workiz Sync", "Flux Image Overlays"],
        tools: ['meta', 'telnyx', 'workiz', 'kie.ai'],
        tags: ['partner', 'marketplace'],
        readinessStatus: 'Active',
        partner: "David Szender",
        technicalRequirements: [
            { id: 'fb_email', label: 'Facebook Email', type: 'email', required: true, secret: true },
            { id: 'fb_password', label: 'Facebook Password', type: 'password', required: true, secret: true },
            { id: 'workiz_api_key', label: 'Workiz API Key', type: 'password', required: true, secret: true }
        ],
        pricing: {
            builder: { price: 997, currency: 'USD' },
            bundle: { price: 497, currency: 'USD', interval: 'month' }
        }
    },
    {
        id: 'missparty-fb-autoposter',
        name: "Miss Party Assistant",
        outcomeHeadline: "Elevate Your Party Rental Business with AI-Powered Reservations",
        description: "Specialized for Miss Party White Bounce House Rentals. Manages 24/7 customer inquiries, calculates delivery costs ($1/mile from Missy Dr), and provides Sarah—your friendly AI hostess—to handle all rental logistics via voice.",
        category: "Operations",
        price: 0,
        rating: 5.0,
        downloads: 8,
        features: ["SARAH AI Voice Agent", "Delivery Calculator", "WhatsApp Confirmation"],
        tools: ['telnyx', 'whatsapp', 'n8n'],
        tags: ['partner', 'marketplace'],
        readinessStatus: 'Active',
        partner: "Michal Friedman",
        technicalRequirements: [
            { id: 'whatsapp_number', label: 'WhatsApp Number', type: 'text', required: true },
            { id: 'delivery_base_address', label: 'Base Address', type: 'text', required: true, placeholder: 'Missy Dr, Dallas, TX' }
        ],
        pricing: {
            builder: { price: 0, currency: 'USD' },
            bundle: { price: 197, currency: 'USD', interval: 'month' }
        }
    }
];

export async function GET() {
    const db = getFirestoreAdmin();
    const clientId = 'test-verification-client';

    try {
        // 1. Seed Templates
        const templatesRef = db.collection(COLLECTIONS.TEMPLATES);
        const templatesBatch = db.batch();

        MOCK_TEMPLATES_EN.forEach(template => {
            templatesBatch.set(templatesRef.doc(template.id), {
                ...template,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });

        // 2. Seed Outreach Campaigns
        const campaignsRef = db.collection(COLLECTIONS.OUTREACH_CAMPAIGNS);
        const campaignsBatch = db.batch();

        const campaigns = [
            {
                id: 'cam_1',
                clientId,
                name: 'Re-engagement Sequence',
                type: 'email',
                status: 'active',
                stats: { sent: 1240, delivered: 1238, opened: 452, replied: 86 },
                lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'cam_2',
                clientId,
                name: 'New Lead SMS Intro',
                type: 'sms',
                status: 'active',
                stats: { sent: 85, delivered: 85, opened: 82, replied: 24 },
                lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString()
            }
        ];

        campaigns.forEach(cam => {
            campaignsBatch.set(campaignsRef.doc(cam.id), cam);
        });

        // 3. Seed Voice Call Logs
        const voiceRef = db.collection(COLLECTIONS.VOICE_CALL_LOGS);
        const voiceBatch = db.batch();

        const calls = [
            {
                id: 'call_1',
                clientId,
                caller: 'John Smith',
                callerPhone: '+1 (555) 123-4567',
                duration: 145,
                outcome: 'answered',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                summary: 'Inquiry about pricing for enterprise plan. Transferred to sales.'
            }
        ];

        calls.forEach(call => {
            voiceBatch.set(voiceRef.doc(call.id), call);
        });

        // 4. Seed Content Items
        const contentRef = db.collection(COLLECTIONS.CONTENT_ITEMS);
        const contentBatch = db.batch();

        const content = [
            {
                id: 'cont_1',
                clientId,
                title: 'Sample Content #1',
                type: 'blog',
                status: 'published',
                platform: 'WordPress',
                publishedUrl: 'https://rensto.com/blog/sample-1',
                createdAt: new Date().toISOString()
            }
        ];

        content.forEach(item => {
            contentBatch.set(contentRef.doc(item.id), item);
        });

        // 5. Seed Leads
        const leadsRef = db.collection('leads');
        const leadsBatch = db.batch();

        const leads = [
            {
                id: 'lead_1',
                clientId,
                name: 'Sample Lead #1',
                email: 'contact@example-biz.com',
                niche: 'Real Estate',
                status: 'new',
                createdAt: new Date().toISOString(),
                phone: '+1 555-0101'
            }
        ];

        leads.forEach(lead => {
            leadsBatch.set(leadsRef.doc(lead.id), lead);
        });

        // Execute Batches
        await templatesBatch.commit();
        await campaignsBatch.commit();
        await voiceBatch.commit();
        await contentBatch.commit();
        await leadsBatch.commit();

        return NextResponse.json({ success: true, message: 'Seeded all Marketplace products and test data for ' + clientId });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
