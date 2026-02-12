import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
export async function GET() {
    try {
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
        await prisma.launchTask.update({
            where: { id: taskId },
            data: { status },
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
        const record = await prisma.launchTask.create({
            data: {
                title: task.title || 'Untitled',
                description: task.description,
                category: task.category,
                status: task.status || 'pending',
                order: task.order || 0,
            },
        });
        return NextResponse.json({ success: true, id: record.id });
    } catch (error: any) {
        console.error('Failed to create launch task:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
