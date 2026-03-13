/**
 * Seed Capability Engine — registers all existing capabilities and their per-tenant status.
 * Run: cd apps/web/superseller-site && npx tsx scripts/seed-capabilities.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CapabilitySeed {
    name: string;
    displayName: string;
    description: string;
    category: string;
    type: string;
    dependencies: string[];
    filePaths: string[];
}

const CAPABILITIES: CapabilitySeed[] = [
    {
        name: 'ai-content-generation',
        displayName: 'AI Content Generation',
        description: 'Claude-powered social media content creation with business context, pillars, and tone',
        category: 'content',
        type: 'tool',
        dependencies: [],
        filePaths: ['apps/web/superseller-site/src/lib/services/social/content-generator.ts'],
    },
    {
        name: 'ai-image-generation',
        displayName: 'AI Image Generation',
        description: 'Kie.ai powered image creation for social media posts',
        category: 'content',
        type: 'tool',
        dependencies: [],
        filePaths: ['apps/web/superseller-site/src/lib/services/social/image-generator.ts'],
    },
    {
        name: 'whatsapp-poll-approval',
        displayName: 'WhatsApp Poll Approval',
        description: 'Interactive poll-based content approval via WhatsApp (WAHA NOWEB PLUS)',
        category: 'social',
        type: 'mechanism',
        dependencies: ['ai-content-generation'],
        filePaths: [
            'apps/web/superseller-site/src/lib/services/social/approval-flow.ts',
            'apps/web/superseller-site/src/app/api/social/webhook/approval/route.ts',
        ],
    },
    {
        name: 'ig-auto-publish',
        displayName: 'Instagram Auto-Publish',
        description: 'Automatic publishing to Instagram Business via Graph API after approval',
        category: 'social',
        type: 'feature',
        dependencies: ['ai-content-generation', 'whatsapp-poll-approval'],
        filePaths: ['apps/web/superseller-site/src/lib/services/social/facebook-publisher.ts'],
    },
    {
        name: 'fb-auto-publish',
        displayName: 'Facebook Auto-Publish',
        description: 'Automatic publishing to Facebook Pages via Graph API after approval',
        category: 'social',
        type: 'feature',
        dependencies: ['ai-content-generation', 'whatsapp-poll-approval'],
        filePaths: ['apps/web/superseller-site/src/lib/services/social/facebook-publisher.ts'],
    },
    {
        name: 'daily-content-cron',
        displayName: 'Daily Content Cron',
        description: 'Vercel cron job generating daily content at 8 AM CDT (1 PM UTC)',
        category: 'automation',
        type: 'mechanism',
        dependencies: ['ai-content-generation', 'ai-image-generation'],
        filePaths: ['apps/web/superseller-site/src/app/api/automation/generate-scheduled/route.ts'],
    },
    {
        name: 'competitor-research',
        displayName: 'Competitor Research',
        description: 'Automated competitor ad and content analysis pipeline',
        category: 'analytics',
        type: 'feature',
        dependencies: [],
        filePaths: ['apps/web/superseller-site/src/app/api/admin/competitor-ads/route.ts'],
    },
    {
        name: 'lead-page',
        displayName: 'Lead Landing Page',
        description: 'Dynamic per-customer branded landing page with lead capture at /lp/[slug]',
        category: 'content',
        type: 'feature',
        dependencies: [],
        filePaths: ['apps/web/superseller-site/src/app/lp/[slug]/page.tsx'],
    },
    {
        name: 'whatsapp-claudeclaw',
        displayName: 'WhatsApp ClaudeClaw AI Chat',
        description: 'AI-powered WhatsApp business assistant with conversation memory',
        category: 'automation',
        type: 'agent',
        dependencies: [],
        filePaths: ['apps/worker/src/api/routes.ts'],
    },
    {
        name: 'voice-assistant',
        displayName: 'Voice Assistant (FrontDesk)',
        description: 'Telnyx-powered AI phone receptionist with call handling and transfer',
        category: 'automation',
        type: 'agent',
        dependencies: [],
        filePaths: ['apps/web/superseller-site/src/app/api/admin/frontdesk/route.ts'],
    },
    {
        name: 'fb-marketplace-bot',
        displayName: 'FB Marketplace Bot',
        description: 'Automated Facebook Marketplace listing creation and management',
        category: 'automation',
        type: 'agent',
        dependencies: [],
        filePaths: ['platforms/marketplace/', 'fb-marketplace-lister/deploy-package/'],
    },
    {
        name: 'video-pipeline',
        displayName: 'VideoForge Pipeline',
        description: 'AI video generation: Kling 3.0 clips + Remotion photo composition for real estate',
        category: 'content',
        type: 'tool',
        dependencies: [],
        filePaths: ['apps/worker/src/pipelines/video-pipeline.worker.ts'],
    },
    {
        name: 'winner-studio',
        displayName: 'Winner Studio',
        description: 'AI avatar video pipeline with lip-sync and WhatsApp delivery',
        category: 'content',
        type: 'tool',
        dependencies: [],
        filePaths: ['apps/studio/'],
    },
    {
        name: 'x-auto-publish',
        displayName: 'X (Twitter) Auto-Publish',
        description: 'Automatic publishing to X/Twitter via API after approval',
        category: 'social',
        type: 'feature',
        dependencies: ['ai-content-generation', 'whatsapp-poll-approval'],
        filePaths: ['apps/web/superseller-site/src/lib/services/social/x-publisher.ts'],
    },
    {
        name: 'linkedin-auto-publish',
        displayName: 'LinkedIn Auto-Publish',
        description: 'Automatic publishing to LinkedIn via API after approval',
        category: 'social',
        type: 'feature',
        dependencies: ['ai-content-generation', 'whatsapp-poll-approval'],
        filePaths: ['apps/web/superseller-site/src/lib/services/social/linkedin-publisher.ts'],
    },
];

// Known tenant states
const TENANT_CAPABILITIES: Record<string, Record<string, { status: string; blockedReason?: string }>> = {
    // Rensto — proven end-to-end
    'rensto': {
        'ai-content-generation': { status: 'enabled' },
        'ai-image-generation': { status: 'enabled' },
        'whatsapp-poll-approval': { status: 'enabled' },
        'ig-auto-publish': { status: 'enabled' },
        'fb-auto-publish': { status: 'eligible' },
        'daily-content-cron': { status: 'enabled' },
        'competitor-research': { status: 'eligible' },
        'lead-page': { status: 'enabled' },
        'whatsapp-claudeclaw': { status: 'enabled' },
        'voice-assistant': { status: 'not_applicable' },
        'fb-marketplace-bot': { status: 'not_applicable' },
        'video-pipeline': { status: 'not_applicable' },
        'winner-studio': { status: 'not_applicable' },
        'x-auto-publish': { status: 'eligible' },
        'linkedin-auto-publish': { status: 'eligible' },
    },
    // Elite Pro — blocked on IG credentials
    'elite-pro-remodeling': {
        'ai-content-generation': { status: 'eligible' },
        'ai-image-generation': { status: 'eligible' },
        'whatsapp-poll-approval': { status: 'eligible' },
        'ig-auto-publish': { status: 'blocked', blockedReason: 'Waiting on Eliran\'s IG credentials' },
        'fb-auto-publish': { status: 'blocked', blockedReason: 'Waiting on Eliran\'s FB credentials' },
        'daily-content-cron': { status: 'blocked', blockedReason: 'contentAutomation DISABLED until credentials provided' },
        'competitor-research': { status: 'enabled' },
        'lead-page': { status: 'enabled' },
        'whatsapp-claudeclaw': { status: 'eligible' },
        'voice-assistant': { status: 'eligible' },
        'fb-marketplace-bot': { status: 'not_applicable' },
        'video-pipeline': { status: 'eligible' },
        'winner-studio': { status: 'not_applicable' },
        'x-auto-publish': { status: 'eligible' },
        'linkedin-auto-publish': { status: 'eligible' },
    },
    // Hair Approach — new prospect
    'hair-approach': {
        'ai-content-generation': { status: 'eligible' },
        'ai-image-generation': { status: 'eligible' },
        'whatsapp-poll-approval': { status: 'eligible' },
        'ig-auto-publish': { status: 'eligible' },
        'fb-auto-publish': { status: 'eligible' },
        'daily-content-cron': { status: 'eligible' },
        'competitor-research': { status: 'eligible' },
        'lead-page': { status: 'enabled' },
        'whatsapp-claudeclaw': { status: 'eligible' },
        'voice-assistant': { status: 'eligible' },
        'fb-marketplace-bot': { status: 'not_applicable' },
        'video-pipeline': { status: 'not_applicable' },
        'winner-studio': { status: 'not_applicable' },
        'x-auto-publish': { status: 'eligible' },
        'linkedin-auto-publish': { status: 'eligible' },
    },
    // Shai Personal Brand
    'shai-personal-brand': {
        'ai-content-generation': { status: 'eligible' },
        'ai-image-generation': { status: 'eligible' },
        'whatsapp-poll-approval': { status: 'eligible' },
        'ig-auto-publish': { status: 'eligible' },
        'fb-auto-publish': { status: 'eligible' },
        'daily-content-cron': { status: 'eligible' },
        'competitor-research': { status: 'eligible' },
        'lead-page': { status: 'eligible' },
        'whatsapp-claudeclaw': { status: 'eligible' },
        'voice-assistant': { status: 'not_applicable' },
        'fb-marketplace-bot': { status: 'not_applicable' },
        'video-pipeline': { status: 'eligible' },
        'winner-studio': { status: 'eligible' },
        'x-auto-publish': { status: 'eligible' },
        'linkedin-auto-publish': { status: 'eligible' },
    },
};

async function main() {
    console.log('Seeding Capability Engine...\n');

    // 1. Upsert all capabilities
    const capMap: Record<string, string> = {}; // name -> id
    for (const cap of CAPABILITIES) {
        const result = await prisma.capability.upsert({
            where: { name: cap.name },
            update: {
                displayName: cap.displayName,
                description: cap.description,
                category: cap.category,
                type: cap.type,
                dependencies: cap.dependencies,
                filePaths: cap.filePaths,
            },
            create: {
                name: cap.name,
                displayName: cap.displayName,
                description: cap.description,
                category: cap.category,
                type: cap.type,
                dependencies: cap.dependencies,
                filePaths: cap.filePaths,
            },
        });
        capMap[cap.name] = result.id;
        console.log(`  ✓ ${cap.displayName} (${cap.category}/${cap.type})`);
    }

    // 2. Get tenants
    const tenants = await prisma.tenant.findMany();
    const tenantBySlug: Record<string, string> = {};
    for (const t of tenants) {
        tenantBySlug[t.slug] = t.id;
    }

    // 3. Upsert entity capabilities
    let ecCount = 0;
    for (const [slug, caps] of Object.entries(TENANT_CAPABILITIES)) {
        const tenantId = tenantBySlug[slug];
        if (!tenantId) {
            console.warn(`  ⚠ Tenant "${slug}" not found, skipping`);
            continue;
        }

        for (const [capName, { status, blockedReason }] of Object.entries(caps)) {
            const capabilityId = capMap[capName];
            if (!capabilityId) {
                console.warn(`  ⚠ Capability "${capName}" not found, skipping`);
                continue;
            }

            await prisma.entityCapability.upsert({
                where: {
                    capabilityId_tenantId: { capabilityId, tenantId },
                },
                update: { status, blockedReason: blockedReason || null },
                create: {
                    capabilityId,
                    tenantId,
                    status,
                    blockedReason: blockedReason || null,
                    enabledAt: status === 'enabled' ? new Date() : null,
                    enabledBy: status === 'enabled' ? 'seed-script' : null,
                },
            });
            ecCount++;
        }
        console.log(`  ✓ ${slug}: ${Object.keys(caps).length} capabilities mapped`);
    }

    console.log(`\nDone! ${CAPABILITIES.length} capabilities, ${ecCount} entity mappings.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
