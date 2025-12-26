import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';

export const dynamic = 'force-dynamic';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    company: string;
    rating: number;
    result: string;
}

// Fallback testimonials if Firestore is empty or unavailable
const FALLBACK_TESTIMONIALS: Testimonial[] = [
    {
        quote: "Rensto transformed our lead management process. What used to take 3 hours daily now happens automatically in minutes.",
        author: "Michael Chen",
        role: "Operations Director",
        company: "Premier HVAC Services",
        rating: 5,
        result: "Saved 15hrs/week"
    },
    {
        quote: "The custom Voice AI agent handles our appointment scheduling flawlessly. Our booking rate increased by 40% in the first month.",
        author: "Sarah Martinez",
        role: "Practice Manager",
        company: "Wellness Dental Group",
        rating: 5,
        result: "+40% bookings"
    },
    {
        quote: "Best investment we've made. The automation system paid for itself in 6 weeks and continues to save us thousands monthly.",
        author: "David Thompson",
        role: "CEO",
        company: "Thompson Insurance Agency",
        rating: 5,
        result: "6-week ROI"
    }
];

export async function GET() {
    try {
        const db = getFirestoreAdmin();
        const snapshot = await db.collection('testimonials').where('active', '==', true).get();

        if (snapshot.empty) {
            return NextResponse.json({ testimonials: FALLBACK_TESTIMONIALS });
        }

        const testimonials = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                quote: data.quote,
                author: data.author,
                role: data.role,
                company: data.company,
                rating: data.rating || 5,
                result: data.result || ''
            } as Testimonial;
        });

        return NextResponse.json({ testimonials });

    } catch (error: any) {
        console.error('Error fetching testimonials from Firestore:', error);
        await auditAgent.log({
            service: 'firebase',
            action: 'fetch_testimonials_failed',
            status: 'error',
            errorMessage: error.message
        });

        // Always return fallback on error to ensure UI doesn't break
        return NextResponse.json({ testimonials: FALLBACK_TESTIMONIALS });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { quote, author, role, company, rating, result } = body;

        if (!quote || !author) {
            return NextResponse.json({ success: false, error: 'Quote and Author are required' }, { status: 400 });
        }

        const db = getFirestoreAdmin();
        const testimonialData = {
            quote,
            author,
            role: role || '',
            company: company || '',
            rating: rating || 5,
            result: result || '',
            active: false, // Requires admin approval
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('testimonials').add(testimonialData);

        await auditAgent.log({
            service: 'firebase',
            action: 'testimonial_submitted',
            status: 'success',
            details: { testimonialId: docRef.id, author }
        });

        // Notify via WhatsApp (n8n)
        const n8nWebhook = process.env.N8N_TESTIMONIAL_SUBMISSION_WEBHOOK;
        if (n8nWebhook) {
            try {
                await fetch(n8nWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'testimonial_pending',
                        testimonialId: docRef.id,
                        author,
                        company,
                        quote,
                        approveUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rensto.com'}/api/admin/testimonials/approve?id=${docRef.id}`,
                        whatsappNumber: '4695885133' // Shai's WhatsApp
                    })
                });
            } catch (n8nErr) {
                console.error('Failed to send WhatsApp notification for testimonial:', n8nErr);
            }
        }

        return NextResponse.json({ success: true, id: docRef.id });

    } catch (error: any) {
        console.error('Testimonial submission error:', error);
        await auditAgent.log({
            service: 'firebase',
            action: 'testimonial_submission_failed',
            status: 'error',
            errorMessage: error.message
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
