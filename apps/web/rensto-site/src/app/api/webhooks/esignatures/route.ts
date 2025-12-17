import { NextRequest, NextResponse } from 'next/server';

// This webhook is called by eSignatures.com when a contract is signed
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('eSignatures webhook received:', JSON.stringify(body, null, 2));

        // Verify webhook signature (if eSignatures provides one)
        // const signature = request.headers.get('x-esignatures-signature');

        const { event, contract_id, signer, metadata } = body;

        switch (event) {
            case 'contract.signed':
                // Contract was signed - now we can proceed to payment
                console.log(`Contract ${contract_id} signed by ${signer?.email}`);

                // Store signed status in database/Boost.space
                // This would typically update a record to mark the contract as signed
                // and enable the payment step

                // You could also trigger an n8n webhook here to handle post-signing logic
                const n8nWebhookUrl = process.env.N8N_CONTRACT_SIGNED_WEBHOOK;
                if (n8nWebhookUrl) {
                    await fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contractId: contract_id,
                            signerEmail: signer?.email,
                            signerName: signer?.name,
                            signedAt: new Date().toISOString(),
                            metadata,
                        }),
                    });
                }

                break;

            case 'contract.viewed':
                console.log(`Contract ${contract_id} viewed by ${signer?.email}`);
                break;

            case 'contract.declined':
                console.log(`Contract ${contract_id} declined by ${signer?.email}`);
                break;

            case 'contract.expired':
                console.log(`Contract ${contract_id} expired`);
                break;

            default:
                console.log(`Unknown event: ${event}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('eSignatures webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const challenge = searchParams.get('challenge');

    if (challenge) {
        // Some webhook providers require echo of challenge for verification
        return new NextResponse(challenge);
    }

    return NextResponse.json({ status: 'eSignatures webhook endpoint active' });
}
