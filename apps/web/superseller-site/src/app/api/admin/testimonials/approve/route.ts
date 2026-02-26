import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import * as dbAdmin from '@/lib/db/admin';
export async function GET(request: NextRequest) {
    try {
        const session = await verifySession();
        if (!session.isValid || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });
        }
        await dbAdmin.updateTestimonial(id, {
            isActive: true,
            approvedAt: new Date(),
        });
        await auditAgent.log({
            service: 'other',
            action: 'testimonial_approved',
            status: 'success',
            details: { testimonialId: id },
        });

        return new NextResponse(`
            <html>
                <head>
                    <title>Testimonial Approved</title>
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0d1b2e; color: white; }
                        .card { background: #1a1438; padding: 2rem; border-radius: 1rem; border: 1px solid #f47920; text-align: center; }
                        h1 { color: #f47920; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Approved!</h1>
                        <p>Testimonial is now live on the SuperSeller AI website.</p>
                        <p style="color: #666; font-size: 0.8rem;">ID: ${id}</p>
                    </div>
                </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error: any) {
        console.error('Testimonial approval error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
