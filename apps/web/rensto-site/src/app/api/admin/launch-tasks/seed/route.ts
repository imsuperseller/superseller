import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
export async function GET() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tasks = [
            { category: 'Infrastructure', title: 'Cloudflare DNS Mapping', description: 'Resolve reachability issues for market. and gateway. subdomains.', status: 'pending', order: 10 },
            { category: 'Infrastructure', title: 'Wrangler Config Finalization', description: 'Update KV IDs and routes in gateway-worker/wrangler.toml.', status: 'pending', order: 15 },
            { category: 'Technical', title: 'Cross-Service Rollbar Audit', description: 'Implement error tracking in Site and Dashboard frontends.', status: 'pending', order: 20 },
            { category: 'Technical', title: 'API Loop Validation', description: 'Ping all 3rd party APIs (Stripe, Telnyx, OpenAI) from VPS.', status: 'pending', order: 25 },
            { category: 'Finance', title: 'Stripe Live Mode Checkout', description: 'Perform $1 real transaction on /offers and verify webhooks.', status: 'pending', order: 30 },
            { category: 'Product', title: 'Pillar Alignment Audit', description: 'Verify naming consistency for Lead Gen, Voice AI, RAG, and Content.', status: 'pending', order: 40 },
            { category: 'Legal', title: 'eSignatures.com API Test', description: 'Verify automated contract generation for Scale-tier subscribers.', status: 'pending', order: 50 },
            { category: 'Lead Gen', title: 'Lead Machine Stress Test', description: 'Process 10 concurrent Israeli leads through full enrichment.', status: 'pending', order: 60 },
        ];
        const results = [];
        for (const task of tasks) {
            const record = await prisma.launchTask.create({
                data: {
                    title: task.title,
                    description: task.description,
                    category: task.category,
                    status: task.status,
                    order: task.order,
                },
            });
            results.push({ id: record.id, title: task.title });
        }
        return NextResponse.json({ success: true, seeded: results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
