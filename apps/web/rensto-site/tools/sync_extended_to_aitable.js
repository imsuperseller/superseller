const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        value = value.replace(/(^['"]|['"]$)/g, '').trim();
        envVars[key] = value;
    }
});

const {
    AITABLE_API_TOKEN,
    AITABLE_SPACE_ID,
    AITABLE_RENSTO_TESTIMONIALS_ID,
    AITABLE_RENSTO_PAYMENTS_ID,
    AITABLE_RENSTO_SOLUTIONS_ID,
    AITABLE_RENSTO_CAMPAIGNS_ID
} = envVars;

// Initialize Firebase
const serviceAccount = require('../service-account.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function syncCollection(collectionName, datasheetId, mapper) {
    console.log(`\n📂 Syncing ${collectionName}...`);
    if (!datasheetId || datasheetId === 'null') {
        console.error(`❌ Missing Datasheet ID for ${collectionName}`);
        return;
    }

    try {
        const snapshot = await db.collection(collectionName).get();
        if (snapshot.empty) {
            console.log(`⚠️ No records found in ${collectionName}`);
            return;
        }

        const records = snapshot.docs.map(doc => ({
            fields: mapper(doc.data(), doc.id)
        }));

        console.log(`📡 Sending ${records.length} records to AITable...`);

        // Batch in 10s
        for (let i = 0; i < records.length; i += 10) {
            const batch = { records: records.slice(i, i + 10) };
            const res = await fetch(`https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AITABLE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(batch)
            });
            const data = await res.json();
            if (data.success) {
                console.log(`✅ Synced batch ${Math.floor(i / 10) + 1}`);
            } else {
                console.error(`❌ Batch failed: ${data.message}`);
                console.error(JSON.stringify(batch, null, 2));
            }
        }
    } catch (error) {
        console.error(`❌ Sync Error for ${collectionName}: ${error.message}`);
    }
}

async function main() {
    // 1. Testimonials
    await syncCollection('testimonials', AITABLE_RENSTO_TESTIMONIALS_ID, (data) => ({
        "Author": data.author || "",
        "Role": data.role || "",
        "Quote": data.quote || "",
        "Client ID": data.clientId || "",
        "Status": data.isActive ? "Active" : "Inactive"
    }));

    // 2. Payments
    await syncCollection('payments', AITABLE_RENSTO_PAYMENTS_ID, (data, id) => ({
        "Payment ID": id,
        "Amount": `${data.amountTotal || 0} ${data.currency || 'USD'}`,
        "Product ID": data.productId || data.flowType || "",
        "Status": "Completed",
        "Timestamp": data.timestamp ? new Date(data.timestamp._seconds * 1000).toISOString() : ""
    }));

    // 3. Solutions
    await syncCollection('solutions', AITABLE_RENSTO_SOLUTIONS_ID, (data) => ({
        "Solution Name": data.name || "",
        "Category": data.category || "",
        "Price": data.pricing?.bundle?.price ? `$${data.pricing.bundle.price}/mo` : "Custom",
        "Description": data.description || "",
        "Status": data.status || "active"
    }));

    // 4. Outreach Campaigns
    await syncCollection('outreach_campaigns', AITABLE_RENSTO_CAMPAIGNS_ID, (data) => ({
        "Campaign Name": data.name || "",
        "Type": data.type || "",
        "Goal": data.goal || "",
        "Status": data.status || "active",
        "Created At": data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : ""
    }));

    console.log("\n🎊 Extended Sync Complete.");
    process.exit(0);
}

main();
