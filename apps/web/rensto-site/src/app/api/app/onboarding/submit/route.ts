import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || !session.clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { productId, solutionName, inputs, pillarId, encryptedSecrets } = body;

        if (!productId) {
            return NextResponse.json({ error: 'productId required' }, { status: 400 });
        }

        // 1. Create onboarding request in Postgres
        const onboarding = await prisma.onboardingRequest.create({
            data: {
                userId: session.clientId,
                solutionId: productId,
                status: 'submitted',
                data: {
                    productId,
                    solutionName: solutionName || '',
                    inputs: inputs || {},
                    pillarId: pillarId || 'marketplace',
                    createdByUid: session.clientId,
                    hasSecrets: !!encryptedSecrets,
                },
            },
        });

        // 2. Store encrypted secrets in vault if present
        if (encryptedSecrets) {
            await prisma.vaultItem.upsert({
                where: {
                    category_key: {
                        category: 'onboarding_secrets',
                        key: onboarding.id,
                    },
                },
                create: {
                    category: 'onboarding_secrets',
                    key: onboarding.id,
                    value: JSON.stringify(encryptedSecrets),
                    metadata: {
                        requestId: onboarding.id,
                        createdByUid: session.clientId,
                        encryptionMode: encryptedSecrets.encryptionMode || 'unknown',
                    },
                },
                update: {
                    value: JSON.stringify(encryptedSecrets),
                },
            });
        }

        return NextResponse.json({
            id: onboarding.id,
            status: 'submitted',
        });
    } catch (error: any) {
        console.error('Onboarding submit error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
