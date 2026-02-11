import { NextResponse } from 'next/server';
// [MIGRATION] Phase 4: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function GET() {
    try {
        // [MIGRATION] Phase 4: Read from Postgres first
        try {
            const tasks = await prisma.launchTask.findMany({
                orderBy: { order: 'asc' },
            });
            return NextResponse.json({ success: true, tasks });
        } catch (pgError) {
            // Fallback: Firestore
            console.info('[Migration] admin/launch-tasks GET: Postgres fail, falling back to Firestore');
            const db = getFirestoreAdmin();
            const snapshot = await db.collection(COLLECTIONS.LAUNCH_TASKS).orderBy('order', 'asc').get();
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return NextResponse.json({ success: true, tasks });
        }
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

        // [MIGRATION] Phase 4: Write to Postgres (primary)
        await prisma.launchTask.update({
            where: { id: taskId },
            data: { status },
        });

        // Backup: Firestore
        await firestoreBackupWrite('admin/launch-tasks PATCH', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.LAUNCH_TASKS).doc(taskId).update({
                status,
                updatedAt: Timestamp.now(),
            });
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

        // [MIGRATION] Phase 4: Write to Postgres (primary)
        const record = await prisma.launchTask.create({
            data: {
                title: task.title || 'Untitled',
                description: task.description,
                category: task.category,
                status: task.status || 'pending',
                order: task.order || 0,
            },
        });

        // Backup: Firestore
        await firestoreBackupWrite('admin/launch-tasks POST', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.LAUNCH_TASKS).doc(record.id).set({
                ...task,
                status: task.status || 'pending',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        });

        return NextResponse.json({ success: true, id: record.id });
    } catch (error: any) {
        console.error('Failed to create launch task:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
