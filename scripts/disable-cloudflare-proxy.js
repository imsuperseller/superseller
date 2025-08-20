import https from 'https';

// Cloudflare API configuration
const CLOUDFLARE_API_TOKEN = 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2';
const ZONE_ID = '031333b77c859d1dd4d4fd4afdc1b9bc';

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

async function disableCloudflareProxy() {
  try {
    console.log('🔧 Temporarily disabling Cloudflare proxy for tax4us.rensto.com...');
    
    // Get current DNS record
    const dnsResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records?name=tax4us.rensto.com`);
    
    if (dnsResponse.result && dnsResponse.result.length > 0) {
      const record = dnsResponse.result[0];
      
      // Update the record to disable proxy
      const updateData = {
        type: 'CNAME',
        name: 'tax4us',
        content: record.content,
        proxied: false, // Disable proxy
        ttl: 1
      };
      
      console.log(`✅ Disabling proxy for record ${record.id}`);
      const updateResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records/${record.id}`, 'PUT', updateData);
      console.log('Update response:', JSON.stringify(updateResponse, null, 2));
      
    } else {
      console.log('❌ No DNS record found for tax4us.rensto.com');
    }
    
  } catch (error) {
    console.error('Error disabling Cloudflare proxy:', error);
  }
}

async function main() {
  console.log('🚀 Disable Cloudflare Proxy');
  console.log('============================');
  
  await disableCloudflareProxy();
  
  console.log('\n✅ Done! Please wait a few minutes for DNS propagation and check https://tax4us.rensto.com again.');
  console.log('⚠️  Note: This disables Cloudflare protection temporarily. Re-enable when working.');
}

main().catch(console.error);
