/**
 * Phase 5 Verification: Remaining Service Routes
 * Tests: SecretaryConfig, IndexedDocument, ContentPost, SupportCase,
 *        UsageLog (via webhooks), Requirement, Consultation
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TEST_PREFIX = 'p5test';

async function cleanup() {
  console.log('\n🧹 Cleaning up test records...');
  await prisma.usageLog.deleteMany({ where: { clientId: { startsWith: TEST_PREFIX } } });
  await prisma.supportCase.deleteMany({ where: { customerId: { startsWith: TEST_PREFIX } } });
  await prisma.contentPost.deleteMany({ where: { userId: { startsWith: TEST_PREFIX } } });
  await prisma.indexedDocument.deleteMany({ where: { clientId: { startsWith: TEST_PREFIX } } });
  await prisma.secretaryConfig.deleteMany({ where: { id: { startsWith: TEST_PREFIX } } });
  await prisma.consultation.deleteMany({ where: { userId: { startsWith: TEST_PREFIX } } });
  await prisma.requirement.deleteMany({ where: { clientId: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { id: { startsWith: TEST_PREFIX } } });
  console.log('✅ Cleanup complete');
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    console.error(`  ❌ ${name}: ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Phase 5 Verification: Service Routes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await cleanup();

  const user = await prisma.user.create({
    data: {
      id: `${TEST_PREFIX}-user`,
      email: `${TEST_PREFIX}@example.com`,
      name: 'Phase 5 Tester',
      role: 'USER',
      entitlements: { pillars: ['content', 'leads'] },
    },
  });
  console.log(`\nCreated test user: ${user.id}\n`);

  await test('1. SecretaryConfig upsert + query by webhookId + phone', async () => {
    const cfg = await prisma.secretaryConfig.create({
      data: {
        id: `${TEST_PREFIX}-sec-01`,
        clientId: `${TEST_PREFIX}-user`,
        agentName: 'Test Secretary',
        greeting: 'Hello!',
        n8nWebhookId: `${TEST_PREFIX}-webhook-123`,
        phoneNumber: '+15551234567',
        voiceId: 'eleven_monica',
      },
    });
    const byWebhook = await prisma.secretaryConfig.findFirst({ where: { n8nWebhookId: `${TEST_PREFIX}-webhook-123` } });
    if (!byWebhook || byWebhook.agentName !== 'Test Secretary') throw new Error('webhookId lookup failed');
    const byPhone = await prisma.secretaryConfig.findFirst({ where: { phoneNumber: '+15551234567' } });
    if (!byPhone || byPhone.id !== cfg.id) throw new Error('phone lookup failed');
    await prisma.secretaryConfig.upsert({ where: { id: cfg.id }, create: { ...cfg }, update: { greeting: 'Updated Hello!' } });
    const updated = await prisma.secretaryConfig.findUnique({ where: { id: cfg.id } });
    if (updated?.greeting !== 'Updated Hello!') throw new Error('Upsert update failed');
  });

  await test('2. IndexedDocument create + query', async () => {
    const doc = await prisma.indexedDocument.create({
      data: { clientId: `${TEST_PREFIX}-user`, name: 'test-doc.pdf', type: 'pdf', status: 'processing', size: '2.5 MB' },
    });
    if (!doc.id) throw new Error('Missing id');
    const found = await prisma.indexedDocument.findMany({ where: { clientId: `${TEST_PREFIX}-user` } });
    if (found.length !== 1) throw new Error(`Expected 1, got ${found.length}`);
  });

  await test('3. ContentPost with platform field', async () => {
    const post = await prisma.contentPost.create({
      data: { userId: `${TEST_PREFIX}-user`, title: 'Test Blog Post', type: 'blog', status: 'draft', platform: 'linkedin' },
    });
    if (post.platform !== 'linkedin') throw new Error('Platform not saved');
    const found = await prisma.contentPost.findFirst({ where: { userId: `${TEST_PREFIX}-user`, platform: 'linkedin' } });
    if (!found) throw new Error('Platform query failed');
  });

  await test('4. SupportCase create + list + update', async () => {
    const sc = await prisma.supportCase.create({
      data: {
        customerId: `${TEST_PREFIX}-user`, carePlanTier: 'growth', submissionMethod: 'magic_button',
        issueDescription: 'Workflow stops after 5 runs',
        contextData: { recentErrors: [{ executionId: '123', errorMessage: 'timeout' }] },
        status: 'pending', aiReasoningLog: [], attemptCount: 0,
      },
    });
    const list = await prisma.supportCase.findMany({ where: { customerId: `${TEST_PREFIX}-user` }, orderBy: { createdAt: 'desc' } });
    if (list.length !== 1) throw new Error(`Expected 1, got ${list.length}`);
    await prisma.supportCase.update({
      where: { id: sc.id },
      data: { status: 'resolved', resolution: { approved: true, feedback: 'Fixed!', resolvedAt: new Date().toISOString() } },
    });
    const updated = await prisma.supportCase.findUnique({ where: { id: sc.id } });
    if (updated?.status !== 'resolved') throw new Error('Status not updated');
    if (!(updated?.resolution as any)?.approved) throw new Error('Resolution not saved');
  });

  await test('5. UsageLog with cost, model, tokens', async () => {
    const log = await prisma.usageLog.create({
      data: { clientId: `${TEST_PREFIX}-user`, agentId: 'lead_gen_v3', model: 'gpt-4o', tokens: { input: 500, output: 200, total: 700 }, cost: 0.03, status: 'completed', metadata: { source: 'linkedin' } },
    });
    if (log.model !== 'gpt-4o') throw new Error('Model not saved');
    if (log.cost !== 0.03) throw new Error(`Cost mismatch: ${log.cost}`);
  });

  await test('6. Consultation with clientId, type, metadata', async () => {
    const c = await prisma.consultation.create({
      data: { userId: `${TEST_PREFIX}-user`, clientId: `${TEST_PREFIX}-user`, type: 'proposal', status: 'new', metadata: { proposalId: 'PROP-TEST-123', title: 'Test Proposal' } },
    });
    if (c.type !== 'proposal') throw new Error('Type not saved');
    if (c.clientId !== `${TEST_PREFIX}-user`) throw new Error('clientId not saved');
  });

  await test('7. Requirement upsert with clientId + type + metadata', async () => {
    const r = await prisma.requirement.create({
      data: { clientId: `${TEST_PREFIX}-user`, type: 'onboarding', metadata: { industry: 'real-estate', volume: 200 }, status: 'submitted' },
    });
    if (r.clientId !== `${TEST_PREFIX}-user`) throw new Error('clientId not saved');
    if (r.type !== 'onboarding') throw new Error('type not saved');
    await prisma.requirement.upsert({
      where: { id: r.id },
      update: { metadata: { industry: 'fintech', volume: 500 }, status: 'submitted' },
      create: { clientId: `${TEST_PREFIX}-user`, type: 'onboarding', status: 'submitted' },
    });
    const updated = await prisma.requirement.findUnique({ where: { id: r.id } });
    if ((updated?.metadata as any)?.industry !== 'fintech') throw new Error('Upsert failed');
  });

  await cleanup();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('All 7 Phase 5 tests PASSED ✅');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((err) => { console.error('\n❌ PHASE 5 VERIFICATION FAILED:', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
