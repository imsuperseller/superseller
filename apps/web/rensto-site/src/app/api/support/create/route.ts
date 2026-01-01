import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';

/**
 * POST /api/support/create
 * 
 * Creates a new support case from the Magic Button or other intake methods.
 * Stores in Firestore and triggers the Care Plan Support Agent workflow.
 */

export interface SupportCase {
    id?: string;
    customerId: string;
    workflowId?: string;
    carePlanTier: 'starter' | 'growth' | 'scale';
    submissionMethod: 'magic_button' | 'voice' | 'whatsapp';
    issueDescription: string;
    contextData: {
        recentErrors?: Array<{
            executionId: string;
            errorMessage: string;
            timestamp: string;
        }>;
        workflowJson?: object;
        capturedAt?: string;
    };
    status: 'pending' | 'researching' | 'fixing' | 'testing' | 'awaiting_approval' | 'resolved' | 'escalated';
    aiReasoningLog: string[];
    attemptCount: number;
    proposedFix?: {
        diff: string;
        testResult: 'pass' | 'fail';
        confidence: number;
    };
    resolution?: {
        approved: boolean;
        feedback?: string;
        resolvedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

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

        const db = getFirestoreAdmin();

        // Create the support case
        const supportCase: Omit<SupportCase, 'id'> = {
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
        };

        const docRef = await db.collection(COLLECTIONS.SUPPORT_CASES).add(supportCase);

        // Trigger n8n Care Plan Support Agent webhook (if configured)
        const N8N_SUPPORT_WEBHOOK = process.env.N8N_SUPPORT_AGENT_WEBHOOK_URL;

        if (N8N_SUPPORT_WEBHOOK) {
            try {
                await fetch(N8N_SUPPORT_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId: docRef.id,
                        ...supportCase,
                    }),
                });
            } catch (webhookError) {
                console.error('Failed to trigger n8n support agent webhook:', webhookError);
                // Don't fail the request - case is still created
            }
        }

        return NextResponse.json({
            success: true,
            caseId: docRef.id,
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
