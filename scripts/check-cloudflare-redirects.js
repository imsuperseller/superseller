const https = require('https');

// Cloudflare API configuration
const CLOUDFLARE_API_TOKEN = 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2';
const ZONE_ID = 'your-zone-id'; // We'll need to get this

async function makeCloudflareRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function checkRedirectRules() {
  try {
    console.log('🔍 Checking Cloudflare redirect rules...');
    
    // First, get the zone ID for rensto.com
    const zonesResponse = await makeCloudflareRequest('/client/v4/zones?name=rensto.com');
    console.log('Zones response:', JSON.stringify(zonesResponse, null, 2));
    
    if (zonesResponse.result && zonesResponse.result.length > 0) {
      const zoneId = zonesResponse.result[0].id;
      console.log(`✅ Found zone ID: ${zoneId}`);
      
      // Check for redirect rules
      const redirectsResponse = await makeCloudflareRequest(`/client/v4/zones/${zoneId}/rulesets`);
      console.log('Redirect rules:', JSON.stringify(redirectsResponse, null, 2));
      
      // Check for page rules
      const pageRulesResponse = await makeCloudflareRequest(`/client/v4/zones/${zoneId}/pagerules`);
      console.log('Page rules:', JSON.stringify(pageRulesResponse, null, 2));
      
    } else {
      console.log('❌ Zone not found');
    }
    
  } catch (error) {
    console.error('Error checking redirect rules:', error);
  }
}

async function removeRedirectRules() {
  try {
    console.log('🗑️ Removing problematic redirect rules...');
    
    // Get zone ID
    const zonesResponse = await makeCloudflareRequest('/client/v4/zones?name=rensto.com');
    
    if (zonesResponse.result && zonesResponse.result.length > 0) {
      const zoneId = zonesResponse.result[0].id;
      
      // Get page rules
      const pageRulesResponse = await makeCloudflareRequest(`/client/v4/zones/${zoneId}/pagerules`);
      
      if (pageRulesResponse.result) {
        for (const rule of pageRulesResponse.result) {
          if (rule.targets && rule.targets.some(target => 
            target.constraint.value.includes('tax4us.rensto.com'))) {
            console.log(`🗑️ Removing page rule: ${rule.id}`);
            await makeCloudflareRequest(`/client/v4/zones/${zoneId}/pagerules/${rule.id}`, 'DELETE');
          }
        }
      }
      
      // Get redirect rules
      const redirectsResponse = await makeCloudflareRequest(`/client/v4/zones/${zoneId}/rulesets`);
      
      if (redirectsResponse.result) {
        for (const ruleset of redirectsResponse.result) {
          if (ruleset.rules && ruleset.rules.some(rule => 
            rule.expression.includes('tax4us.rensto.com'))) {
            console.log(`🗑️ Removing redirect ruleset: ${ruleset.id}`);
            await makeCloudflareRequest(`/client/v4/zones/${zoneId}/rulesets/${ruleset.id}`, 'DELETE');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error removing redirect rules:', error);
  }
}

async function main() {
  console.log('🚀 Cloudflare Redirect Checker');
  console.log('==============================');
  
  await checkRedirectRules();
  console.log('\n');
  await removeRedirectRules();
  
  console.log('\n✅ Done! Please check https://tax4us.rensto.com again.');
}

main().catch(console.error);
