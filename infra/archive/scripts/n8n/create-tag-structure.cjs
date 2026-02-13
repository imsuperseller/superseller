#!/usr/bin/env node
/**
 * n8n Tag Structure Creation Script
 * 
 * Creates the complete tag taxonomy for organizing 124 workflows
 * 
 * Usage: node create-tag-structure.cjs
 */

const N8N_API_URL = process.env.N8N_API_URL || 'http://n8n.rensto.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable required');
  console.error('   Export it: export N8N_API_KEY="your-api-key"');
  process.exit(1);
}

const TAGS_TO_CREATE = [
  // Category Tags (Primary - every workflow needs one)
  { name: 'whatsapp-agent', description: 'WhatsApp/WAHA agent workflows' },
  { name: 'lead-generation', description: 'Lead generation and scraping workflows' },
  { name: 'content-pipeline', description: 'Content creation and marketing workflows' },
  { name: 'voice-ai', description: 'Voice AI and TTS workflows' },
  { name: 'internal', description: 'Rensto internal operations' },
  { name: 'payments', description: 'Stripe and payment workflows' },
  { name: 'forms', description: 'Typeform and form handling' },
  
  // Status Tags (Every workflow needs one)
  { name: 'production', description: 'Working, production-ready workflow' },
  { name: 'template', description: 'Ready to copy for new clients' },
  { name: 'needs-fix', description: 'Known issues, needs repair' },
  { name: 'archive', description: 'Old/deprecated, do not use' },
  { name: 'testing', description: 'Experimental, under development' },
  
  // Client Tags
  { name: 'rensto', description: 'Rensto internal workflows' },
  { name: 'tax4us', description: 'Tax4Us client workflows' },
  { name: 'dima', description: 'Dima Vainer client workflows' },
  { name: 'meatpoint', description: 'MeatPoint Dallas client workflows' },
  { name: 'client-specific', description: 'Other client-specific work' },
  
  // Sub-category Tags
  { name: 'infra', description: 'Infrastructure workflows' },
  { name: 'tech', description: 'Technical/system workflows' },
  { name: 'monitor', description: 'Monitoring workflows' },
  { name: 'sync', description: 'Data synchronization workflows' },
  { name: 'email', description: 'Email automation workflows' },
  { name: 'ai', description: 'AI/LLM workflows' },
  { name: 'crm', description: 'Customer management workflows' },
  { name: 'insurance', description: 'Insurance-related workflows' }
];

async function createTag(tag) {
  const response = await fetch(`${N8N_API_URL}/api/v1/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY
    },
    body: JSON.stringify({ name: tag.name })
  });
  
  if (response.ok) {
    const data = await response.json();
    return { success: true, tag: data, created: true };
  } else if (response.status === 409) {
    // Tag already exists
    return { success: true, tag: tag, created: false, existed: true };
  } else {
    const error = await response.text();
    return { success: false, error, tag: tag.name };
  }
}

async function listExistingTags() {
  const response = await fetch(`${N8N_API_URL}/api/v1/tags`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  if (response.ok) {
    return await response.json();
  }
  return [];
}

async function main() {
  console.log('🏷️  n8n Tag Structure Creation\n');
  console.log(`📍 Target: ${N8N_API_URL}\n`);
  
  // List existing tags first
  console.log('📋 Checking existing tags...');
  const existing = await listExistingTags();
  const existingNames = new Set(existing.data?.map(t => t.name) || []);
  console.log(`   Found ${existingNames.size} existing tags\n`);
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  console.log('🔨 Creating tags...\n');
  
  for (const tag of TAGS_TO_CREATE) {
    if (existingNames.has(tag.name)) {
      console.log(`   ⏭️  ${tag.name} (already exists)`);
      skipped++;
      continue;
    }
    
    const result = await createTag(tag);
    if (result.success) {
      if (result.created) {
        console.log(`   ✅ ${tag.name}`);
        created++;
      } else {
        console.log(`   ⏭️  ${tag.name} (already exists)`);
        skipped++;
      }
    } else {
      console.log(`   ❌ ${tag.name}: ${result.error}`);
      failed++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total tags: ${created + skipped + existingNames.size}`);
  
  if (created > 0) {
    console.log('\n🎉 Tag structure created! Now you can apply tags to workflows.');
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
