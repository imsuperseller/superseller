import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

// This webhook is called by eSignatures.com when a contract is signed
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const db = getFirestoreAdmin();

        console.log('eSignatures webhook received:', JSON.stringify(body, null, 2));

        const { event, contract_id, signer, metadata } = body;
        const clientId = metadata?.clientId || metadata?.client_id;

        switch (event) {
            case 'contract.signed':
                console.log(`Contract ${contract_id} signed by ${signer?.email}`);

                if (clientId) {
                    await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId).update({
                        contractStatus: 'signed',
                        status: 'paid', // Or whatever our next step is
                        signedAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                }

                await auditAgent.log({
                    service: 'other',
                    action: 'contract_signed',
                    status: 'success',
                    details: { contract_id, clientId, email: signer?.email }
                });

                // Trigger n8n for downstream logic (QuickBooks, Slack, etc.)
                const n8nWebhookUrl = process.env.N8N_CONTRACT_SIGNED_WEBHOOK;
                if (n8nWebhookUrl) {
                    try {
                        await fetch(n8nWebhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contractId: contract_id,
                                clientId,
                                signerEmail: signer?.email,
                                signerName: signer?.name,
                                signedAt: new Date().toISOString(),
                                metadata,
                            }),
                        });
                    } catch (n8nErr) {
                        console.error('N8N notification failed:', n8nErr);
                    }
                }
                break;

            case 'contract.viewed':
                if (clientId) {
                    await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId).update({
                        lastViewedAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                }
                break;

            case 'contract.declined':
                if (clientId) {
                    await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId).update({
                        contractStatus: 'declined',
                        updatedAt: Timestamp.now()
                    });
                }
                break;

            default:
                console.log(`Unhandled event: ${event}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('eSignatures webhook error:', error);
        await auditAgent.log({
            service: 'other',
            action: 'esignatures_webhook_failed',
            status: 'error',
            errorMessage: error.message
        });
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json({ status: 'eSignatures webhook endpoint active' });
}
