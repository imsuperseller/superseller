import { NextRequest, NextResponse } from 'next/server';
import { ModelOptimizer } from '@/lib/n8n/ModelOptimizer';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * API Route: Trigger a Workflow Optimization Audit
 * For All-Access Pass subscribers.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { workflowJson, customerId, customerName, workflowName } = body;

        if (!workflowJson) {
            return NextResponse.json({ success: false, error: 'Workflow JSON is required' }, { status: 400 });
        }

        const optimizer = new ModelOptimizer();
        const db = getFirestoreAdmin();

        // 1. Analyze the workflow
        const recommendations = await optimizer.analyzeWorkflow(workflowJson);

        // 2. Log the audit in Firestore to track value delivered
        const auditData = {
            customerId: customerId || 'anonymous',
            customerName: customerName || 'Valued Customer',
            workflowName: workflowName || 'Untitled Workflow',
            recommendationCount: recommendations.length,
            savingEstimate: recommendations.reduce((acc: number, r: any) => acc + (r.improvementPct || 0), 0) / (recommendations.length || 1),
            timestamp: Timestamp.now(),
            status: 'completed'
        };

        const auditRef = await db.collection('optimizer_audits').add(auditData);

        await auditAgent.log({
            service: 'firebase',
            action: 'optimizer_audit_performed',
            status: 'success',
            details: { auditId: auditRef.id, customerId, recommendationCount: recommendations.length }
        });

        // 3. Format WhatsApp message
        const waMessage = optimizer.formatWhatsAppMessage(customerName || 'Subscriber', recommendations);

        // 4. Dispatch to n8n (which handles the actual WAHA/WhatsApp sending)
        if (process.env.N8N_OPTIMIZER_WEBHOOK) {
            try {
                await fetch(process.env.N8N_OPTIMIZER_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        auditId: auditRef.id,
                        customerId,
                        customerName,
                        message: waMessage,
                        recommendations
                    })
                });
            } catch (n8nError) {
                console.error('Failed to notify n8n of optimizer audit:', n8nError);
                // Don't fail the request, audit is saved
            }
        }

        return NextResponse.json({
            success: true,
            auditId: auditRef.id,
            recommendationCount: recommendations.length,
            recommendations
        });

    } catch (error: any) {
        console.error('Optimizer API Error:', error);
        await auditAgent.log({
            service: 'firebase',
            action: 'optimizer_audit_failed',
            status: 'error',
            errorMessage: error.message
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
