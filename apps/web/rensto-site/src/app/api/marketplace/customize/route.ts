import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';

/**
 * POST /api/marketplace/customize
 * 
 * Handles workflow customization requests from the CustomizationModal.
 * Stores the request in Firestore and triggers the n8n Workflow Generalizer
 * webhook for processing.
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

        const db = getFirestoreAdmin();

        // Create a customization request record
        const customizationRequest = {
            workflowId,
            parameters,
            customerEmail: parameters.email || customerEmail || null,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Store in Firestore
        const docRef = await db.collection(COLLECTIONS.CUSTOMIZATION_REQUESTS).add(customizationRequest);

        // Trigger n8n Workflow Generalizer webhook (if configured)
        const N8N_WEBHOOK_URL = process.env.N8N_CUSTOMIZE_WEBHOOK_URL;

        if (N8N_WEBHOOK_URL) {
            try {
                await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requestId: docRef.id,
                        workflowId,
                        parameters,
                        customerEmail: customizationRequest.customerEmail,
                    }),
                });
            } catch (webhookError) {
                console.error('Failed to trigger n8n webhook:', webhookError);
                // Don't fail the request if webhook fails - the request is still stored
            }
        }

        return NextResponse.json({
            success: true,
            requestId: docRef.id,
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
