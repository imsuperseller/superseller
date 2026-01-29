import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { message, sessionId, userId, context } = await req.json();
        const db = getFirestoreAdmin();
        const actualSessionId = sessionId || `terry_${uuidv4()}`;

        // 1. Store user message in history
        const chatRef = db.collection('admin_conversations').doc(actualSessionId);
        const sessionSnap = await chatRef.get();

        let history = [];
        if (sessionSnap.exists) {
            history = sessionSnap.data()?.messages || [];
        }

        const userMsg = {
            id: uuidv4(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        history.push(userMsg);

        // 2. Prepare context for Terry (Supervisor Agent)
        // In a real scenario, we would call OpenAI or n8n here
        // For now, we simulate Terry's intelligence and routing

        let responseContent = "";
        let actions: any[] = [];

        // Simple routing logic (Simulation of the "Brain")
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
            timestamp: new Date().toISOString()
        };

        history.push(assistantMsg);

        // 3. Update Firestore with new history
        await chatRef.set({
            userId,
            lastMessageAt: Timestamp.now(),
            messages: history.slice(-50), // Keep last 50 messages
            context: context || {}
        }, { merge: true });

        // 4. (Optional) Trigger n8n Supervisor for actual automation tasks
        if (process.env.N8N_SUPERVISOR_WEBHOOK) {
            fetch(process.env.N8N_SUPERVISOR_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'admin_chat',
                    sessionId: actualSessionId,
                    userId,
                    message,
                    context
                })
            }).catch(e => console.error('n8n Terry trigger failed:', e));
        }

        return NextResponse.json({
            success: true,
            message: assistantMsg,
            sessionId: actualSessionId
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
