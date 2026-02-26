import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

/**
 * GET /api/n8n/workflows
 * Proxy to n8n API to list workflows. Used by admin AgentDashboard.
 */
export async function GET(req: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL?.replace('/webhook', '') || 'https://n8n.superseller.agency';
    const n8nApiKey = process.env.N8N_API_KEY;

    if (!n8nApiKey) {
        return NextResponse.json({
            workflows: [],
            message: 'N8N_API_KEY not configured',
        });
    }

    try {
        const type = req.nextUrl.searchParams.get('type');
        const res = await fetch(`${n8nUrl}/api/v1/workflows`, {
            headers: { 'X-N8N-API-KEY': n8nApiKey },
        });

        if (!res.ok) {
            return NextResponse.json({ workflows: [], error: `n8n returned ${res.status}` });
        }

        const data = await res.json();
        let workflows = data.data || [];

        if (type === 'agents') {
            workflows = workflows.filter((w: any) =>
                w.name?.toLowerCase().includes('agent') ||
                w.tags?.some((t: any) => t.name?.toLowerCase().includes('agent'))
            );
        }

        return NextResponse.json({
            workflows: workflows.map((w: any) => ({
                id: w.id,
                name: w.name,
                active: w.active,
                updatedAt: w.updatedAt,
                tags: w.tags?.map((t: any) => t.name) || [],
            })),
        });
    } catch (error: any) {
        console.error('[n8n/workflows] Error:', error.message);
        return NextResponse.json({ workflows: [], error: error.message });
    }
}
