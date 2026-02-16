import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { emails } from '@/lib/email';
import * as dbServices from '@/lib/db/services';
export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session.isValid || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { instanceId, n8nWorkflowId, adminNotes } = body;

        if (!instanceId || !n8nWorkflowId) {
            return NextResponse.json(
                { error: 'Missing instance ID or N8N Workflow ID' },
                { status: 400 }
            );
        }
        const instance = await dbServices.getServiceInstance(instanceId);

        if (!instance) {
            return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
        }

        // Postgres update
        await dbServices.updateServiceInstance(instanceId, {
            n8nWorkflowId,
            status: 'active',
            activatedAt: new Date(),
            adminNotes: adminNotes || instance.adminNotes || '',
        });
        // Trigger Activation Notification via N8N
        const N8N_WEBHOOK = process.env.N8N_FULFILLMENT_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/fulfillment-orchestrator';
        try {
            await fetch(N8N_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'service_activated',
                    instanceId,
                    clientId: instance.clientId,
                    clientEmail: instance.clientEmail,
                    productName: instance.productName,
                    n8nWorkflowId,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (e) {
            console.warn('Failed to trigger activation webhook:', e);
        }

        // Send fulfillment complete email
        if (instance.clientEmail) {
            try {
                await emails.fulfillmentComplete(
                    instance.clientEmail,
                    instance.clientId || 'Valued Customer',
                    instance.productName || 'Rensto Service',
                    `https://rensto.com/dashboard/${instance.clientId}`
                );
            } catch (emailError) {
                console.error('Failed to send fulfillment complete email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Service instance activated successfully.',
        });

    } catch (error) {
        console.error('Error finalizing fulfillment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
