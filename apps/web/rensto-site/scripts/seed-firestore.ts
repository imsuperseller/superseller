
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load Service Account from env or local file if needed
// For this script, we'll try to use Application Default Credentials or assume env var is set.
// If running locally with `firebase login`, it might need specific setup or service account key file.

const serviceAccountVal = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let app;

if (getApps().length === 0) {
    if (serviceAccountVal) {
        const serviceAccount = JSON.parse(serviceAccountVal);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: 'rensto'
        });
    } else {
        // Warning: this might fail locally without GOOGLE_APPLICATION_CREDENTIALS
        console.log("No FIREBASE_SERVICE_ACCOUNT_KEY found. Trying default credentials...");
        app = initializeApp({ projectId: 'rensto' });
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

// Mock Data (Copied from src/app/marketplace/page.tsx)
// Video paths are relative to public/, but Firestore should store the full public path string.

const TEMPLATES = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: "Celebrity Selfie Video Generator",
        description: "Create personalized AI video journeys through movie history. Upload a photo and get a merged video where the user stars in iconic scenes. Powered by Higgsfield Kling Omni and delivered via WhatsApp.",
        category: "Content Engine",
        price: 297,
        downloadPrice: 297,
        rating: 4.9,
        downloads: 156,
        popular: true,
        features: ["AI Face Swap", "Multi-Scene Stitching", "WhatsApp Delivery", "Custom Movie Presets", "ImgBB Photo Hosting"],
        video: "/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace'],
        configurationSchema: [
            { id: 'movie_theme', label: 'Movie Theme', type: 'select', required: true, options: ['Action Hero', 'Classic Romance', 'Sci-Fi Explorer', 'Historical Legend'], placeholder: 'Select a theme' },
            { id: 'user_photo', label: 'Upload Portrait', type: 'text', required: true, placeholder: 'URL to your photo', helperText: 'Front-facing portrait for AI mapping' }
        ]
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "Meta Ad Library Analyzer",
        description: "Scrapes winning ads from Meta Ad Library and generates detailed replication templates using AI vision analysis. Identifies UGC and testimonial-style ads with precise scene-by-scene breakdowns.",
        category: "Lead Machine",
        price: 197,
        downloadPrice: 197,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["Ad Scraping", "AI Video Analysis", "Template Generation", "Boost.Space Storage", "WhatsApp Trigger Support"],
        video: "/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace'],
        configurationSchema: [
            { id: 'competitor_domain', label: 'Competitor Domain', type: 'url', required: true, placeholder: 'https://competitor.com' },
            { id: 'niche', label: 'Advertising Niche', type: 'text', required: true, placeholder: 'e.g. E-commerce, SaaS' }
        ]
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "YouTube AI Clone",
        description: "Create an AI persona from any YouTube channel. Extracts transcripts, synthesizes a conversational persona, and lets you chat with the clone via Telegram. Includes Perplexity research tool.",
        category: "Knowledge Engine",
        price: 347,
        downloadPrice: 347,
        rating: 4.7,
        downloads: 64,
        features: ["Transcript Extraction", "Persona Synthesis", "Telegram Bot Integration", "Perplexity Research Tool", "Session Memory"],
        video: "/videos/youtube-clone.mp4",
        tags: ['marketplace'],
        configurationSchema: [
            { id: 'channel_url', label: 'YouTube Channel URL', type: 'url', required: true, placeholder: 'https://youtube.com/@channel' },
            { id: 'persona_voice', label: 'Clone Voice Style', type: 'select', required: true, options: ['Enthusiastic', 'Analytical', 'Sarcastic', 'Inspirational'] }
        ]
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "Call Audio Lead Analyzer",
        description: "Ingests Telnyx call recordings, transcribes them with AI, and creates qualified leads in Workiz with intelligent categorization. Sends email reports via Outlook.",
        category: "Lead Machine",
        price: 497,
        downloadPrice: 497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["Telnyx Integration", "Audio Transcription", "Lead Scoring", "Workiz CRM Sync", "Outlook Email Reports"],
        video: "/videos/call-audio-analyzer.mp4",
        tags: ['marketplace'],
        configurationSchema: [
            { id: 'crm_type', label: 'Target CRM', type: 'select', required: true, options: ['Workiz', 'PipeDrive', 'Salesforce', 'HubSpot'] },
            { id: 'score_threshold', label: 'Lead Score Threshold', type: 'number', required: true, placeholder: '0-100' }
        ]
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "AI Calendar Assistant",
        description: "An AI agent that manages your TidyCal calendar. Books meetings, reschedules, checks availability, and detects conflicts via natural chat commands through Telegram or webhooks.",
        category: "Autonomous Secretary",
        price: 147,
        downloadPrice: 147,
        rating: 4.6,
        downloads: 312,
        features: ["Conflict Resolution", "Natural Language", "Smart Rescheduling", "Human Approval Flow", "Webhook Triggers"],
        video: "/videos/calendar-assistant.mp4",
        tags: ['marketplace'],
        configurationSchema: [
            { id: 'calendar_provider', label: 'Calendar Provider', type: 'select', required: true, options: ['Google Calendar', 'Outlook', 'iCloud'] },
            { id: 'timezone', label: 'Primary Timezone', type: 'text', required: true, placeholder: ' America/New_York' }
        ]
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "Floor Plan to Property Tour",
        description: "Upload a floor plan and receive a photorealistic video walkthrough. AI generates room renders in multiple styles (Modern, Traditional, Scandinavian) and stitches them into a smooth tour video.",
        category: "Content Engine",
        price: 397,
        downloadPrice: 397,
        rating: 5.0,
        downloads: 45,
        features: ["2D to 3D Conversion", "Photorealistic Rendering", "Video Walkthrough", "Five Interior Styles", "Email Delivery"],
        video: "/videos/floor-plan-tour.mp4",
        tags: ['marketplace'],
        configurationSchema: [
            { id: 'floorplan_url', label: 'Floor Plan Image URL', type: 'url', required: true },
            { id: 'style', label: 'Interior Style', type: 'select', required: true, options: ['Modern', 'Scandinavian', 'Industrial', 'Traditional'] }
        ]
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "Monthly CRO Insights Bot",
        description: "Automated monthly analysis of GA4 and Clarity data with actionable CRO recommendations. Identifies rage clicks, scroll depth issues, and generates prioritized action items delivered via Slack.",
        category: "Knowledge Engine",
        price: 247,
        downloadPrice: 247,
        rating: 4.8,
        downloads: 112,
        features: ["Drop-off Analysis", "Heatmap Integration", "Monthly Report", "Slack Reports", "Error Alerting"],
        video: "/videos/cro-insights.mp4",
        tags: ['marketplace'],
        configurationSchema: [
            { id: 'ga4_id', label: 'GA4 Measurement ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
            { id: 'domain', label: 'Website Domain', type: 'url', required: true }
        ]
    },
    {
        id: 'internal-admin-bot',
        name: "Internal System Monitor",
        description: "Monitors system health and alerts admins.",
        category: "Internal",
        price: 0,
        downloadPrice: 0,
        rating: 0,
        downloads: 0,
        features: ["System Health", "Alerting"],
        video: "",
        tags: ['internal']
    }
];

async function seed() {
    console.log("Starting seed process...");
    const batch = db.batch();

    for (const template of TEMPLATES) {
        const ref = db.collection('templates').doc(template.id);

        // We only want to update 'video' if it exists, or create full doc if not.
        // Actually, let's just Upsert the fields we have, especially 'video'.
        // To be safe, we perform set with merge: true

        // Note: In a real scenario, we might want to preserve other fields if they changed on server.
        // But here we are initializing the video links.

        batch.set(ref, {
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            price: template.price,
            downloadPrice: template.downloadPrice || template.price,
            video: template.video,
            features: template.features,
            tags: template.tags,
            configurationSchema: (template as any).configurationSchema || null,
            updatedAt: new Date()
        }, { merge: true });
    }

    await batch.commit();
    console.log(`Successfully updated ${TEMPLATES.length} templates with video links.`);
}

seed().catch(console.error);
