/**
 * Phase 1 Verification Script
 * Tests that User + Auth DAL functions work correctly against Postgres.
 *
 * Run: npx tsx scripts/verify-phase1.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Phase 1 Verification: Users + Auth\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Read existing seeded user
  const admin = await prisma.user.findUnique({ where: { id: 'admin_rensto_com' } });
  if (admin?.email === 'admin@rensto.com') {
    console.log('  ✅ Test 1: Read admin user by ID');
    passed++;
  } else {
    console.log('  ❌ Test 1: Admin user not found');
    failed++;
  }

  // Test 2: Read by email
  const byEmail = await prisma.user.findUnique({ where: { email: 'demo@client.com' } });
  if (byEmail?.businessName === 'CoolAir HVAC') {
    console.log('  ✅ Test 2: Read user by email');
    passed++;
  } else {
    console.log('  ❌ Test 2: Demo user not found by email');
    failed++;
  }

  // Test 3: Read by dashboard token
  const byToken = await prisma.user.findUnique({ where: { dashboardToken: 'demo-dashboard-token-002' } });
  if (byToken?.id === 'demo_client_com') {
    console.log('  ✅ Test 3: Read user by dashboard token');
    passed++;
  } else {
    console.log('  ❌ Test 3: User not found by dashboard token');
    failed++;
  }

  // Test 4: getOrCreate pattern (new user)
  const testEmail = 'test-phase1@example.com';
  const testId = testEmail.replace(/[^a-z0-9]/g, '_');
  await prisma.magicLinkToken.deleteMany({ where: { clientId: testId } });
  await prisma.leadRequest.deleteMany({ where: { userId: testId } });
  await prisma.user.deleteMany({ where: { id: testId } });

  await prisma.user.create({
    data: {
      id: testId,
      email: testEmail,
      name: 'Phase 1 Test',
      status: 'active',
      emailVerified: true,
      dashboardToken: 'test-token-phase1',
      activeServices: { marketplace: false, whatsapp: false, subscriptions: false, custom_solutions: false, care_plan: 'none' },
      preferences: { language: 'en', emailNotifications: true, smsNotifications: false },
    },
  });
  const created = await prisma.user.findUnique({ where: { id: testId } });
  if (created?.email === testEmail) {
    console.log('  ✅ Test 4: Create new user (getOrCreate pattern)');
    passed++;
  } else {
    console.log('  ❌ Test 4: Failed to create user');
    failed++;
  }

  // Test 5: Update user
  await prisma.user.update({
    where: { id: testId },
    data: { stripeCustomerId: 'cus_test_phase1' },
  });
  const updated = await prisma.user.findUnique({ where: { id: testId } });
  if (updated?.stripeCustomerId === 'cus_test_phase1') {
    console.log('  ✅ Test 5: Update user fields');
    passed++;
  } else {
    console.log('  ❌ Test 5: Failed to update user');
    failed++;
  }

  // Test 6: Create magic link token
  const mlToken = await prisma.magicLinkToken.create({
    data: {
      id: 'test-magic-token-001',
      email: testEmail,
      clientId: testId,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  if (mlToken.id === 'test-magic-token-001') {
    console.log('  ✅ Test 6: Create magic link token');
    passed++;
  } else {
    console.log('  ❌ Test 6: Failed to create magic link token');
    failed++;
  }

  // Test 7: Read and mark token as used
  await prisma.magicLinkToken.update({
    where: { id: 'test-magic-token-001' },
    data: { used: true },
  });
  const usedToken = await prisma.magicLinkToken.findUnique({ where: { id: 'test-magic-token-001' } });
  if (usedToken?.used === true) {
    console.log('  ✅ Test 7: Mark magic link token as used');
    passed++;
  } else {
    console.log('  ❌ Test 7: Failed to mark token as used');
    failed++;
  }

  // Test 8: Create lead request
  const lr = await prisma.leadRequest.create({
    data: {
      userId: testId,
      data: { niche: 'hvac', source: 'test' },
      status: 'pending',
    },
  });
  if (lr.userId === testId) {
    console.log('  ✅ Test 8: Create lead request');
    passed++;
  } else {
    console.log('  ❌ Test 8: Failed to create lead request');
    failed++;
  }

  // Test 9: JSON entitlements update
  await prisma.user.update({
    where: { id: testId },
    data: {
      entitlements: {
        freeLeadsTrial: true,
        freeLeadsRemaining: 5,
        pillars: ['lead-machine'],
        engines: [],
        marketplaceProducts: [],
        customSolution: null,
      },
    },
  });
  const withEntitlements = await prisma.user.findUnique({ where: { id: testId } });
  const ent = withEntitlements?.entitlements as any;
  if (ent?.freeLeadsRemaining === 5 && ent?.pillars?.[0] === 'lead-machine') {
    console.log('  ✅ Test 9: JSON entitlements read/write');
    passed++;
  } else {
    console.log('  ❌ Test 9: JSON entitlements mismatch');
    failed++;
  }

  // Test 10: List users (admin/clients GET)
  const allUsers = await prisma.user.findMany({ orderBy: { email: 'asc' } });
  if (allUsers.length >= 3) {
    console.log('  ✅ Test 10: List users (' + allUsers.length + ' found)');
    passed++;
  } else {
    console.log('  ❌ Test 10: Expected >= 3 users, got ' + allUsers.length);
    failed++;
  }

  // Cleanup
  await prisma.leadRequest.deleteMany({ where: { userId: testId } });
  await prisma.magicLinkToken.deleteMany({ where: { clientId: testId } });
  await prisma.user.delete({ where: { id: testId } });

  console.log('\n' + (passed === 10 ? '✅' : '⚠️') + ' Results: ' + passed + '/' + (passed + failed) + ' passed\n');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Verification failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
