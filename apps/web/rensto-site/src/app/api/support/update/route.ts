import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import * as dbAdmin from '@/lib/db/admin';
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
        await dbAdmin.updateSupportCase(caseId, updateData);
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
