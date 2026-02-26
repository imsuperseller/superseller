#!/usr/bin/env node
/**
 * n8n Workflow Renaming Script
 * 
 * Renames workflows to follow convention: [TYPE]-[CAT]-[NUM]: Description vX
 * 
 * Usage: node rename-workflows.cjs
 */

const N8N_API_URL = process.env.N8N_API_URL || 'http://n8n.superseller.agency';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable required');
  process.exit(1);
}

// Naming convention: [TYPE]-[CAT]-[NUM]: Description vX
// Types: WA (WhatsApp), LEAD (Lead Gen), CONTENT, VOICE, INFRA, TECH, MONITOR, SYNC, EMAIL, PAY, FORM, TEST, INSURE

const WORKFLOW_RENAMES = {
  // ═══════════════════════════════════════════════════════════════════
  // WHATSAPP AGENTS - Already well-named, minor tweaks
  // ═══════════════════════════════════════════════════════════════════
  'eQSCUFw91oXLxtvn': 'WA-AGENT-001: SuperSeller AI Voice Agent (Shai AI) v1',
  '86WHKNpj09tV9j1d': 'WA-AGENT-002: Liza AI - Kitchen Design Assistant v1',
  '0Cyp9kWJ0oUPNx2L': 'WA-AGENT-003A: Human-in-Loop Question Handler v1',
  'DNzlEU1vs7aqrlBg': 'WA-AGENT-003B: Human-in-Loop Answer Handler v1',
  '3OukCjHVvBXiXr6u': 'WA-ROUTER-001: Multi-Customer AI Router v1',
  'nZJJZvWl0MBe3uT4': 'WA-ROUTER-002: WhatsApp Message Router v1',
  '1LWTwUuN6P6uq2Ha': 'WA-ROUTER-003: Optimized Multi-Customer Router v1',
  'GKwumIALkYjN6HMf': 'WA-UTIL-001: Group Polling Approval Handler v1',
  'FDX7vCrU3VvM2Go3': 'WA-UTIL-002: Evolution API Approval Handler v1',
  'Q7I7saENlT4I7bn7': 'WA-UTIL-003: Polling Listener v1',
  'QGeuha1acbSkwf0h': 'WA-UTIL-004: Optimized Approval Handler v1',
  't19U37rAQNPfhDfm': 'WA-UTIL-005: Webhook Listener v1',
  'WbL20M0h2uJDMAYm': 'WA-AGENT-004: Gemini Runtime Chatbot v1',
  '80w2xpBPTNGrcZMV': 'WA-AGENT-005: Tax4Us RAG Voice Assistant v1',
  'p4oG6E9DyedGyIo4': 'WA-AGENT-006: WAHA RAG Assistant v1',
  'wctBX3HGve9jhdPG': 'WA-AGENT-007: MeatPoint Agent v1',
  'zQrGERNGDfPL7KyB': 'WA-AGENT-008: MeatPoint Dallas Agent v1',
  'afuwFRbipP3bqNZz': 'WA-AGENT-009: Tax4Us WhatsApp Agent v1',

  // ═══════════════════════════════════════════════════════════════════
  // LEAD GENERATION
  // ═══════════════════════════════════════════════════════════════════
  '0Ss043Wge5zasNWy': 'LEAD-GEN-001: Cold Outreach Lead Machine v2 [NEEDS-FIX]',
  'THgM79EtvserVMKV': 'LEAD-GEN-002: Israeli Professional Lead Generator v1',
  '9lTWZUMP8Rp2Bt98': 'LEAD-GEN-003: Israeli LinkedIn Leads v1',
  'OqbtExgLG3t8VJz8': 'LEAD-GEN-004: Local Lead Finder & Email Sender v1',
  'XBy78u2xQbH4DGRE': 'LEAD-GEN-005: DFW Lead Discovery Service v1',
  'WsgveTBcE0Sul907': 'LEAD-GEN-006: Best Amusement Games Lead Gen v1',
  'gS87LVGWmiraenEg': 'LEAD-GEN-007: Best Amusement Games FB Discovery v1',
  'weEAv47M3DYzJL0n': 'LEAD-GEN-008: Production Lead Gen Comprehensive v1',
  'x7GwugG3fzdpuC4f': 'LEAD-ORCH-001: Lead Machine Orchestrator v2',
  'BWU6jLuUL3asB9Hk': 'LEAD-UTIL-001: Lead Machine Webhook Handler v1',
  'h6MfeXa0EMsv6Uih': 'LEAD-EMAIL-001: Best Amusement Games Outreach v1',
  'htkWSRkCIvootY8q': 'LEAD-ENRICH-001: Best Amusement Games Scoring v1',
  'kBURLOU888WjFqkX': 'LEAD-MONITOR-001: Best Amusement Games Tracking v1',

  // ═══════════════════════════════════════════════════════════════════
  // CONTENT/MARKETING
  // ═══════════════════════════════════════════════════════════════════
  'GRlA3iuB7A8y8xFJ': 'CONTENT-AGENT-001: Tax4Us Blog Master Pipeline v1',
  '9PHPlSvFNfMY4L6w': 'CONTENT-WP-001: Tax4Us WordPress Auto-Publishing v1',
  'ZJUWCQNKSNcyDpWL': 'CONTENT-WP-002: WordPress Rank Math Optimizer v1',
  '5mObI7a6JbqbmWDa': 'CONTENT-POD-001: Tax4Us Podcast Master v1',
  '5pMi01SwffYB6KeX': 'CONTENT-VIDEO-001: AI Guides YouTuber Cloner v1',
  '6zJDmAgRKpu0qdXJ': 'CONTENT-GEN-001: AI Landing Page Generator v1',
  'C56KDpSOgzIwf42S': 'CONTENT-SORA-001: Sora 2 Automation Template v1',
  'qL6tmZBqrkm84LkX': 'CONTENT-SORA-002: Sora 2 Automation Active v1',
  'ZlPk13SD1XCUMhhb': 'CONTENT-SORA-003: Sora 2 Social Template v1',
  'cJbG8MpomtNrR1Sa': 'CONTENT-OPT-001: Landing Page Optimizer v1',
  'vV9qnwTU8aq63opJ': 'CONTENT-MKT-001: Workflow Generalizer & Publisher v1',
  'CydsTsbkaL5xQkIJ': 'CONTENT-SOCIAL-001: Automated Social Media Video v1',
  'zgFBKmbMWbnqZiwk': 'CONTENT-SOCIAL-002: TikTok Posts Automation v1',
  'F0f4PtwG9FQM7ME9': 'CONTENT-GEN-002: Cinematic Pitch Engine v1',
  'f2GHwdzxcsv2HcAW': 'CONTENT-SORA-004: SuperSeller AI Custom Script & Show v1',
  'nEOPdmUOE0bK37sQ': 'CONTENT-SORA-005: Sora 2 Evolution API Polls v1',
  '8GC371u1uBQ8WLmu': 'CONTENT-ADS-001: Find Winning Ads Meta Library v1',
  'XTTFteuNaCKEL455': 'CONTENT-VIDEO-002: MeatPoint Video Ideas Agent v1',
  'MOxiwcLhQMMHCGPM': 'CONTENT-DIGEST-001: Daf Yomi Digest v2',
  'OdtoCM2XxiBNtL3L': 'CONTENT-DIGEST-002: Daf Yomi Digest v1',

  // ═══════════════════════════════════════════════════════════════════
  // VOICE AI
  // ═══════════════════════════════════════════════════════════════════
  '1ORV3KSLVRwqUbY0': 'VOICE-AGENT-001: Inbound Voice Agent v1',
  'tDkJbZYRVgmGuByz': 'VOICE-BOT-001: Israeli News Voice Bot v1',
  '84YwyEvH2FzZUGH8': 'VOICE-FORM-001: Typeform Voice AI Integration v1',
  'vFA8zLCGlL6nn5Lq': 'VOICE-TTS-001: ElevenLabs Custom Lead v1',

  // ═══════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════════
  '7ArwzAJhIUlpOEZh': 'INFRA-AGENT-001: Server Monitor (Terry) v1',
  'kGJlGfmnIHPvzket': 'INFRA-SSH-001: RackNerd SSH Access v1',
  '5Fl9WUjYTpodcloJ': 'INFRA-AGENT-002: Calendar Agent (Dom) v1',
  'se8JzwjqkOZNWt3Z': 'INFRA-EMAIL-001: SuperSeller AI Email Agent (Ron) v2',

  // ═══════════════════════════════════════════════════════════════════
  // TECH
  // ═══════════════════════════════════════════════════════════════════
  'QxfNnhlEXY2mZFM2': 'TECH-AUTH-001: OAuth Configuration Management v1',
  'WiADCj8mBCMPifYe': 'TECH-SAAS-001: Multi-Tenant SaaS Architecture v1',
  'Uu6JdNAsz7cr14XF': 'TECH-SYNC-001: n8n-Airtable-Notion Integration v1',

  // ═══════════════════════════════════════════════════════════════════
  // MONITOR
  // ═══════════════════════════════════════════════════════════════════
  'AOYcPkiRurYg8Pji': 'MONITOR-DASH-001: Admin Dashboard Data v1',
  'Eu0ldg1B04bSSBC0': 'MONITOR-SYNC-001: Real-Time Data Sync v1',

  // ═══════════════════════════════════════════════════════════════════
  // SYNC
  // ═══════════════════════════════════════════════════════════════════
  'ipP7GRTeJrpwxyQx': 'SYNC-FIN-001: QuickBooks Financial Sync v1',
  'ZRGVkpUirNrAF0KL': 'SYNC-HA-001: Home Assistant Airtable Sync v1',

  // ═══════════════════════════════════════════════════════════════════
  // EMAIL
  // ═══════════════════════════════════════════════════════════════════
  'DeUmb1mwj1vaXVBp': 'EMAIL-AUTO-001: Email Automation System v1',

  // ═══════════════════════════════════════════════════════════════════
  // AI
  // ═══════════════════════════════════════════════════════════════════
  'qEQbFBvjvygqovYm': 'AI-FRAME-001: AI Solutions Framework v1',

  // ═══════════════════════════════════════════════════════════════════
  // CRM
  // ═══════════════════════════════════════════════════════════════════
  'DANuAnhFiehSvMiV': 'CRM-SYNC-001: Customer-Project Data Sync v1',
  'asvylLhkdF6sXTQa': 'CRM-SYNC-002: Project-Task Data Integration v1',

  // ═══════════════════════════════════════════════════════════════════
  // PAYMENTS (STRIPE)
  // ═══════════════════════════════════════════════════════════════════
  'FOWZV3tTy5Pv84HP': 'PAY-STRIPE-001: Template Purchase Handler v1',
  'QdalBg1LUY0xpwPR': 'PAY-STRIPE-002: Installation Service Handler v1',
  'APAOVLYBWKZF8Ch8': 'PAY-STRIPE-003: Ready Solutions Handler v1',
  'NCoV3cPjS9JCNCed': 'PAY-STRIPE-004: Custom Solutions Handler v1',
  'qDZTfVWD6ClDXa0a': 'PAY-STRIPE-005: Monthly Subscription Handler v1',
  'AdgeSyjBQS7brUBb': 'PAY-FIN-001: Stripe Revenue Sync v1',

  // ═══════════════════════════════════════════════════════════════════
  // FORMS (TYPEFORM)
  // ═══════════════════════════════════════════════════════════════════
  '1NgUtwNhG19JoVCX': 'FORM-TF-001: Template Request Handler v1',
  'KXVJUtRiwozkKBmO': 'FORM-TF-002: Ready Solutions Quiz Handler v1',

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT: TAX4US
  // ═══════════════════════════════════════════════════════════════════
  '7zzmIgdAwF8uYESp': 'CLIENT-TAX4US-001: PDF Gemini File Search v1',

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT: DIMA
  // ═══════════════════════════════════════════════════════════════════
  '7cY8QD8CikWXy8Gk': 'CLIENT-DIMA-001: PDF Gemini File Search v1',

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT: MEATPOINT
  // ═══════════════════════════════════════════════════════════════════
  'B6B5wp92JZbiKaC9': 'CLIENT-MEATPOINT-001: PDF Gemini File Search v1',

  // ═══════════════════════════════════════════════════════════════════
  // INTERNAL: RENSTO
  // ═══════════════════════════════════════════════════════════════════
  'BtpIM8sVdkrDvWrh': 'RENSTO-RAG-001: PDF Gemini File Search v1',

  // ═══════════════════════════════════════════════════════════════════
  // TESTING
  // ═══════════════════════════════════════════════════════════════════
  'Pn7a4h2h3DTsSS6h': 'TEST-001: Optimized Workflow Test v1',
  'NUgSHEvCSeMdIVR0': 'TEST-002: Ollama Validation Test v1',
  'F3Ch9QhSUbmI4PKP': 'TEST-003: Minimal Test v1',
  'U7uMULHYCZjbDvVv': 'TEST-004: Cinematic Pitch Test v1',
  'UX4WxVBMX0cNGmEK': 'TEST-005: Perplexity Test v1',
  'WokyaqSG5F8WJloq': 'TEST-006: Basic Test v1',

  // ═══════════════════════════════════════════════════════════════════
  // INSURANCE
  // ═══════════════════════════════════════════════════════════════════
  'Q3E94KHVh44lgVSP': 'INSURE-AGENT-001: Family Insurance Analysis v1',
  '9JWqzXgEzoD4XKCP': 'INSURE-AGENT-002: Family Insurance Summary v1',
  'DqvQyTuWplhycUjh': 'INSURE-AGENT-003: Family Insurance Analysis v2',
  'L0t86xpKLMmqHQFj': 'INSURE-AGENT-004: Family Insurance Analysis v3',
  'Q6ujantLJCrvcaUq': 'INSURE-AGENT-005: Family Insurance Processing v2',
  'ua4t56fmRCdNIQUk': 'INSURE-PARSER-001: Family Insurance PDF Parser v1',

  // ═══════════════════════════════════════════════════════════════════
  // OTHER/MISC
  // ═══════════════════════════════════════════════════════════════════
  '8Fls0QPWnGyTkTz5': 'CRM-SCORE-001: Airtable Customer Scoring v1',
  'X3jxeLsebWDY7uku': 'BI-ANALYTICS-001: Business Intelligence v1',
  'yjDsmVCkO3vktM6e': 'AI-MEDICAL-001: Medical Symptom Analysis v1',
  'y2vMGgPT5aQKtrdT': 'HA-AGENT-001: Home Assistant Agent (Homey) v1',
  'a24nCv42JJAM3OCi': 'UTIL-DEMO-001: Demo Mode Toggle v1',
  'PUadkuAQnHNfwt7D': 'FIN-QB-001: Invoice Automation QuickBooks v1',

  // ═══════════════════════════════════════════════════════════════════
  // ARCHIVED - Mark with [ARCHIVED] prefix
  // ═══════════════════════════════════════════════════════════════════
  'CA77hnWrOJUrpSJN': '[ARCHIVED] WA-ROUTER-DUP: Router Duplicate',
  'hs7c1Y5pdNtfRJAd': '[ARCHIVED] WA-ROUTER-OLD: Router Old Version',
  'oh9FHhiJgU9Fe1U4': '[ARCHIVED] WA-SUPPORT-001: SuperSeller AI Support Agent',
  'h0gcKRZbgrIVK3Ka': '[ARCHIVED] LEAD-GEN-OLD-004: Smart Lead Enrichment',
  'SrgOTg0pZX9b8Jmc': '[ARCHIVED] LEAD-GEN-OLD-002: Facebook Groups Scraper',
  '0SxNwE2IvN43iFpt': '[ARCHIVED] LEAD-GEN-OLD-001: SaaS Template',
  '4cg1KYQmBvRqQnoR': '[ARCHIVED] LEAD-GEN-OLD-003: Smart Israeli Leads',
  '6Y3EQ6pWyh5enLHG': '[ARCHIVED] LEAD-GEN-OLD-005: Micro-SaaS v1',
  'D3gvVLGWGHNQixIp': '[ARCHIVED] LEAD-GEN-OLD-006: AI Lead Gen SaaS',
  'UWb1837Pg8Ssubpe': '[ARCHIVED] LEAD-GEN-OLD-007: Micro-SaaS v2',
  'fIv6GZJ4XhFL59wu': '[ARCHIVED] LEAD-GEN-OLD-008: Micro-SaaS v3',
  'A7AjDqvVw3m0kia5': '[ARCHIVED] LEAD-GEN-OLD-009: DFW Working',
  'NpZpK8Z414giaLjO': '[ARCHIVED] LEAD-GEN-OLD-010: Cold Outreach 3.0',
  'cgk7FI57o6cg3eju': '[ARCHIVED] LEAD-GEN-OLD-011: Smart Israeli v1',
  'tnTlHG7pBLgfOxq4': '[ARCHIVED] LEAD-GEN-OLD-012: Smart Israeli v2',
  'BZ1wk9DlZncPRN8t': '[ARCHIVED] LEAD-GEN-OLD-013: Production Comprehensive',
  'yr0tLBk4fFHMUq1U': '[ARCHIVED] LEAD-GEN-OLD-014: Production Comp v2',
  'tCYSKNvbOGTKgc2N': '[ARCHIVED] LEAD-GEN-OLD-015: MicroSaaS NYC',
  'ffahgxCnZvLLklOv': '[ARCHIVED] TECH-DEPLOY-001: Template Deployment',
  'QHNZ5WTdnYdaAr93': '[ARCHIVED] SYNC-NOTION-001: Notion-Airtable Sync',
  '0zizVjeRiPp8QOb7': '[ARCHIVED] FORM-TF-003: Free Leads Sample',
  'NgqR5LtBhhaFQ8j0': '[ARCHIVED] FORM-TF-004: Readiness Scorecard',
  'dHmbohbSPAACutey': '[ARCHIVED] TEST-OLD-001: Working Optimized',
  'ioGRFAJg5Id8RxAw': '[ARCHIVED] ADS-OLD-001: AI Ads God',
};

async function getWorkflow(id) {
  const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${id}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  if (!response.ok) return null;
  return await response.json();
}

async function renameWorkflow(workflowId, newName) {
  // Get current workflow
  const workflow = await getWorkflow(workflowId);
  if (!workflow) return { success: false, error: 'Workflow not found' };
  
  // Skip if already has the correct name
  if (workflow.name === newName) {
    return { success: true, skipped: true, oldName: workflow.name };
  }
  
  // Clean settings - remove non-boolean saveExecutionProgress if present
  const cleanSettings = { ...(workflow.settings || {}) };
  if (cleanSettings.saveExecutionProgress !== undefined && typeof cleanSettings.saveExecutionProgress !== 'boolean') {
    delete cleanSettings.saveExecutionProgress;
  }
  
  // Update workflow name using PUT - IMPORTANT: Do NOT include tags
  const updatePayload = {
    name: newName,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: cleanSettings
    // Explicitly NOT including: tags, staticData (to avoid constraint issues)
  };
  
  const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY
    },
    body: JSON.stringify(updatePayload)
  });
  
  if (!response.ok) {
    const error = await response.text();
    return { success: false, error, oldName: workflow.name };
  }
  
  return { success: true, oldName: workflow.name };
}

async function main() {
  console.log('📝 Renaming Workflows to Convention\n');
  console.log(`📍 Target: ${N8N_API_URL}`);
  console.log(`📋 Workflows to rename: ${Object.keys(WORKFLOW_RENAMES).length}\n`);
  
  let success = 0;
  let skipped = 0;
  let failed = 0;
  
  console.log('🔨 Renaming workflows...\n');
  
  for (const [workflowId, newName] of Object.entries(WORKFLOW_RENAMES)) {
    const result = await renameWorkflow(workflowId, newName);
    
    if (result.success) {
      if (result.skipped) {
        console.log(`   ⏭️  ${workflowId} (already named correctly)`);
        skipped++;
      } else {
        console.log(`   ✅ ${result.oldName}`);
        console.log(`      → ${newName}`);
        success++;
      }
    } else {
      console.log(`   ❌ ${workflowId}: ${result.error}`);
      failed++;
    }
    
    // Rate limit to avoid overwhelming the API
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Renamed: ${success}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (success > 0) {
    console.log('\n🎉 Workflows renamed successfully!');
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
