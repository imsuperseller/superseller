import { NextResponse } from 'next/server';
import { getFirestoreAdmin, getStorageAdmin } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';
import * as dbAdmin from '@/lib/db/admin';
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        let onboardingData: any = null;
        let source: 'postgres' | 'firestore' = 'postgres';

        const pgOnboarding = await dbAdmin.getOnboardingRequest(id);
        if (pgOnboarding) {
            onboardingData = pgOnboarding;
        } else {
            // Fallback: Firestore
            console.info('[Migration] admin/onboarding/approve: Postgres miss, falling back to Firestore');
            source = 'firestore';
            const db = getFirestoreAdmin();
            const doc = await db.collection('onboarding_requests').doc(id).get();
            if (!doc.exists) {
                return NextResponse.json({ error: 'Onboarding request not found' }, { status: 404 });
            }
            onboardingData = doc.data();
        }

        const clientId = onboardingData.createdByUid || onboardingData.userId || id;

        // 1. Create/update client record in Postgres
        await prisma.user.upsert({
            where: { id: clientId },
            create: {
                id: clientId,
                email: onboardingData.contactEmail || `${clientId}@unknown.com`,
                name: onboardingData.orgName,
                status: 'active',
            },
            update: {
                name: onboardingData.orgName,
                status: 'active',
            },
        });

        // 2. Handle secrets if they exist in Firebase Storage
        if (onboardingData.secretsPath) {
            try {
                const storage = getStorageAdmin().bucket();
                const sourceFile = storage.file(onboardingData.secretsPath);
                const [exists] = await sourceFile.exists();
                if (exists) {
                    const [content] = await sourceFile.download();
                    const secretsData = JSON.parse(content.toString());

                    // Store in Postgres vault
                    const { setVaultItem } = await import('@/lib/db/admin');
                    await setVaultItem('client_secrets', clientId, JSON.stringify(secretsData));
                }
            } catch (storageErr) {
                console.warn('Failed to migrate secrets from storage:', storageErr);
            }
        }

        // 3. Update onboarding request status
        if (source === 'postgres') {
            await dbAdmin.updateOnboardingRequest(id, {
                status: 'approved',
                approvedAt: new Date(),
            });
        }
        return NextResponse.json({ success: true, message: 'Onboarding approved and client activated' });

    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
