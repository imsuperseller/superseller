import { NextResponse } from 'next/server';
// [MIGRATION] Phase 4: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function GET() {
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

        // [MIGRATION] Phase 4: Seed into Postgres (primary)
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

        // Backup: Firestore
        await firestoreBackupWrite('admin/launch-tasks/seed', async () => {
            const db = getFirestoreAdmin();
            const collectionRef = db.collection(COLLECTIONS.LAUNCH_TASKS);
            for (const task of tasks) {
                await collectionRef.add({
                    ...task,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
        });

        return NextResponse.json({ success: true, seeded: results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
