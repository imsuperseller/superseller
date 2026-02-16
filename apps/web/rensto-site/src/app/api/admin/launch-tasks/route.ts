import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tasks = await prisma.launchTask.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json({ success: true, tasks });
    } catch (error: any) {
        console.error('Failed to fetch launch tasks:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
