import https from 'https';

// Cloudflare API configuration
const CLOUDFLARE_API_TOKEN = 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2';
const ZONE_ID = '031333b77c859d1dd4d4fd4afdc1b9bc';
const NEW_DEPLOYMENT = 'rensto-business-system-i85wtoy8b-shais-projects-f9b9e359.vercel.app';

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

async function updateDNSRecord() {
  try {
    console.log('🔧 Updating DNS record to new deployment...');
    
    // Get current DNS record
    const dnsResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records?name=tax4us.rensto.com`);
    
    if (dnsResponse.result && dnsResponse.result.length > 0) {
      const record = dnsResponse.result[0];
      
      // Update the record to point to the new deployment
      const updateData = {
        type: 'CNAME',
        name: 'tax4us',
        content: NEW_DEPLOYMENT,
        proxied: true,
        ttl: 1
      };
      
      console.log(`✅ Updating record ${record.id} to point to ${NEW_DEPLOYMENT}`);
      const updateResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records/${record.id}`, 'PUT', updateData);
      console.log('Update response:', JSON.stringify(updateResponse, null, 2));
      
    } else {
      console.log('❌ No DNS record found for tax4us.rensto.com');
    }
    
  } catch (error) {
    console.error('Error updating DNS record:', error);
  }
}

async function main() {
  console.log('🚀 DNS Update to New Deployment');
  console.log('================================');
  
  await updateDNSRecord();
  
  console.log('\n✅ Done! Please wait a few minutes for DNS propagation and check https://tax4us.rensto.com again.');
}

main().catch(console.error);
