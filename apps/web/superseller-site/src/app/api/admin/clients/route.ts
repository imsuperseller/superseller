import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';
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
        const clients = await prisma.user.findMany({
            orderBy: { email: 'asc' },
        });
        return NextResponse.json({ clients });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { id, ...saveData } = data;
        const email = (saveData.email || '').toLowerCase().trim();
        const userId = email.replace(/[^a-z0-9]/g, '_');

        const created = await prisma.user.create({
            data: {
                id: userId,
                email,
                name: saveData.name,
                status: saveData.status || 'active',
                emailVerified: false,
                ...( saveData.businessName ? { businessName: saveData.businessName } : {}),
                ...( saveData.phone ? { phone: saveData.phone } : {}),
            },
        });
        return NextResponse.json({ success: true, id: created.id });
    } catch (error) {
        console.error('Failed to create client:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { id, ...updateData } = data;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await prisma.user.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update client:', error);
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
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete client:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
