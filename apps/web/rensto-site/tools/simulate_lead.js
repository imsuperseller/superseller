/**
 * tools/simulate_lead.js
 *
 * Purpose: Inserts a test lead into PostgreSQL to verify the AITable sync.
 * Usage: node tools/simulate_lead.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
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

const prisma = new PrismaClient();

async function createTestLead() {
    try {
        // Get first user as owner (required FK)
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('❌ No users in database. Create a user first.');
            process.exit(1);
        }

        const lead = await prisma.lead.create({
            data: {
                name: "Test User " + Date.now(),
                email: `test${Date.now()}@example.com`,
                phone: "+15550101",
                source: "manual_simulation",
                status: "new",
                syncedToAITable: false,
                userId: user.id,
            },
        });

        console.log(`✅ Created Test Lead: ${lead.id}`);
        console.log(lead);
    } catch (error) {
        console.error('❌ Error creating lead:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestLead();
