#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🔒 CHANGE CLOUDFLARE SSL/TLS MODE
 * Switch to Flexible mode to resolve SSL handshake issues
 */

class CloudflareSSLChanger {
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

    async changeSSLMode(mode = 'flexible') {
        console.log(`🔒 Changing Cloudflare SSL/TLS mode to: ${mode.toUpperCase()}\n`);

        try {
            const sslModes = {
                'off': 'off',
                'flexible': 'flexible', 
                'full': 'full',
                'strict': 'strict'
            };

            if (!sslModes[mode]) {
                throw new Error(`Invalid SSL mode: ${mode}. Valid modes: ${Object.keys(sslModes).join(', ')}`);
            }

            const response = await axios.patch(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/settings/ssl`,
                {
                    value: sslModes[mode]
                },
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                console.log(`✅ SSL/TLS mode changed to: ${mode.toUpperCase()}`);
                console.log(`📝 Description: ${this.getSSLDescription(mode)}`);
                console.log('\n⏳ Wait 2-5 minutes for changes to take effect...');
                console.log('🔍 Then test: https://tax4us.rensto.com');
                return true;
            } else {
                throw new Error('Failed to change SSL mode');
            }
        } catch (error) {
            console.error(`❌ Failed to change SSL mode:`, error.response?.data || error.message);
            return false;
        }
    }

    getSSLDescription(mode) {
        const descriptions = {
            'off': 'No encryption between visitor and Cloudflare, no encryption between Cloudflare and origin',
            'flexible': 'Encryption between visitor and Cloudflare, no encryption between Cloudflare and origin',
            'full': 'Encryption between visitor and Cloudflare, encryption between Cloudflare and origin (self-signed certs allowed)',
            'strict': 'Encryption between visitor and Cloudflare, encryption between Cloudflare and origin (valid certs required)'
        };
        return descriptions[mode] || 'Unknown mode';
    }

    async getCurrentSSLMode() {
        try {
            const response = await axios.get(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/settings/ssl`,
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                const currentMode = response.data.result.value;
                console.log(`📋 Current SSL/TLS mode: ${currentMode.toUpperCase()}`);
                console.log(`📝 Description: ${this.getSSLDescription(currentMode)}`);
                return currentMode;
            }
        } catch (error) {
            console.error('❌ Failed to get current SSL mode:', error.response?.data || error.message);
        }
        return null;
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const changer = new CloudflareSSLChanger();

    try {
        console.log('🔒 Cloudflare SSL/TLS Mode Changer\n');

        // Get current mode
        const currentMode = await changer.getCurrentSSLMode();
        console.log('');

        if (currentMode === 'flexible') {
            console.log('✅ SSL mode is already set to Flexible');
            console.log('🔍 Testing if this resolves the 525 error...');
            console.log('\n⏳ Wait a moment, then test: https://tax4us.rensto.com');
        } else {
            // Change to flexible mode
            const success = await changer.changeSSLMode('flexible');
            
            if (success) {
                console.log('\n🎯 Next steps:');
                console.log('1. Wait 2-5 minutes for SSL changes to propagate');
                console.log('2. Test: https://tax4us.rensto.com');
                console.log('3. If it works, the issue was SSL cipher compatibility');
                console.log('4. If it still fails, we may need to try a different approach');
            }
        }

    } catch (error) {
        console.error('❌ SSL mode change failed:', error.message);
        process.exit(1);
    }
}

main();
