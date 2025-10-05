#!/usr/bin/env node

/**
 * Restore All Lost n8n Credentials
 * This script restores all the credentials that were lost
 */

const credentials = [
  {
    name: "SerpAPI",
    id: "jxHMlk8kx412vnJs",
    type: "serpApi",
    data: {
      apiKey: "YOUR_SERPAPI_KEY_HERE"
    }
  },
  {
    name: "Slack API",
    id: "ktLP7QexI9Hpgz73",
    type: "slackApi",
    data: {
      accessToken: "YOUR_SLACK_ACCESS_TOKEN_HERE"
    }
  },
  {
    name: "Airtable API",
    id: "3lTwFd8waEI1UQEW",
    type: "airtableApi",
    data: {
      apiKey: "YOUR_AIRTABLE_API_KEY_HERE"
    }
  },
  {
    name: "Rollbar",
    id: "f2HfMrHSa8iJFb8b",
    type: "rollbarApi",
    data: {
      accessToken: "YOUR_ROLLBAR_ACCESS_TOKEN_HERE"
    }
  },
  {
    name: "RackNerd",
    id: "8XOSOQHJY8ZV3xLn",
    type: "httpHeaderAuth",
    data: {
      name: "Authorization",
      value: "Bearer YOUR_RACKNERD_API_KEY_HERE"
    }
  },
  {
    name: "eSignatures",
    id: "YqEfEMlde82yVVcy",
    type: "httpHeaderAuth",
    data: {
      name: "Authorization",
      value: "Bearer YOUR_ESIGNATURES_API_KEY_HERE"
    }
  },
  {
    name: "Webflow OAuth2 API",
    id: "R4avdBREB7saW2yG",
    type: "webflowOAuth2Api",
    data: {
      clientId: "YOUR_WEBFLOW_CLIENT_ID_HERE",
      clientSecret: "YOUR_WEBFLOW_CLIENT_SECRET_HERE",
      accessToken: "YOUR_WEBFLOW_ACCESS_TOKEN_HERE",
      refreshToken: "YOUR_WEBFLOW_REFRESH_TOKEN_HERE"
    }
  },
  {
    name: "Stripe API",
    id: "B9WHEOJGtVQ3KJdv",
    type: "stripeApi",
    data: {
      secretKey: "YOUR_STRIPE_SECRET_KEY_HERE"
    }
  },
  {
    name: "Typeform API",
    id: "formq6fOA2bXt5bF",
    type: "typeformApi",
    data: {
      accessToken: "YOUR_TYPEFORM_ACCESS_TOKEN_HERE"
    }
  },
  {
    name: "QuickBooks Online OAuth2 API",
    id: "d15JMAyxpZ1Lfm7e",
    type: "quickBooksOAuth2Api",
    data: {
      clientId: "ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f",
      clientSecret: "Cf2WeEhdIZLoJCKs60YrR17yMeqLJmth2WaSuK3j",
      accessToken: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..jSGyDz_OC013EmwCtqgTWw.R_yBtaHTWBcbFiMmJhQZehBK3nI1hxYg2pSFJ5Bw_wgRS7qLeqiosANbN1h49-QWHGiQuXju5cO-q9BIi5f1b6iKqbJaXJtAw17_F8QVM-clHg_5ywQ6YWI1EagjOBBR71ftPKT7fwtciNMlkWx8tTsHMMiMV-_EgP8JmryExrcsMBIMfA5_0bhTxUkc2mvAg6j_YKRCRPdvj3HosNxGU93eLqRkAxkz6n1Kzlh3OWNDSFwBdmDW0a36qfju3PHLzTbheFNl2DZrfyRwbEqXl-vZ2_kni7f4F9m88JmDYoPSczBuIxOxqaL7m5bh5CsAVAFD26UkeZwevrLF8TS35FwV694sY2fuWtGYRfpR1KzJ-Yrjs0CfQuRRSedjZ5pGFBVR5t46U-xA7ESg4N1CmzSp9OokUGpaeQcUEWmtfSn_DfggkcKLFCeXwEr-Iys_B6CJhMLNyw-eUrpeBQLcuIrGmUefwnCNfPkcaoISiVw.DRe-psDe1R_73xYpemFMbA",
      refreshToken: "RT1-227-H0-1767309586i782bk169l9srfm7jria",
      realmId: "9341454031329905"
    }
  },
  {
    name: "Facebook Graph API (App)",
    id: "56McxLVAx9PuY3gl",
    type: "facebookGraphApi",
    data: {
      accessToken: "YOUR_FACEBOOK_ACCESS_TOKEN_HERE"
    }
  },
  {
    name: "GitHub API",
    id: "WyNBmvWCKVPyjqro",
    type: "githubApi",
    data: {
      accessToken: "YOUR_GITHUB_ACCESS_TOKEN_HERE"
    }
  },
  {
    name: "HuggingFaceApi",
    id: "SwLtiGwfwrsGPYDQ",
    type: "huggingFaceApi",
    data: {
      apiKey: "YOUR_HUGGINGFACE_API_KEY_HERE"
    }
  },
  {
    name: "OpenAi",
    id: "Hd3fxt3JdAePKYJJ",
    type: "openAi",
    data: {
      apiKey: "YOUR_OPENAI_API_KEY_HERE"
    }
  },
  {
    name: "OpenRouter",
    id: "p2rBawf0dYiXgwzb",
    type: "httpHeaderAuth",
    data: {
      name: "Authorization",
      value: "Bearer YOUR_OPENROUTER_API_KEY_HERE"
    }
  },
  {
    name: "Zoho OAuth2 API",
    id: "wRVePO90xJlp2e9u",
    type: "zohoOAuth2Api",
    data: {
      clientId: "YOUR_ZOHO_CLIENT_ID_HERE",
      clientSecret: "YOUR_ZOHO_CLIENT_SECRET_HERE",
      accessToken: "YOUR_ZOHO_ACCESS_TOKEN_HERE",
      refreshToken: "YOUR_ZOHO_REFRESH_TOKEN_HERE"
    }
  },
  {
    name: "Microsoft Outlook OAuth2 API",
    id: "3a1hl1Tk0IkpDuOy",
    type: "microsoftOutlookOAuth2Api",
    data: {
      clientId: "YOUR_MICROSOFT_CLIENT_ID_HERE",
      clientSecret: "YOUR_MICROSOFT_CLIENT_SECRET_HERE",
      accessToken: "YOUR_MICROSOFT_ACCESS_TOKEN_HERE",
      refreshToken: "YOUR_MICROSOFT_REFRESH_TOKEN_HERE"
    }
  },
  {
    name: "Anthropic",
    id: "rRbcV7CsFW8k6uG8",
    type: "anthropicApi",
    data: {
      apiKey: "YOUR_ANTHROPIC_API_KEY_HERE"
    }
  },
  {
    name: "Apify API",
    id: "YAejSPPe9kH85mYN",
    type: "apifyApi",
    data: {
      apiToken: "YOUR_APIFY_API_TOKEN_HERE"
    }
  },
  {
    name: "ElevenLabs API",
    id: "CgCX9GgPA7qzDZZ0",
    type: "elevenLabsApi",
    data: {
      apiKey: "YOUR_ELEVENLABS_API_KEY_HERE"
    }
  },
  {
    name: "Telegram API",
    id: "bLHttNk6uvckgrcO",
    type: "telegramApi",
    data: {
      accessToken: "YOUR_TELEGRAM_BOT_TOKEN_HERE"
    }
  },
  {
    name: "Supabase API",
    id: "5bcb6YlPgGH6b5sg",
    type: "supabaseApi",
    data: {
      host: "YOUR_SUPABASE_HOST_HERE",
      serviceRole: "YOUR_SUPABASE_SERVICE_ROLE_HERE"
    }
  },
  {
    name: "Sentry.io API",
    id: "iVggZPneSJjNme4f",
    type: "sentryApi",
    data: {
      token: "YOUR_SENTRY_API_TOKEN_HERE"
    }
  },
  {
    name: "Tavily",
    id: "bA3URPqTVIB7lX5M",
    type: "tavilyApi",
    data: {
      apiKey: "YOUR_TAVILY_API_KEY_HERE"
    }
  },
  {
    name: "Perplexity.ai",
    id: "TuWKvKJ10l1MhdTT",
    type: "perplexityApi",
    data: {
      apiKey: "YOUR_PERPLEXITY_API_KEY_HERE"
    }
  },
  {
    name: "Linkedin",
    id: "tJCQNvfScwtKhEA0",
    type: "linkedInOAuth2Api",
    data: {
      clientId: "YOUR_LINKEDIN_CLIENT_ID_HERE",
      clientSecret: "YOUR_LINKEDIN_CLIENT_SECRET_HERE",
      accessToken: "YOUR_LINKEDIN_ACCESS_TOKEN_HERE",
      refreshToken: "YOUR_LINKEDIN_REFRESH_TOKEN_HERE"
    }
  },
  {
    name: "Gemini",
    id: "iQ84KVgBgSNxlcYD",
    type: "googleGeminiOAuth2Api",
    data: {
      clientId: "YOUR_GEMINI_CLIENT_ID_HERE",
      clientSecret: "YOUR_GEMINI_CLIENT_SECRET_HERE",
      accessToken: "YOUR_GEMINI_ACCESS_TOKEN_HERE",
      refreshToken: "YOUR_GEMINI_REFRESH_TOKEN_HERE"
    }
  },
  {
    name: "Firecrawl",
    id: "ZNwylTDDAKXSBhhB",
    type: "firecrawlApi",
    data: {
      apiKey: "YOUR_FIRECRAWL_API_KEY_HERE"
    }
  },
  {
    name: "Cloudflare API",
    id: "O6dQuoJsnRpKhu3j",
    type: "cloudflareApi",
    data: {
      apiToken: "YOUR_CLOUDFLARE_API_TOKEN_HERE"
    }
  },
  {
    name: "Notion",
    id: "oDlrA5ZGP1u5IfY2",
    type: "notionApi",
    data: {
      apiKey: "YOUR_NOTION_API_KEY_HERE"
    }
  },
  {
    name: "Tidycal",
    id: "iVmrQRk9XK9YZBBl",
    type: "tidycalApi",
    data: {
      apiKey: "YOUR_TIDYCAL_API_KEY_HERE"
    }
  },
  {
    name: "Airtop API",
    id: "4OZpzYSJPju2YfIv",
    type: "airtopApi",
    data: {
      apiKey: "YOUR_AIRTOP_API_KEY_HERE"
    }
  },
  {
    name: "Perplexity API",
    id: "mQhAC2oGpWeMF3rY",
    type: "perplexityApi",
    data: {
      apiKey: "YOUR_PERPLEXITY_API_KEY_HERE"
    }
  },
  {
    name: "Searxng API",
    id: "dArnWhcaQMIEsQxC",
    type: "searxngApi",
    data: {
      baseUrl: "YOUR_SEARXNG_BASE_URL_HERE",
      apiKey: "YOUR_SEARXNG_API_KEY_HERE"
    }
  },
  {
    name: "APITemplate.io API",
    id: "9MOlWvv0TiV03hWg",
    type: "apiTemplateApi",
    data: {
      apiKey: "YOUR_APITEMPLATE_API_KEY_HERE"
    }
  },
  {
    name: "Tavily API",
    id: "0DRdYB64V2mBGAiv",
    type: "tavilyApi",
    data: {
      apiKey: "YOUR_TAVILY_API_KEY_HERE"
    }
  }
];

console.log('🔧 N8N CREDENTIALS RESTORATION SCRIPT');
console.log('=====================================\n');

console.log(`📋 Found ${credentials.length} credentials to restore:`);
credentials.forEach((cred, index) => {
  console.log(`${index + 1}. ${cred.name} (ID: ${cred.id})`);
});

console.log('\n🎯 IMPORTANT NOTES:');
console.log('• This script creates the credential structure for n8n');
console.log('• You need to replace "YOUR_*_HERE" placeholders with actual API keys');
console.log('• QuickBooks credentials are already populated with your working tokens');
console.log('• Some credentials may need OAuth2 flow completion');

console.log('\n📝 CREDENTIALS TO UPDATE:');
console.log('1. Replace all "YOUR_*_HERE" placeholders with actual API keys');
console.log('2. Complete OAuth2 flows for services that require it');
console.log('3. Test each credential after restoration');

console.log('\n🚀 NEXT STEPS:');
console.log('1. Update this script with real API keys');
console.log('2. Run the n8n credential import process');
console.log('3. Test all restored credentials');
console.log('4. Clean up old workflows as needed');

// Export the credentials for easy import
const fs = require('fs');
const path = require('path');

const exportPath = path.join(__dirname, 'n8n-credentials-to-import.json');
fs.writeFileSync(exportPath, JSON.stringify(credentials, null, 2));

console.log(`\n✅ Credentials exported to: ${exportPath}`);
console.log('📋 Use this file to import credentials into n8n');

module.exports = credentials;
