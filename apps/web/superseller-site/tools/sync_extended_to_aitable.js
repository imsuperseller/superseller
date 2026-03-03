/**
 * tools/sync_extended_to_aitable.js
 *
 * Purpose: Syncs testimonials, payments, solutions, and campaigns from PostgreSQL to AITable.
 * Protocol: BLAST Layer 3 (Atomic Tool)
 *
 * Usage: npx tsx tools/sync_extended_to_aitable.js
 *   OR:  node tools/sync_extended_to_aitable.js  (after prisma generate)
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
    AITABLE_SUPERSELLER_TESTIMONIALS_ID,
    AITABLE_SUPERSELLER_PAYMENTS_ID,
    AITABLE_SUPERSELLER_SOLUTIONS_ID,
    AITABLE_SUPERSELLER_CAMPAIGNS_ID
} = envVars;

const prisma = new PrismaClient();

async function syncToAITable(label, datasheetId, records) {
    console.log(`\n📂 Syncing ${label}...`);
    if (!datasheetId || datasheetId === 'null') {
        console.error(`❌ Missing Datasheet ID for ${label}`);
        return;
    }

    if (records.length === 0) {
        console.log(`⚠️ No records found for ${label}`);
        return;
    }

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
        }
        // Rate limit protection
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function main() {
    if (!AITABLE_API_TOKEN) {
        console.error('❌ AITABLE_API_TOKEN missing.');
        process.exit(1);
    }

    try {
        // 1. Testimonials
        const testimonials = await prisma.testimonial.findMany();
        await syncToAITable('testimonials', AITABLE_SUPERSELLER_TESTIMONIALS_ID,
            testimonials.map(t => ({
                fields: {
                    "Author": t.author || t.name || "",
                    "Role": t.role || "",
                    "Quote": t.quote || t.content || "",
                    "Client ID": t.clientId || "",
                    "Status": t.isActive ? "Active" : "Inactive"
                }
            }))
        );

        // 2. Payments
        const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
        await syncToAITable('payments', AITABLE_SUPERSELLER_PAYMENTS_ID,
            payments.map(p => ({
                fields: {
                    "Payment ID": p.id,
                    "Amount": `${(p.amount || p.amountTotal || 0) / 100} ${p.currency || 'USD'}`,
                    "Product ID": p.productId || p.flowType || "",
                    "Status": p.status || "Completed",
                    "Timestamp": p.createdAt ? p.createdAt.toISOString() : ""
                }
            }))
        );

        // 3. Solutions
        const solutions = await prisma.solution.findMany();
        await syncToAITable('solutions', AITABLE_SUPERSELLER_SOLUTIONS_ID,
            solutions.map(s => ({
                fields: {
                    "Solution Name": s.name || "",
                    "Category": s.category || "",
                    "Price": s.pricing?.bundle?.price ? `$${s.pricing.bundle.price}/mo` : "Custom",
                    "Description": s.description || "",
                    "Status": s.status || "active"
                }
            }))
        );

        // 4. Outreach Campaigns
        const campaigns = await prisma.outreachCampaign.findMany();
        await syncToAITable('campaigns', AITABLE_SUPERSELLER_CAMPAIGNS_ID,
            campaigns.map(c => ({
                fields: {
                    "Campaign Name": c.name || "",
                    "Type": c.type || "",
                    "Status": c.status || "draft",
                    "Created At": c.createdAt ? c.createdAt.toISOString() : ""
                }
            }))
        );

        console.log("\n🎊 Extended Sync Complete.");
    } finally {
        await prisma.$disconnect();
    }
}

main();
