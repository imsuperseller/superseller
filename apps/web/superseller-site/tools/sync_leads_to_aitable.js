/**
 * tools/sync_leads_to_aitable.js
 *
 * Purpose: Syncs unsynced Leads and Users from PostgreSQL to AITable for admin dashboards.
 * Protocol: BLAST Layer 3 (Atomic Tool)
 *
 * Usage: npx tsx tools/sync_leads_to_aitable.js
 *   OR:  node tools/sync_leads_to_aitable.js  (after prisma generate)
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env.local manually for local testing
const envPath = path.resolve(__dirname, '../.env.local');
console.log('📂 Loading environment from:', envPath);
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            value = value.replace(/(^['"]|['"]$)/g, '').trim();
            process.env[key] = value;
        }
    });
}
console.log('🔑 AITABLE_API_TOKEN status:', process.env.AITABLE_API_TOKEN ? 'LOADED' : 'MISSING');

const prisma = new PrismaClient();
const AITABLE_API_TOKEN = process.env.AITABLE_API_TOKEN;
const LEADS_ID = process.env.AITABLE_SUPERSELLER_LEADS_ID;
const CLIENTS_ID = process.env.AITABLE_SUPERSELLER_CLIENTS_ID;

async function syncLeads(datasheetId) {
    if (!datasheetId) {
        console.warn('⚠️ Skipping leads: AITABLE_SUPERSELLER_LEADS_ID missing.');
        return;
    }

    console.log('🔍 Checking for unsynced leads...');
    const leads = await prisma.lead.findMany({
        where: { syncedToAITable: false },
        take: 50,
    });

    if (leads.length === 0) {
        console.log('✅ No new leads to sync.');
        return;
    }

    const records = leads.map(lead => ({
        fields: {
            "Lead Name": lead.name || "Unknown",
            "Email": lead.email || "",
            "Phone": lead.phone || "",
            "Source": lead.source || "Website",
            "Status": lead.status || "New",
            "Postgres ID": lead.id,
            "Created At": lead.createdAt ? lead.createdAt.toISOString() : new Date().toISOString()
        }
    }));

    try {
        const response = await fetch(`https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AITABLE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records })
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        console.log(`✅ Successfully pushed ${leads.length} leads to AITable.`);

        // Mark as synced
        await prisma.lead.updateMany({
            where: { id: { in: leads.map(l => l.id) } },
            data: { syncedToAITable: true },
        });
        console.log('✅ PostgreSQL leads marked as synced.');
    } catch (error) {
        console.error('❌ Leads sync failed:', error.message);
    }
}

async function syncClients(datasheetId) {
    if (!datasheetId) {
        console.warn('⚠️ Skipping clients: AITABLE_SUPERSELLER_CLIENTS_ID missing.');
        return;
    }

    console.log('🔍 Fetching users for client sync...');
    const users = await prisma.user.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
        console.log('✅ No users to sync.');
        return;
    }

    const records = users.map(user => ({
        fields: {
            "Client Name": user.name || "Unknown",
            "Email": user.email || "",
            "Status": user.status || "Active",
            "Business": user.businessName || "N/A",
            "Postgres ID": user.id,
            "Created At": user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
        }
    }));

    try {
        const response = await fetch(`https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AITABLE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records })
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        console.log(`✅ Successfully pushed ${users.length} clients to AITable.`);
    } catch (error) {
        console.error('❌ Clients sync failed:', error.message);
    }
}

async function main() {
    if (!AITABLE_API_TOKEN) {
        console.error('❌ AITABLE_API_TOKEN missing.');
        process.exit(1);
    }

    try {
        await syncLeads(LEADS_ID);
        await syncClients(CLIENTS_ID);
    } finally {
        await prisma.$disconnect();
    }
}

main();
