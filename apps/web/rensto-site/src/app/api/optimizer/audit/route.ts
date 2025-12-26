import { NextRequest, NextResponse } from 'next/server';
import { ModelOptimizer } from '@/lib/n8n/ModelOptimizer';
import { AirtableApi } from '@/lib/airtable';

/**
 * API Route: Trigger a Workflow Optimization Audit
 * For All-Access Pass subscribers.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { workflowJson, customerId, customerName } = body;

        if (!workflowJson) {
            return NextResponse.json({ success: false, error: 'Workflow JSON is required' }, { status: 400 });
        }

        const optimizer = new ModelOptimizer();
        const airtable = new AirtableApi();

        // 1. Analyze the workflow
        const recommendations = await optimizer.analyzeWorkflow(workflowJson);

        // 2. Log the audit in Airtable to track value delivered
        // TODO: Create tblAudits in Airtable if it doesn't exist
        /*
        await airtable.logAudit({
            customerId,
            timestamp: new Date().toISOString(),
            recommendationCount: recommendations.length,
            savingEstimate: recommendations.reduce((acc, r) => acc + r.improvementPct, 0) / recommendations.length
        });
        */

        // 3. Format WhatsApp message
        const waMessage = optimizer.formatWhatsAppMessage(customerName || 'Subscriber', recommendations);

        // 4. Dispatch to n8n (which handles the actual WAHA/WhatsApp sending)
        if (process.env.N8N_OPTIMIZER_WEBHOOK) {
            await fetch(process.env.N8N_OPTIMIZER_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    customerName,
                    message: waMessage,
                    recommendations
                })
            });
        }

        return NextResponse.json({
            success: true,
            recommendationCount: recommendations.length,
            recommendations
        });

    } catch (error: any) {
        console.error('Optimizer API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
