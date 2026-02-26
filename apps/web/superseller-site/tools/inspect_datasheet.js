/**
 * tools/inspect_datasheet.js
 * 
 * Usage: node tools/inspect_datasheet.js <DATASHEET_ID>
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
const DATASHEET_ID = process.argv[2] || process.env.AITABLE_LEADS_DATASHEET_ID;

if (!TOKEN || !DATASHEET_ID) {
    console.error('❌ Missing Token or Datasheet ID');
    process.exit(1);
}

async function inspectDatasheet() {
    console.log(`🔍 Inspecting Datasheet: ${DATASHEET_ID}...`);
    try {
        // Fetch views to get column info (or records with fieldKey=name)
        // Better: GET https://aitable.ai/fusion/v1/datasheets/{datasheetId}/fields
        const response = await fetch(`https://aitable.ai/fusion/v1/datasheets/${DATASHEET_ID}/fields`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        console.log('✅ Columns Found:');
        data.data.fields.forEach(field => {
            console.log(`   - "${field.name}" (ID: ${field.id}, Type: ${field.type})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

inspectDatasheet();
