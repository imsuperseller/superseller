import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @api {post} /api/leads/sync Sync Lead from external source (n8n/Telnyx)
 * @apiDescription Bridges the "Lead Island" by allowing external analysis engines to push results.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            phone,
            name,
            email,
            source,
            sourceId,
            tenantId,
            transcript,
            rawAnalysis,
            status = 'new'
        } = body;

        if (!phone && !email) {
            return NextResponse.json({ error: 'Phone or Email required' }, { status: 400 });
        }

        // 1. Identify User/Tenant
        let finalTenantId = tenantId;
        if (!finalTenantId && sourceId) {
            const tenant = await prisma.tenant.findUnique({
                where: { slug: sourceId }
            });
            if (tenant) finalTenantId = tenant.id;
        }

        // 2. Find existing user for this tenant
        let targetUserId = body.userId;
        if (!targetUserId && finalTenantId) {
            const tenantUser = await prisma.tenantUser.findFirst({
                where: { tenantId: finalTenantId, role: 'owner' }
            });
            targetUserId = tenantUser?.userId;
        }

        if (!targetUserId && finalTenantId) {
            const fallbackUser = await prisma.tenantUser.findFirst({
                where: { tenantId: finalTenantId }
            });
            targetUserId = fallbackUser?.userId;
        }

        if (!targetUserId) {
            return NextResponse.json({ error: 'Could not resolve target User for this lead' }, { status: 400 });
        }

        // 3. Create Lead
        const lead = await prisma.lead.create({
            data: {
                phone,
                name,
                email,
                source: source || 'external_sync',
                sourceId,
                tenantId: finalTenantId,
                userId: targetUserId,
                transcript,
                rawAnalysis,
                status,
                metadata: body.metadata || {},
            }
        });

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            message: 'Lead synced successfully to PostgreSQL SSOT'
        });

    } catch (error: any) {
        console.error('[LEAD_SYNC_ERROR]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
