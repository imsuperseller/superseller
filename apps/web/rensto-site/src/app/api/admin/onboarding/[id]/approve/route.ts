import { NextResponse } from 'next/server';
import { getFirestoreAdmin, getStorageAdmin, COLLECTIONS } from '@/lib/firebase-admin';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const db = getFirestoreAdmin();
    const storage = getStorageAdmin().bucket();

    try {
        const onboardingRef = db.collection('onboarding_requests').doc(id);
        const onboardingDoc = await onboardingRef.get();

        if (!onboardingDoc.exists) {
            return NextResponse.json({ error: 'Onboarding request not found' }, { status: 404 });
        }

        const data = onboardingDoc.data()!;
        const clientId = data.createdByUid; // Using UID as clientId for consistency

        // 1. Create client record
        const clientRef = db.collection('clients').doc(clientId);
        await clientRef.set({
            orgName: data.orgName,
            contactEmail: data.contactEmail,
            timezone: data.timezone,
            postingWindow: data.postingWindow,
            status: 'active',
            solutionId: data.solutionId,
            solutionName: data.solutionName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // 2. Move secrets if they exist in storage
        if (data.secretsPath) {
            const sourceFile = storage.file(data.secretsPath);
            const [exists] = await sourceFile.exists();

            if (exists) {
                const [content] = await sourceFile.download();
                const secretsData = JSON.parse(content.toString());

                // Save to restricted secrets collection
                await db.collection('secrets').doc(clientId).set({
                    ...secretsData,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        // 3. Update onboarding request status
        await onboardingRef.update({
            status: 'approved',
            approvedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, message: 'Onboarding approved and client activated' });

    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
