import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

const CRON_SECRET = process.env.CRON_SECRET;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function requireAdmin(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) {
        return { session: { isValid: true, role: 'admin' } };
    }
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { session };
}

// POST /api/admin/capabilities/smart-match — AI evaluates which tenants fit a capability
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const { capabilityId } = await req.json();
        if (!capabilityId) {
            return NextResponse.json({ error: 'capabilityId is required' }, { status: 400 });
        }

        const [capability, tenants, existingMappings] = await Promise.all([
            prisma.capability.findUnique({ where: { id: capabilityId } }),
            prisma.tenant.findMany({
                include: {
                    brand: { select: { name: true, tone: true, nicheSettings: true, instagramId: true, facebookPageId: true } },
                    entityCapabilities: { include: { capability: { select: { name: true } } } },
                },
            }),
            prisma.entityCapability.findMany({
                where: { capabilityId },
                select: { tenantId: true, status: true },
            }),
        ]);

        if (!capability) {
            return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
        }

        const alreadyMapped = new Set(existingMappings.map(m => m.tenantId));

        // Build context for AI
        const tenantSummaries = tenants.map(t => {
            const settings = t.settings as Record<string, unknown> | null;
            const caps = t.entityCapabilities.map(ec => `${ec.capability.name}:${ec.status}`);
            return {
                id: t.id,
                name: t.name,
                slug: t.slug,
                status: t.status,
                brand: t.brand?.name || 'none',
                tone: t.brand?.tone || 'none',
                hasIG: !!t.brand?.instagramId,
                hasFB: !!t.brand?.facebookPageId,
                contentAutomation: !!(settings?.contentAutomation as Record<string, unknown>)?.enabled,
                currentCapabilities: caps,
                alreadyHasThis: alreadyMapped.has(t.id),
            };
        });

        if (!ANTHROPIC_API_KEY) {
            // No AI available — return basic rule-based suggestions
            const suggestions = tenantSummaries
                .filter(t => !t.alreadyHasThis && t.status === 'active')
                .map(t => ({
                    tenantId: t.id,
                    tenantName: t.name,
                    reason: 'Active tenant without this capability',
                    score: 0.5,
                }));
            return NextResponse.json({ success: true, suggestions });
        }

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1000,
                system: `You evaluate which business tenants would benefit from a specific capability. Return ONLY a JSON array of objects with: tenantId, tenantName, reason (1 sentence why it fits), score (0-1). Only include tenants that are a genuine fit. If none fit, return an empty array.`,
                messages: [{
                    role: 'user',
                    content: `Capability: "${capability.displayName}" - ${capability.description || 'No description'}\nCategory: ${capability.category}\nType: ${capability.type}\nDependencies: ${capability.dependencies.join(', ') || 'none'}\n\nTenants:\n${JSON.stringify(tenantSummaries, null, 2)}\n\nWhich tenants (that don't already have this capability) would benefit from it? Consider their current capabilities, brand, and settings.`,
                }],
            }),
        });

        if (!res.ok) {
            return NextResponse.json({ success: false, error: 'AI evaluation failed' }, { status: 502 });
        }

        const data = await res.json();
        const content = data.content?.[0]?.text || '[]';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        return NextResponse.json({ success: true, suggestions });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('POST /api/admin/capabilities/smart-match failed:', msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
