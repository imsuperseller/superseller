/**
 * Phase 3 Verification: Marketplace + Templates + Fulfillment
 *
 * Tests:
 *  1. Template CRUD + listing with filters
 *  2. CustomizationRequest creation with parameters + customerEmail
 *  3. Download record creation with userAgent + ip
 *  4. ServiceInstance create + update (fulfillment flow)
 *  5. Purchase creation with downloadToken (marketplace/downloads POST)
 *
 * Run: npx tsx scripts/verify-phase3.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TEST_PREFIX = 'p3-test';
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
  await prisma.download.deleteMany({ where: { templateId: { startsWith: TEST_PREFIX } } });
  await prisma.customizationRequest.deleteMany({ where: { templateId: { startsWith: TEST_PREFIX } } });
  await prisma.purchase.deleteMany({ where: { templateId: { startsWith: TEST_PREFIX } } });
  await prisma.serviceInstance.deleteMany({ where: { productId: { startsWith: TEST_PREFIX } } });
  await prisma.template.deleteMany({ where: { id: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { id: { startsWith: TEST_PREFIX } } });
}

async function main() {
  console.log('\n🧪 Phase 3 Verification: Marketplace + Templates + Fulfillment\n');

  await cleanup();

  const testUser = await prisma.user.create({
    data: {
      id: `${TEST_PREFIX}-user-01`,
      email: `${TEST_PREFIX}@example.com`,
      name: 'Phase 3 Test User',
    },
  });

  // ---- TEST 1: Template CRUD ----
  await test('1. Template create + read + list', async () => {
    const t1 = await prisma.template.create({
      data: {
        id: `${TEST_PREFIX}-template-01`,
        name: 'Lead Gen Blueprint',
        description: 'Automated LinkedIn lead generation',
        category: 'lead-generation',
        price: 97,
        readinessStatus: 'Active',
        showInMarketplace: true,
        tags: ['lead-gen', 'linkedin'],
        features: [{ title: 'LinkedIn Scraper', desc: 'Auto-scrape contacts' }],
        integrations: ['LinkedIn', 'n8n', 'Google Sheets'],
        metrics: { leads_per_month: 500, time_saved_hours: 20 },
        complexity: 'Intermediate',
        setupTime: '2 hours',
        targetMarket: 'B2B SaaS',
        content: '{"nodes": [], "connections": {}}',
      },
    });

    await prisma.template.create({
      data: {
        id: `${TEST_PREFIX}-template-02`,
        name: 'Internal Testing Workflow',
        description: 'Testing only',
        category: 'internal',
        price: 0,
        readinessStatus: 'Draft',
        showInMarketplace: false,
        tags: ['internal', 'testing'],
      },
    });

    const found = await prisma.template.findUnique({ where: { id: t1.id } });
    if (!found) throw new Error('Template not found after create');
    if (found.name !== 'Lead Gen Blueprint') throw new Error('Name mismatch');
    if (!Array.isArray(found.integrations)) throw new Error('integrations should be array');
    if ((found.integrations as any[]).length !== 3) throw new Error('integrations count wrong');
    if (!(found.metrics as any).leads_per_month) throw new Error('metrics not stored');

    const active = await prisma.template.findMany({
      where: { readinessStatus: 'Active', showInMarketplace: true },
    });
    const activeIds = active.map(a => a.id);
    if (!activeIds.includes(t1.id)) throw new Error('Active template not listed');
  });

  // ---- TEST 2: CustomizationRequest ----
  await test('2. CustomizationRequest with parameters + customerEmail', async () => {
    const req = await prisma.customizationRequest.create({
      data: {
        templateId: `${TEST_PREFIX}-template-01`,
        customerEmail: 'customer@example.com',
        parameters: { industry: 'real-estate', volume: 200, email: 'customer@example.com' },
        status: 'pending',
      },
    });

    if (!req.id) throw new Error('No id');
    if (req.customerEmail !== 'customer@example.com') throw new Error('customerEmail not stored');
    if (!(req.parameters as any).industry) throw new Error('parameters not stored');
  });

  // ---- TEST 3: Download with userAgent + ip ----
  await test('3. Download record with userAgent + ip', async () => {
    const dl = await prisma.download.create({
      data: {
        templateId: `${TEST_PREFIX}-template-01`,
        userEmail: `${TEST_PREFIX}@example.com`,
        status: 'success',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ip: '192.168.1.42',
      },
    });

    if (!dl.id) throw new Error('No id');
    if (dl.userAgent !== 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)') throw new Error('userAgent not stored');
    if (dl.ip !== '192.168.1.42') throw new Error('ip not stored');
  });

  // ---- TEST 4: ServiceInstance fulfillment flow ----
  await test('4. ServiceInstance fulfillment flow (create → activate)', async () => {
    const instance = await prisma.serviceInstance.create({
      data: {
        clientId: testUser.id,
        clientEmail: testUser.email,
        productId: `${TEST_PREFIX}-product`,
        productName: 'Lead Gen Pro',
        status: 'configuring',
        configuration: { niche: 'HVAC', location: 'Miami' },
        adminNotes: 'Paid via pi_test_123',
      },
    });

    if (instance.status !== 'configuring') throw new Error('Initial status wrong');

    const updated = await prisma.serviceInstance.update({
      where: { id: instance.id },
      data: {
        status: 'active',
        n8nWorkflowId: 'wf-lead-gen-001',
        activatedAt: new Date(),
      },
    });

    if (updated.status !== 'active') throw new Error('Status not updated');
    if (updated.n8nWorkflowId !== 'wf-lead-gen-001') throw new Error('n8nWorkflowId not set');
    if (!updated.activatedAt) throw new Error('activatedAt not set');
  });

  // ---- TEST 5: Purchase with downloadToken ----
  await test('5. Purchase with downloadToken and downloadUrl', async () => {
    const token = Buffer.from(`${TEST_PREFIX}-template-01:test@example.com:${Date.now()}`).toString('base64url');
    const dlUrl = `https://rensto.com/api/marketplace/download/${token}`;

    const purchase = await prisma.purchase.create({
      data: {
        userId: testUser.id,
        templateId: `${TEST_PREFIX}-template-01`,
        customerEmail: 'test@example.com',
        downloadToken: token,
        downloadUrl: dlUrl,
      },
    });

    if (!purchase.id) throw new Error('No id');
    if (purchase.downloadToken !== token) throw new Error('downloadToken mismatch');
    if (!purchase.downloadUrl?.includes('/api/marketplace/download/')) throw new Error('downloadUrl wrong');
  });

  await cleanup();

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed}\n`);
  if (failed > 0) process.exit(1);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
