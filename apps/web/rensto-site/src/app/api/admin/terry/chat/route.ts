import { NextResponse } from 'next/server';
// [MIGRATION] Phase 4: Firestore kept as backup
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import * as dbAdmin from '@/lib/db/admin';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';
import type { Prisma } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const { message, sessionId, userId, context } = await req.json();
        const actualSessionId = sessionId || `terry_${uuidv4()}`;

        // [MIGRATION] Phase 4: Read conversation history from Postgres first
        let history: any[] = [];

        try {
            const conversation = await dbAdmin.getOrCreateConversation(actualSessionId);
            history = (conversation.messages as any[]) || [];
        } catch (pgError) {
            // Fallback: Firestore
            console.info('[Migration] admin/terry/chat POST: Postgres miss, falling back to Firestore');
            const db = getFirestoreAdmin();
            const chatRef = db.collection('admin_conversations').doc(actualSessionId);
            const sessionSnap = await chatRef.get();
            if (sessionSnap.exists) {
                history = sessionSnap.data()?.messages || [];
            }
        }

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

        // [MIGRATION] Phase 4: Write to Postgres (primary)
        await dbAdmin.updateConversation(actualSessionId, trimmedHistory as Prisma.InputJsonValue[]);

        // Backup: Firestore
        await firestoreBackupWrite('admin/terry/chat POST', async () => {
            const db = getFirestoreAdmin();
            await db.collection('admin_conversations').doc(actualSessionId).set({
                userId,
                lastMessageAt: Timestamp.now(),
                messages: trimmedHistory,
                context: context || {},
            }, { merge: true });
        });

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
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) return NextResponse.json({ success: false, error: 'Missing sessionId' });

    try {
        // [MIGRATION] Phase 4: Read from Postgres first
        try {
            const conversation = await prisma.adminConversation.findUnique({
                where: { id: sessionId },
            });
            if (conversation) {
                return NextResponse.json({ success: true, messages: conversation.messages || [] });
            }
        } catch (pgError) {
            console.info('[Migration] admin/terry/chat GET: Postgres miss');
        }

        // Fallback: Firestore
        const db = getFirestoreAdmin();
        const chatSnap = await db.collection('admin_conversations').doc(sessionId).get();
        if (!chatSnap.exists) {
            return NextResponse.json({ success: true, messages: [] });
        }
        return NextResponse.json({ success: true, messages: chatSnap.data()?.messages || [] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
