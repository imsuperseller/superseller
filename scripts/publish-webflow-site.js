#!/usr/bin/env node

import axios from 'axios';

const CONFIG = {
    WEBFLOW_API_KEY: 'fd74dac2e8dc23c2e8047d7854be9e303afe85249301b14a91b657b36d1759ed',
    SITE_ID: '66c7e551a317e0e9c9f906d8',
    DOMAINS: ['rensto.com', 'www.rensto.com']
};

async function publishWebflowSite() {
    console.log('🚀 Publishing Webflow Site');
    console.log('==========================\n');

    try {
        // First, get the domains to get their IDs
        console.log('📋 Fetching domain information...');
        const domainsResponse = await axios.get(`https://api.webflow.com/v2/sites/${CONFIG.SITE_ID}/domains`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        console.log('✅ Domains found:');
        domainsResponse.data.domains.forEach(domain => {
            console.log(`   - ${domain.name} (ID: ${domain.id})`);
        });

        // Get domain IDs for the domains we want to publish
        const domainIds = domainsResponse.data.domains
            .filter(domain => CONFIG.DOMAINS.includes(domain.name))
            .map(domain => domain.id);

        if (domainIds.length === 0) {
            console.log('❌ No matching domains found for publishing');
            return;
        }

        console.log(`\n🎯 Publishing to domains: ${domainIds.join(', ')}`);

        // Publish the site
        const publishResponse = await axios.post(`https://api.webflow.com/v2/sites/${CONFIG.SITE_ID}/publish`, {
            domains: domainIds
        }, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'Accept': 'application/json',
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

        // Try alternative approach - direct publish without domain IDs
        console.log('\n🔄 Trying alternative publish method...');
        try {
            const simplePublishResponse = await axios.post(`https://api.webflow.com/v2/sites/${CONFIG.SITE_ID}/publish`, {}, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Site published successfully (simple method)!');
            console.log('📊 Publish details:', JSON.stringify(simplePublishResponse.data, null, 2));
        } catch (simpleError) {
            console.log('❌ Simple publish also failed:');
            if (simpleError.response) {
                console.log(`   Status: ${simpleError.response.status}`);
                console.log(`   Data: ${JSON.stringify(simpleError.response.data, null, 2)}`);
            }
        }
    }
}

publishWebflowSite();
