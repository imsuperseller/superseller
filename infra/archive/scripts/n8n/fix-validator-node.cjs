#!/usr/bin/env node

/**
 * Fix WordPress Content Validator Node
 * Updates the Code node to properly parse JSON from AI Agent output
 */

const fs = require('fs');
const path = require('path');

// Load the multi-instance API
const apiPath = path.join(__dirname, 'multi-instance-api.cjs');
const { listWorkflows, getWorkflow, updateWorkflow } = require(apiPath);

async function fixValidatorNode() {
  const workflowId = 'GRlA3iuB7A8y8xFJ';
  const nodeId = '5a89c9ab-4442-44fd-9f8f-d0e2ec7f3fc4';
  const instance = 'superseller';

  console.log('🔧 Fixing WordPress Content Validator Node...');
  console.log(`Workflow: ${workflowId}`);
  console.log(`Node: ${nodeId}`);
  console.log(`Instance: ${instance}`);

  try {
    console.log('📡 Testing API connection...');
    const testResult = await listWorkflows(instance);
    console.log(`✅ Connected to ${instance} - found ${testResult.length} workflows`);

    // Get current workflow
    console.log('\n📥 Getting current workflow...');
    const workflow = await getWorkflow(instance, workflowId);
    
    if (!workflow) {
      throw new Error(`Failed to get workflow: ${workflowId}`);
    }

    // Find the validator node
    const validatorNode = workflow.nodes.find(node => node.id === nodeId);
    if (!validatorNode) {
      throw new Error(`Node ${nodeId} not found in workflow`);
    }

    console.log(`✅ Found node: ${validatorNode.name}`);

    // Updated JavaScript code with proper JSON parsing
    const updatedCode = `/**
 * WordPress Content Validator - Production Grade
 * Validates Gutenberg block structure, field lengths, and bilingual requirements
 * Based on WordPress AI Content Generation optimization guide
 */

// Parse the JSON string from AI Agent output
let content;
try {
  // Handle both string and object inputs
  if (typeof $json.output === 'string') {
    content = JSON.parse($json.output);
  } else {
    content = $json.output;
  }
} catch (e) {
  console.error('Failed to parse AI Agent output:', e);
  console.log('Raw output:', $json.output);
  return [{
    json: {
      error: 'Failed to parse AI Agent output',
      raw_output: $json.output,
      parse_error: e.message,
      validation: {
        valid: false,
        passed: false,
        errors: ['Failed to parse AI Agent output: ' + e.message],
        warnings: [],
        errorCount: 1,
        warningCount: 0,
        timestamp: new Date().toISOString(),
        summary: '❌ Validation failed: Parse error'
      }
    }
  }];
}

const errors = [];
const warnings = [];

// Helper: Generate unique block ID
function generateBlockId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return \`gen-\${timestamp}-\${random}\`;
}

// === TITLE VALIDATION ===
if (!content.title || content.title.trim() === '') {
  errors.push('Title is required');
} else {
  if (content.title.length > 200) {
    errors.push(\`Title exceeds 200 character limit (\${content.title.length} chars)\`);
  }
  if (content.title.length > 60) {
    warnings.push(\`Title over 60 chars may be truncated in search results (\${content.title.length} chars - optimal: 50-60)\`);
  }
  // Check for unencoded HTML entities
  if (!/&[a-z]+;|&#\\d+;/.test(content.title) && /[&<>"']/.test(content.title)) {
    warnings.push('Title contains unencoded special characters (should use &amp; &#8211; &quot;)');
  }
}

// === EXCERPT VALIDATION ===
if (!content.excerpt) {
  warnings.push('Excerpt is missing');
} else {
  const strippedExcerpt = content.excerpt.replace(/<[^>]*>/g, '');
  if (strippedExcerpt.length < 120 || strippedExcerpt.length > 160) {
    warnings.push(\`Excerpt length \${strippedExcerpt.length} chars (optimal: 150-160 for SEO meta description)\`);
  }
  if (/<[^>]+>/.test(content.excerpt)) {
    warnings.push('Excerpt contains HTML tags (will be stripped by WordPress)');
  }
  if (/\\n/.test(content.excerpt)) {
    errors.push('Excerpt contains newlines (not allowed in meta descriptions)');
  }
}

// === CONTENT VALIDATION - GUTENBERG BLOCKS ===
if (!content.content || content.content.trim() === '') {
  errors.push('Content is required');
} else {
  // Check for Gutenberg block structure
  const blockPattern = /<!-- wp:[a-z-\\/]+ (?:{[^}]*} )?-->/g;
  const openBlocks = (content.content.match(blockPattern) || []).length;
  const closePattern = /<!-- \\/wp:[a-z-\\/]+ -->/g;
  const closeBlocks = (content.content.match(closePattern) || []).length;
  
  if (openBlocks === 0) {
    errors.push('Content has no Gutenberg blocks - will render incorrectly in WordPress editor');
  }
  
  if (openBlocks !== closeBlocks) {
    errors.push(\`CRITICAL: Mismatched blocks - \${openBlocks} opening delimiters, \${closeBlocks} closing delimiters\`);
  }
  
  // === UAGB BLOCK VALIDATION ===
  const uagbBlocks = content.content.match(/<!-- wp:uagb\\/[a-z-]+ {[^}]+} -->/g) || [];
  
  uagbBlocks.forEach((fullBlock, index) => {
    // Extract block type and attributes
    const blockTypeMatch = fullBlock.match(/wp:(uagb\\/[a-z-]+)/);
    const attrsMatch = fullBlock.match(/({[^}]+})/);
    
    if (blockTypeMatch && attrsMatch) {
      const blockType = blockTypeMatch[1];
      try {
        const attrs = JSON.parse(attrsMatch[1]);
        
        // Check for required UAGB attributes
        if (!attrs.block_id) {
          errors.push(\`UAGB block \${index + 1} (\${blockType}) missing required block_id attribute\`);
        } else {
          // Validate block_id format
          if (!/^[a-z0-9-]+$/.test(attrs.block_id)) {
            warnings.push(\`UAGB block \${index + 1} block_id "\${attrs.block_id}" has unusual format\`);
          }
        }
        
        if (!attrs.classMigrate) {
          warnings.push(\`UAGB block \${index + 1} (\${blockType}) missing classMigrate:true (may cause styling issues)\`);
        }
        
        // Check for corresponding CSS class in HTML
        const expectedClass = \`uagb-block-\${attrs.block_id}\`;
        if (attrs.block_id && !content.content.includes(expectedClass)) {
          warnings.push(\`UAGB block \${index + 1} missing expected CSS class "\${expectedClass}" in HTML\`);
        }
        
      } catch (e) {
        errors.push(\`UAGB block \${index + 1} has invalid JSON attributes: \${e.message}\`);
      }
    }
  });
  
  // === BLOCK NESTING VALIDATION ===
  const blockStack = [];
  const blockRegex = /<!-- (\\/)?wp:([a-z-\\/]+)(?: ({[^}]*}))? -->/g;
  let match;
  let position = 0;
  
  while ((match = blockRegex.exec(content.content)) !== null) {
    const [full, isClosing, blockName, attrs] = match;
    position++;
    
    if (!isClosing) {
      blockStack.push({ name: blockName, position });
    } else {
      const expected = blockStack.pop();
      if (!expected) {
        errors.push(\`Unexpected closing tag for \${blockName} at position \${position} (no matching opening tag)\`);
      } else if (expected.name !== blockName) {
        errors.push(\`Mismatched block tags: expected closing tag for "\${expected.name}", found "\${blockName}" at position \${position}\`);
      }
    }
  }
  
  if (blockStack.length > 0) {
    const unclosed = blockStack.map(b => b.name).join(', ');
    errors.push(\`Unclosed blocks: \${unclosed}\`);
  }
  
  // === ORPHANED HTML VALIDATION ===
  const contentWithoutBlocks = content.content.replace(/<!-- wp:.*?-->[\\s\\S]*?<!-- \\/wp:.*?-->/g, '');
  if (/<[^>]+>/.test(contentWithoutBlocks.trim())) {
    warnings.push('Found HTML content outside of Gutenberg blocks (may not render correctly)');
  }
}

// === SLUG VALIDATION ===
if (!content.slug) {
  warnings.push('Slug is missing (WordPress will auto-generate)');
} else {
  if (!/^[a-z0-9-]+$/.test(content.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }
  if (content.slug.length > 200) {
    errors.push(\`Slug exceeds 200 character limit (\${content.slug.length} chars)\`);
  }
  if (content.slug.startsWith('-') || content.slug.endsWith('-')) {
    warnings.push('Slug should not start or end with hyphen');
  }
  if (content.slug.includes('--')) {
    warnings.push('Slug contains consecutive hyphens (may affect SEO)');
  }
}

// === LANGUAGE VALIDATION ===
if (!content.language || !['en', 'he'].includes(content.language)) {
  errors.push('Language must be "en" or "he"');
}

// === HEBREW-SPECIFIC VALIDATION ===
if (content.language === 'he') {
  const hebrewPattern = /[\\u0590-\\u05FF]/;
  const hasHebrew = hebrewPattern.test(content.content);
  
  if (!hasHebrew) {
    errors.push('Language is set to Hebrew but content contains no Hebrew characters');
  }
  
  if (/dir\\s*=\\s*["']?rtl["']?/.test(content.content)) {
    warnings.push('Content contains dir="rtl" attributes - WordPress handles RTL automatically via Polylang');
  }
  
  if (content.slug && hebrewPattern.test(content.slug)) {
    errors.push('Slug contains Hebrew characters - must use English transliteration only for URL compatibility');
  }
  
  if (content.title && !hebrewPattern.test(content.title)) {
    warnings.push('Title contains no Hebrew characters despite language being set to Hebrew');
  }
  
  try {
    JSON.stringify(content.content);
  } catch (e) {
    errors.push('Content has encoding issues - ensure proper UTF-8 for Hebrew characters');
  }
}

// === ENGLISH-SPECIFIC VALIDATION ===
if (content.language === 'en') {
  if (/[\\u0590-\\u05FF]/.test(content.content)) {
    warnings.push('Language is set to English but content contains Hebrew characters');
  }
}

// === SEO & CONTENT QUALITY CHECKS ===
if (content.content) {
  const h1Count = (content.content.match(/<h1/g) || []).length;
  if (h1Count > 1) {
    warnings.push(\`Multiple H1 tags found (\${h1Count}) - should have only one H1 per page for SEO\`);
  }
  
  const images = content.content.match(/<img[^>]+>/g) || [];
  images.forEach((img, i) => {
    if (!img.includes('alt="') && !img.includes("alt='")) {
      warnings.push(\`Image \${i + 1} missing alt text (important for accessibility and SEO)\`);
    }
  });
  
  const textContent = content.content.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ');
  const wordCount = textContent.trim().split(/\\s+/).length;
  if (wordCount < 300) {
    warnings.push(\`Content is short (\${wordCount} words) - optimal blog posts are 1200-2000 words for SEO\`);
  }
}

// === LOG RESULTS ===
console.log('=== WORDPRESS CONTENT VALIDATION RESULTS ===');
console.log('Valid:', errors.length === 0);
console.log('Errors:', errors.length);
console.log('Warnings:', warnings.length);

if (errors.length > 0) {
  console.log('\\n🚫 ERRORS (must fix):');
  errors.forEach((err, i) => console.log(\`  \${i + 1}. \${err}\`));
}

if (warnings.length > 0) {
  console.log('\\n⚠️  WARNINGS (should review):');
  warnings.forEach((warn, i) => console.log(\`  \${i + 1}. \${warn}\`));
}

// === RETURN ENHANCED OUTPUT - PROPER FORMAT ===
return [{
  json: {
    ...content,
    validation: {
      valid: errors.length === 0,
      passed: errors.length === 0,
      errors,
      warnings,
      errorCount: errors.length,
      warningCount: warnings.length,
      timestamp: new Date().toISOString(),
      summary: errors.length === 0 
        ? \`✅ Validation passed with \${warnings.length} warnings\`
        : \`❌ Validation failed with \${errors.length} errors and \${warnings.length} warnings\`
    },
    metadata: {
      titleLength: content.title?.length || 0,
      excerptLength: content.excerpt?.replace(/<[^>]*>/g, '').length || 0,
      slugLength: content.slug?.length || 0,
      language: content.language,
      validated_at: new Date().toISOString()
    }
  }
}];`;

    // Update the node with new code
    validatorNode.parameters.jsCode = updatedCode;

    // Update the workflow
    console.log('\n📤 Updating workflow...');
    const updateResult = await updateWorkflow(instance, workflowId, workflow);
    
    if (!updateResult) {
      throw new Error(`Failed to update workflow: ${workflowId}`);
    }

    console.log('✅ Successfully updated WordPress Content Validator node!');
    console.log('\n🔧 Changes made:');
    console.log('  - Added JSON parsing for AI Agent output');
    console.log('  - Added error handling for malformed JSON');
    console.log('  - Improved validation logic');
    console.log('  - Better error reporting');

    console.log('\n📋 Next steps:');
    console.log('  1. Test the workflow with a new execution');
    console.log('  2. Check that validation now works correctly');
    console.log('  3. Verify Slack approval message displays properly');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixValidatorNode();
}

module.exports = { fixValidatorNode };
