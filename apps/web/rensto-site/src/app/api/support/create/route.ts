import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 5: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import * as dbAdmin from '@/lib/db/admin';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            customerId,
            workflowId,
            carePlanTier = 'starter',
            submissionMethod = 'magic_button',
            issueDescription,
            contextData = {},
        } = body;

        if (!customerId) {
            return NextResponse.json(
                { success: false, error: 'Customer ID is required' },
                { status: 400 }
            );
        }

        if (!issueDescription) {
            return NextResponse.json(
                { success: false, error: 'Issue description is required' },
                { status: 400 }
            );
        }

        // [MIGRATION] Phase 5: Write to Postgres (primary)
        const supportCase = await dbAdmin.createSupportCase({
            customerId,
            workflowId: workflowId || undefined,
            carePlanTier,
            submissionMethod,
            issueDescription,
            contextData: Object.keys(contextData).length > 0 ? contextData : undefined,
            status: 'pending',
            aiReasoningLog: [],
            attemptCount: 0,
        });

        // Backup: Firestore
        await firestoreBackupWrite('support/create', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.SUPPORT_CASES).doc(supportCase.id).set({
                customerId,
                workflowId: workflowId || null,
                carePlanTier,
                submissionMethod,
                issueDescription,
                contextData,
                status: 'pending',
                aiReasoningLog: [],
                attemptCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });

        // Trigger n8n Care Plan Support Agent
        const N8N_SUPPORT_WEBHOOK = process.env.N8N_SUPPORT_AGENT_WEBHOOK_URL;
        if (N8N_SUPPORT_WEBHOOK) {
            try {
                await fetch(N8N_SUPPORT_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId: supportCase.id,
                        customerId,
                        workflowId,
                        carePlanTier,
                        submissionMethod,
                        issueDescription,
                        contextData,
                    }),
                });
            } catch (webhookError) {
                console.error('Failed to trigger n8n support agent webhook:', webhookError);
            }
        }

        return NextResponse.json({
            success: true,
            caseId: supportCase.id,
            message: 'Support case created successfully. Our AI agent will analyze it shortly.',
        });

    } catch (error: any) {
        console.error('Support case creation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
