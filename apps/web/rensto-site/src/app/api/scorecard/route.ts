import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sendScorecardEmail } from '@/lib/email-service';

// Boost.space Configuration
const BOOST_SPACE_API_URL = 'https://superseller.boost.space/api';
const BOOST_SPACE_API_KEY = process.env.BOOST_SPACE_API_KEY;
const CONTACTS_SPACE_ID = 26;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, company, answers } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // 1. Save to Boost.space (Contacts Module)
        const boostResponse = await fetch(`${BOOST_SPACE_API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BOOST_SPACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                firstname: name || 'Scorecard Lead',
                name: company || 'Unknown Company',
                type: 'lead',
                contactSource: 'Automation Readiness Scorecard',
                spaces: [CONTACTS_SPACE_ID], // Assign to Contacts space
                note: `Scorecard Answers: ${JSON.stringify(answers)}`,
                // Add custom fields for scorecard results if needed
            }),
        });

        if (!boostResponse.ok) {
            console.error('Boost.space Error:', await boostResponse.text());
            // Continue execution - don't fail user experience if CRM sync fails
        }

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

export async function OPTIONS(req: Request) {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
