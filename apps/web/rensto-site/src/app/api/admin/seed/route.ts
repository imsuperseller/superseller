import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';
// Template seed data (moved from previous Firestore-only implementation)
const SEED_TEMPLATES = [
    { id: '4OYGXXMYeJFfAo6X', name: 'Celebrity Selfie Video Generator', category: 'Creative Content', price: 297, rating: 5.0, downloadCount: 156, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace'], features: ['AI Face Swap', 'Multi-Scene Stitching', 'WhatsApp Delivery'], tools: ['whatsapp', 'n8n', 'higgsfield'], outcomeHeadline: 'Drive High-Engagement Brand Awareness with Viral AI Video Experiences', description: 'Empower your audience to become the star of your brands cinematic journey.' },
    { id: '8GC371u1uBQ8WLmu', name: 'Meta Ad Library Analyzer', category: 'Lead & Sales', price: 197, rating: 4.8, downloadCount: 89, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace'], features: ['Ad Scraping', 'AI Video Analysis', 'Template Generation'], tools: ['meta', 'openai', 'n8n'], outcomeHeadline: 'Scale Your Ads with Proven, Competitor-Tested Creative Patterns', description: 'Eliminate guesswork from your creative strategy.' },
    { id: '5pMi01SwffYB6KeX', name: 'YouTube AI Clone', category: 'Knowledge & Research', price: 347, rating: 4.7, downloadCount: 64, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace'], features: ['Knowledge Extraction', 'Expert Personality AI', 'Telegram Integration'], tools: ['youtube', 'telegram', 'perplexity'], outcomeHeadline: 'Convert Thousands of Hours of Video Into Your Private Intelligence Engine', description: 'Transform any YouTube channel into a searchable, conversational digital expert.' },
    { id: 'U6EZ2iLQ4zCGg31H', name: 'Voice AI Lead Analyzer', category: 'Lead & Sales', price: 497, rating: 4.9, downloadCount: 203, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace'], features: ['Voice Transcription', 'Buying Intent Scoring', 'CRM Integration'], tools: ['telnyx', 'workiz', 'openai'], outcomeHeadline: 'Scale Your Sales with Autonomous Voice AI Intelligence', description: 'Part of the Rensto Autonomous Secretary pillar.' },
    { id: '5Fl9WUjYTpodcloJ', name: 'AI Appointment Assistant', category: 'Operations', price: 147, rating: 4.6, downloadCount: 312, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace'], features: ['Conflict Resolution', 'Natural Language', 'Smart Rescheduling'], tools: ['google', 'slack', 'n8n'], outcomeHeadline: 'Eliminate Scheduling Friction with an Autonomous Booking Representative', description: 'Delegate your entire calendar management to an agent.' },
    { id: 'stj8DmATqe66D9j4', name: 'Floor Plan to Property Tour', category: 'Creative Content', price: 397, rating: 5.0, downloadCount: 45, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace'], features: ['2D to 3D Conversion', 'Photorealistic Rendering', 'Video Walkthrough'], tools: ['n8n', 'openai', 'midjourney'], outcomeHeadline: 'Sell Properties Faster with Photorealistic AI Video Walkthroughs', description: 'Transform flat 2D floor plans into immersive 4K cinematic walkthroughs.' },
    { id: 'vCxY2DXUZ8vUb30f', name: 'Monthly Growth Insights Bot', category: 'Knowledge & Research', price: 247, rating: 4.8, downloadCount: 112, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace'], features: ['Drop-off Analysis', 'Behavioral Heatmaps', 'Monthly Report'], tools: ['google', 'n8n', 'openai'], outcomeHeadline: 'Automate Your Growth Strategy with Continuous User Experience Audits', description: 'Turn your website data into a prioritized growth roadmap.' },
    { id: 'fb-marketplace-autoposter', name: 'Facebook Marketplace Autoposter', category: 'Lead & Sales', price: 497, rating: 5.0, downloadCount: 842, readinessStatus: 'Active', showInMarketplace: true, tags: ['marketplace', 'managed-solution'], features: ['Anti-Detection Browser Sync', 'Randomized Post Intervals', 'Image Metadata Scrubbing', 'Auto-Renewal Engine'], tools: ['meta', 'gologin', 'n8n'], outcomeHeadline: 'Scale Your Real Estate or Auto Business with Autonomous Marketplace Fulfillment', description: 'The universal engine for high-volume Facebook Marketplace sellers.' },
    { id: 'uad-fb-autoposter', name: 'UAD Facebook Autoposter', category: 'Lead & Sales', price: 497, rating: 5.0, downloadCount: 12, readinessStatus: 'Active', showInMarketplace: true, tags: ['partner', 'marketplace'], features: ['Marketplace Scraping', 'Telnyx + Workiz Sync', 'Flux Image Overlays'], tools: ['meta', 'telnyx', 'workiz', 'kie.ai'], partner: 'David Szender', outcomeHeadline: 'Scale Your Garage Door Business with Autonomous Marketplace Fulfillment', description: 'Specialized for UAD Garage Doors.' },
    { id: 'missparty-fb-autoposter', name: 'Miss Party Assistant', category: 'Operations', price: 0, rating: 5.0, downloadCount: 8, readinessStatus: 'Active', showInMarketplace: true, tags: ['partner', 'marketplace'], features: ['SARAH AI Voice Agent', 'Delivery Calculator', 'WhatsApp Confirmation'], tools: ['telnyx', 'whatsapp', 'n8n'], partner: 'Michal Friedman', outcomeHeadline: 'Elevate Your Party Rental Business with AI-Powered Reservations', description: 'Specialized for Miss Party White Bounce House Rentals.' },
];

export async function GET() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let seededCount = 0;

        for (const tpl of SEED_TEMPLATES) {
            await prisma.template.upsert({
                where: { id: tpl.id },
                create: tpl,
                update: tpl,
            });
            seededCount++;
        }
        return NextResponse.json({
            success: true,
            message: `Seeded ${seededCount} templates into Postgres`,
        });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
