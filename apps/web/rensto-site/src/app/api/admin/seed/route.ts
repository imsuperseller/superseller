import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';

export async function GET() {
    const db = getFirestoreAdmin();
    const clientId = 'test-verification-client';

    try {
        // 1. Seed Outreach Campaigns
        const campaignsRef = db.collection(COLLECTIONS.OUTREACH_CAMPAIGNS);
        const campaignsBatch = db.batch();

        const campaigns = [
            {
                id: 'cam_1',
                clientId,
                name: 'Re-engagement Sequence',
                type: 'email',
                status: 'active',
                stats: { sent: 1240, delivered: 1238, opened: 452, replied: 86 },
                lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
            },
            {
                id: 'cam_2',
                clientId,
                name: 'New Lead SMS Intro',
                type: 'sms',
                status: 'active',
                stats: { sent: 85, delivered: 85, opened: 82, replied: 24 },
                lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 mins ago
            },
            {
                id: 'cam_3',
                clientId,
                name: 'Q1 Discount Flow',
                type: 'email',
                status: 'paused',
                stats: { sent: 500, delivered: 498, opened: 120, replied: 5 },
                lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
            }
        ];

        campaigns.forEach(cam => {
            campaignsBatch.set(campaignsRef.doc(cam.id), cam);
        });

        // 2. Seed Voice Call Logs
        const voiceRef = db.collection(COLLECTIONS.VOICE_CALL_LOGS);
        const voiceBatch = db.batch();

        const calls = [
            {
                id: 'call_1',
                clientId,
                caller: 'John Smith',
                callerPhone: '+1 (555) 123-4567',
                duration: 145,
                outcome: 'answered',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                summary: 'Inquiry about pricing for enterprise plan. Transferred to sales.'
            },
            {
                id: 'call_2',
                clientId,
                caller: 'Sarah Johnson',
                callerPhone: '+1 (555) 987-6543',
                duration: 62,
                outcome: 'voicemail',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                summary: 'Left message regarding appointment cancellation.'
            },
            {
                id: 'call_3',
                clientId,
                caller: 'Michael Brown',
                callerPhone: '+1 (555) 456-7890',
                duration: 15,
                outcome: 'missed',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        calls.forEach(call => {
            voiceBatch.set(voiceRef.doc(call.id), call);
        });

        // 3. Seed Content Items
        const contentRef = db.collection(COLLECTIONS.CONTENT_ITEMS);
        const contentBatch = db.batch();

        const content = [
            {
                id: 'cont_1',
                clientId,
                title: 'Sample Content #1',
                type: 'blog',
                status: 'published',
                platform: 'WordPress',
                publishedUrl: 'https://rensto.com/blog/sample-1',
                createdAt: new Date().toISOString()
            },
            {
                id: 'cont_2',
                clientId,
                title: 'Sample Content #2',
                type: 'social',
                status: 'scheduled',
                platform: 'LinkedIn',
                scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: 'cont_3',
                clientId,
                title: 'Sample Content #3',
                type: 'email',
                status: 'draft',
                createdAt: new Date().toISOString()
            }
        ];

        content.forEach(item => {
            contentBatch.set(contentRef.doc(item.id), item);
        });

        // 4. Seed Leads (restored from previous logic but made generic)
        const leadsRef = db.collection('leads');
        const leadsBatch = db.batch();

        const leads = [
            {
                id: 'lead_1',
                clientId,
                name: 'Sample Lead #1',
                email: 'contact@example-biz.com',
                niche: 'Real Estate',
                status: 'new',
                createdAt: new Date().toISOString(),
                phone: '+1 555-0101'
            },
            {
                id: 'lead_2',
                clientId,
                name: 'Sample Lead #2',
                email: 'marketing@tech-hub.io',
                niche: 'SaaS',
                status: 'contacted',
                createdAt: new Date().toISOString(),
                phone: '+1 555-0102'
            },
            {
                id: 'lead_3',
                clientId,
                name: 'Sample Lead #3',
                email: 'ops@law-firm.com',
                niche: 'Legal',
                status: 'qualified',
                createdAt: new Date().toISOString(),
                phone: '+1 555-0103'
            }
        ];

        leads.forEach(lead => {
            leadsBatch.set(leadsRef.doc(lead.id), lead);
        });

        // Execute Batches
        await campaignsBatch.commit();
        await voiceBatch.commit();
        await contentBatch.commit();
        await leadsBatch.commit();

        return NextResponse.json({ success: true, message: 'Seeded data for ' + clientId });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
