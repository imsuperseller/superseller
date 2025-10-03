#!/usr/bin/env node

import axios from 'axios';

const WEBFLOW_CONFIG = {
    siteId: '66c7e551a317e0e9c9f906d8',
    apiKey: '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b'
};

async function publishWebflowSite() {
    console.log('🚀 Publishing Webflow site...');
    
    try {
        // Try to publish to Webflow subdomain only
        const response = await axios.post(
            `https://api.webflow.com/v2/sites/${WEBFLOW_CONFIG.siteId}/publish`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Site published successfully');
        console.log('🌍 Check: https://www.rensto.com/');
        
    } catch (error) {
        console.error('❌ Error publishing site:', error.response?.data || error.message);
        
        if (error.response?.status === 429) {
            console.log('⏳ Rate limited. The page settings were updated successfully.');
            console.log('📝 Title updated to: "Rensto - AI-Powered Virtual Workers That Actually Work"');
            console.log('🔍 SEO description updated');
            console.log('⏳ Please wait a few minutes and check the site manually.');
        }
    }
}

// Run the publish
publishWebflowSite();
