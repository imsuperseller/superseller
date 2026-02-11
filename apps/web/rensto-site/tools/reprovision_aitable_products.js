const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        envVars[match[1]] = value;
    }
});

const AITABLE_API_TOKEN = envVars.AITABLE_API_TOKEN;
const SPACE_ID = envVars.AITABLE_SPACE_ID;
const PRODUCTS_DATASHEET_ID = envVars.AITABLE_RENSTO_MASTER_REGISTRY_ID;

if (!AITABLE_API_TOKEN || !SPACE_ID || !PRODUCTS_DATASHEET_ID) {
    console.error("❌ Missing AITable credentials (AITABLE_API_TOKEN, AITABLE_SPACE_ID, or AITABLE_RENSTO_MASTER_REGISTRY_ID).");
    process.exit(1);
}

async function reprovision() {
    console.log(`🗑️ Deleting existing datasheet: ${PRODUCTS_DATASHEET_ID}...`);

    try {
        const deleteRes = await fetch(`https://aitable.ai/fusion/v1/spaces/${SPACE_ID}/nodes/${PRODUCTS_DATASHEET_ID}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${AITABLE_API_TOKEN}` }
        });
        const deleteData = await deleteRes.json();
        console.log("Response:", JSON.stringify(deleteData, null, 2));

        if (deleteData.success || deleteData.code === 404) {
            console.log("✅ Deletion successful (or already gone). Waiting for propagation...");
            await new Promise(r => setTimeout(r, 2000));

            console.log("🛠️ Re-running setup_aitable.js to provision correctly...");
            // We'll just run the script using child_process
            const { execSync } = require('child_process');
            execSync('node tools/setup_aitable.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

            console.log("🎊 Reprovisioning complete.");
        } else {
            console.error("❌ Failed to delete datasheet.");
        }
    } catch (e) {
        console.error("❌ Reprovisioning failed:", e.message);
    }
}

reprovision();
