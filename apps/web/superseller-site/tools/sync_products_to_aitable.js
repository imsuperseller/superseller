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
const PRODUCTS_DATASHEET_ID = envVars.AITABLE_SUPERSELLER_MASTER_REGISTRY_ID;

if (!AITABLE_API_TOKEN || !PRODUCTS_DATASHEET_ID) {
    console.error("❌ Missing AITable credentials in .env.local");
    process.exit(1);
}

function extractProducts() {
    const registryPath = path.join(__dirname, '../src/lib/registry/ProductRegistry.ts');
    const content = fs.readFileSync(registryPath, 'utf8');

    const products = [];
    const lines = content.split('\n');

    // First Pass: Extract PRODUCT_REGISTRY
    let currentProduct = null;
    for (const line of lines) {
        // Detect product start: 'product-id': { OR ['product-id']: {
        const startMatch = line.match(/^\s+(?:\[)?(['"])(.*?)\1(?:\])?:\s*{/);
        if (startMatch) {
            currentProduct = { id: startMatch[2], lines: [] };
            continue;
        }

        // Detect product end: },
        if (currentProduct && line.match(/^\s+},/)) {
            const block = currentProduct.lines.join('\n');
            const nameMatch = block.match(/name:\s*(['"])(.*?)\1/);
            const priceMatch = block.match(/price:\s*(\d+)/);
            const stripeMatch = block.match(/stripePriceId:\s*(['"])(.*?)\1/);
            const workflowMatch = block.match(/workflowId:\s*(['"])(.*?)\1/);
            const statusMatch = block.match(/status:\s*(['"])(.*?)\1/);
            const flowMatch = block.match(/flowType:\s*(['"])(.*?)\1/);
            const pillarMatch = block.match(/pillarId:\s*(['"])(.*?)\1/);

            products.push({
                id: currentProduct.id,
                name: nameMatch ? nameMatch[2] : currentProduct.id,
                price: priceMatch ? parseInt(priceMatch[1]) : 0,
                stripeId: stripeMatch ? stripeMatch[2] : "",
                webhook: workflowMatch ? workflowMatch[2] : "",
                status: statusMatch ? statusMatch[2] : "active",
                flowType: flowMatch ? flowMatch[2] : "service-purchase",
                pillarId: pillarMatch ? pillarMatch[2] : ""
            });
            currentProduct = null;
            continue;
        }

        if (currentProduct) {
            currentProduct.lines.push(line);
        }
    }

    // Second Pass: Extract TOKEN_PACKAGES
    let inTokenPackages = false;
    currentProduct = null;
    for (const line of lines) {
        if (line.includes('export const TOKEN_PACKAGES')) {
            inTokenPackages = true;
            continue;
        }
        if (inTokenPackages && line.match(/^\s+{/)) {
            currentProduct = { lines: [] };
            continue;
        }
        if (inTokenPackages && currentProduct && line.match(/^\s+},/)) {
            const block = currentProduct.lines.join('\n');
            const idMatch = block.match(/id:\s*(['"])(.*?)\1/);
            const nameMatch = block.match(/name:\s*(['"])(.*?)\1/);
            const priceMatch = block.match(/price:\s*(\d+)/);
            const stripeMatch = block.match(/stripeLink:\s*(?:env\.)?([A-Z0-9_]+)/);
            const flowMatch = block.match(/flowType:\s*(['"])(.*?)\1/);

            products.push({
                id: idMatch ? idMatch[2] : (nameMatch ? nameMatch[2].toLowerCase().replace(/\s+/g, '-') : ""),
                name: nameMatch ? nameMatch[2] : "Care Plan",
                price: priceMatch ? parseInt(priceMatch[1]) : 0,
                stripeId: stripeMatch ? stripeMatch[1] : "",
                status: "active",
                webhook: "",
                flowType: flowMatch ? flowMatch[2] : "care-plan",
                pillarId: ""
            });
            currentProduct = null;
            continue;
        }
        if (inTokenPackages && currentProduct) {
            currentProduct.lines.push(line);
        }
        if (inTokenPackages && line.match(/^\];/)) {
            inTokenPackages = false;
        }
    }

    return products;
}

async function syncProducts() {
    try {
        const products = extractProducts();
        console.log(`🚀 Found ${products.length} products to sync.`);
        if (products.length === 0) {
            console.warn("⚠️ No products found. Check the regex parser.");
            return;
        }

        // Prepare records
        const records = products.map(p => ({
            fields: {
                "Product ID": p.id || "",
                "Product Name": p.name || "",
                "Status": p.status || "active",
                "Price": p.price ? p.price.toString() : "0",
                "Stripe ID": p.stripeId || "",
                "n8n Webhook": p.webhook || "",
                "flowType": p.flowType || "",
                "pillarId": p.pillarId || ""
            }
        }));

        console.log(`📡 Syncing ${records.length} products to AITable...`);

        // Chunk records (max 10 per request)
        const CHUNK_SIZE = 10;
        for (let i = 0; i < records.length; i += CHUNK_SIZE) {
            const batch = { records: records.slice(i, i + CHUNK_SIZE) };

            const response = await fetch(`https://aitable.ai/fusion/v1/datasheets/${PRODUCTS_DATASHEET_ID}/records`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AITABLE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(batch)
            });

            const data = await response.json();
            if (!data.success) {
                console.error(`❌ Batch Sync Failed: ${data.message}`);
                console.error("Payload:", JSON.stringify(batch, null, 2));
            } else {
                console.log(`✅ Synced batch ${Math.floor(i / CHUNK_SIZE) + 1} (${batch.records.length} records)`);
            }
            // Rate limit protection
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("🎊 Product sync complete.");
    } catch (error) {
        console.error("❌ Sync Error:", error.message);
    }
}

syncProducts();
