/**
 * tools/list_aitable_resources.js
 * 
 * Usage: node tools/list_aitable_resources.js
 * Requires: .env.local with AITABLE_API_TOKEN
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const TOKEN = process.env.AITABLE_API_TOKEN;

if (!TOKEN) {
    console.error('❌ AITABLE_API_TOKEN not found in .env.local');
    process.exit(1);
}

async function listSpaces() {
    console.log('🔍 Fetching Spaces...');
    try {
        const response = await fetch('https://aitable.ai/fusion/v1/spaces', {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        console.log(`✅ Found ${data.data.spaces.length} Spaces:`);
        data.data.spaces.forEach(space => {
            console.log(`   - [${space.name}] (ID: ${space.id})`);
        });

        return data.data.spaces;
    } catch (error) {
        console.error('❌ Error fetching spaces:', error.message);
        return [];
    }
}

async function listNodes(spaceId, parentNodeId = '') {
    const parentLabel = parentNodeId ? ` (Parent: ${parentNodeId})` : '';
    console.log(`\n🔍 Fetching Nodes for Space ${spaceId}${parentLabel}...`);
    try {
        let url = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
        if (parentNodeId) url += `?parentNodeId=${parentNodeId}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        console.log(`✅ Found Nodes:`);
        data.data.nodes.forEach(node => {
            console.log(`   - [${node.type}] ${node.name} (ID: ${node.id})`);
        });

        return data.data.nodes;
    } catch (error) {
        console.error('❌ Error fetching nodes:', error.message);
    }
}

async function main() {
    const spaces = await listSpaces();

    // Check SuperSeller AI Space (spc63cnXLdMYc) folder (fodW7MSY6fdLz) directly
    await listNodes('spc63cnXLdMYc', 'fodW7MSY6fdLz');
}

main();
