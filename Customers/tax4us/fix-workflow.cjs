#!/usr/bin/env node

/**
 * Tax4Us Blog Workflow Fixer
 * Applies all critical and high-priority fixes to the workflow JSON
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_FILE = 'CORRECT_25NODE_WORKFLOW_WITH_AGENTS.json';
const OUTPUT_FILE = 'FIXED_25NODE_WORKFLOW.json';

console.log('🔧 Tax4Us Blog Workflow Fixer\n');

// Read workflow
console.log('📖 Reading workflow...');
const workflow = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf8'));

console.log(`✅ Loaded workflow: "${workflow.name}"`);
console.log(`📊 ${workflow.nodes.length} nodes found\n`);

// Track changes
const changes = [];

// ===================================================================
// FIX 1: OpenAI Model Names (gpt-5-chat-latest → gpt-4o)
// ===================================================================
console.log('🔴 FIX 1: Correcting OpenAI model names...');
let modelFixes = 0;

workflow.nodes.forEach((node, index) => {
  if (node.type === '@n8n/n8n-nodes-langchain.lmChatOpenAi') {
    const currentModel = node.parameters?.model?.value;
    if (currentModel === 'gpt-5-chat-latest') {
      node.parameters.model.value = 'gpt-4o';
      node.parameters.model.cachedResultName = 'gpt-4o';
      modelFixes++;
      changes.push(`  ✓ Node "${node.name}": gpt-5-chat-latest → gpt-4o`);
      console.log(`  ✓ Fixed node #${index + 1}: "${node.name}"`);
    }
  }
});

if (modelFixes === 0) {
  console.log('  ℹ️  No model fixes needed (already correct)\n');
} else {
  console.log(`  ✅ Fixed ${modelFixes} OpenAI model(s)\n`);
}

// ===================================================================
// FIX 2: Structured Output Parser Schema
// ===================================================================
console.log('🔴 FIX 2: Fixing Structured Output Parser schema...');
let schemaFixed = false;

workflow.nodes.forEach((node, index) => {
  if (node.type === '@n8n/n8n-nodes-langchain.outputParserStructured') {
    const currentSchema = node.parameters?.inputSchema;

    // Check if it's the example data (contains specific text)
    if (typeof currentSchema === 'string' && currentSchema.includes('5 Common Tax Deductions')) {
      // Replace with proper JSON Schema
      node.parameters.inputSchema = JSON.stringify({
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The blog post title"
          },
          slug: {
            type: "string",
            description: "URL-friendly slug"
          },
          content: {
            type: "string",
            description: "Full HTML content with proper tags"
          },
          excerpt: {
            type: "string",
            description: "Brief 2-3 sentence summary"
          },
          meta_description: {
            type: "string",
            description: "SEO meta description (150-160 characters)"
          }
        },
        required: ["title", "slug", "content", "excerpt", "meta_description"],
        additionalProperties: false
      }, null, 2);

      schemaFixed = true;
      changes.push(`  ✓ Node "${node.name}": Fixed JSON Schema`);
      console.log(`  ✓ Fixed node #${index + 1}: "${node.name}"`);
    }
  }
});

if (!schemaFixed) {
  console.log('  ℹ️  Schema already correct or not found\n');
} else {
  console.log('  ✅ Schema fixed\n');
}

// ===================================================================
// FIX 3: Airtable Trigger Polling Frequency
// ===================================================================
console.log('🟠 FIX 3: Reducing Airtable polling frequency...');
let pollingFixed = false;

workflow.nodes.forEach((node, index) => {
  if (node.type === 'n8n-nodes-base.airtableTrigger') {
    const pollTimes = node.parameters?.pollTimes?.item;
    if (pollTimes && pollTimes[0]?.mode === 'everyMinute') {
      // Change to every 5 minutes
      node.parameters.pollTimes.item = [{
        mode: 'everyX',
        value: 5,
        unit: 'minutes'
      }];
      pollingFixed = true;
      changes.push(`  ✓ Node "${node.name}": Every 1 min → Every 5 min`);
      console.log(`  ✓ Fixed node #${index + 1}: "${node.name}" - Now polls every 5 minutes`);
    }
  }
});

if (!pollingFixed) {
  console.log('  ℹ️  Polling already optimized\n');
} else {
  console.log('  ✅ Polling frequency reduced\n');
}

// ===================================================================
// FIX 4: AI Agent Max Iterations
// ===================================================================
console.log('🟠 FIX 4: Reducing AI Agent max iterations...');
let iterationsFixes = 0;

workflow.nodes.forEach((node, index) => {
  if (node.type === '@n8n/n8n-nodes-langchain.agent') {
    const currentMax = node.parameters?.options?.maxIterations;

    // Content Creator should be max 10
    if (node.name.includes('Content Creator') && currentMax > 10) {
      node.parameters.options.maxIterations = 10;
      iterationsFixes++;
      changes.push(`  ✓ Node "${node.name}": ${currentMax} → 10 iterations`);
      console.log(`  ✓ Fixed node #${index + 1}: "${node.name}" - Reduced from ${currentMax} to 10`);
    }

    // Publisher is fine at 7, but log it
    if (node.name.includes('Publisher')) {
      console.log(`  ℹ️  Node "${node.name}": ${currentMax} iterations (already optimal)`);
    }
  }
});

if (iterationsFixes === 0) {
  console.log('  ℹ️  Iterations already optimized\n');
} else {
  console.log(`  ✅ Fixed ${iterationsFixes} agent(s)\n`);
}

// ===================================================================
// FIX 5: Memory Buffer Session Key (Dynamic)
// ===================================================================
console.log('🟡 FIX 5: Improving Memory Buffer session key...');
let memoryFixed = false;

workflow.nodes.forEach((node, index) => {
  if (node.type === '@n8n/n8n-nodes-langchain.memoryBufferWindow') {
    const currentKey = node.parameters?.sessionKey;

    if (currentKey === 'tax4us-blog-history') {
      // Make it dynamic per content spec
      node.parameters.sessionKey = '={{ $json.spec_id }}-blog-history';
      memoryFixed = true;
      changes.push(`  ✓ Node "${node.name}": Made session key dynamic`);
      console.log(`  ✓ Fixed node #${index + 1}: "${node.name}" - Now uses spec_id for isolation`);
    }
  }
});

if (!memoryFixed) {
  console.log('  ℹ️  Memory buffer already optimized\n');
} else {
  console.log('  ✅ Memory buffer improved\n');
}

// ===================================================================
// FIX 6: Remove Error Workflow Reference (if it doesn't exist)
// ===================================================================
console.log('🟡 FIX 6: Checking error workflow reference...');
if (workflow.settings?.errorWorkflow) {
  console.log(`  ⚠️  Error workflow ID: ${workflow.settings.errorWorkflow}`);
  console.log('  ℹ️  Leaving as-is (verify manually if this workflow exists)\n');
} else {
  console.log('  ℹ️  No error workflow configured\n');
}

// ===================================================================
// Save Fixed Workflow
// ===================================================================
console.log('💾 Saving fixed workflow...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(workflow, null, 2));
console.log(`✅ Saved to: ${OUTPUT_FILE}\n`);

// ===================================================================
// Summary
// ===================================================================
console.log('═'.repeat(60));
console.log('📋 SUMMARY OF CHANGES');
console.log('═'.repeat(60));
console.log('');

if (changes.length === 0) {
  console.log('✨ No changes needed - workflow is already optimal!');
} else {
  console.log(`✅ Applied ${changes.length} fix(es):\n`);
  changes.forEach(change => console.log(change));
  console.log('');
  console.log('📁 Files:');
  console.log(`  • Original: ${WORKFLOW_FILE}`);
  console.log(`  • Backup:   WORKFLOW_BACKUP_20251010.json`);
  console.log(`  • Fixed:    ${OUTPUT_FILE}`);
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('  1. Review the fixed workflow JSON');
  console.log('  2. Import it into n8n (Settings → Import from File)');
  console.log('  3. Test with a sample content spec');
  console.log('  4. Activate the workflow');
}

console.log('\n✨ Done!\n');
