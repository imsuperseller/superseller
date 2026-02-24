#!/usr/bin/env node
/**
 * Bot Adapter v2 - Multi-Customer Support
 *
 * This adapter loads customer configs from the file-based multi-tenant structure
 * and adapts them to the format expected by facebook-bot-final.js
 *
 * Usage: node bot-adapter.js <customerId> <productId>
 */

const { ConfigLoader } = require('./config-loader');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configLoader = new ConfigLoader('/opt/fb-marketplace-bot/customers');

// Parse command line args
const customerId = process.argv[2];
const productId = process.argv[3];

if (!customerId || !productId) {
    console.error('Usage: node bot-adapter.js <customerId> <productId>');
    console.error('Example: node bot-adapter.js demo uad');
    process.exit(1);
}

try {
    // Load customer data
    const customerData = configLoader.loadFullCustomerData(customerId);
    const productConfig = customerData.config.products.find(p => p.productId === productId);
    const scheduleConfig = customerData.schedule.products[productId];
    const sessionConfig = customerData.session.goLoginProfiles[productId];

    if (!productConfig) {
        console.error(`Product ${productId} not found for customer ${customerId}`);
        process.exit(1);
    }

    if (!scheduleConfig) {
        console.error(`Schedule config not found for ${customerId}/${productId}`);
        process.exit(1);
    }

    if (!sessionConfig) {
        console.error(`Session config not found for ${customerId}/${productId}`);
        process.exit(1);
    }

    // Construct bot config in the format facebook-bot-final.js expects
    const botConfig = {
        products: [
            {
                id: productId,
                name: productConfig.name,
                goLoginProfileId: sessionConfig.profileId,
                getJobsUrl: `http://localhost:8082/webhook/v2/${customerId}/${productId}/jobs`,
                updateUrl: `http://localhost:8082/webhook/v2/${customerId}/${productId}/update`,
                phoneRotation: productConfig.phoneNumbers || [],
                locations: productConfig.locations || [],
                postLimit: scheduleConfig.postLimit || 1,
                cooldownMinutes: scheduleConfig.cooldownMinutes || 15,
                stealthLevel: 3, // Default stealth level
                videoLogic: productConfig.productType === 'BOUNCE_HOUSES' ? 'kie' : 'none',
            }
        ]
    };

    // Write temporary bot-config.json for this customer+product
    const tempConfigPath = path.join(__dirname, `bot-config-${customerId}-${productId}.json`);
    fs.writeFileSync(tempConfigPath, JSON.stringify(botConfig, null, 2));

    console.log(`[Adapter] Loaded config for ${customerId}/${productId}`);
    console.log(`[Adapter] GoLogin Profile: ${sessionConfig.profileId}`);
    console.log(`[Adapter] Jobs URL: ${botConfig.products[0].getJobsUrl}`);
    console.log(`[Adapter] Running facebook-bot-final.js...`);

    // Run facebook-bot-final.js with the adapted config
    // Temporarily replace bot-config.json
    const originalConfigPath = path.join(__dirname, 'bot-config.json');
    const backupConfigPath = path.join(__dirname, 'bot-config.json.backup');

    // Backup original config
    if (fs.existsSync(originalConfigPath)) {
        fs.copyFileSync(originalConfigPath, backupConfigPath);
    }

    // Use temp config
    fs.copyFileSync(tempConfigPath, originalConfigPath);

    try {
        // Run the bot
        execSync(`node facebook-bot-final.js ${productId}`, {
            cwd: __dirname,
            stdio: 'inherit',
            env: { ...process.env, DISPLAY: ':100' },
        });
    } finally {
        // Restore original config
        if (fs.existsSync(backupConfigPath)) {
            fs.copyFileSync(backupConfigPath, originalConfigPath);
            fs.unlinkSync(backupConfigPath);
        }

        // Clean up temp config
        if (fs.existsSync(tempConfigPath)) {
            fs.unlinkSync(tempConfigPath);
        }
    }

} catch (error) {
    console.error(`[Adapter] Error: ${error.message}`);
    process.exit(1);
}
