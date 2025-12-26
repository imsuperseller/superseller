#!/usr/bin/env node
/**
 * n8n Workflow Tagging Script
 * 
 * Applies category, status, and client tags to all 124 workflows
 * 
 * Usage: node apply-workflow-tags.cjs
 */

const N8N_API_URL = process.env.N8N_API_URL || 'http://n8n.rensto.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable required');
  process.exit(1);
}

// Complete workflow tagging map based on our categorization
const WORKFLOW_TAGS = {
  // ═══════════════════════════════════════════════════════════════════
  // WHATSAPP AGENTS
  // ═══════════════════════════════════════════════════════════════════
  'eQSCUFw91oXLxtvn': ['whatsapp-agent', 'production', 'template', 'rensto'], // SALES-WHATSAPP-001: Rensto Voice Agent
  '86WHKNpj09tV9j1d': ['whatsapp-agent', 'template', 'dima'], // CUSTOMER-WHATSAPP-001: Liza AI
  '0Cyp9kWJ0oUPNx2L': ['whatsapp-agent', 'dima'], // CUSTOMER-WHATSAPP-002A
  'DNzlEU1vs7aqrlBg': ['whatsapp-agent', 'dima'], // CUSTOMER-WHATSAPP-002B
  '3OukCjHVvBXiXr6u': ['whatsapp-agent', 'internal', 'production'], // INT-WHATSAPP-ROUTER-MODERN
  'nZJJZvWl0MBe3uT4': ['whatsapp-agent', 'internal'], // INT-WHATSAPP-ROUTER-001
  '1LWTwUuN6P6uq2Ha': ['whatsapp-agent', 'internal'], // INT-WHATSAPP-ROUTER-OPTIMIZED
  'CA77hnWrOJUrpSJN': ['whatsapp-agent', 'archive'], // Duplicate
  'hs7c1Y5pdNtfRJAd': ['whatsapp-agent', 'archive'], // Archived
  'GKwumIALkYjN6HMf': ['whatsapp-agent', 'production'], // WhatsApp Group Polling
  'FDX7vCrU3VvM2Go3': ['whatsapp-agent'], // WhatsApp Evolution API
  'Q7I7saENlT4I7bn7': ['whatsapp-agent'], // WhatsApp Polling Listener
  'QGeuha1acbSkwf0h': ['whatsapp-agent'], // Optimized WhatsApp Approval
  't19U37rAQNPfhDfm': ['whatsapp-agent'], // WhatsApp Webhook Listener
  'WbL20M0h2uJDMAYm': ['whatsapp-agent', 'internal'], // INT-WHATSAPP-GEMINI-AGENT
  '80w2xpBPTNGrcZMV': ['whatsapp-agent', 'tax4us'], // WAHA RAG tax4us
  'p4oG6E9DyedGyIo4': ['whatsapp-agent'], // WAHA RAG Assistant
  'wctBX3HGve9jhdPG': ['whatsapp-agent', 'production', 'meatpoint'], // MeatPoint Agent
  'zQrGERNGDfPL7KyB': ['whatsapp-agent', 'meatpoint'], // Meatpoint Dallas
  'afuwFRbipP3bqNZz': ['whatsapp-agent', 'tax4us'], // Tax4US Whatsapp
  'oh9FHhiJgU9Fe1U4': ['whatsapp-agent', 'archive'], // Archived support

  // ═══════════════════════════════════════════════════════════════════
  // LEAD GENERATION
  // ═══════════════════════════════════════════════════════════════════
  '0Ss043Wge5zasNWy': ['lead-generation', 'needs-fix'], // SUB-LEAD-006 (Apollo broken)
  'THgM79EtvserVMKV': ['lead-generation', 'template'], // SUB-LEAD-001
  '9lTWZUMP8Rp2Bt98': ['lead-generation', 'internal', 'production'], // DEV-LEAD-001
  'OqbtExgLG3t8VJz8': ['lead-generation', 'template'], // SUB-LEAD-003
  'h0gcKRZbgrIVK3Ka': ['lead-generation', 'archive'], // SUB-LEAD-004 archived
  'XBy78u2xQbH4DGRE': ['lead-generation'], // SUB-LEAD-005
  'WsgveTBcE0Sul907': ['lead-generation', 'client-specific', 'production'], // SUB-LEAD-007
  'gS87LVGWmiraenEg': ['lead-generation', 'client-specific'], // SUB-LEAD-008
  'weEAv47M3DYzJL0n': ['lead-generation', 'production'], // SUB-LEAD-009
  'SrgOTg0pZX9b8Jmc': ['lead-generation', 'archive'], // SUB-LEAD-002 archived
  'x7GwugG3fzdpuC4f': ['lead-generation', 'internal', 'production'], // INT-LEAD-001
  'BWU6jLuUL3asB9Hk': ['lead-generation', 'internal'], // INT-LEAD-002
  '0SxNwE2IvN43iFpt': ['lead-generation', 'archive'], // MKT-LEAD-001 archived
  '4cg1KYQmBvRqQnoR': ['lead-generation', 'archive'], // ARCHIVED Smart Israeli
  '6Y3EQ6pWyh5enLHG': ['lead-generation', 'archive'], // ARCHIVED Micro-SaaS
  'D3gvVLGWGHNQixIp': ['lead-generation', 'archive'], // ARCHIVED AI Lead Gen
  'UWb1837Pg8Ssubpe': ['lead-generation', 'archive'], // ARCHIVED Micro-SaaS
  'fIv6GZJ4XhFL59wu': ['lead-generation', 'archive'], // ARCHIVED Micro-SaaS
  'A7AjDqvVw3m0kia5': ['lead-generation', 'archive'], // ARCHIVED DFW
  'NpZpK8Z414giaLjO': ['lead-generation', 'archive'], // ARCHIVED Cold Outreach
  'cgk7FI57o6cg3eju': ['lead-generation', 'archive'], // ARCHIVED Smart Israeli
  'tnTlHG7pBLgfOxq4': ['lead-generation', 'archive'], // ARCHIVED Smart Israeli
  'BZ1wk9DlZncPRN8t': ['lead-generation', 'archive'], // ARCHIVED Production
  'yr0tLBk4fFHMUq1U': ['lead-generation', 'archive'], // ARCHIVED Production
  'tCYSKNvbOGTKgc2N': ['lead-generation', 'archive'], // ARCHIVED MicroSaaS NYC
  'h6MfeXa0EMsv6Uih': ['lead-generation', 'email'], // SUB-EMAIL-002
  'htkWSRkCIvootY8q': ['lead-generation'], // SUB-ENRICH-001
  'kBURLOU888WjFqkX': ['lead-generation', 'monitor'], // SUB-MONITOR-001

  // ═══════════════════════════════════════════════════════════════════
  // CONTENT/MARKETING
  // ═══════════════════════════════════════════════════════════════════
  'GRlA3iuB7A8y8xFJ': ['content-pipeline', 'tax4us', 'template', 'production'], // TAX4US Blog Master
  '9PHPlSvFNfMY4L6w': ['content-pipeline', 'tax4us'], // Daily WordPress tax4us
  'ZJUWCQNKSNcyDpWL': ['content-pipeline', 'tax4us'], // Daily WordPress Rank Math
  '5mObI7a6JbqbmWDa': ['content-pipeline', 'tax4us'], // Podcast Master tax4us
  '5pMi01SwffYB6KeX': ['content-pipeline', 'production', 'template'], // Chase AI Guides Youtuber
  '6zJDmAgRKpu0qdXJ': ['content-pipeline', 'internal', 'production'], // MKT-CONTENT-001
  'C56KDpSOgzIwf42S': ['content-pipeline', 'internal'], // MKT-TEMPLATE-001 (inactive)
  'qL6tmZBqrkm84LkX': ['content-pipeline', 'internal', 'production'], // MKT-TEMPLATE-001 (active)
  'ZlPk13SD1XCUMhhb': ['content-pipeline', 'internal'], // MKT-TEMPLATE-001 social
  'cJbG8MpomtNrR1Sa': ['content-pipeline', 'internal', 'production'], // MKT-OPTIMIZE-001
  'vV9qnwTU8aq63opJ': ['content-pipeline', 'internal'], // MKT-MARKETPLACE-001
  'CydsTsbkaL5xQkIJ': ['content-pipeline', 'template'], // Automated Social Media
  'zgFBKmbMWbnqZiwk': ['content-pipeline'], // TikTok Posts
  'F0f4PtwG9FQM7ME9': ['content-pipeline', 'production'], // Cinematic Pitch Engine
  'f2GHwdzxcsv2HcAW': ['content-pipeline', 'production'], // Sora 2 rensto-custom
  'nEOPdmUOE0bK37sQ': ['content-pipeline'], // Sora 2 Evolution API
  '8GC371u1uBQ8WLmu': ['content-pipeline'], // Find Winning Ads
  'XTTFteuNaCKEL455': ['content-pipeline', 'meatpoint'], // MeatPoint Video Ideas
  'MOxiwcLhQMMHCGPM': ['content-pipeline', 'internal', 'production'], // INT-CONTENT-001 Daf Yomi
  'OdtoCM2XxiBNtL3L': ['content-pipeline', 'internal'], // INT-CONTENT-002 Daf Yomi

  // ═══════════════════════════════════════════════════════════════════
  // VOICE AI
  // ═══════════════════════════════════════════════════════════════════
  '1ORV3KSLVRwqUbY0': ['voice-ai', 'template'], // Inbound Voice Agent
  'tDkJbZYRVgmGuByz': ['voice-ai'], // Israeli News Voice Bot
  '84YwyEvH2FzZUGH8': ['voice-ai', 'forms'], // TYPEFORM-VOICE-AI
  'vFA8zLCGlL6nn5Lq': ['voice-ai', 'internal', 'production'], // INT-CUSTOM-LEAD ELEVENLABS

  // ═══════════════════════════════════════════════════════════════════
  // INTERNAL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  // Infrastructure
  '7ArwzAJhIUlpOEZh': ['internal', 'infra', 'production'], // INT-INFRA-001 Terry
  'kGJlGfmnIHPvzket': ['internal', 'infra', 'production'], // INT-INFRA-002 SSH
  '5Fl9WUjYTpodcloJ': ['internal', 'infra', 'production'], // INT-INFRA-009 Calendar Dom
  'se8JzwjqkOZNWt3Z': ['internal', 'infra', 'email', 'production'], // INT-INFRA-015 Email Ron
  
  // Tech
  'ffahgxCnZvLLklOv': ['internal', 'tech', 'archive'], // INT-TECH-002 archived
  'QxfNnhlEXY2mZFM2': ['internal', 'tech', 'production'], // INT-TECH-003 OAuth
  'WiADCj8mBCMPifYe': ['internal', 'tech', 'production'], // INT-TECH-004 Multi-Tenant
  'Uu6JdNAsz7cr14XF': ['internal', 'tech', 'sync', 'production'], // INT-TECH-005 Integration
  
  // Monitor
  'AOYcPkiRurYg8Pji': ['internal', 'monitor', 'production'], // INT-MONITOR-002
  'Eu0ldg1B04bSSBC0': ['internal', 'monitor'], // INT-MONITOR-003
  
  // Sync
  'QHNZ5WTdnYdaAr93': ['internal', 'sync', 'archive'], // INT-SYNC-004 archived
  'ipP7GRTeJrpwxyQx': ['internal', 'sync', 'payments', 'production'], // INT-SYNC-005 QuickBooks
  'ZRGVkpUirNrAF0KL': ['internal', 'sync'], // INT-SYNC-006 Home Assistant
  
  // Email
  'DeUmb1mwj1vaXVBp': ['internal', 'email', 'production'], // INT-EMAIL-001
  
  // AI
  'qEQbFBvjvygqovYm': ['internal', 'ai', 'production'], // INT-AI-001
  
  // CRM
  'DANuAnhFiehSvMiV': ['internal', 'crm', 'production'], // INT-CUSTOMER-002
  'asvylLhkdF6sXTQa': ['internal', 'crm', 'production'], // INT-CUSTOMER-003

  // ═══════════════════════════════════════════════════════════════════
  // PAYMENTS (STRIPE)
  // ═══════════════════════════════════════════════════════════════════
  'FOWZV3tTy5Pv84HP': ['payments', 'production'], // STRIPE-MARKETPLACE-001
  'QdalBg1LUY0xpwPR': ['payments', 'production'], // STRIPE-INSTALL-001
  'APAOVLYBWKZF8Ch8': ['payments', 'production'], // STRIPE-READY-001
  'NCoV3cPjS9JCNCed': ['payments', 'production'], // STRIPE-CUSTOM-001
  'qDZTfVWD6ClDXa0a': ['payments', 'production'], // STRIPE-SUBSCRIPTION-001
  'AdgeSyjBQS7brUBb': ['payments', 'internal', 'production'], // DEV-FIN-006

  // ═══════════════════════════════════════════════════════════════════
  // FORMS (TYPEFORM)
  // ═══════════════════════════════════════════════════════════════════
  '0zizVjeRiPp8QOb7': ['forms', 'archive'], // TYPEFORM-FREE-LEADS
  '1NgUtwNhG19JoVCX': ['forms'], // TYPEFORM-TEMPLATE-REQUEST
  'KXVJUtRiwozkKBmO': ['forms'], // TYPEFORM-READY-SOLUTIONS
  'NgqR5LtBhhaFQ8j0': ['forms', 'archive'], // TYPEFORM-READINESS archived

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT: TAX4US
  // ═══════════════════════════════════════════════════════════════════
  '7zzmIgdAwF8uYESp': ['tax4us', 'production'], // PDF Gemini tax4us

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT: DIMA
  // ═══════════════════════════════════════════════════════════════════
  '7cY8QD8CikWXy8Gk': ['dima'], // PDF Gemini Dima

  // ═══════════════════════════════════════════════════════════════════
  // CLIENT: MEATPOINT
  // ═══════════════════════════════════════════════════════════════════
  'B6B5wp92JZbiKaC9': ['meatpoint', 'production'], // PDF Gemini meatpoint

  // ═══════════════════════════════════════════════════════════════════
  // INTERNAL: RENSTO
  // ═══════════════════════════════════════════════════════════════════
  'BtpIM8sVdkrDvWrh': ['internal', 'rensto', 'production'], // PDF Gemini Rensto

  // ═══════════════════════════════════════════════════════════════════
  // TESTING/DEV
  // ═══════════════════════════════════════════════════════════════════
  'Pn7a4h2h3DTsSS6h': ['testing', 'internal', 'production'], // DEV-TEST-001
  'NUgSHEvCSeMdIVR0': ['testing', 'internal'], // TEST-OLLAMA-001
  'F3Ch9QhSUbmI4PKP': ['testing'], // Minimal Test
  'U7uMULHYCZjbDvVv': ['testing'], // Cinematic Pitch Test
  'UX4WxVBMX0cNGmEK': ['testing'], // Test Perplexity
  'WokyaqSG5F8WJloq': ['testing'], // My workflow

  // ═══════════════════════════════════════════════════════════════════
  // INSURANCE
  // ═══════════════════════════════════════════════════════════════════
  'Q3E94KHVh44lgVSP': ['insurance', 'production'], // DEV-INSURE-001
  '9JWqzXgEzoD4XKCP': ['insurance'], // DEV-INSURE-002
  'DqvQyTuWplhycUjh': ['insurance'], // DEV-INSURE-003
  'L0t86xpKLMmqHQFj': ['insurance'], // DEV-INSURE-004
  'Q6ujantLJCrvcaUq': ['insurance'], // DEV-INSURE-005
  'ua4t56fmRCdNIQUk': ['insurance'], // DEV-INSURE-006

  // ═══════════════════════════════════════════════════════════════════
  // OTHER/MISC
  // ═══════════════════════════════════════════════════════════════════
  '8Fls0QPWnGyTkTz5': ['internal', 'crm', 'production'], // DEV-003 Airtable
  'X3jxeLsebWDY7uku': ['internal'], // DEV-001 Business Intelligence
  'yjDsmVCkO3vktM6e': ['internal'], // DEV-005 Medical Symptom
  'y2vMGgPT5aQKtrdT': ['internal', 'production'], // Home Assistant Agent
  'a24nCv42JJAM3OCi': ['internal'], // DEMO-MODE-TOGGLE
  'dHmbohbSPAACutey': ['archive'], // ARCHIVED Working Optimized
  'PUadkuAQnHNfwt7D': ['internal', 'payments'], // SUB-FINANCE-001
  'ioGRFAJg5Id8RxAw': ['archive'], // AI Ads God archived
};

async function getTagByName(tagName) {
  const response = await fetch(`${N8N_API_URL}/api/v1/tags`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  const tag = data.data?.find(t => t.name === tagName);
  return tag;
}

async function getAllTags() {
  const response = await fetch(`${N8N_API_URL}/api/v1/tags`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  if (!response.ok) return {};
  
  const data = await response.json();
  const tagMap = {};
  for (const tag of (data.data || [])) {
    tagMap[tag.name] = tag.id;
  }
  return tagMap;
}

async function getWorkflow(id) {
  const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${id}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  if (!response.ok) return null;
  return await response.json();
}

async function updateWorkflowTags(workflowId, tagIds) {
  // Get current workflow to check existing tags
  const workflow = await getWorkflow(workflowId);
  if (!workflow) return { success: false, error: 'Workflow not found' };
  
  // Get current tag IDs
  const existingTagIds = new Set((workflow.tags || []).map(t => t.id));
  
  // Only add tags that don't already exist
  const newTagIds = tagIds.filter(id => !existingTagIds.has(id));
  
  if (newTagIds.length === 0) {
    return { success: true, skipped: true };
  }
  
  // Use the workflow-tags endpoint: PUT /api/v1/workflows/{id}/tags
  // This replaces all tags, so we need to include existing + new
  const allTagIds = [...new Set([...existingTagIds, ...tagIds])];
  
  const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflowId}/tags`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY
    },
    body: JSON.stringify(allTagIds.map(id => ({ id })))
  });
  
  if (!response.ok) {
    const error = await response.text();
    return { success: false, error };
  }
  
  return { success: true };
}

async function main() {
  console.log('🏷️  Applying Tags to Workflows\n');
  console.log(`📍 Target: ${N8N_API_URL}`);
  console.log(`📋 Workflows to tag: ${Object.keys(WORKFLOW_TAGS).length}\n`);
  
  // Get all tags
  console.log('📥 Loading tag IDs...');
  const tagMap = await getAllTags();
  console.log(`   Found ${Object.keys(tagMap).length} tags\n`);
  
  let success = 0;
  let failed = 0;
  let skipped = 0;
  
  console.log('🔨 Applying tags...\n');
  
  for (const [workflowId, tagNames] of Object.entries(WORKFLOW_TAGS)) {
    // Convert tag names to IDs
    const tagIds = [];
    let missingTag = false;
    
    for (const tagName of tagNames) {
      const tagId = tagMap[tagName];
      if (!tagId) {
        console.log(`   ⚠️  Tag not found: ${tagName}`);
        missingTag = true;
      } else {
        tagIds.push(tagId);
      }
    }
    
    if (missingTag) {
      console.log(`   ⏭️  ${workflowId} (missing tags)`);
      skipped++;
      continue;
    }
    
    const result = await updateWorkflowTags(workflowId, tagIds);
    
    if (result.success) {
      console.log(`   ✅ ${workflowId} → [${tagNames.join(', ')}]`);
      success++;
    } else {
      console.log(`   ❌ ${workflowId}: ${result.error}`);
      failed++;
    }
    
    // Rate limit to avoid overwhelming the API
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Tagged: ${success}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (success > 0) {
    console.log('\n🎉 Workflows tagged successfully!');
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
