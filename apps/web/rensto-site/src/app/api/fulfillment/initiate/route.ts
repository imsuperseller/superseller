
import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { ServiceInstance } from '@/types/firestore';
import { FieldValue } from 'firebase-admin/firestore';

// In production, this would be an env var
const N8N_FULFILLMENT_WEBHOOK = process.env.N8N_FULFILLMENT_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/fulfillment-orchestrator';

export async function POST(request: Request) {
    try {
        return NextResponse.json({
            message: 'Hello World - API is Live',
            debug: true
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
