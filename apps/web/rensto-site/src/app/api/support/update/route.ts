import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 5: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import * as dbAdmin from '@/lib/db/admin';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { caseId, status, resolution } = body;

        if (!caseId) {
            return NextResponse.json(
                { success: false, error: 'Case ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (resolution) {
            updateData.resolution = {
                ...resolution,
                resolvedAt: new Date(),
            };
            updateData.resolvedAt = new Date();
        }

        // [MIGRATION] Phase 5: Write to Postgres (primary)
        await dbAdmin.updateSupportCase(caseId, updateData);

        // Backup: Firestore
        await firestoreBackupWrite('support/update', async () => {
            const db = getFirestoreAdmin();
            const fsUpdate: any = { updatedAt: new Date() };
            if (status) fsUpdate.status = status;
            if (resolution) {
                fsUpdate.resolution = { ...resolution, resolvedAt: new Date() };
            }
            await db.collection(COLLECTIONS.SUPPORT_CASES).doc(caseId).update(fsUpdate);
        });

        return NextResponse.json({
            success: true,
            message: 'Support case updated successfully',
        });

    } catch (error: any) {
        console.error('Support case update error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
