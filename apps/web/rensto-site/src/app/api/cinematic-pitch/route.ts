import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to n8n webhook - Production URL (activated and configured)
        const response = await fetch('https://n8n.rensto.com/webhook/37475351-7bc4-43b9-91f9-d233ab511cd9', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

            // Check if it's a webhook registration error
            if (response.status === 404 && errorData.message?.includes('not registered')) {
                return NextResponse.json(
                    {
                        error: 'Webhook not activated',
                        message: 'Please activate the n8n workflow first',
                        details: errorData.message
                    },
                    { status: 503 }
                );
            }

            throw new Error(`n8n webhook failed with status ${response.status}: ${errorData.message}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Webhook proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
