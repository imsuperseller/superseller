import { NextRequest, NextResponse } from 'next/server';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';

export async function GET(request: NextRequest) {
    try {
        // Simple security: check for a secret token or just let it be public-but-obscure for now
        // Pros can add a secret header check here later

        const results = await auditAgent.runFullHealthCheck();

        const isHealthy = Object.values(results.services).every((s: any) => s.status === 'healthy');

        return NextResponse.json({
            success: true,
            healthy: isHealthy,
            ...results
        }, {
            status: isHealthy ? 200 : 503 // Service Unavailable if any core service is down
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
