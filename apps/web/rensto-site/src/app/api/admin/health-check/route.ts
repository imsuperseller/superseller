import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = [
        { name: 'n8n', url: 'https://n8n.rensto.com/healthz' },
        { name: 'WAHA', url: `${process.env.WAHA_BASE_URL || 'http://172.245.56.50:3000'}/api/health` },
        { name: 'Worker', url: 'http://172.245.56.50:3002/api/health' },
        { name: 'FB Bot', url: 'http://172.245.56.50:8082/health' },
        { name: 'Ollama', url: 'http://172.245.56.50:11434/api/tags' },
        { name: 'LightRAG', url: `${process.env.LIGHTRAG_BASE_URL || 'http://172.245.56.50:9621'}/query`, method: 'OPTIONS' as const },
    ];

    const results = await Promise.all(services.map(async (service) => {
        try {
            const start = Date.now();
            const response = await fetch(service.url, {
                method: service.method || 'GET',
                signal: AbortSignal.timeout(5000)
            });
            const latency = Date.now() - start;

            return {
                name: service.name,
                status: response.ok ? 'online' : 'degraded',
                latency: `${latency}ms`,
                lastChecked: new Date().toISOString()
            };
        } catch (error) {
            return {
                name: service.name,
                status: 'offline',
                latency: 'N/A',
                lastChecked: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }));

    // Add Vercel/Internal health
    results.push({
        name: 'Vercel (Self)',
        status: 'online',
        latency: '0ms',
        lastChecked: new Date().toISOString()
    });

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        services: results
    });
}
