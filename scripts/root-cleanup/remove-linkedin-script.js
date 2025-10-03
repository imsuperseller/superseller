#!/usr/bin/env node

import axios from 'axios';

const WEBFLOW_CONFIG = {
    siteId: '66c7e551a317e0e9c9f906d8',
    apiKey: '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b',
    homepageId: '66c7e551a317e0e9c9f9073d'
};

async function removeLinkedInScript() {
    console.log('🔍 Checking for custom code on homepage...');
    
    try {
        // First, get current custom code on the page
        const getResponse = await axios.get(
            `https://api.webflow.com/v2/pages/${WEBFLOW_CONFIG.homepageId}/custom_code`,
            {
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('📋 Current custom code:', JSON.stringify(getResponse.data, null, 2));
        
        if (getResponse.data.scripts && getResponse.data.scripts.length > 0) {
            console.log('🗑️ Removing all custom code scripts from homepage...');
            
            // Remove all custom code from the page
            const deleteResponse = await axios.delete(
                `https://api.webflow.com/v2/pages/${WEBFLOW_CONFIG.homepageId}/custom_code`,
                {
                    headers: {
                        'Authorization': `Bearer ${WEBFLOW_CONFIG.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Successfully removed custom code from homepage');
            console.log('🌍 The LinkedIn verification script should no longer appear');
            
        } else {
            console.log('ℹ️ No custom code scripts found on homepage');
        }
        
    } catch (error) {
        console.error('❌ Error removing custom code:', error.response?.data || error.message);
    }
}

removeLinkedInScript();
