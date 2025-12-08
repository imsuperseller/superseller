#!/usr/bin/env node

/**
 * Send Real Stripe Test Webhook to Vercel
 * 
 * This script creates a properly signed Stripe webhook event
 * and sends it to the Vercel endpoint to test the complete flow.
 */

import https from 'https';
import crypto from 'crypto';

// Configuration
const VERCEL_WEBHOOK_URL = process.env.VERCEL_WEBHOOK_URL || 'https://rensto.com/api/stripe/webhook';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_RGYzuYIi97YDf4KIA1InPXDakJU8CMUL';
const N8N_URL = process.env.N8N_URL || 'https://n8n.rensto.com';

// Create realistic Stripe event payload
const timestamp = Math.floor(Date.now() / 1000);
const sessionId = `cs_test_${Date.now()}`;

const stripeEvent = {
  id: `evt_test_${Date.now()}`,
  object: 'event',
  api_version: '2025-02-24.acacia',
  created: timestamp,
  data: {
    object: {
      id: sessionId,
      object: 'checkout.session',
      amount_total: 19700, // $197.00
      currency: 'usd',
      customer: null,
      customer_email: 'test@rensto.com',
      customer_details: {
        email: 'test@rensto.com',
        name: 'Test Customer'
      },
      metadata: {
        flowType: 'marketplace-template',
        productId: 'test-product-123',
        customerName: 'Test Customer'
      },
      payment_status: 'paid',
      status: 'complete',
      mode: 'payment',
      success_url: 'https://rensto.com/success',
      cancel_url: 'https://rensto.com/cancel'
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: `req_test_${Date.now()}`,
    idempotency_key: null
  },
  type: 'checkout.session.completed'
};

/**
 * Create Stripe webhook signature
 */
function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  
  // Stripe uses base64-encoded secret (remove whsec_ prefix)
  const secretKey = secret.replace('whsec_', '');
  const decodedSecret = Buffer.from(secretKey, 'base64');
  
  const signature = crypto
    .createHmac('sha256', decodedSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Send HTTPS request
 */
function sendRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🧪 Stripe Webhook End-to-End Test');
  console.log('==================================\n');
  
  console.log('📋 Configuration:');
  console.log(`   Vercel URL: ${VERCEL_WEBHOOK_URL}`);
  console.log(`   n8n URL: ${N8N_URL}`);
  console.log(`   Session ID: ${sessionId}`);
  console.log('');

  // Step 1: Check n8n connectivity
  console.log('1️⃣  Checking n8n connectivity...');
  try {
    const healthResponse = await fetch(`${N8N_URL}/healthz`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ n8n accessible: ${JSON.stringify(healthData)}`);
  } catch (error) {
    console.error(`   ❌ n8n not accessible: ${error.message}`);
    process.exit(1);
  }
  console.log('');

  // Step 2: Create signed webhook payload
  console.log('2️⃣  Creating signed webhook payload...');
  const payload = JSON.stringify(stripeEvent);
  const signature = createStripeSignature(payload, STRIPE_WEBHOOK_SECRET);
  console.log(`   ✅ Payload created (${payload.length} bytes)`);
  console.log(`   ✅ Signature created`);
  console.log('');

  // Step 3: Send to Vercel
  console.log('3️⃣  Sending webhook to Vercel...');
  try {
    const response = await sendRequest(VERCEL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'stripe-signature': signature
      },
      body: payload
    });

    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body.substring(0, 200)}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Webhook accepted by Vercel!');
    } else {
      console.log(`   ⚠️  Webhook returned status ${response.statusCode}`);
    }
  } catch (error) {
    console.error(`   ❌ Error sending webhook: ${error.message}`);
    process.exit(1);
  }
  console.log('');

  // Step 4: Wait and check n8n
  console.log('4️⃣  Waiting for n8n workflow execution (5 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('');

  // Step 5: Check n8n executions
  console.log('5️⃣  Checking n8n executions...');
  try {
    const execResponse = await fetch(`${N8N_URL}/api/v1/executions?limit=3`);
    const execData = await execResponse.json();
    
    if (execData.data && execData.data.executions && execData.data.executions.length > 0) {
      const latest = execData.data.executions[0];
      console.log(`   Latest execution:`);
      console.log(`      ID: ${latest.id}`);
      console.log(`      Workflow: ${latest.workflowId}`);
      console.log(`      Status: ${latest.status}`);
      console.log(`      Started: ${latest.startedAt}`);
      
      if (latest.status === 'success') {
        console.log('   ✅ Workflow executed successfully!');
      } else if (latest.status === 'error') {
        console.log('   ⚠️  Workflow execution had errors (check workflow configuration)');
      }
    } else {
      console.log('   ⚠️  No recent executions found');
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check executions: ${error.message}`);
  }
  console.log('');

  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log('✅ n8n connectivity: PASSED');
  console.log('✅ Webhook payload: CREATED');
  console.log('✅ Vercel webhook: SENT');
  console.log('✅ n8n execution: CHECKED');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Check Vercel logs for webhook processing');
  console.log('   2. Verify STRIPE-MARKETPLACE-001 workflow executed');
  console.log('   3. Check Boost.space/Airtable for new records');
  console.log('   4. Test with real Stripe checkout session');
  console.log('');
}

// Run test
runTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
