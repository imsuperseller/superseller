/**
 * Phase 4 Verification: Dashboard + Admin routes
 *
 * Tests:
 *  1. UsageLog creation (sync-usage bridge)
 *  2. LaunchTask CRUD with order field
 *  3. Testimonial CRUD (create, update, approve)
 *  4. AdminConversation (Terry chat) upsert + update
 *  5. N8nAgentMemory upsert + read
 *  6. Admin metrics aggregation (counts)
 *
 * Run: npx tsx scripts/verify-phase4.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TEST_PREFIX = 'p4-test';
let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

async function cleanup() {
  await prisma.usageLog.deleteMany({ where: { clientId: { startsWith: TEST_PREFIX } } });
  await prisma.launchTask.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
  await prisma.testimonial.deleteMany({ where: { name: { startsWith: TEST_PREFIX } } });
  await prisma.adminConversation.deleteMany({ where: { id: { startsWith: TEST_PREFIX } } });
  await prisma.n8nAgentMemory.deleteMany({ where: { key: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { id: { startsWith: TEST_PREFIX } } });
}

async function main() {
  console.log('\n🧪 Phase 4 Verification: Dashboard + Admin\n');
  await cleanup();

  // Seed test user
  await prisma.user.create({
    data: {
      id: `${TEST_PREFIX}-user`,
      email: `${TEST_PREFIX}@example.com`,
      name: 'Phase 4 Test User',
    },
  });

  // ---- TEST 1: UsageLog creation ----
  await test('1. UsageLog creation (sync-usage bridge)', async () => {
    const log = await prisma.usageLog.create({
      data: {
        clientId: `${TEST_PREFIX}-user`,
        agentId: 'lead_generation',
        serviceType: 'lead_generation',
        status: 'completed',
        metadata: { count: 5, source: 'linkedin' },
      },
    });
    if (!log.id) throw new Error('No id');
    if (log.agentId !== 'lead_generation') throw new Error('agentId wrong');
    if (!(log.metadata as any).count) throw new Error('metadata not stored');
  });

  // ---- TEST 2: LaunchTask CRUD with order ----
  await test('2. LaunchTask CRUD with order field', async () => {
    const t1 = await prisma.launchTask.create({
      data: { title: `${TEST_PREFIX} Task A`, category: 'Technical', status: 'pending', order: 10 },
    });
    const t2 = await prisma.launchTask.create({
      data: { title: `${TEST_PREFIX} Task B`, category: 'Finance', status: 'pending', order: 5 },
    });

    // List ordered by order
    const ordered = await prisma.launchTask.findMany({
      where: { title: { startsWith: TEST_PREFIX } },
      orderBy: { order: 'asc' },
    });
    if (ordered[0].title !== `${TEST_PREFIX} Task B`) throw new Error('Order not correct');

    // Update status
    await prisma.launchTask.update({ where: { id: t1.id }, data: { status: 'completed' } });
    const updated = await prisma.launchTask.findUnique({ where: { id: t1.id } });
    if (updated?.status !== 'completed') throw new Error('Status not updated');
  });

  // ---- TEST 3: Testimonial CRUD ----
  await test('3. Testimonial CRUD (create, update, approve)', async () => {
    const t = await prisma.testimonial.create({
      data: {
        name: `${TEST_PREFIX} John Doe`,
        role: 'CEO',
        company: 'Acme Corp',
        content: 'Rensto transformed our operations.',
        rating: 5.0,
        isActive: false,
        language: 'en',
        order: 1,
      },
    });
    if (t.name !== `${TEST_PREFIX} John Doe`) throw new Error('name wrong');
    if (t.company !== 'Acme Corp') throw new Error('company wrong');

    // Approve
    await prisma.testimonial.update({
      where: { id: t.id },
      data: { isActive: true, approvedAt: new Date() },
    });
    const approved = await prisma.testimonial.findUnique({ where: { id: t.id } });
    if (!approved?.isActive) throw new Error('not active');
    if (!approved?.approvedAt) throw new Error('approvedAt not set');
  });

  // ---- TEST 4: AdminConversation (Terry chat) ----
  await test('4. AdminConversation (Terry chat) upsert + update', async () => {
    const conv = await prisma.adminConversation.upsert({
      where: { id: `${TEST_PREFIX}-session` },
      create: { id: `${TEST_PREFIX}-session`, messages: [] },
      update: {},
    });
    if (!conv.id) throw new Error('No id');

    const msgs = [
      { role: 'user', content: 'Check revenue' },
      { role: 'assistant', content: 'Revenue is on track.' },
    ];
    await prisma.adminConversation.update({
      where: { id: conv.id },
      data: { messages: msgs },
    });

    const updated = await prisma.adminConversation.findUnique({ where: { id: conv.id } });
    const stored = updated?.messages as any[];
    if (stored.length !== 2) throw new Error('messages not stored');
    if (stored[0].role !== 'user') throw new Error('message role wrong');
  });

  // ---- TEST 5: N8nAgentMemory ----
  await test('5. N8nAgentMemory upsert + read', async () => {
    const key = `${TEST_PREFIX}-agent-key`;

    // Create
    await prisma.n8nAgentMemory.create({
      data: { key, data: { preferences: { safety_first: true }, findings: [] } },
    });

    const found = await prisma.n8nAgentMemory.findFirst({ where: { key } });
    if (!found) throw new Error('Not found');
    if (!(found.data as any).preferences.safety_first) throw new Error('data not stored');

    // Update
    await prisma.n8nAgentMemory.update({
      where: { id: found.id },
      data: { data: { preferences: { safety_first: true }, findings: ['research-1'] } },
    });

    const updated = await prisma.n8nAgentMemory.findFirst({ where: { key } });
    if ((updated?.data as any).findings.length !== 1) throw new Error('update failed');
  });

  // ---- TEST 6: Admin metrics aggregation ----
  await test('6. Admin metrics aggregation (counts)', async () => {
    const userCount = await prisma.user.count();
    const paymentCount = await prisma.payment.count();

    if (typeof userCount !== 'number') throw new Error('user count not a number');
    if (typeof paymentCount !== 'number') throw new Error('payment count not a number');
    // Just verify the queries work without error
  });

  await cleanup();

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed}\n`);
  if (failed > 0) process.exit(1);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
