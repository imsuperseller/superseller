#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import axios from 'axios';

const CONFIG = {
    N8N_URL: 'http://173.254.201.134:5678',
    SERVICE_EMAIL: 'service@rensto.com',
    SERVICE_PASSWORD: 'Service123!'
};

// All the original credentials from your CSV
const ALL_CREDENTIALS = {
    'a1FbnZq8zYHCYUeK': {
        name: 'Home Assistant API',
        type: 'homeAssistantApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    '2xsUzGGwVhSw4Ivq': {
        name: 'Facebook Graph API (App)',
        type: 'facebookGraphApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'VJ7HOBTw0FthJ9eq': {
        name: 'MongoDB',
        type: 'mongoDb',
        data: {
            // Will need to be configured with actual values
        }
    },
    'huBYp4d6CEnIiqI3': {
        name: 'Rollbar',
        type: 'httpHeaderAuth',
        data: {
            // Will need to be configured with actual values
        }
    },
    'dx3VMhzp86kI6jYo': {
        name: 'eSignatures',
        type: 'httpHeaderAuth',
        data: {
            // Will need to be configured with actual values
        }
    },
    'P86mF2xQYdzPdcJa': {
        name: 'hyperise',
        type: 'httpHeaderAuth',
        data: {
            // Will need to be configured with actual values
        }
    },
    '8tMhZyf61E7WOToe': {
        name: 'RackNerd',
        type: 'ssh',
        data: {
            // Will need to be configured with actual values
        }
    },
    'T3cDMFPGa0YUPBLk': {
        name: 'SerpAPI',
        type: 'serpApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'DplgDU4nURvfy8Qb': {
        name: 'Slack OAuth2 API',
        type: 'slackOAuth2Api',
        data: {
            // Will need to be configured with actual values
        }
    },
    'tilk3s6sK9ATRt9r': {
        name: 'Airtable Personal Access Token API',
        type: 'airtableApi',
        data: {
            apiKey: 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12',
            baseUrl: 'https://api.airtable.com/v0'
        }
    },
    'Lv9VVBfeJsuZQ0B3': {
        name: 'Webflow OAuth2 API',
        type: 'webflowOAuth2Api',
        data: {
            // Will need to be configured with actual values
        }
    },
    '9O8piUXp589yofJc': {
        name: 'Stripe API',
        type: 'stripeApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'qkyDU8hoQOG0JxO8': {
        name: 'Typeform API',
        type: 'typeformApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'kfHhz8EaVCEIcbu0': {
        name: 'QuickBooks Online OAuth2 API',
        type: 'quickbooksOAuth2Api',
        data: {
            accessToken: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..5QL-SDn2oXHncdY790ZqTA.I4BGF4zlq-N7wOps0l2bXSX8GOb3PyEBbK0l3ybYoxd2PBaJ31VNxulKwxbEmiyxwh5k25uLqEbvQ1aB6CL2OYCcGwycu5y9cN49Xcz4D2r_SFM_IoQQQIew4ZhDsPd7YiQL_FLvAZxP8r3xqnLjXjRZb0BzN-hzc0t5TQtAkpx06Cv7gzWBBpUZPtAdMqU6HSQ73KxqeF4pytys2GvylM7t4Wrid64l_UNYF0EjgbFX46Y7PevnCKJIz57VYOkkEyWXhlmorfaSmP76xvYOkwX7SjV0ioatG0sBRKoZwnfOpS4vSzum5PznXfCh7r1cMtLfn2m7ekFhXeYQc9ryisca0WcBd7aEcmX4bc358Si7kh4KK0A0OQ-vbNeUAoog9vjqyUJkZbcc2kudKKvZsbNKOEOuq_JO60CZ5BGzh-9atzMuCxMbESaaXsEuCjhbtrwJ1AT87Ndy-tvQeyjB_OLb9fAWM2PfXAScWmEzjLU.u2MF_nM43EYENtixLI-s1g',
            refreshToken: 'RT1-159-H0-1764490772g7tbw7f7ioiemp2wodfx',
            realmId: '9341454031329905',
            clientId: 'ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f',
            clientSecret: 'Cf2WeEhdIZLoJCKs60YrR17yMeqLJmth2WaSuK3j'
        }
    },
    '8CiYBKzWyePJydX8': {
        name: 'GitHub API',
        type: 'githubApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'VPqW9GBtqeLVRVw7': {
        name: 'HuggingFaceApi',
        type: 'huggingFaceApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    '0sXFXYfqiDEKuDcN': {
        name: 'OpenAi',
        type: 'openAi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'XorqqpNVvabnf8Ko': {
        name: 'OpenRouter',
        type: 'openRouterApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'CNuOTZrvwNFkjv7U': {
        name: 'Zoho OAuth2 API',
        type: 'zohoOAuth2Api',
        data: {
            // Will need to be configured with actual values
        }
    },
    'cG7UVwSbYjSYBg4P': {
        name: 'Microsoft Outlook OAuth2 API',
        type: 'microsoftOutlookOAuth2Api',
        data: {
            // Will need to be configured with actual values
        }
    },
    'bOftv5dScq3IjYQQ': {
        name: 'Anthropic',
        type: 'anthropicApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'lJiKppXwpskAZIOW': {
        name: 'Apify API',
        type: 'apifyApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'yEEqLVMzOlo1L0xI': {
        name: 'ElevenLabs API',
        type: 'elevenLabsApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    '0WW3IfTfTah5WAnl': {
        name: 'Telegram API',
        type: 'telegramApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'j9Xh65SA8QyOJGO1': {
        name: 'Supabase API',
        type: 'supabaseApi',
        data: {
            // Will need to be configured with actual values
        }
    },
    'bRGk4WYQWeUUtviR': {
        name: 'Sentry.io API',
        type: 'sentryApi',
        data: {
            // Will need to be configured with actual values
        }
    }
};

async function login() {
    console.log('🔐 Logging in...');

    try {
        const response = await axios.post(
            `${CONFIG.N8N_URL}/rest/login`,
            {
                emailOrLdapLoginId: CONFIG.SERVICE_EMAIL,
                password: CONFIG.SERVICE_PASSWORD
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Login successful');
        const setCookieHeader = response.headers['set-cookie'];
        const sessionCookie = setCookieHeader?.find(cookie => cookie.startsWith('n8n-auth='));
        return { sessionId: sessionCookie };
    } catch (error) {
        console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

async function createAllCredentials(sessionId) {
    console.log('🔑 Creating ALL Rensto credentials...');

    let successCount = 0;
    let failCount = 0;

    for (const [credId, credential] of Object.entries(ALL_CREDENTIALS)) {
        try {
            const response = await axios.post(
                `${CONFIG.N8N_URL}/rest/credentials`,
                credential,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': sessionId
                    }
                }
            );

            console.log(`✅ Created ${credential.name} (${credId}): ${response.data.id}`);
            successCount++;
        } catch (error) {
            console.log(`❌ Failed to create ${credential.name} (${credId}): ${error.response?.data?.message || error.message}`);
            failCount++;
        }
    }

    console.log(`\n📊 Summary: ${successCount} created, ${failCount} failed`);
}

async function main() {
    console.log('🚀 Starting complete credentials restoration...');

    try {
        const loginResult = await login();
        if (!loginResult) {
            console.log('❌ Cannot proceed without login');
            return;
        }

        await createAllCredentials(loginResult.sessionId);

        console.log('✅ Complete credentials restoration finished!');
        console.log(`🌐 Access n8n at: ${CONFIG.N8N_URL}`);
        console.log(`📧 Email: ${CONFIG.SERVICE_EMAIL}`);
        console.log(`🔑 Password: ${CONFIG.SERVICE_PASSWORD}`);
    } catch (error) {
        console.log(`❌ Restoration failed: ${error.message}`);
    }
}

main();
