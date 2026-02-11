/**
 * ONE-TIME Firestore → PostgreSQL Data Migration (v2 - FK-safe)
 * 
 * Safe to run multiple times (upsert = skip if exists).
 * Auto-creates placeholder users for FK references.
 * 
 * Usage: npx tsx scripts/migrate-firestore-to-postgres.ts [--dry-run]
 */
import { PrismaClient, Prisma } from '@prisma/client';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

function initFirebase() {
  if (admin.apps.length) return admin.firestore();
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'service-account-key.json');
  if (fs.existsSync(saPath)) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(saPath, 'utf8'))) });
  } else {
    admin.initializeApp();
  }
  return admin.firestore();
}

// ─── Helpers ─────────────────────────────────────────────
function toDate(val: any): Date | null {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  if (val._seconds != null) return new Date(val._seconds * 1000);
  if (typeof val === 'string') { const d = new Date(val); return isNaN(d.getTime()) ? null : d; }
  if (val instanceof Date) return val;
  return null;
}
function toDateOrNow(val: any): Date { return toDate(val) || new Date(); }
function safeJson(val: any): Prisma.InputJsonValue | undefined {
  if (val == null) return undefined;
  return val as Prisma.InputJsonValue;
}

/** Ensure a User row exists for FK references. Creates placeholder if missing. */
async function ensureUser(id: string, email?: string) {
  if (!id) return;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) return;
  // Use a unique placeholder email based on the ID to avoid email uniqueness conflicts
  const safeEmail = `${id.replace(/[^a-zA-Z0-9_.-]/g, '_')}@placeholder.rensto.com`;
  try {
    await prisma.user.create({
      data: {
        id,
        email: safeEmail,
        name: `[Migrated] ${id}`,
        role: 'USER',
        status: 'active',
      },
    });
  } catch { /* race condition or constraint — ignore */ }
}

const stats: Record<string, { total: number; migrated: number; skipped: number; errors: number }> = {};
function initStats(col: string) { stats[col] = { total: 0, migrated: 0, skipped: 0, errors: 0 }; }

async function readCol(db: admin.firestore.Firestore, name: string) {
  const snap = await db.collection(name).get();
  return snap.docs;
}

// ─── Migrators ───────────────────────────────────────────

async function migrateUsers(db: admin.firestore.Firestore) {
  const col = 'users'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      await prisma.user.upsert({
        where: { id }, update: {},
        create: {
          id, email: d.email || `${id}@unknown.com`, name: d.name || null, phone: d.phone || null,
          dashboardToken: d.dashboardToken || null, businessName: d.businessName || null,
          status: d.status || 'active', emailVerified: d.emailVerified ?? false,
          stripeCustomerId: d.stripeCustomerId || null,
          activeServices: safeJson(d.activeServices) || {}, entitlements: safeJson(d.entitlements) || {},
          preferences: safeJson(d.preferences) || {}, metrics: safeJson(d.metrics || d.usage) || {},
          source: d.source || null, role: 'USER',
          createdAt: toDateOrNow(d.createdAt), updatedAt: toDateOrNow(d.updatedAt),
        },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateClients(db: admin.firestore.Firestore) {
  const col = 'clients'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      const exists = await prisma.user.findUnique({ where: { id } });
      if (exists) { stats[col].skipped++; continue; }
      await prisma.user.create({
        data: { id, email: d.email || `${id}@unknown.com`, name: d.name || null, status: d.status || 'active', role: 'USER', metrics: safeJson(d.usage) || {}, createdAt: toDateOrNow(d.createdAt), updatedAt: toDateOrNow(d.updatedAt) },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateTemplates(db: admin.firestore.Firestore) {
  const col = 'templates'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      await prisma.template.upsert({
        where: { id }, update: {},
        create: {
          id, name: d.name || 'Untitled', description: d.description || null, category: d.category || null,
          price: typeof d.price === 'number' ? d.price : 0, installPrice: d.installPrice || null, customPrice: d.customPrice || null,
          features: safeJson(d.features) || [], tags: safeJson(d.tags) || [], tools: safeJson(d.tools) || [],
          image: d.image || null, video: d.video || null, rating: d.rating || null,
          downloadCount: d.downloads || 0, popular: d.popular || false, version: d.version || null,
          readinessStatus: d.readinessStatus || 'Draft', partner: d.partner || null,
          setupTime: d.setupTime || null, targetMarket: d.targetMarket || null, content: d.content || null,
          demoVideo: d.demoVideo || null, previewImages: safeJson(d.previewImages) || undefined,
          outcomeHeadline: d.outcomeHeadline || null, installation: d.installation || null,
          // Hebrew
          name_he: d.name_he || null, description_he: d.description_he || null,
          outcomeHeadline_he: d.outcomeHeadline_he || null, features_he: safeJson(d.features_he) || undefined,
          deploymentSteps: safeJson(d.deploymentSteps) || undefined,
          // Technical
          workflowId: d.workflowId || d.n8nWorkflowId || null,
          technicalRequirements: safeJson(d.technicalRequirements) || undefined,
          pricingConfig: safeJson(d.pricing) || undefined,
          owner: d.owner || null, clientId: d.clientId || null, department: d.department || null,
          n8nWorkflowId: d.n8nWorkflowId || null, n8nWorkflowUrl: d.n8nWorkflowUrl || null,
          stripeProductId: d.stripeProductId || null, stripePriceId: d.stripePriceId || null,
          showInMarketplace: d.showInMarketplace ?? true, showInAdminDashboard: d.showInAdminDashboard ?? true,
          showInClientDashboard: d.showInClientDashboard ?? false,
          configurationSchema: safeJson(d.configurationSchema) || undefined, deliveryChecklist: safeJson(d.deliveryChecklist) || undefined,
          // Rich content
          complexity: d.complexity || null, businessImpact: d.businessImpact || null, businessImpact_he: d.businessImpact_he || null,
          roiExample: d.roiExample || null, roiExample_he: d.roiExample_he || null,
          oneTimeCost: d.oneTimeCost || null, maintenanceCost: d.maintenanceCost || null,
          maintenanceExplanation: d.maintenanceExplanation || null, maintenanceExplanation_he: d.maintenanceExplanation_he || null,
          aiPromptScript: d.aiPromptScript || null, soraVideoPrompt: d.soraVideoPrompt || null,
          guarantee: d.guarantee || null, guarantee_he: d.guarantee_he || null, isTargetTier: d.isTargetTier || null,
          integrations: safeJson(d.integrations) || undefined, metrics: safeJson(d.metrics) || undefined,
          kpis: safeJson(d.kpis) || undefined, kpis_he: safeJson(d.kpis_he) || undefined,
          useCases: safeJson(d.useCases) || undefined, useCases_he: safeJson(d.useCases_he) || undefined,
          faqs: safeJson(d.faqs) || undefined, faqs_he: safeJson(d.faqs_he) || undefined,
          creator: safeJson(d.creator) || undefined, creator_he: safeJson(d.creator_he) || undefined,
          videoScripts: safeJson(d.videoScripts) || undefined,
          createdAt: toDateOrNow(d.createdAt), updatedAt: toDateOrNow(d.updatedAt),
        },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migratePayments(db: admin.firestore.Firestore) {
  const col = 'payments'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      const userId = d.userId || d.clientId || d.customerId || d.customerEmail || 'unknown';
      await ensureUser(userId, d.customerEmail);
      await prisma.payment.upsert({
        where: { id }, update: {},
        create: {
          id, userId,
          stripeSessionId: d.stripeSessionId || d.sessionId || null,
          stripeCustomerId: d.stripeCustomerId || d.customerId || null,
          customerId: d.customerId || null,
          customerEmail: d.customerEmail || null,
          amount: d.amount || d.amountTotal || 0,
          amountTotal: d.amountTotal || d.amount || 0,
          currency: d.currency || 'usd',
          flowType: d.flowType || d.serviceType || null,
          productId: d.productId || null,
          tier: d.tier || null,
          platform: d.platform || 'rensto-web',
          status: d.status || 'completed',
          metadata: safeJson({ tier: d.tier, platform: d.platform, flowType: d.flowType }) || {},
          createdAt: toDateOrNow(d.createdAt || d.timestamp),
          updatedAt: toDateOrNow(d.updatedAt || d.timestamp),
        },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migratePurchases(db: admin.firestore.Firestore) {
  const col = 'purchases'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      const userId = d.userId || d.clientId || 'unknown';
      await ensureUser(userId);
      const templateId = d.templateId || d.productId;
      if (templateId) {
        const tpl = await prisma.template.findUnique({ where: { id: templateId } });
        if (!tpl) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: template ${templateId} not found`); continue; }
      }
      await prisma.purchase.upsert({
        where: { id }, update: {},
        create: { id, userId, templateId: templateId || null, customerEmail: d.customerEmail || d.email || 'unknown@rensto.com', stripeSessionId: d.stripeSessionId || null, downloadToken: d.downloadToken || null, downloadUrl: d.downloadUrl || null, tier: d.tier || null, createdAt: toDateOrNow(d.createdAt || d.timestamp) },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateServiceInstances(db: admin.firestore.Firestore) {
  const col = 'service_instances'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      const clientId = d.clientId || d.userId || 'unknown';
      await ensureUser(clientId, d.clientEmail);
      await prisma.serviceInstance.upsert({
        where: { id }, update: {},
        create: { id, clientId, clientEmail: d.clientEmail || '', productId: d.productId || '', productName: d.productName || '', status: d.status || 'pending_setup', configuration: safeJson(d.configuration) || {}, n8nWorkflowId: d.n8nWorkflowId || null, adminNotes: d.adminNotes || null, whatsappInstanceId: d.whatsappInstanceId || null, createdAt: toDateOrNow(d.createdAt), activatedAt: toDate(d.activatedAt), updatedAt: toDateOrNow(d.updatedAt) },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateLeads(db: admin.firestore.Firestore) {
  const col = 'leads'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      const userId = d.userId || `lead-${id}`;
      await ensureUser(userId, d.email);
      await prisma.lead.upsert({
        where: { id }, update: {},
        create: { id, userId, source: d.source || 'manual', name: d.name || null, company: d.company || null, email: d.email || null, phone: d.phone || null, website: d.website || null, location: safeJson(d.location) || undefined, qualificationStatus: d.qualificationStatus || 'unqualified', qualificationData: safeJson(d.qualificationData) || undefined, enrichedData: safeJson(d.enrichedData) || undefined, status: d.status || 'new', deliveredAt: toDate(d.deliveredAt), deliveryMethod: d.deliveryMethod || 'dashboard', responseTime: d.responseTime || null, metadata: safeJson(d.metadata) || undefined, tags: d.tags || [], notes: d.notes || null, createdAt: toDateOrNow(d.createdAt), updatedAt: toDateOrNow(d.updatedAt) },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateTestimonials(db: admin.firestore.Firestore) {
  const col = 'testimonials'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      // clientId on Testimonial → FK to Client (not User), and it's optional
      await prisma.testimonial.upsert({
        where: { id }, update: {},
        create: { id, clientId: null, language: d.language || 'en', author: d.author || null, name: d.name || d.author || null, role: d.role || null, quote: d.quote || null, content: d.content || d.quote || null, result: d.result || null, imageUrl: d.imageUrl || null, avatar: d.avatar || d.imageUrl || null, rating: d.rating || null, label: d.label || null, order: d.order || 0, isActive: d.isActive ?? true, approvedAt: toDate(d.approvedAt), createdAt: toDateOrNow(d.createdAt), updatedAt: toDateOrNow(d.updatedAt) },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateSupportCases(db: admin.firestore.Firestore) {
  const col = 'supportCases'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      const customerId = d.customerId || 'unknown';
      await ensureUser(customerId);
      await prisma.supportCase.upsert({
        where: { id }, update: {},
        create: { id, customerId, workflowId: d.workflowId || null, carePlanTier: d.carePlanTier || null, submissionMethod: d.submissionMethod || null, issueDescription: d.issueDescription || '', contextData: safeJson(d.contextData) || undefined, status: d.status || 'pending', aiReasoningLog: safeJson(d.aiReasoningLog) || [], attemptCount: d.attemptCount || 0, proposedFix: safeJson(d.proposedFix) || undefined, resolution: safeJson(d.resolution) || undefined, createdAt: toDateOrNow(d.createdAt) },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateUsageLogs(db: admin.firestore.Firestore) {
  const col = 'usage_logs'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      await ensureUser(d.clientId || 'unknown');
      await prisma.usageLog.upsert({
        where: { id }, update: {},
        create: { id, clientId: d.clientId || 'unknown', agentId: d.agentId || 'system', status: d.status || 'completed', model: d.model || null, tokens: safeJson(d.tokens) || undefined, cost: d.cost || 0, output: d.output || null, metadata: safeJson(d.metadata) || undefined, startedAt: toDateOrNow(d.startedAt || d.timestamp), completedAt: toDate(d.completedAt), durationMs: d.durationMs || null },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateSecretaryConfigs(db: admin.firestore.Firestore) {
  const col = 'secretary_configs'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      await ensureUser(d.clientId || 'unknown');
      await prisma.secretaryConfig.upsert({
        where: { id }, update: {},
        create: { id, clientId: d.clientId || 'unknown', agentName: d.agentName || 'AI Secretary', greeting: d.greeting || null, voiceId: d.voiceId || 'eleven_monica', tone: d.tone || null, businessContext: d.businessContext || null, phoneNumber: d.phoneNumber || null, transferNumber: d.transferNumber || null, n8nWebhookId: d.n8nWebhookId || null, whatsappEnabled: d.whatsappEnabled ?? false, calendarEnabled: d.calendarEnabled ?? false, calendarLink: d.calendarLink || null, availability: safeJson(d.availability) || undefined, createdAt: toDateOrNow(d.createdAt || d.updatedAt), updatedAt: toDateOrNow(d.updatedAt) },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateContentPosts(db: admin.firestore.Firestore) {
  const col = 'content_posts'; initStats(col);
  const docs = await readCol(db, col);
  stats[col].total = docs.length;
  console.log(`  📄 ${col}: ${docs.length} docs`);
  if (DRY_RUN) return;
  // Content posts have no userId in Firestore — use a system user
  const systemUserId = 'system-content';
  await ensureUser(systemUserId, 'content@rensto.com');
  for (const doc of docs) {
    const d = doc.data()!; const id = doc.id;
    try {
      const userId = d.clientId || d.userId || systemUserId;
      await ensureUser(userId);
      await prisma.contentPost.upsert({
        where: { id }, update: {},
        create: {
          id, userId, title: d.title || null, content: d.content || null,
          type: d.type || null, status: d.status || 'draft', slug: d.slug || null,
          platform: d.platform || null,
          metadata: safeJson({ excerpt: d.excerpt, focusKeyword: d.focusKeyword, image_prompt: d.image_prompt, video_prompt: d.video_prompt, linkedin_post: d.linkedin_post, facebook_post: d.facebook_post, video_url: d.video_url, ad_archive_id: d.ad_archive_id, running_days: d.running_days, style_fit: d.style_fit, start_date: d.start_date }),
          createdAt: toDateOrNow(d.createdAt),
        },
      });
      stats[col].migrated++;
    } catch (e: any) { stats[col].errors++; console.error(`    ⚠ ${col}/${id}: ${e.message.slice(0, 200)}`); }
  }
}

async function migrateSimple(db: admin.firestore.Firestore, colName: string, fn: (id: string, d: any) => Promise<void>) {
  initStats(colName);
  const docs = await readCol(db, colName);
  stats[colName].total = docs.length;
  console.log(`  📄 ${colName}: ${docs.length} docs`);
  if (DRY_RUN) return;
  for (const doc of docs) {
    try { await fn(doc.id, doc.data()!); stats[colName].migrated++; }
    catch (e: any) { stats[colName].errors++; console.error(`    ⚠ ${colName}/${doc.id}: ${e.message.slice(0, 200)}`); }
  }
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log(`║  Firestore → Postgres Migration v2 ${DRY_RUN ? '[DRY RUN]' : '[LIVE]   '}  ║`);
  console.log('╚══════════════════════════════════════════════╝\n');

  const db = initFirebase();

  console.log('─── Phase A: Core Entities ───');
  await migrateUsers(db);
  await migrateClients(db);
  await migrateTemplates(db);

  console.log('\n─── Phase B: Transactions ───');
  await migratePayments(db);
  await migratePurchases(db);
  await migrateSimple(db, 'downloads', async (id, d) => {
    await prisma.download.upsert({ where: { id }, update: {}, create: { id, templateId: d.templateId || 'unknown', userEmail: d.userEmail || d.email || 'unknown', paymentIntentId: d.paymentIntentId || null, status: d.status || 'completed', userAgent: d.userAgent || null, ip: d.ip || null, createdAt: toDateOrNow(d.timestamp || d.createdAt) } });
  });

  console.log('\n─── Phase C: Services ───');
  await migrateServiceInstances(db);
  await migrateSimple(db, 'subscriptions', async (id, d) => {
    await ensureUser(d.userId || 'unknown', d.userEmail);
    await prisma.subscription.upsert({ where: { id }, update: {}, create: { id, userId: d.userId || 'unknown', userEmail: d.userEmail || '', stripeSubscriptionId: d.stripeSubscriptionId || '', stripeCustomerId: d.stripeCustomerId || '', stripePriceId: d.stripePriceId || '', subscriptionType: d.subscriptionType || 'whatsapp', amount: d.amount || 0, currency: d.currency || 'usd', billingInterval: d.billingInterval || 'month', status: d.status || 'active', currentPeriodStart: toDateOrNow(d.currentPeriodStart), currentPeriodEnd: toDateOrNow(d.currentPeriodEnd), cancelAtPeriodEnd: d.cancelAtPeriodEnd || false, canceledAt: toDate(d.canceledAt), metadata: safeJson({ whatsappBundle: d.whatsappBundle, carePlanTier: d.carePlanTier, leadGenTier: d.leadGenTier }), createdAt: toDateOrNow(d.createdAt), updatedAt: toDateOrNow(d.updatedAt) } });
  });
  await migrateSimple(db, 'whatsapp_instances', async (id, d) => {
    await ensureUser(d.userId || 'unknown', d.userEmail);
    await prisma.whatsAppInstance.upsert({ where: { id }, update: {}, create: { id, userId: d.userId || 'unknown', userEmail: d.userEmail || '', businessName: d.businessName || '', businessType: d.businessType || '', phoneNumber: d.phoneNumber || '', bundle: d.bundle || 'never_miss_lead', bundleFeatures: safeJson(d.bundleFeatures) || {}, addOns: safeJson(d.addOns) || {}, status: d.status || 'pending_setup', metrics: safeJson(d.metrics) || {}, configuration: safeJson(d.configuration) || {}, subscriptionId: d.subscriptionId || null, createdAt: toDateOrNow(d.createdAt), activatedAt: toDate(d.activatedAt), updatedAt: toDateOrNow(d.updatedAt) } });
  });

  console.log('\n─── Phase D: Operations ───');
  await migrateLeads(db);
  await migrateTestimonials(db);
  await migrateSupportCases(db);
  await migrateUsageLogs(db);
  await migrateSecretaryConfigs(db);
  await migrateContentPosts(db);

  console.log('\n─── Phase E: Remaining ───');
  await migrateSimple(db, 'audits', async (id, d) => {
    await prisma.audit.upsert({ where: { id }, update: {}, create: { id, service: d.service || 'unknown', action: d.action || '', status: d.status || 'info', details: safeJson(d.details) || undefined, errorMessage: d.errorMessage || null, createdAt: toDateOrNow(d.createdAt || d.timestamp) } });
  });
  await migrateSimple(db, 'customizationRequests', async (id, d) => {
    const crTemplateId = d.templateId || d.workflowId || 'unknown';
    const crTplExists = await prisma.template.findUnique({ where: { id: crTemplateId } });
    if (!crTplExists) { console.log(`    ⚠ customizationRequests/${id}: template ${crTemplateId} not found, skipping`); return; }
    await prisma.customizationRequest.upsert({ where: { id }, update: {}, create: { id, templateId: crTemplateId, customerEmail: d.customerEmail || d.email || null, parameters: safeJson(d.parameters) || undefined, data: safeJson({ requirements: d.requirements, budget: d.budget, timeline: d.timeline }) || undefined, status: d.status || 'pending', createdAt: toDateOrNow(d.createdAt) } });
  });
  await migrateSimple(db, 'magicLinkTokens', async (id, d) => {
    const mlClientId = d.clientId || 'unknown';
    await ensureUser(mlClientId, d.email);
    await prisma.magicLinkToken.upsert({ where: { id }, update: {}, create: { id, email: d.email || '', clientId: mlClientId, expiresAt: toDateOrNow(d.expiresAt), used: d.used ?? false, createdAt: toDateOrNow(d.createdAt) } });
  });
  await migrateSimple(db, 'launch_tasks', async (id, d) => {
    await prisma.launchTask.upsert({ where: { id }, update: {}, create: { id, title: d.title || '', description: d.description || null, status: d.status || 'pending', order: d.order || 0, metadata: safeJson(d.metadata) || undefined, createdAt: toDateOrNow(d.createdAt) } });
  });
  await migrateSimple(db, 'business_niches', async (id, d) => {
    await prisma.businessNiche.upsert({ where: { id }, update: {}, create: { id, name: d.name || '', slug: d.slug || id, category: d.category || 'other', painPoints: d.painPoints || [], commonServices: d.commonServices || [], typicalRevenue: d.typicalRevenue || null, typicalEmployees: d.typicalEmployees || null, whatsappFaqs: safeJson(d.whatsappFaqs) || undefined, isActive: d.isActive ?? true, order: d.order || 0, createdAt: toDateOrNow(d.createdAt), updatedAt: toDateOrNow(d.updatedAt) } });
  });
  await migrateSimple(db, 'indexed_documents', async (id, d) => {
    await ensureUser(d.clientId || 'unknown');
    await prisma.indexedDocument.upsert({ where: { id }, update: {}, create: { id, clientId: d.clientId || 'unknown', name: d.name || '', type: d.type || 'text', status: d.status || 'processing', url: d.url || null, size: d.size || null, createdAt: toDateOrNow(d.createdAt || d.indexedAt) } });
  });
  // Empty collections (0 docs in dry-run): scorecards, consultations, proposals, requirements, optimizer_audits, service_manifests
  for (const emptyCol of ['scorecards', 'consultations', 'proposals', 'requirements', 'optimizer_audits', 'service_manifests']) {
    initStats(emptyCol);
    const docs = await readCol(db, emptyCol);
    stats[emptyCol].total = docs.length;
    console.log(`  📄 ${emptyCol}: ${docs.length} docs (skip if 0)`);
  }

  // ─── Summary ─────────────────
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  MIGRATION SUMMARY                            ║');
  console.log('╚══════════════════════════════════════════════╝');
  let totalDocs = 0, totalMig = 0, totalSkip = 0, totalErr = 0;
  for (const [col, s] of Object.entries(stats)) {
    const icon = s.errors > 0 ? '⚠' : s.total === 0 ? '○' : '✅';
    console.log(`  ${icon} ${col.padEnd(25)} ${String(s.total).padStart(4)} | ${String(s.migrated).padStart(4)} migrated | ${String(s.skipped).padStart(3)} skip | ${String(s.errors).padStart(3)} err`);
    totalDocs += s.total; totalMig += s.migrated; totalSkip += s.skipped; totalErr += s.errors;
  }
  console.log(`  ${'─'.repeat(55)}`);
  console.log(`  TOTAL: ${totalDocs} docs | ${totalMig} migrated | ${totalSkip} skipped | ${totalErr} errors\n`);
  if (totalErr > 0) console.log(`  ⚠ ${totalErr} errors. Review above.\n`);
  else if (!DRY_RUN) console.log('  ✅ Migration complete!\n');
}

main()
  .catch((err) => { console.error('FATAL:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
