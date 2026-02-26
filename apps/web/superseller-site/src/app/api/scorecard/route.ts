import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/scorecard
 * Accepts scorecard form submission (name, email, company) and creates a lead.
 * Anonymous — creates or finds user by email, then creates Lead record.
 */
export async function POST(req: NextRequest) {
    try {
        const { name, email, company } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Get or create user for the lead
        const user = await prisma.user.upsert({
            where: { email: cleanEmail },
            create: {
                email: cleanEmail,
                name: name || null,
                source: 'scorecard',
            },
            update: {},
        });

        await prisma.lead.create({
            data: {
                userId: user.id,
                name: name || null,
                email: cleanEmail,
                company: company || null,
                source: 'scorecard',
                status: 'NEW',
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[scorecard] Error:', error.message);
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
}
