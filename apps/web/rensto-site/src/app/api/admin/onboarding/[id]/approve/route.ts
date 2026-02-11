import { NextResponse } from 'next/server';
// [MIGRATION] Phase 4: Firestore kept as fallback
import { getFirestoreAdmin, getStorageAdmin } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';
import * as dbAdmin from '@/lib/db/admin';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // [MIGRATION] Phase 4: Read from Postgres first
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

        // Backup: Firestore
        await firestoreBackupWrite('admin/onboarding/approve', async () => {
            const db = getFirestoreAdmin();
            await db.collection('clients').doc(clientId).set({
                orgName: onboardingData.orgName,
                contactEmail: onboardingData.contactEmail,
                timezone: onboardingData.timezone,
                postingWindow: onboardingData.postingWindow,
                status: 'active',
                solutionId: onboardingData.solutionId,
                solutionName: onboardingData.solutionName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            await db.collection('onboarding_requests').doc(id).update({
                status: 'approved',
                approvedAt: new Date().toISOString(),
            });
        });

        return NextResponse.json({ success: true, message: 'Onboarding approved and client activated' });

    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
