import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientName, projectType, budget, email } = body;

        // Simulate eSignatures contract creation response
        const mockResponse = {
            id: `demo_con_${Math.random().toString(36).substr(2, 9)}`,
            status: "draft",
            title: `Service Agreement - ${clientName}`,
            metadata: {
                projectType,
                budget,
                autoBilling: "enabled"
            },
            signer: {
                name: clientName,
                email: email
            },
            templateUsed: "RENSTO_STANDARD_v2.4",
            webhookUrl: "https://rensto.com/api/webhooks/esignatures",
            previewUrl: "https://esignatures.com/preview/demo-123"
        };

        return NextResponse.json({
            success: true,
            message: "Simulation successful",
            contractData: mockResponse,
            logic: "Dynamic Template Injection"
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to process contract demo" }, { status: 500 });
    }
}
