import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // 1. Verify Admin Session
        const session = await verifySession();
        if (!session.isValid || session.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const n8nApiKey = process.env.N8N_API_KEY;
        const n8nBaseUrl = 'https://n8n.rensto.com/api/v1'; // Standard API base

        if (!n8nApiKey) {
            return NextResponse.json({ success: false, error: 'n8n API key not configured' }, { status: 500 });
        }

        // 2. Fetch Latest Executions
        // Note: n8n API v1 (Standard) is often used for broad visibility. 
        // We fetch the most recent 50 executions globally to map them to workflows.
        const response = await fetch(`${n8nBaseUrl}/executions?limit=50`, {
            headers: {
                'X-N8N-API-KEY': n8nApiKey,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('n8n API Error:', error);
            return NextResponse.json({ success: false, error: 'Failed to fetch n8n data' }, { status: response.status });
        }

        const data = await response.json();

        // 3. Map Executions to Workflow IDs
        // We want the most recent execution status for each workflow
        const workflowStatusMap: Record<string, {
            lastExecutionId: string;
            status: string;
            finished: boolean;
            startedAt: string;
            stoppedAt?: string;
            error?: string;
        }> = {};

        if (data.data) {
            data.data.forEach((exec: any) => {
                const workflowId = exec.workflowId;
                // If we don't have this workflow yet, or this execution is newer
                if (!workflowStatusMap[workflowId]) {
                    workflowStatusMap[workflowId] = {
                        lastExecutionId: exec.id,
                        status: exec.status,
                        finished: exec.finished,
                        startedAt: exec.startedAt,
                        stoppedAt: exec.stoppedAt,
                        error: exec.data?.resultData?.error?.message // Surface error if failed
                    };
                }
            });
        }

        return NextResponse.json({
            success: true,
            workflowStatusMap
        });

    } catch (error) {
        console.error('n8n status proxy error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
