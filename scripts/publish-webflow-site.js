#!/usr/bin/env node

import axios from 'axios';

const CONFIG = {
    // Using Site API Token (v1) - from mcp.json
    WEBFLOW_API_KEY: process.env.WEBFLOW_API_TOKEN || '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b',
    SITE_ID: '66c7e551a317e0e9c9f906d8',
    DOMAINS: ['rensto.com', 'www.rensto.com']
};

async function publishWebflowSite() {
    console.log('🚀 Publishing Webflow Site');
    console.log('==========================\n');

    try {
        // Use v1 API for publishing (more reliable with Site API token)
        console.log('📋 Fetching domain information (v1 API)...');
        const domainsResponse = await axios.get(`https://api.webflow.com/sites/${CONFIG.SITE_ID}/domains`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'accept-version': '1.0.0'
            }
        });

        console.log('✅ Domains found:');
        const domainNames = domainsResponse.data.map(domain => domain.name);
        domainNames.forEach(name => {
            console.log(`   - ${name}`);
        });

        // Get domain names for the domains we want to publish
        const domainsToPublish = domainNames.filter(name => CONFIG.DOMAINS.includes(name));

        if (domainsToPublish.length === 0) {
            console.log('⚠️  No matching domains found, publishing to all domains');
            domainsToPublish.push(...domainNames);
        }

        console.log(`\n🎯 Publishing to domains: ${domainsToPublish.join(', ')}`);

        // Publish the site using v1 API
        const publishResponse = await axios.post(`https://api.webflow.com/sites/${CONFIG.SITE_ID}/publish`, {
            domains: domainsToPublish
        }, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'accept-version': '1.0.0',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Site published successfully!');
        console.log('📊 Publish details:', JSON.stringify(publishResponse.data, null, 2));

        console.log('\n🎯 Next Steps:');
        console.log('1. Wait 2-5 minutes for changes to propagate');
        console.log('2. Test the site: https://rensto.com');
        console.log('3. Add legal page content in Webflow Designer');
        console.log('4. Publish again after adding content');

    } catch (error) {
        console.log('❌ Error publishing site:');
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.log(`   Message: ${error.message}`);
        }

        // Try alternative: Use direct publish with domain names from config
        console.log('\n🔄 Trying alternative publish method (using configured domains)...');
        try {
            const simplePublishResponse = await axios.post(`https://api.webflow.com/sites/${CONFIG.SITE_ID}/publish`, {
                domains: CONFIG.DOMAINS
            }, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                    'accept-version': '1.0.0',
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Site published successfully (using configured domains)!');
            console.log('📊 Publish details:', JSON.stringify(simplePublishResponse.data, null, 2));
        } catch (simpleError) {
            console.log('❌ Alternative publish also failed:');
            if (simpleError.response) {
                console.log(`   Status: ${simpleError.response.status}`);
                console.log(`   Data: ${JSON.stringify(simpleError.response.data, null, 2)}`);
            }
        }
    }
}

publishWebflowSite();
