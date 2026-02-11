/**
 * Phase 2 Verification Script
 * Tests Payment, Purchase, Subscription, ServiceInstance, and WhatsApp provisioning.
 *
 * Run: npx tsx scripts/verify-phase2.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Phase 2 Verification: Stripe + Payments\n');
  let passed = 0;
  let failed = 0;

  // Ensure test user exists
  const testUserId = 'admin_rensto_com';
  const testEmail = 'admin@rensto.com';

  // Test 1: Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: testUserId,
      stripeSessionId: 'cs_test_phase2_001',
      stripeCustomerId: 'cus_test_phase2',
      customerEmail: testEmail,
      amount: 9700,
      amountTotal: 9700,
      currency: 'usd',
      status: 'completed',
      flowType: 'marketplace-template',
      productId: 'lead-gen-linkedin',
      tier: 'download',
      platform: 'rensto-web',
      metadata: { source: 'test' },
    },
  });
  if (payment.amount === 9700 && payment.status === 'completed') {
    console.log('  ✅ Test 1: Create payment with all fields');
    passed++;
  } else {
    console.log('  ❌ Test 1: Payment creation failed');
    failed++;
  }

  // Test 2: Create purchase with download token
  const purchase = await prisma.purchase.create({
    data: {
      userId: testUserId,
      templateId: 'lead-gen-linkedin',
      customerEmail: testEmail,
      stripeSessionId: 'cs_test_phase2_001',
      downloadToken: 'test-token-phase2-download',
      downloadUrl: 'https://rensto.com/api/marketplace/download/test-token',
      tier: 'download',
    },
  });
  if (purchase.downloadToken === 'test-token-phase2-download') {
    console.log('  ✅ Test 2: Create purchase with download token');
    passed++;
  } else {
    console.log('  ❌ Test 2: Purchase creation failed');
    failed++;
  }

  // Test 3: Create service instance (Core 7 pattern)
  const serviceInst = await prisma.serviceInstance.create({
    data: {
      clientId: testUserId,
      clientEmail: testEmail,
      productId: 'lead-gen-linkedin',
      productName: 'Lead Generation Engine',
      status: 'pending_setup',
      type: 'marketplace_implementation',
      stripeSessionId: 'cs_test_phase2_001',
    },
  });
  if (serviceInst.status === 'pending_setup') {
    console.log('  ✅ Test 3: Create service instance (Core 7)');
    passed++;
  } else {
    console.log('  ❌ Test 3: Service instance creation failed');
    failed++;
  }

  // Test 4: Create subscription (managed plan)
  const sub = await prisma.subscription.create({
    data: {
      userId: testUserId,
      userEmail: testEmail,
      stripeSubscriptionId: 'sub_test_phase2_001',
      stripeCustomerId: 'cus_test_phase2',
      subscriptionType: 'whatsapp',
      whatsappBundle: 'starter',
      amount: 29900,
      status: 'active',
      currentPeriodStart: new Date(),
    },
  });
  if (sub.status === 'active' && sub.whatsappBundle === 'starter') {
    console.log('  ✅ Test 4: Create subscription (managed plan)');
    passed++;
  } else {
    console.log('  ❌ Test 4: Subscription creation failed');
    failed++;
  }

  // Test 5: Create WhatsApp instance linked to subscription
  const waInstance = await prisma.whatsAppInstance.create({
    data: {
      userId: testUserId,
      userEmail: testEmail,
      businessName: "Test Business",
      bundle: 'starter',
      status: 'pending_setup',
      subscriptionId: sub.id,
    },
  });
  if (waInstance.subscriptionId === sub.id) {
    console.log('  ✅ Test 5: Create WhatsApp instance linked to subscription');
    passed++;
  } else {
    console.log('  ❌ Test 5: WhatsApp instance creation failed');
    failed++;
  }

  // Test 6: Read payment by stripeSession
  const foundPayment = await prisma.payment.findFirst({
    where: { stripeSessionId: 'cs_test_phase2_001' },
  });
  if (foundPayment?.id === payment.id) {
    console.log('  ✅ Test 6: Read payment by Stripe session ID');
    passed++;
  } else {
    console.log('  ❌ Test 6: Payment lookup failed');
    failed++;
  }

  // Test 7: List payments for user
  const userPayments = await prisma.payment.findMany({
    where: { userId: testUserId },
    orderBy: { createdAt: 'desc' },
  });
  if (userPayments.length >= 1) {
    console.log('  ✅ Test 7: List payments for user (' + userPayments.length + ' found)');
    passed++;
  } else {
    console.log('  ❌ Test 7: No payments found for user');
    failed++;
  }

  // Test 8: Read subscription by Stripe subscription ID
  const foundSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: 'sub_test_phase2_001' },
  });
  if (foundSub?.id === sub.id) {
    console.log('  ✅ Test 8: Read subscription by Stripe subscription ID');
    passed++;
  } else {
    console.log('  ❌ Test 8: Subscription lookup failed');
    failed++;
  }

  // Test 9: Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'refunded' },
  });
  const refundedPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
  if (refundedPayment?.status === 'refunded') {
    console.log('  ✅ Test 9: Update payment status');
    passed++;
  } else {
    console.log('  ❌ Test 9: Payment status update failed');
    failed++;
  }

  // Test 10: Transaction - provisionMarketplaceTemplate pattern
  const txResult = await prisma.$transaction(async (tx) => {
    const p = await tx.purchase.create({
      data: {
        userId: testUserId,
        templateId: 'lead-gen-linkedin',
        customerEmail: testEmail,
        stripeSessionId: 'cs_test_tx_001',
        downloadToken: 'tx-token',
      },
    });
    const si = await tx.serviceInstance.create({
      data: {
        clientId: testUserId,
        clientEmail: testEmail,
        productId: 'lead-gen-linkedin',
        productName: 'TX Test',
        status: 'pending_setup',
        type: 'marketplace_implementation',
      },
    });
    return { purchaseId: p.id, serviceInstanceId: si.id };
  });
  if (txResult.purchaseId && txResult.serviceInstanceId) {
    console.log('  ✅ Test 10: Atomic transaction (purchase + service instance)');
    passed++;
  } else {
    console.log('  ❌ Test 10: Transaction failed');
    failed++;
  }

  // Cleanup
  await prisma.whatsAppInstance.deleteMany({ where: { userId: testUserId, bundle: 'starter' } });
  await prisma.subscription.deleteMany({ where: { stripeSubscriptionId: 'sub_test_phase2_001' } });
  await prisma.serviceInstance.deleteMany({ where: { clientId: testUserId, type: 'marketplace_implementation' } });
  await prisma.purchase.deleteMany({ where: { userId: testUserId, stripeSessionId: { in: ['cs_test_phase2_001', 'cs_test_tx_001'] } } });
  await prisma.payment.deleteMany({ where: { stripeSessionId: 'cs_test_phase2_001' } });

  console.log('\n' + (passed === 10 ? '✅' : '⚠️') + ' Results: ' + passed + '/' + (passed + failed) + ' passed\n');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Verification failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
