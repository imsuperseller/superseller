import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// [MIGRATION] Phase 4: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as dbAdmin from '@/lib/db/admin';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // [MIGRATION] Phase 4: Read from Postgres first
        try {
            const testimonials = await dbAdmin.listTestimonials();
            return NextResponse.json({ testimonials });
        } catch (pgError) {
            // Fallback: Firestore
            console.info('[Migration] admin/testimonials GET: Postgres fail, falling back to Firestore');
            const db = getFirestoreAdmin();
            const snap = await db.collection(COLLECTIONS.TESTIMONIALS).orderBy('order', 'asc').get();
            const testimonials = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return NextResponse.json({ testimonials });
        }
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { id, ...saveData } = data;

        // [MIGRATION] Phase 4: Write to Postgres (primary)
        const record = await dbAdmin.createTestimonial({
            name: saveData.name || '',
            role: saveData.role,
            company: saveData.company,
            content: saveData.content || saveData.text || '',
            rating: saveData.rating,
            avatar: saveData.avatar,
            isActive: saveData.isActive ?? saveData.active ?? false,
            language: saveData.language || 'en',
            order: saveData.order || 0,
        });

        // Backup: Firestore
        await firestoreBackupWrite('admin/testimonials POST', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.TESTIMONIALS).doc(record.id).set({
                ...saveData,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });

        return NextResponse.json({ success: true, id: record.id });
    } catch (error) {
        console.error('Failed to create testimonial:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { id, ...updateData } = data;

        // [MIGRATION] Phase 4: Write to Postgres (primary)
        await dbAdmin.updateTestimonial(id, updateData);

        // Backup: Firestore
        await firestoreBackupWrite('admin/testimonials PATCH', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.TESTIMONIALS).doc(id).update({
                ...updateData,
                updatedAt: new Date(),
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update testimonial:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // [MIGRATION] Phase 4: Delete from Postgres (primary)
        await dbAdmin.deleteTestimonial(id);

        // Backup: Firestore
        await firestoreBackupWrite('admin/testimonials DELETE', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.TESTIMONIALS).doc(id).delete();
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete testimonial:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
