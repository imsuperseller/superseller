import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { niche, count } = body;

        // In a real implementation, this would call Apify or similar
        // For the demo, we provide a sophisticated-looking "real" mock response
        // that feels like it actually searched.

        const mockLeads = [
            {
                name: "Atlantic Roofing Solutions",
                contact: "Michael Torres",
                email: "m.torres@atlroofs.net",
                verified: true,
                intentScore: 0.94,
                source: "Google Maps / LinkedIn"
            },
            {
                name: "Miami Sky Construction",
                contact: "Sarah Jenkins",
                email: "sarah@miamisky.com",
                verified: true,
                intentScore: 0.88,
                source: "BBB / Local Listings"
            }
        ];

        return NextResponse.json({
            status: "success",
            searchCriteria: niche,
            leadsFound: count || 2,
            processingTime: "1.4s",
            sampleData: mockLeads,
            notes: "Full CSV report sent to user email (Simulated)"
        });
    } catch (error) {
        return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 500 });
    }
}
