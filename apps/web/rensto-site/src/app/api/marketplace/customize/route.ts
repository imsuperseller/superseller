import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';
/**
 * POST /api/marketplace/customize
 * Handles workflow customization requests from the CustomizationModal.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { workflowId, parameters, customerEmail } = body;

        if (!workflowId) {
            return NextResponse.json(
                { success: false, error: 'Workflow ID is required' },
                { status: 400 }
            );
        }

        if (!parameters || Object.keys(parameters).length === 0) {
            return NextResponse.json(
                { success: false, error: 'Parameters are required' },
                { status: 400 }
            );
        }

        const resolvedEmail = parameters.email || customerEmail || null;
        const record = await prisma.customizationRequest.create({
            data: {
                templateId: workflowId,
                customerEmail: resolvedEmail,
                parameters: parameters,
                status: 'pending',
            },
        });
        // Trigger n8n Workflow Generalizer webhook (if configured)
        const N8N_WEBHOOK_URL = process.env.N8N_CUSTOMIZE_WEBHOOK_URL;
        if (N8N_WEBHOOK_URL) {
            try {
                await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requestId: record.id,
                        workflowId,
                        parameters,
                        customerEmail: resolvedEmail,
                    }),
                });
            } catch (webhookError) {
                console.error('Failed to trigger n8n webhook:', webhookError);
            }
        }

        return NextResponse.json({
            success: true,
            requestId: record.id,
            message: 'Customization request submitted successfully',
        });

    } catch (error: any) {
        console.error('Customization API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
