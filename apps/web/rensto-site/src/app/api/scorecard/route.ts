import { NextRequest, NextResponse } from 'next/server';
import { sendScorecardEmail } from '@/lib/email-service';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, name, company, answers } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // 1. Save to Firestore
        const db = getFirestoreAdmin();
        const leadRef = await db.collection(COLLECTIONS.SCORECARDS).add({
            email,
            name: name || 'Scorecard Lead',
            company: company || 'Unknown Company',
            type: 'lead',
            source: 'Automation Readiness Scorecard',
            answers,
            timestamp: Timestamp.now()
        });

        console.log('Scorecard lead saved to Firestore:', leadRef.id);

        // 2. Send Email with PDF
        // For now using a static PDF URL - in future can generate dynamically
        const pdfUrl = 'https://rensto.com/assets/scorecard-template.pdf';
        await sendScorecardEmail(email, name || 'Future Automator', pdfUrl);

        return NextResponse.json({
            success: true,
            message: 'Scorecard submitted successfully'
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });

    } catch (error) {
        console.error('Scorecard API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
