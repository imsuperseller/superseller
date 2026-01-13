import { NextResponse } from 'next/server';

export async function GET() {
    const services = [
        { name: 'n8n', url: 'https://n8n.rensto.com/api/v1/healthz' },
        { name: 'WAHA', url: `${process.env.WAHA_BASE_URL}/api/health` },
        { name: 'Marketplace', url: 'https://market.rensto.com' },
        { name: 'API Gateway', url: 'https://gateway.rensto.com' },
        { name: 'SaaS API', url: 'https://api.rensto.com' },
        { name: 'LightRAG', url: `${process.env.LIGHTRAG_BASE_URL}/query`, method: 'OPTIONS' },
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
