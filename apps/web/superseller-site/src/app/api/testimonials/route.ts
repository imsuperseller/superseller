import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
    try {
        const rows = await prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                name: true,
                author: true,
                role: true,
                company: true,
                content: true,
                quote: true,
                result: true,
                rating: true,
                avatar: true,
            },
        });

        const testimonials = rows.map((r) => ({
            quote: r.content || r.quote || '',
            author: r.name || r.author || 'Anonymous',
            role: r.role || '',
            company: r.company || '',
            rating: r.rating ?? 5,
            result: r.result || '',
            avatar: r.avatar || null,
        }));

        return NextResponse.json({ testimonials });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ testimonials: [] });
    }
}
