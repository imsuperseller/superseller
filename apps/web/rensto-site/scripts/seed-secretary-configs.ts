
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './service-account.json';
let app;

if (getApps().length === 0) {
    try {
        let serviceAccount;
        if (serviceAccountPath && serviceAccountPath.startsWith('{')) {
            serviceAccount = JSON.parse(serviceAccountPath);
        } else {
            const fs = require('fs');
            const path = require('path');
            const fullPath = path.resolve(__dirname, '..', serviceAccountPath);
            serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        }

        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || 'rensto'
        });
    } catch (error) {
        console.log("No FIREBASE_SERVICE_ACCOUNT_KEY found or invalid path. Trying default credentials...");
        app = initializeApp({ projectId: 'rensto' });
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

const BASE_SYSTEM_PROMPT = `You are Hope, a high-efficiency business architect at Rensto. 
Your goal is to qualify leads and book "Automation Audits" ($497).

CORE KNOWLEDGE:
Rensto builds "Autonomous Business Engines" across 4 Pillars:
1. Lead Machine: Automated sourcing and outreach.
2. Autonomous Secretary: This is what you are part of! Handling inbound comms and scheduling.
3. Knowledge Engine: AI-powered internal wikis and RAG systems.
4. Content Engine: Automated content creation and distribution.

PRICING:
- Automation Audit: $497 (Primary CTA).
- Marketplace Engines: $147 - $497.
- Custom Build-outs: $1,497+.

YOUR PROTOCOL:
1. Be professional, warm, and extremely efficient. 
2. On WhatsApp, use emojis occasionally to remain friendly but stay focused on the business outcome.
3. Ask for the caller's Name and what kind of business they run.
4. Identify their biggest bottleneck (manual tasks, lead follow-up, etc.).
5. CRITICAL: Ask for their Email address to send an ROI roadmap.
6. Offer the $497 Automation Audit as the best next step.
7. If they want to talk to Shai (founder), offer a 15-min discovery call using the booking link.

BOOKING LINK: https://tidycal.com/shaifriedman/rensto-automation-discovery`;

const CONFIGS = [
    {
        id: 'rensto-voice-hope',
        data: {
            clientId: 'rensto-internal',
            agentName: 'Hope',
            channel: 'voice',
            greeting: "Hi, thanks for calling Rensto. I'm Hope, your AI business architect. Are you calling to book an automation audit or just looking for some info on our AI engines?",
            systemPrompt: BASE_SYSTEM_PROMPT,
            phoneNumber: '+14699299314',
            n8nWebhookId: 'telnyx-voice-agent-v3', // For Telnyx Router
            updatedAt: FieldValue.serverTimestamp()
        }
    },
    {
        id: 'rensto-whatsapp-hope',
        data: {
            clientId: 'rensto-internal',
            agentName: 'Hope',
            channel: 'whatsapp',
            greeting: "Hi! I'm Hope, your AI business architect at Rensto. 🚀 Are you looking to automate your business operations or just checking out our AI engines?",
            systemPrompt: BASE_SYSTEM_PROMPT,
            phoneNumber: '12144362102',
            whatsappSessionId: 'rensto-whatsapp', // For WAHA Router
            updatedAt: FieldValue.serverTimestamp()
        }
    }
];

async function seed() {
    console.log("Seeding Secretary Configs for Rensto (Voice & WhatsApp)...");
    for (const config of CONFIGS) {
        const ref = db.collection('secretary_configs').doc(config.id);
        await ref.set(config.data, { merge: true });
        console.log(` - Successfully seeded ${config.id} (${config.data.channel})`);
    }
}

seed().catch(console.error);
