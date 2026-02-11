/**
 * Seed script — populates all key tables with realistic test data.
 *
 * Run:  npx tsx prisma/seed.ts
 * Or:   npm run db:seed
 */
import { PrismaClient, UserRole, BillingInterval } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Rensto database...\n');

  // ── 1. Users ──────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { id: 'admin_rensto_com' },
    update: {},
    create: {
      id: 'admin_rensto_com',
      email: 'admin@rensto.com',
      name: 'Admin User',
      role: UserRole.SUPER_ADMIN,
      status: 'active',
      emailVerified: true,
      dashboardToken: 'admin-dashboard-token-001',
      activeServices: {
        marketplace: true,
        whatsapp: true,
        subscriptions: true,
        custom_solutions: true,
        care_plan: 'scale',
      },
      preferences: { language: 'en', emailNotifications: true, smsNotifications: false },
      source: 'organic',
    },
  });
  console.log(`  ✅ User: ${adminUser.email} (${adminUser.role})`);

  const demoClient = await prisma.user.upsert({
    where: { id: 'demo_client_com' },
    update: {},
    create: {
      id: 'demo_client_com',
      email: 'demo@client.com',
      name: 'Demo HVAC Business',
      status: 'active',
      emailVerified: true,
      dashboardToken: 'demo-dashboard-token-002',
      businessName: 'CoolAir HVAC',
      businessType: 'hvac',
      businessSize: 'small_team',
      revenueRange: '$500k-1m',
      stripeCustomerId: 'cus_demo_123',
      activeServices: {
        marketplace: true,
        whatsapp: true,
        subscriptions: false,
        custom_solutions: false,
        care_plan: 'starter',
      },
      entitlements: {
        freeLeadsTrial: false,
        freeLeadsRemaining: 0,
        pillars: ['lead-machine', 'autonomous-secretary'],
        engines: [],
        marketplaceProducts: [],
        customSolution: null,
      },
      preferences: { language: 'en', emailNotifications: true, smsNotifications: true, timezone: 'America/New_York' },
      source: 'referral',
    },
  });
  console.log(`  ✅ User: ${demoClient.email} (demo client)`);

  // ── 2. Legacy Client ──────────────────────────────────────
  const legacyClient = await prisma.client.upsert({
    where: { id: 'coolair-hvac' },
    update: {},
    create: {
      id: 'coolair-hvac',
      name: 'CoolAir HVAC',
      logoUrl: 'https://rensto.com/logos/coolair.png',
      showLogoOnLanding: true,
      privacySettings: { hideBusinessName: false },
      hebrew: { name: 'קול אייר' },
      status: 'active',
    },
  });
  console.log(`  ✅ Legacy Client: ${legacyClient.name}`);

  // ── 3. Templates ──────────────────────────────────────────
  const templates = [
    {
      id: 'lead-gen-linkedin',
      name: 'LinkedIn Lead Generator',
      description: 'Automatically find and qualify B2B leads from LinkedIn.',
      category: 'Lead Generation',
      price: 97,
      readinessStatus: 'Active',
      features: ['Auto-scrape LinkedIn profiles', 'Enrich with Apollo.io', 'Push to CRM'],
      tags: ['linkedin', 'b2b', 'lead-gen'],
      tools: ['Apify', 'Apollo.io', 'n8n'],
      showInMarketplace: true,
      downloadCount: 42,
      rating: 4.8,
    },
    {
      id: 'whatsapp-responder',
      name: 'WhatsApp AI Responder',
      description: '24/7 AI agent that responds to WhatsApp messages for your business.',
      category: 'Communication',
      price: 197,
      readinessStatus: 'Active',
      features: ['Instant response', 'FAQ auto-answers', 'Lead capture', 'Appointment booking'],
      tags: ['whatsapp', 'ai', 'customer-service'],
      tools: ['WAHA', 'OpenAI', 'n8n'],
      showInMarketplace: true,
      downloadCount: 28,
      rating: 4.9,
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
    console.log(`  ✅ Template: ${t.name}`);
  }

  // ── 4. Payment ────────────────────────────────────────────
  const payment = await prisma.payment.create({
    data: {
      userId: demoClient.id,
      stripeSessionId: 'cs_test_seed_001',
      customerEmail: demoClient.email,
      amountTotal: 19700,
      currency: 'usd',
      flowType: 'marketplace-template',
      productId: 'whatsapp-responder',
      platform: 'rensto-web',
    },
  });
  console.log(`  ✅ Payment: $${payment.amountTotal / 100} (${payment.flowType})`);

  // ── 5. Purchase ───────────────────────────────────────────
  const purchase = await prisma.purchase.create({
    data: {
      userId: demoClient.id,
      templateId: 'whatsapp-responder',
      customerEmail: demoClient.email,
      stripeSessionId: 'cs_test_seed_001',
      downloadToken: 'dGVzdC10b2tlbi0wMDE',
      downloadUrl: 'https://rensto.com/api/marketplace/download/dGVzdC10b2tlbi0wMDE',
      tier: 'full-service',
    },
  });
  console.log(`  ✅ Purchase: template=${purchase.templateId}`);

  // ── 6. Service Instance ───────────────────────────────────
  const si = await prisma.serviceInstance.create({
    data: {
      clientId: demoClient.id,
      clientEmail: demoClient.email,
      productId: 'whatsapp-responder',
      productName: 'WhatsApp AI Responder',
      status: 'active',
      type: 'marketplace_implementation',
      activatedAt: new Date(),
    },
  });
  console.log(`  ✅ Service Instance: ${si.productName} (${si.status})`);

  // ── 7. Subscription ───────────────────────────────────────
  const sub = await prisma.subscription.create({
    data: {
      userId: demoClient.id,
      userEmail: demoClient.email,
      stripeSubscriptionId: 'sub_test_seed_001',
      stripeCustomerId: 'cus_demo_123',
      subscriptionType: 'whatsapp',
      whatsappBundle: 'auto_qualify_book',
      amount: 29900,
      currency: 'usd',
      billingInterval: BillingInterval.month,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`  ✅ Subscription: ${sub.subscriptionType} ($${sub.amount / 100}/mo)`);

  // ── 8. WhatsApp Instance ──────────────────────────────────
  const wa = await prisma.whatsAppInstance.create({
    data: {
      userId: demoClient.id,
      userEmail: demoClient.email,
      businessName: 'CoolAir HVAC',
      businessType: 'hvac',
      phoneNumber: '+15551234567',
      bundle: 'auto_qualify_book',
      status: 'active',
      subscriptionId: sub.id,
      metrics: {
        totalMessages: 156,
        averageResponseTime: 45,
        leadsCaptured: 23,
        appointmentsBooked: 8,
        quotesSent: 5,
        humanEscalations: 2,
      },
      activatedAt: new Date(),
    },
  });
  console.log(`  ✅ WhatsApp Instance: ${wa.businessName} (${wa.status})`);

  // ── 9. Leads ──────────────────────────────────────────────
  const leadData = [
    { name: 'John Smith', company: 'Smith Plumbing', email: 'john@smithplumbing.com', phone: '+15559001', source: 'google_maps' as const, status: 'qualified' as const },
    { name: 'Maria Garcia', company: 'Garcia Electric', email: 'maria@garciaelectric.com', phone: '+15559002', source: 'linkedin' as const, status: 'contacted' as const },
    { name: 'David Chen', company: 'Chen Roofing', email: 'david@chenroofing.com', phone: '+15559003', source: 'whatsapp' as const, status: 'new' as const },
  ];

  for (const ld of leadData) {
    await prisma.lead.create({
      data: {
        userId: demoClient.id,
        source: ld.source,
        name: ld.name,
        company: ld.company,
        email: ld.email,
        phone: ld.phone,
        status: ld.status,
        qualificationStatus: ld.status === 'qualified' ? 'qualified' : 'unqualified',
        deliveredAt: new Date(),
        deliveryMethod: 'dashboard',
      },
    });
    console.log(`  ✅ Lead: ${ld.name} (${ld.source})`);
  }

  // ── 10. Usage Logs ────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    await prisma.usageLog.create({
      data: {
        clientId: demoClient.id,
        agentId: 'whatsapp-responder',
        status: 'completed',
        startedAt: new Date(Date.now() - i * 3600000),
        completedAt: new Date(Date.now() - i * 3600000 + 2500),
        durationMs: 2500,
        model: 'gpt-4-turbo',
        tokens: { input: 350, output: 120, total: 470 },
        cost: 0.47,
      },
    });
  }
  console.log(`  ✅ Usage Logs: 5 entries`);

  // ── 11. Testimonial ───────────────────────────────────────
  await prisma.testimonial.create({
    data: {
      clientId: legacyClient.id,
      language: 'en',
      author: 'Mike Johnson',
      role: 'Owner, CoolAir HVAC',
      quote: 'Rensto automated our entire lead response system. We went from 30-minute response times to under 5 minutes.',
      result: '85% faster lead response',
      order: 1,
      isActive: true,
    },
  });
  console.log(`  ✅ Testimonial: Mike Johnson`);

  // ── 12. Business Niche ────────────────────────────────────
  const niches = [
    { name: 'HVAC Contractor', slug: 'hvac', category: 'home_services', painPoints: ['Missing calls on jobs', 'Tire-kickers waste time'], commonServices: ['AC Repair', 'Furnace Installation', 'Duct Cleaning'] },
    { name: 'Real Estate Agent', slug: 'realtor', category: 'professional_services', painPoints: ['Slow lead follow-up', 'Too many leads to manage'], commonServices: ['Buyer Representation', 'Listing', 'Property Management'] },
  ];

  for (const n of niches) {
    await prisma.businessNiche.upsert({
      where: { slug: n.slug },
      update: {},
      create: { ...n, isActive: true, order: niches.indexOf(n) },
    });
    console.log(`  ✅ Niche: ${n.name}`);
  }

  // ── 13. Audit ─────────────────────────────────────────────
  await prisma.audit.create({
    data: {
      service: 'seed',
      action: 'database_seeded',
      status: 'success',
      details: { tables: 46, timestamp: new Date().toISOString() },
    },
  });
  console.log(`  ✅ Audit: seed entry`);

  // ── 14. Launch Task ───────────────────────────────────────
  await prisma.launchTask.create({
    data: {
      title: 'Migrate Firestore to Postgres',
      description: 'Phase 0 complete. Proceed with Phase 1 (Users + Auth).',
      status: 'in_progress',
      priority: 'high',
      category: 'infrastructure',
    },
  });
  console.log(`  ✅ Launch Task: migration tracking`);

  console.log('\n✅ Seed complete!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
