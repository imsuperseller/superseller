
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
        description: "Create personalized AI video journeys through movie history. Upload a photo and get a merged video where the user stars in iconic scenes.",
        category: "Content Engine",
        price: 297,
        rating: 4.9,
        downloads: 156,
        popular: true,
        features: ["AI Face Swap", "Multi-Scene Stitching", "WhatsApp Delivery"],
        video: "http://172.245.56.50/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace']
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "Meta Ad Library Analyzer",
        description: "Scrapes winning ads from Meta Ad Library and generates detailed replication templates using AI vision analysis.",
        category: "Lead Machine",
        price: 197,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["Ad Scraping", "AI Video Analysis", "Template Generation"],
        video: "http://172.245.56.50/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace']
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "YouTube AI Clone",
        description: "Create an AI persona from any YouTube channel. Extracts transcripts and builds a conversational clone that mimics style and knowledge.",
        category: "Knowledge Engine",
        price: 347,
        rating: 4.7,
        downloads: 64,
        features: ["Transcript Extraction", "Persona Synthesis", "Telegram/WhatsApp Integration"],
        video: "http://172.245.56.50/videos/youtube-clone.mp4",
        tags: ['marketplace']
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "Call Audio Lead Analyzer",
        description: "Analyzes call recordings to qualify leads, extract details, and update CRM. Turns raw audio into actionable structured data.",
        category: "Lead Machine",
        price: 497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["Audio Transcription", "Sentiment Analysis", "CRM Sync"],
        video: "http://172.245.56.50/videos/call-audio-analyzer.mp4",
        tags: ['marketplace']
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "AI Calendar Assistant",
        description: "Autonomous scheduling agent that handles complex booking logic, availability checks, and natural language coordination.",
        category: "Autonomous Secretary",
        price: 147,
        rating: 4.6,
        downloads: 312,
        features: ["Conflict Resolution", "Natural Language", "Smart Rescheduling"],
        video: "http://172.245.56.50/videos/calendar-assistant.mp4",
        tags: ['marketplace']
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "Floor Plan to Property Tour",
        description: "Converts 2D floor plans into 3D photorealistic video tours. Perfect for real estate marketing and pre-construction sales.",
        category: "Content Engine",
        price: 397,
        rating: 5.0,
        downloads: 45,
        features: ["2D to 3D Conversion", "Photorealistic Rendering", "Video Walkthrough"],
        video: "http://172.245.56.50/videos/floor-plan-tour.mp4",
        tags: ['marketplace']
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "Monthly CRO Insights Bot",
        description: "Automated Conversion Rate Optimization analyst. Monitors site data, identifies drop-off points, and suggests actionable fixes monthly.",
        category: "Knowledge Engine",
        price: 247,
        rating: 4.8,
        downloads: 112,
        features: ["Drop-off Analysis", "Heatmap Integration", "Monthly Report"],
        video: "http://172.245.56.50/videos/cro-insights.mp4",
        tags: ['marketplace']
    },
    {
        id: 'internal-admin-bot',
        name: "Internal System Monitor",
        description: "Monitors system health and alerts admins.",
        category: "Internal",
        price: 0,
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
            // Minimal update to ensure video field is there
            video: template.video,
            // Also update others to ensure consistency with code
            name: template.name,
            id: template.id,
            tags: template.tags
            // We can add more fields if we want full sync
        }, { merge: true });
    }

    await batch.commit();
    console.log(`Successfully updated ${TEMPLATES.length} templates with video links.`);
}

seed().catch(console.error);
