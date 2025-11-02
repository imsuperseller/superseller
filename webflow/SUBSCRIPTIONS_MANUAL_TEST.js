/**
 * Manual Test Script for Subscriptions Checkout
 * Run this in browser console to debug the checkout issue
 */

// Step 1: Check button data attributes
console.log('🔍 Step 1: Checking button data attributes...');
const buttons = document.querySelectorAll('.pricing-button, .subscription-button');
buttons.forEach((btn, i) => {
  console.log(`Button ${i+1}:`, {
    flowType: btn.getAttribute('data-flow-type'),
    tier: btn.getAttribute('data-tier'),
    subscriptionType: btn.getAttribute('data-subscription-type'),
    price: btn.getAttribute('data-price'),
    pageType: btn.getAttribute('data-page-type'),
    href: btn.getAttribute('href')
  });
});

// Step 2: Test API call directly
console.log('\n🧪 Step 2: Testing API call directly...');
async function testAPICall() {
  const btn = document.querySelector('.pricing-button');
  if (!btn) {
    console.error('❌ No button found');
    return;
  }
  
  const payload = {
    flowType: btn.getAttribute('data-flow-type') || 'subscription',
    tier: btn.getAttribute('data-tier') || 'starter',
    subscriptionType: btn.getAttribute('data-subscription-type') || 'lead-gen',
    pageType: btn.getAttribute('data-page-type') || 'subscriptions'
  };
  
  console.log('📤 Sending request:', payload);
  
  try {
    const response = await fetch('https://api.rensto.com/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (data.success && data.url) {
      console.log('✅ SUCCESS! Checkout URL:', data.url);
      // Uncomment to actually redirect:
      // window.location.href = data.url;
    } else {
      console.error('❌ API Error:', data.error || data);
    }
  } catch(err) {
    console.error('❌ Network Error:', err);
  }
}

// Step 3: Check if click handlers are attached
console.log('\n🔍 Step 3: Checking click handlers...');
const testBtn = document.querySelector('.pricing-button');
if (testBtn) {
  console.log('Has onclick:', !!testBtn.onclick);
  console.log('Has addEventListener listeners:', testBtn.addEventListener.toString().includes('native'));
  
  // Try to see what happens on click
  console.log('Click the button manually to see what happens...');
}

// Run API test
testAPICall();

