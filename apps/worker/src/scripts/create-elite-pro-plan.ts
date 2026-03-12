/**
 * One-off script: Create PayPal subscription plan for Elite Pro Remodeling ($2,000/month)
 * Run: npx tsx apps/worker/src/scripts/create-elite-pro-plan.ts
 */

// Credentials removed after plan creation — were provided inline for one-off execution
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_PRODUCT_ID = 'PROD-4W993698BV951770E';
const PAYPAL_API_BASE = 'https://api-m.paypal.com';

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function createPlan(): Promise<void> {
  const token = await getAccessToken();
  console.log('Authenticated with PayPal (live)');

  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      product_id: PAYPAL_PRODUCT_ID,
      name: 'Elite Pro Remodeling — Monthly',
      description: 'Elite Pro Remodeling monthly subscription at $2,000/mo',
      billing_cycles: [{
        frequency: { interval_unit: 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
          fixed_price: {
            value: '2000.00',
            currency_code: 'USD',
          },
        },
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create plan failed: ${res.status} ${text}`);
  }

  const plan = await res.json();
  console.log('\n=== PLAN CREATED ===');
  console.log(`Plan ID: ${plan.id}`);
  console.log(`Name: ${plan.name}`);
  console.log(`Status: ${plan.status}`);
  console.log(`Product ID: ${plan.product_id}`);
  console.log('====================\n');
}

createPlan().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
