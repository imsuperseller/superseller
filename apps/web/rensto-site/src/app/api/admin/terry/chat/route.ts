import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import * as dbAdmin from '@/lib/db/admin';
import type { Prisma } from '@prisma/client';
import { verifySession } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { message, sessionId, userId, context } = await req.json();
        const actualSessionId = sessionId || `terry_${uuidv4()}`;
        let history: any[] = [];

        const conversation = await dbAdmin.getOrCreateConversation(actualSessionId);
        history = (conversation.messages as any[]) || [];

        const userMsg = {
            id: uuidv4(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };

        history.push(userMsg);

        // Simple routing logic
        let responseContent = '';
        let actions: any[] = [];

        if (message.toLowerCase().includes('revenue') || message.toLowerCase().includes('money')) {
            responseContent = "I'm pulling the live Treasury data for you. Revenue is currently on track, but I noticed RackNerd expenses increased by 15% this month. Would you like me to audit the inactive server instances?";
            actions = [{ label: 'Audit Servers', action: 'audit_servers' }];
        } else if (message.toLowerCase().includes('fix') || message.toLowerCase().includes('error')) {
            responseContent = "Found 2 failing workflows in the 'Lead Machine' layer for Client Acme. I've already drafted the fix in the Support Queue. Should I deploy it now?";
            actions = [{ label: 'View Fix', action: 'view_support' }];
        } else {
            responseContent = "I'm Terry, your Supervisor Agent. I'm monitoring the Nexus and your Vault. How can I help you scale today?";
        }

        const assistantMsg = {
            id: uuidv4(),
            role: 'assistant',
            content: responseContent,
            actions,
            timestamp: new Date().toISOString(),
        };

        history.push(assistantMsg);
        const trimmedHistory = history.slice(-50);
        await dbAdmin.updateConversation(actualSessionId, trimmedHistory as Prisma.InputJsonValue[]);
        // Trigger n8n Supervisor if configured
        if (process.env.N8N_SUPERVISOR_WEBHOOK) {
            fetch(process.env.N8N_SUPERVISOR_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'admin_chat',
                    sessionId: actualSessionId,
                    userId,
                    message,
                    context,
                }),
            }).catch(e => console.error('n8n Terry trigger failed:', e));
        }

        return NextResponse.json({
            success: true,
            message: assistantMsg,
            sessionId: actualSessionId,
        });

    } catch (error: any) {
        console.error('Terry Chat Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) return NextResponse.json({ success: false, error: 'Missing sessionId' });

    try {
        const conversation = await prisma.adminConversation.findUnique({
            where: { id: sessionId },
        });
        return NextResponse.json({ success: true, messages: conversation?.messages || [] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
