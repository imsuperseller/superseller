/**
 * tools/setup_aitable.js
 * 
 * Purpose: 
 * 1. Connect to the 'SuperSeller AI' Space (spc63cnXLdMYc).
 * 2. Check if 'SuperSeller AI Leads' datasheet exists.
 * 3. If not, create it with the correct schema.
 * 4. Output the Datasheet ID for .env.local
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            value = value.replace(/(^['"]|['"]$)/g, '').trim();
            process.env[key] = value;
            // console.log(`Decoded: ${key}`);
        }
    });
}

const TOKEN = process.env.AITABLE_API_TOKEN;
console.log(`🔑 Final TOKEN: ${TOKEN ? 'FOUND' : 'NOT FOUND'}`);
const SPACE_ID = 'spc63cnXLdMYc'; // 'SuperSeller AI' Space (new, no account limits)

if (!TOKEN) {
    console.error('❌ AITABLE_API_TOKEN not found.');
    process.exit(1);
}

const SCHEMAS = {
    "SuperSeller AI Leads": [
        { "name": "Lead Name", "type": "Text" },
        { "name": "Email", "type": "Text" },
        { "name": "Phone", "type": "Text" },
        { "name": "Source", "type": "Text" },
        { "name": "Status", "type": "Text" },
        { "name": "Firestore ID", "type": "Text" },
        { "name": "Created At", "type": "Text" }
    ],
    "SuperSeller AI Clients": [
        { "name": "Client Name", "type": "Text" },
        { "name": "Email", "type": "Text" },
        { "name": "Status", "type": "Text" },
        { "name": "Subscription", "type": "Text" },
        { "name": "Firestore ID", "type": "Text" },
        { "name": "Created At", "type": "Text" }
    ],
    "SuperSeller AI Master Registry": [
        { "name": "Product ID", "type": "Text" },
        { "name": "Product Name", "type": "Text" },
        { "name": "Status", "type": "Text" },
        { "name": "Price", "type": "Text" },
        { "name": "Stripe ID", "type": "Text" },
        { "name": "n8n Webhook", "type": "Text" }
    ],
    "SuperSeller AI Knowledge": [
        { "name": "Title", "type": "Text" },
        { "name": "Type", "type": "Text" },
        { "name": "Content URL", "type": "Text" },
        { "name": "Summary", "type": "Text" },
        { "name": "Last Updated", "type": "Text" }
    ],
    "SuperSeller AI Testimonials": [
        { "name": "Author", "type": "Text" },
        { "name": "Role", "type": "Text" },
        { "name": "Quote", "type": "Text" },
        { "name": "Client ID", "type": "Text" },
        { "name": "Status", "type": "Text" }
    ],
    "SuperSeller AI Payments": [
        { "name": "Payment ID", "type": "Text" },
        { "name": "Amount", "type": "Text" },
        { "name": "Product ID", "type": "Text" },
        { "name": "Status", "type": "Text" },
        { "name": "Timestamp", "type": "Text" }
    ],
    "SuperSeller AI Solutions": [
        { "name": "Solution Name", "type": "Text" },
        { "name": "Category", "type": "Text" },
        { "name": "Price", "type": "Text" },
        { "name": "Description", "type": "Text" },
        { "name": "Status", "type": "Text" }
    ],
    "SuperSeller AI Campaigns": [
        { "name": "Campaign Name", "type": "Text" },
        { "name": "Type", "type": "Text" },
        { "name": "Goal", "type": "Text" },
        { "name": "Status", "type": "Text" },
        { "name": "Created At", "type": "Text" }
    ]
};

async function createDatasheet(name, columns) {
    console.log(`🚀 Creating "${name}" Datasheet...`);
    const payload = {
        name: name,
        fields: columns
    };

    try {
        const response = await fetch(`https://aitable.ai/fusion/v1/spaces/${SPACE_ID}/datasheets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        console.log(`✅ Created ${name}! ID: ${data.data.id}`);
        return data.data.id;
    } catch (error) {
        console.error(`❌ Creation Failed for ${name}:`, error.message);
        return null;
    }
}

async function findDatasheet(name) {
    console.log(`🔍 Searching for existing "${name}"...`);
    try {
        const response = await fetch(`https://aitable.ai/fusion/v1/spaces/${SPACE_ID}/nodes`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        const node = data.data.nodes.find(n => n.name === name && n.type === "Datasheet");
        if (node) {
            console.log(`✅ Found existing ${name}! ID: ${node.id}`);
            return node.id;
        }
        return null;
    } catch (error) {
        console.error(`❌ Search Error for ${name}:`, error.message);
        return null;
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const results = {};

    for (const [name, columns] of Object.entries(SCHEMAS)) {
        await sleep(1000); // 1s delay
        let id = await findDatasheet(name);
        if (!id) {
            await sleep(1000); // 1s delay
            console.log(`⚠️ ${name} not found. Creating new one...`);
            id = await createDatasheet(name, columns);
        }
        results[name] = id;
    }

    console.log('\n👇 UPDATE YOUR .env.local WITH THESE 👇');
    console.log(`AITABLE_SPACE_ID=${SPACE_ID}`);
    Object.entries(results).forEach(([name, id]) => {
        const envKey = `AITABLE_${name.toUpperCase().replace(/\s+/g, '_')}_ID`;
        console.log(`${envKey}=${id}`);
    });

    // Update .env.local file automatically
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Clean up existing AITABLE keys except the token
    envContent = envContent.split('\n')
        .filter(line => {
            const key = line.split('=')[0].trim();
            if (key === 'AITABLE_API_TOKEN') return true;
            return !key.startsWith('AITABLE_');
        })
        .join('\n');

    // Append new lines
    envContent += `\nAITABLE_SPACE_ID=${SPACE_ID}`;
    Object.entries(results).forEach(([name, id]) => {
        const envKey = `AITABLE_${name.toUpperCase().replace(/\s+/g, '_')}_ID`;
        envContent += `\n${envKey}=${id}`;
    });

    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('\n✅ Updated .env.local automatically.');
}

main();
