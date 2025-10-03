#!/usr/bin/env node

import axios from 'axios';

const WEBFLOW_CONFIG = {
    siteId: '66c7e551a317e0e9c9f906d8',
    apiKey: '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b',
    homepageId: '66c7e551a317e0e9c9f9073d'
};

async function overrideLinkedInContent() {
    console.log('🎯 Attempting to override LinkedIn verification content...');
    
    try {
        // Try to add content to the page that will override the LinkedIn script
        const contentUpdate = {
            nodes: [
                {
                    nodeId: "9924c011-27f7-7add-46d2-f49325a28a72",
                    text: `
                        <div class="rensto-homepage-override" style="
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: #110d28;
                            color: #fffff3;
                            z-index: 9999;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            font-family: 'Outfit', sans-serif;
                            padding: 2rem;
                            box-sizing: border-box;
                        ">
                            <div style="max-width: 1200px; text-align: center;">
                                <h1 style="
                                    font-size: 3.5rem;
                                    font-weight: 700;
                                    margin-bottom: 1rem;
                                    background: linear-gradient(135deg, #fe3d51 0%, #bf5700 100%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                ">AI-Powered Virtual Workers That Actually Work</h1>
                                
                                <p style="
                                    font-size: 1.5rem;
                                    margin-bottom: 2rem;
                                    color: #b0bec5;
                                    line-height: 1.6;
                                ">Because Your Employees Are Tired of Explaining Why They Can't Read Your Mind at 3 AM</p>
                                
                                <p style="
                                    font-size: 1.1rem;
                                    margin-bottom: 3rem;
                                    color: #b0bec5;
                                    line-height: 1.8;
                                    max-width: 800px;
                                    margin-left: auto;
                                    margin-right: auto;
                                ">Listen up, business owners. We know your daily struggle - the endless meetings about meetings, the constant battle with "efficiency experts" who've never actually run a business, and the pressure to "innovate" when you just want to get shit done.</p>
                                
                                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                                    <a href="/virtual-workers" style="
                                        background: linear-gradient(135deg, #fe3d51 0%, #bf5700 100%);
                                        color: white;
                                        padding: 1rem 2rem;
                                        border-radius: 8px;
                                        text-decoration: none;
                                        font-weight: 600;
                                        font-size: 1.1rem;
                                        transition: transform 0.3s ease;
                                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Explore Virtual Workers</a>
                                    
                                    <a href="/contact" style="
                                        background: transparent;
                                        color: #1eaef7;
                                        padding: 1rem 2rem;
                                        border: 2px solid #1eaef7;
                                        border-radius: 8px;
                                        text-decoration: none;
                                        font-weight: 600;
                                        font-size: 1.1rem;
                                        transition: all 0.3s ease;
                                    " onmouseover="this.style.background='#1eaef7'; this.style.color='#110d28'" onmouseout="this.style.background='transparent'; this.style.color='#1eaef7'">Get Started</a>
                                </div>
                            </div>
                        </div>
                        
                        <script>
                            // Override LinkedIn verification content
                            document.addEventListener('DOMContentLoaded', function() {
                                // Hide any LinkedIn verification content
                                const linkedinContent = document.querySelector('[data-wf-page="68be54083509cbbfa529845a"]');
                                if (linkedinContent) {
                                    linkedinContent.style.display = 'none';
                                }
                                
                                // Remove LinkedIn verification script if it loads
                                const observer = new MutationObserver(function(mutations) {
                                    mutations.forEach(function(mutation) {
                                        mutation.addedNodes.forEach(function(node) {
                                            if (node.nodeType === 1 && node.textContent && node.textContent.includes('LinkedIn App Verification')) {
                                                node.style.display = 'none';
                                            }
                                        });
                                    });
                                });
                                
                                observer.observe(document.body, {
                                    childList: true,
                                    subtree: true
                                });
                            });
                        </script>
                    `
                }
            ]
        };
        
        const response = await axios.put(
            `https://api.webflow.com/v2/pages/${WEBFLOW_CONFIG.homepageId}/static_content`,
            contentUpdate,
            {
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Successfully added homepage content override');
        console.log('🌍 The LinkedIn verification content should now be hidden');
        console.log('📱 Check: https://www.rensto.com/');
        
    } catch (error) {
        console.error('❌ Error adding content override:', error.response?.data || error.message);
        
        if (error.response?.data?.message?.includes('localeId')) {
            console.log('💡 Trying with locale ID...');
            // Try with locale ID
            try {
                const contentUpdateWithLocale = {
                    localeId: "685de5af16ac6756ecafbb37",
                    nodes: [
                        {
                            nodeId: "9924c011-27f7-7add-46d2-f49325a28a72",
                            text: `<div style="display: none;">LinkedIn verification content hidden</div>`
                        }
                    ]
                };
                
                const response = await axios.put(
                    `https://api.webflow.com/v2/pages/${WEBFLOW_CONFIG.homepageId}/static_content`,
                    contentUpdateWithLocale,
                    {
                        headers: {
                            'Authorization': `Bearer ${WEBFLOW_CONFIG.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log('✅ Successfully added content with locale ID');
                
            } catch (localeError) {
                console.error('❌ Error with locale ID:', localeError.response?.data || localeError.message);
            }
        }
    }
}

overrideLinkedInContent();
