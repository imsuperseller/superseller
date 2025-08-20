#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🧹 CLEAR CLOUDFLARE CACHE
 * Purge Cloudflare cache for specific domains
 */

class CloudflareCacheClearer {
    constructor() {
        this.config = {
            apiToken: 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2',
            domain: 'rensto.com',
            baseUrl: 'https://api.cloudflare.com/client/v4',
            zoneId: '031333b77c859d1dd4d4fd4afdc1b9bc'
        };
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
        };
    }

    async clearCache() {
        console.log('🧹 Clearing Cloudflare cache...\n');

        try {
            const purgeData = {
                files: [
                    'https://tax4us.rensto.com/*',
                    'https://shelly-mizrahi.rensto.com/*',
            
                    'https://test-customer.rensto.com/*'
                ]
            };

            const response = await axios.post(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/purge_cache`,
                purgeData,
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                console.log('✅ Cloudflare cache cleared successfully!');
                console.log('📋 Purged URLs:');
                purgeData.files.forEach(url => console.log(`   - ${url}`));
                return true;
            } else {
                throw new Error('Failed to clear cache');
            }
        } catch (error) {
            console.error('❌ Failed to clear Cloudflare cache:', error.response?.data || error.message);
            return false;
        }
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const clearer = new CloudflareCacheClearer();

    try {
        await clearer.clearCache();
        console.log('\n🎉 Cache clearing process completed!');
        console.log('⏳ Wait 30-60 seconds for changes to take effect...');
    } catch (error) {
        console.error('❌ Cache clearing failed:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default CloudflareCacheClearer;
