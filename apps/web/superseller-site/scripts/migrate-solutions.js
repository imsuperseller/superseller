const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const SOLUTIONS = [
    {
        id: 'marketplace-autoposter',
        name: "Facebook Marketplace Autoposter",
        description: "Fully automated professional listing agent. Replaces a human VA with 24/7 robotic posting consistency.",
        outcomeHeadline: "Own the Marketplace without lifting a finger.",
        category: "Operations",
        type: "marketplace-autoposter",
        status: "active",
        pricing: {
            builder: { price: 497, currency: "USD" },
            bundle: { price: 1997, currency: "USD", interval: "month" }
        },
        features: ["20-30 min randomized posting", "GoLogin browser fingerprinting", "Image randomization", "Automatic status reporting"],
        tools: ["n8n", "gologin", "facebook"],
        tags: ["realestate", "automation", "sales"],
        rating: 5.0,
        downloads: 120,
        technicalRequirements: [
            { id: "fb_email", label: "FB Email/Login", type: "text", required: true },
            { id: "fb_password", label: "FB Password", type: "text", required: true },
            { id: "gologin_profile_id", label: "GoLogin Profile ID", type: "text", required: true },
            { id: "gologin_api_key", label: "GoLogin API Key", type: "text", required: true }
        ],
        showInMarketplace: true
    },
    {
        id: 'lead-machine',
        name: "The Lead Machine",
        description: "Autonomous lead extraction and qualification engine. Scrapes, validates, and pushes to your CRM.",
        outcomeHeadline: "Scale your sales with an army of robotic prospectors.",
        category: "Leads",
        type: "lead-machine",
        status: "active",
        pricing: {
            builder: { price: 297, currency: "USD" },
            bundle: { price: 997, currency: "USD", interval: "month" }
        },
        features: ["LinkedIn/GMap scraping", "AI qualification", "Direct CRM sync"],
        tools: ["n8n", "apollo", "openai"],
        tags: ["leads", "sales", "growth"],
        rating: 4.9,
        downloads: 450,
        technicalRequirements: [
            { id: "crm_webhook", label: "CRM Webhook URL", type: "url", required: true },
            { id: "target_keywords", label: "Target Keywords (CSV)", type: "text", required: true }
        ],
        showInMarketplace: true
    }
];

async function migrate() {
    const solutionsRef = db.collection('solutions');

    for (const sol of SOLUTIONS) {
        console.log(`Migrating solution: ${sol.name}...`);
        await solutionsRef.doc(sol.id).set({
            ...sol,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    console.log("Migration completed successfully.");
    process.exit(0);
}

migrate().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
