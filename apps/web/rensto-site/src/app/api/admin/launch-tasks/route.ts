import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const db = getFirestoreAdmin();
        const snapshot = await db.collection(COLLECTIONS.LAUNCH_TASKS).orderBy('order', 'asc').get();

        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, tasks });
    } catch (error: any) {
        console.error('Failed to fetch launch tasks:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { taskId, status } = await request.json();
        if (!taskId || !status) {
            return NextResponse.json({ success: false, error: 'Missing taskId or status' }, { status: 400 });
        }

        const db = getFirestoreAdmin();
        await db.collection(COLLECTIONS.LAUNCH_TASKS).doc(taskId).update({
            status,
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to update launch task:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const task = await request.json();
        const db = getFirestoreAdmin();

        const docRef = await db.collection(COLLECTIONS.LAUNCH_TASKS).add({
            ...task,
            status: task.status || 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error: any) {
        console.error('Failed to create launch task:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
