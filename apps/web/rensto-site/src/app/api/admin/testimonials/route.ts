import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return null;
    }
    return session;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const db = getFirestoreAdmin();
        const testimonialsSnap = await db.collection(COLLECTIONS.TESTIMONIALS).orderBy('order', 'asc').get();
        const testimonials = testimonialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ testimonials });
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
        const db = getFirestoreAdmin();

        const docRef = await db.collection(COLLECTIONS.TESTIMONIALS).add({
            ...saveData,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { id, ...updateData } = data;
        const db = getFirestoreAdmin();

        await db.collection(COLLECTIONS.TESTIMONIALS).doc(id).update({
            ...updateData,
            updatedAt: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
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

        const db = getFirestoreAdmin();
        await db.collection(COLLECTIONS.TESTIMONIALS).doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
