import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';

/**
 * Public health check: returns basic status without auth.
 * Admin health check: returns detailed subsystem status with auth.
 * Use ?detail=true with admin auth for full diagnostics.
 */
export async function GET(request: NextRequest) {
    const wantsDetail = request.nextUrl.searchParams.get('detail') === 'true';

    // Public health probe — no auth required
    if (!wantsDetail) {
        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    }

    // Detailed health check — admin only
    try {
        const session = await verifySession();
        if (!session.isValid || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const results = await auditAgent.runFullHealthCheck();
        const isHealthy = Object.values(results.services).every((s: any) => s.status === 'healthy');

        return NextResponse.json({
            success: true,
            healthy: isHealthy,
            ...results
        }, {
            status: isHealthy ? 200 : 503
        });

    } catch (error: any) {
        console.error('Manual health check error:', error);
        return NextResponse.json({
            success: false,
            healthy: false,
            error: error.message
        }, { status: 500 });
    }
}
