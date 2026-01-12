// Script to update Firebase Templates with marketplace content
// Run with: npx tsx scripts/update-marketplace-content.ts

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Manually parse .env.local if needed
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=['"]({[\s\S]*?})['"]/);
    if (match && match[1]) {
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY = match[1];
    } else {
        dotenv.config({ path: '.env.local' });
    }
} else {
    dotenv.config({ path: '.env.local' });
}

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load Service Account from environment variable
const serviceAccountVal = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let app;

if (getApps().length === 0) {
    if (serviceAccountVal) {
        console.log(`Length of FIREBASE_SERVICE_ACCOUNT_KEY: ${serviceAccountVal.length}`);

        try {
            // First try direct parse
            const serviceAccount = JSON.parse(serviceAccountVal);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            app = initializeApp({
                credential: cert(serviceAccount),
                projectId: 'rensto'
            });
        } catch (e) {
            console.error("Standard JSON parse failed, trying to fix escaped newlines...");
            // Handle case where newlines are escaped as \\n in the string
            try {
                const fixedJson = serviceAccountVal.replace(/\\n/g, '\n');
                const serviceAccount = JSON.parse(fixedJson);
                app = initializeApp({
                    credential: cert(serviceAccount),
                    projectId: 'rensto'
                });
            } catch (e2) {
                // Last ditch effort: replace \\n with nothing and then try to fix private_key
                // This is likely what's needed if it's double escaped
                const doubleFixedJson = serviceAccountVal.replace(/\\\\n/g, '\n');
                const serviceAccount = JSON.parse(doubleFixedJson);
                app = initializeApp({
                    credential: cert(serviceAccount),
                    projectId: 'rensto'
                });
            }
        }
    } else {
        console.error("ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.");
        process.exit(1);
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

// Generic feature icons (can be used across any workflow)
const FEATURE_ICONS = {
    transformation: '/images/feature-icons/icon_transformation.png',
    automation: '/images/feature-icons/icon_automation.png',
    analytics: '/images/feature-icons/icon_analytics.png',
    integration: '/images/feature-icons/icon_integration.png',
    messaging: '/images/feature-icons/icon_messaging.png',
    content: '/images/feature-icons/icon_content.png',
};

// Complete marketplace content for each template
const MARKETPLACE_CONTENT: Record<string, any> = {
    '4OYGXXMYeJFfAo6X': { // Celebrity Selfie Video Generator
        targetMarket: 'Event Marketing Agencies & Personal Branding Consultants',
        setupTime: 'Instant',
        deploymentSteps: [
            { title: 'Upload & Configure', desc: 'Provide your brand assets and select movie scene themes', icon: 'Rocket' },
            { title: 'AI Processing', desc: 'Neural face-mapping processes your portrait in under 2 minutes', icon: 'Cpu' },
            { title: 'Instant Delivery', desc: 'Receive your cinematic video via WhatsApp or download link', icon: 'Mail' }
        ],
        features: [
            { title: 'AI Face Swap', desc: 'State-of-the-art neural mapping for seamless character integration.', image: FEATURE_ICONS.transformation },
            { title: 'Multi-Scene Stitching', desc: 'Automatic editing and color grading across legendary movie clips.', image: FEATURE_ICONS.integration },
            { title: 'WhatsApp Delivery', desc: 'Instant delivery to any mobile device without app installation.', image: FEATURE_ICONS.messaging },
            { title: 'Custom Movie Presets', desc: 'Growing library of action, sci-fi, and classic cinema themes.', image: FEATURE_ICONS.content },
            { title: 'ImgBB Integration', desc: 'Secure, ephemeral photo hosting for privacy-first AI processing.', image: FEATURE_ICONS.automation }
        ],
        faqs: [
            { q: 'Which AI models power the face swap?', a: 'We use a combination of Higgsfield for 3D face modeling and Kling Omni for temporal consistency across scenes, ensuring Hollywood-quality results.' },
            { q: 'How long does one video take to generate?', a: 'Average processing time is 90-120 seconds per video, depending on scene complexity and server load.' },
            { q: 'Is there content moderation?', a: 'Yes. All submissions pass through a SafetyNet filter that blocks inappropriate content before processing begins.' },
            { q: 'Can I use my own movie clips?', a: 'Professional and Enterprise tiers allow custom template upload with your brand\'s proprietary footage.' },
            { q: 'What happens to my photo after processing?', a: 'Photos are processed in ephemeral memory and permanently deleted within 60 seconds of video completion.' },
            { q: 'Can this be white-labeled for my agency?', a: 'Yes. The Pro Managed Setup tier includes full white-label delivery via your own WhatsApp Business number.' }
        ]
    },
    '8GC371u1uBQ8WLmu': { // Meta Ad Library Analyzer
        targetMarket: 'Performance Marketing Agencies & E-commerce Growth Teams',
        setupTime: '24 Hours',
        deploymentSteps: [
            { title: 'Connect Domains', desc: 'Provide competitor domains or Facebook Page URLs to monitor', icon: 'Globe' },
            { title: 'AI Analysis', desc: 'System scrapes active ads and deconstructs winning patterns', icon: 'Cpu' },
            { title: 'Strategy Delivery', desc: 'Receive templates, hooks, and scripts in your Slack or Notion', icon: 'Mail' }
        ],
        features: [
            { title: 'Ad Scraping', desc: 'Automated retrieval of active and historical ads from Meta Library.', image: FEATURE_ICONS.automation },
            { title: 'AI Video Analysis', desc: 'Deep vision processing to extract hook patterns and CTA structures.', image: FEATURE_ICONS.analytics },
            { title: 'Template Generation', desc: 'Instant creation of high-converting scripts based on winning ad logic.', image: FEATURE_ICONS.content },
            { title: 'Boost.Space Storage', desc: 'Organized data sink for competitor research and creative assets.', image: FEATURE_ICONS.integration }
        ],
        faqs: [
            { q: 'Does this analyze video ads or just image ads?', a: 'Both. Our AI vision model processes video content frame-by-frame to extract hook timing, text overlays, and CTA structures.' },
            { q: 'Can it find ads that are no longer running?', a: 'We can access ads that ran within the last 90 days in most regions. Older ads may not be available.' },
            { q: 'Do I need my own Meta API key?', a: 'No. We use our own infrastructure to scrape the public Meta Ad Library.' },
            { q: 'What output format do I receive?', a: 'You receive a structured Notion database or Google Sheet with hook text, CTA text, video length, and a Virality Score.' },
            { q: 'How often does it refresh data?', a: 'Data is refreshed daily. You can request on-demand scrapes for real-time campaign launches.' }
        ]
    },
    '5pMi01SwffYB6KeX': { // YouTube AI Clone
        targetMarket: 'Online Educators, Coaches & Info-Product Creators',
        setupTime: '48 Hours',
        deploymentSteps: [
            { title: 'Submit Channel', desc: 'Provide the YouTube channel URL you want to clone', icon: 'Globe' },
            { title: 'Knowledge Ingestion', desc: 'AI extracts and indexes all video transcripts into a persona', icon: 'Cpu' },
            { title: 'Deploy Bot', desc: 'Your Telegram bot goes live, ready to answer questions in the creator\'s voice', icon: 'MessageSquare' }
        ],
        features: [
            { title: 'Transcript Extraction', desc: 'Clean, formatted text retrieval from any video ID or channel URL.', image: FEATURE_ICONS.content },
            { title: 'Persona Synthesis', desc: 'Training OpenAI models to mirror specific speech patterns and knowledge bases.', image: FEATURE_ICONS.transformation },
            { title: 'Telegram Integration', desc: 'Real-time conversational interface for mobile and desktop chat.', image: FEATURE_ICONS.messaging },
            { title: 'Perplexity Research', desc: 'Real-time fact checking and source citation for AI generated responses.', image: FEATURE_ICONS.analytics }
        ],
        faqs: [
            { q: 'What makes the bot sound like the YouTuber?', a: 'We fine-tune a language model on the specific vocabulary, sentence structure, and communication patterns from thousands of hours of transcripts.' },
            { q: 'Is there a limit on channel video count?', a: 'Standard tier handles up to 500 videos. Enterprise tier is unlimited.' },
            { q: 'Can it handle multiple languages?', a: 'Yes. If the channel has content in multiple languages, the persona will respond appropriately based on the user\'s input language.' },
            { q: 'How accurate are the responses?', a: 'Responses are grounded in the actual video content. We use RAG (Retrieval-Augmented Generation) to cite specific videos when answering.' },
            { q: 'Can I monetize the bot?', a: 'Yes. Many clients use this for paid community access or as a lead magnet for course sales.' }
        ]
    },
    'U6EZ2iLQ4zCGg31H': { // Voice AI Lead Analyzer
        targetMarket: 'Home Service Contractors & Field Service Businesses',
        setupTime: '3 Days',
        deploymentSteps: [
            { title: 'Connect Phone System', desc: 'Link your Telnyx, Twilio, or VoIP provider via webhook', icon: 'Activity' },
            { title: 'Automatic Transcription', desc: 'Every call is transcribed and scored for buyer intent', icon: 'Cpu' },
            { title: 'CRM Sync', desc: 'Hot leads are pushed directly to Workiz, HubSpot, or your CRM', icon: 'TrendingUp' }
        ],
        features: [
            { title: 'Telnyx Integration', desc: 'Direct webhook processing for incoming recordings and call logs.', image: FEATURE_ICONS.integration },
            { title: 'Audio Transcription', desc: 'High-fidelity voice-to-text conversion for sales and support calls.', image: FEATURE_ICONS.transformation },
            { title: 'Lead Scoring', desc: 'Sentiment analysis and intent detection to prioritize high-value prospects.', image: FEATURE_ICONS.analytics },
            { title: 'CRM Sync', desc: 'Automated entry and categorization within your existing operations stack.', image: FEATURE_ICONS.automation }
        ],
        faqs: [
            { q: 'Which phone providers are supported?', a: 'Native integration with Telnyx, Twilio, RingCentral, and Aircall. Custom webhooks available for others.' },
            { q: 'What languages are supported for transcription?', a: 'English and Spanish with 98%+ accuracy. Hebrew, French, and German available on request.' },
            { q: 'How is lead intent scored?', a: 'Our NLP model analyzes urgency keywords, budget mentions, timeline references, and emotional sentiment to generate a 0-100 score.' },
            { q: 'Can it detect missed opportunities from past calls?', a: 'Yes. Upload historical call recordings for bulk analysis to recover leads you may have missed.' },
            { q: 'Is the data secure?', a: 'All audio is processed in encrypted memory and transcripts are stored in your own CRM, not on our servers.' }
        ]
    },
    '5Fl9WUjYTpodcloJ': { // AI Appointment Assistant
        targetMarket: 'Consultants, Coaches & Professional Service Providers',
        setupTime: 'Instant',
        deploymentSteps: [
            { title: 'Connect Calendar', desc: 'Link your Google Calendar, Outlook, or iCloud', icon: 'Clock' },
            { title: 'Set Preferences', desc: 'Define availability rules, buffer times, and approval workflows', icon: 'Settings' },
            { title: 'Go Autonomous', desc: 'The AI handles booking requests via email, Slack, or WhatsApp', icon: 'Rocket' }
        ],
        features: [
            { title: 'Conflict Resolution', desc: 'Intelligent handling of double-bookings and time-zone overlaps.', image: FEATURE_ICONS.automation },
            { title: 'Natural Language', desc: 'Process scheduling requests like "Move my Tuesday 10am to next Monday".', image: FEATURE_ICONS.transformation },
            { title: 'Human Approval Flow', desc: 'Optional Slack/WhatsApp confirmation before finalizing bookings.', image: FEATURE_ICONS.messaging },
            { title: 'Webhook Triggers', desc: 'Connect to external apps to trigger bookings from lead forms.', image: FEATURE_ICONS.integration }
        ],
        faqs: [
            { q: 'Does it handle multiple time zones?', a: 'Yes. The AI automatically detects the requester\'s time zone and presents availability in their local time.' },
            { q: 'Can I require approval before confirming?', a: 'Absolutely. Enable Human-in-the-Loop mode to receive Slack or WhatsApp confirmations before any booking is finalized.' },
            { q: 'What happens if someone asks to reschedule?', a: 'The AI understands natural language like "move my call to next Tuesday" and handles the change automatically.' },
            { q: 'Does it integrate with video conferencing?', a: 'Yes. Zoom, Google Meet, and Microsoft Teams links are automatically generated and included in confirmations.' },
            { q: 'Can it handle recurring appointments?', a: 'Yes. Weekly coaching calls or monthly check-ins are fully supported.' }
        ]
    },
    'stj8DmATqe66D9j4': { // Floor Plan to Property Tour
        targetMarket: 'Real Estate Agents & Property Developers',
        setupTime: '24-48 Hours',
        deploymentSteps: [
            { title: 'Upload Floor Plan', desc: 'Submit a 2D floor plan image (PNG, JPG, or PDF)', icon: 'Layout' },
            { title: 'Style Selection', desc: 'Choose from Modern, Scandinavian, Industrial, or Traditional styles', icon: 'CheckCircle2' },
            { title: 'Receive Walkthrough', desc: 'Download your 4K cinematic property tour video in 24-48 hours', icon: 'Rocket' }
        ],
        features: [
            { title: '2D to 3D Conversion', desc: 'Neural reconstruction of spatial layouts from simple image files.', image: FEATURE_ICONS.transformation },
            { title: 'Photorealistic Rendering', desc: 'Ray-traced quality visuals with accurate lighting and material textures.', image: FEATURE_ICONS.content },
            { title: 'Video Walkthrough', desc: 'Dynamic camera paths that explore the property in 4K resolution.', image: FEATURE_ICONS.analytics },
            { title: 'Multi-Style Options', desc: 'Switch between Modern, Industrial and Classic themes instantly.', image: FEATURE_ICONS.automation }
        ],
        faqs: [
            { q: 'What file formats are accepted?', a: 'PNG, JPG, PDF, and SVG. The cleaner the floor plan, the better the 3D reconstruction.' },
            { q: 'Can I change the furniture style after generating?', a: 'The initial generation locks in the style. Re-runs with different styles are available at a discounted rate.' },
            { q: 'How long does processing take?', a: 'Standard turnaround is 24-48 hours. Rush processing (4-hour) is available for an additional fee.' },
            { q: 'What resolution is the video?', a: 'All videos are rendered in 4K (3840x2160) at 30fps, optimized for social media and listing portals.' },
            { q: 'Can I add my own branding?', a: 'Yes. Pro tier includes a custom intro/outro with your logo and contact information.' }
        ]
    },
    'vCxY2DXUZ8vUb30f': { // Monthly CRO Insights Bot
        targetMarket: 'SaaS Companies & E-commerce Conversion Teams',
        setupTime: 'Instant',
        deploymentSteps: [
            { title: 'Connect Analytics', desc: 'Provide GA4 Measurement ID and Clarity project access', icon: 'Activity' },
            { title: 'Baseline Audit', desc: 'AI performs initial funnel analysis and identifies quick wins', icon: 'TrendingUp' },
            { title: 'Monthly Reports', desc: 'Receive prioritized CRO recommendations in Slack every month', icon: 'Mail' }
        ],
        features: [
            { title: 'Drop-off Analysis', desc: 'Detection of funnel leaks and navigation bottlenecks across the journey.', image: FEATURE_ICONS.analytics },
            { title: 'Heatmap Integration', desc: 'Correlating click density with user conversion intent scores.', image: FEATURE_ICONS.transformation },
            { title: 'Slack Reporting', desc: 'Beautifully formatted monthly summaries sent directly to team channels.', image: FEATURE_ICONS.messaging },
            { title: 'Action Item Prioritization', desc: 'Ranking fixes by estimated ROI and development effort.', image: FEATURE_ICONS.automation }
        ],
        faqs: [
            { q: 'What analytics permissions are required?', a: 'Read-only access to GA4 (Viewer role) and Clarity (Viewer role). We never modify your data.' },
            { q: 'Does it require Google Tag Manager?', a: 'No, but having GTM allows for more granular event tracking and richer insights.' },
            { q: 'How are recommendations prioritized?', a: 'Each recommendation is scored by (Potential Revenue Impact) × (1 / Implementation Effort). High-ROI, low-effort fixes surface first.' },
            { q: 'Can it detect technical issues?', a: 'Yes. The bot flags broken links, slow-loading pages, and JavaScript errors that impact conversion.' },
            { q: 'Is this a one-time audit or ongoing?', a: 'Ongoing. You receive a fresh analysis every month with trend comparisons to previous periods.' }
        ]
    }
};

async function updateMarketplaceContent() {
    console.log('Starting marketplace content update...\n');

    for (const [templateId, content] of Object.entries(MARKETPLACE_CONTENT)) {
        try {
            const docRef = db.collection('templates').doc(templateId);
            const doc = await docRef.get();

            if (!doc.exists) {
                console.log(`⚠️  Template ${templateId} not found, skipping...`);
                continue;
            }

            await docRef.update(content);
            console.log(`✅ Updated: ${templateId}`);
        } catch (error) {
            console.error(`❌ Failed to update ${templateId}:`, error);
        }
    }

    console.log('\n✨ Marketplace content update complete!');
}

updateMarketplaceContent();
