import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';

/**
 * PATCH /api/support/update
 * 
 * Updates a support case status and resolution data.
 */

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

        const db = getFirestoreAdmin();
        const docRef = db.collection(COLLECTIONS.SUPPORT_CASES).doc(caseId);

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (status) updateData.status = status;
        if (resolution) {
            updateData.resolution = {
                ...resolution,
                resolvedAt: new Date()
            };
        }

        await docRef.update(updateData);

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
