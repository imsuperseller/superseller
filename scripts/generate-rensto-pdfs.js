#!/usr/bin/env node

/**
 * Generate PDF files from Rensto documentation
 * 
 * This script converts markdown files to PDF format for upload to
 * Gemini File Search Store.
 * 
 * Requirements:
 * - pandoc: brew install pandoc basictex (macOS)
 * - OR: npm install -g md-to-pdf
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// PDF output directory
const PDF_DIR = path.join(rootDir, 'docs', 'pdfs');

// Files to convert (Priority order)
const FILES_TO_CONVERT = [
  // Priority 1: Essential
  {
    input: 'CLAUDE.md',
    output: 'RENSTO_MASTER_DOCUMENTATION.pdf',
    priority: '⭐⭐⭐⭐⭐',
    description: 'Master documentation - Single source of truth'
  },
  {
    input: 'docs/business/RENSTO_BUSINESS_ROADMAP_2025.md',
    output: 'RENSTO_BUSINESS_ROADMAP_2025.pdf',
    priority: '⭐⭐⭐⭐⭐',
    description: 'Business strategy and roadmap'
  },
  {
    input: 'docs/business/BUSINESS_MODEL_CANVAS.md',
    output: 'BUSINESS_MODEL_CANVAS.pdf',
    priority: '⭐⭐⭐⭐',
    description: 'Business model framework'
  },
  {
    input: 'docs/business/IMPLEMENTATION_AUDIT_2025.md',
    output: 'IMPLEMENTATION_AUDIT_2025.pdf',
    priority: '⭐⭐⭐⭐',
    description: 'Implementation status'
  },
  // Priority 2: Service Documentation
  {
    input: 'docs/products/CONTENT_AI_SYSTEM_OVERVIEW.md',
    output: 'CONTENT_AI_SYSTEM_OVERVIEW.pdf',
    priority: '⭐⭐⭐⭐',
    description: 'Content AI service documentation'
  },
  {
    input: 'docs/website/RENSTO_WEBSITE_AGENT_MASTER_PLAN.md',
    output: 'RENSTO_WEBSITE_AGENT_MASTER_PLAN.pdf',
    priority: '⭐⭐⭐',
    description: 'Website agent architecture'
  },
  // Priority 3: Technical
  {
    input: 'docs/infrastructure/WEBSITE_CURRENT_STATUS.md',
    output: 'WEBSITE_CURRENT_STATUS.pdf',
    priority: '⭐⭐⭐',
    description: 'Current architecture status'
  },
  {
    input: 'docs/workflows/WHATSAPP_MULTI_AGENT_ARCHITECTURE.md',
    output: 'WHATSAPP_MULTI_AGENT_ARCHITECTURE.pdf',
    priority: '⭐⭐⭐',
    description: 'WhatsApp multi-agent system'
  },
  {
    input: 'README.md',
    output: 'RENSTO_README.pdf',
    priority: '⭐⭐⭐',
    description: 'Quick reference guide'
  }
];

/**
 * Check if tool is available
 */
async function checkTool(tool) {
  try {
    await execAsync(`which ${tool}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert markdown to PDF using Pandoc
 */
async function convertWithPandoc(inputPath, outputPath) {
  const input = path.join(rootDir, inputPath);
  const output = path.join(PDF_DIR, outputPath);

  if (!existsSync(input)) {
    console.log(`⚠️  Skipping: ${inputPath} (file not found)`);
    return false;
  }

  try {
    const command = `pandoc "${input}" -o "${output}" \
      --pdf-engine=xelatex \
      --variable mainfont="Arial" \
      --variable fontsize=11pt \
      -V geometry:margin=1in \
      --toc \
      --toc-depth=3`;

    await execAsync(command, { timeout: 300000 }); // 5 minute timeout
    console.log(`✅ Generated: ${outputPath}`);
    return true;
  } catch (error) {
    if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
      console.error(`❌ Error converting ${inputPath}: Timeout (file may be too large)`);
    } else {
      console.error(`❌ Error converting ${inputPath}:`, error.message);
    }
    return false;
  }
}

/**
 * Convert markdown to PDF using md-to-pdf
 */
async function convertWithMdToPdf(inputPath, outputPath) {
  const input = path.join(rootDir, inputPath);
  const output = path.join(PDF_DIR, outputPath);

  if (!existsSync(input)) {
    console.log(`⚠️  Skipping: ${inputPath} (file not found)`);
    return false;
  }

  try {
    // md-to-pdf generates PDF in same directory as input with same name + .pdf
    const inputDir = path.dirname(input);
    const inputBaseName = path.basename(input, path.extname(input));
    const generatedPdf = path.join(inputDir, inputBaseName + '.pdf');
    
    // Generate PDF in input directory with timeout (5 minutes for large files)
    const command = `npx md-to-pdf "${input}" --pdf-options '{"format": "A4", "margin": {"top": "20mm", "right": "20mm", "bottom": "20mm", "left": "20mm"}}'`;
    
    console.log(`   ⏳ Converting (this may take a few minutes for large files)...`);
    await execAsync(command, { timeout: 300000 }); // 5 minute timeout
    
    // Move to output directory with correct name
    if (existsSync(generatedPdf)) {
      await execAsync(`mv "${generatedPdf}" "${output}"`, { timeout: 10000 });
      console.log(`✅ Generated: ${outputPath}`);
      return true;
    } else {
      throw new Error(`PDF was not generated at: ${generatedPdf}`);
    }
  } catch (error) {
    if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
      console.error(`❌ Error converting ${inputPath}: Timeout (file may be too large)`);
    } else {
      console.error(`❌ Error converting ${inputPath}:`, error.message);
    }
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('📄 Rensto PDF Generation Script\n');
  console.log('='.repeat(60));

  // Create PDF directory
  if (!existsSync(PDF_DIR)) {
    await mkdir(PDF_DIR, { recursive: true });
    console.log(`📁 Created directory: ${PDF_DIR}\n`);
  }

  // Check available tools
  const hasPandoc = await checkTool('pandoc');
  const hasMdToPdf = await checkTool('md-to-pdf') || await checkTool('npx');

  if (!hasPandoc && !hasMdToPdf) {
    console.error('❌ No PDF conversion tool found!');
    console.error('\nInstall one of:');
    console.error('  - Pandoc: brew install pandoc basictex');
    console.error('  - md-to-pdf: npm install -g md-to-pdf');
    process.exit(1);
  }

  const converter = hasPandoc ? convertWithPandoc : convertWithMdToPdf;
  const toolName = hasPandoc ? 'Pandoc' : 'md-to-pdf';
  console.log(`🔧 Using: ${toolName}\n`);

  // Convert files
  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const file of FILES_TO_CONVERT) {
    console.log(`\n📄 Converting: ${file.input}`);
    console.log(`   Priority: ${file.priority}`);
    console.log(`   Description: ${file.description}`);

    const success = await converter(file.input, file.output);

    if (success) {
      results.success.push(file);
    } else {
      if (!existsSync(path.join(rootDir, file.input))) {
        results.skipped.push(file);
      } else {
        results.failed.push(file);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Skipped: ${results.skipped.length}`);

  if (results.success.length > 0) {
    console.log('\n✅ Generated PDFs:');
    results.success.forEach(file => {
      console.log(`   - ${file.output}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log('\n⚠️  Skipped (file not found):');
    results.skipped.forEach(file => {
      console.log(`   - ${file.input}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed:');
    results.failed.forEach(file => {
      console.log(`   - ${file.input}`);
    });
  }

  // Generate upload checklist
  const checklistPath = path.join(PDF_DIR, 'UPLOAD_CHECKLIST.md');
  const checklist = `# 📋 PDF Upload Checklist

**Generated**: ${new Date().toISOString()}
**Store**: \`fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p\`
**Upload URL**: \`http://173.254.201.134:5678/form/0509cfab-f2e9-40fc-a268-8b966efb8305\`

---

## ✅ Files Ready for Upload

${results.success.map((file, i) => `${i + 1}. [ ] \`${file.output}\` - ${file.description} (${file.priority})`).join('\n')}

---

## 📤 Upload Instructions

1. **Open File Upload Form**: \`http://173.254.201.134:5678/form/0509cfab-f2e9-40fc-a268-8b966efb8305\`
2. **Upload each PDF** one by one
3. **Wait for confirmation** after each upload
4. **Test** by sending WhatsApp message: "What is the Marketplace?"

---

## 🧪 Testing

After uploading, test with these questions:
- "What is the Marketplace?"
- "What are your subscription plans?"
- "How much does Custom Solutions cost?"
- "What is Content AI?"

---

**Total Files**: ${results.success.length}
**Location**: \`${PDF_DIR}\`
`;

  await writeFile(checklistPath, checklist);
  console.log(`\n📋 Upload checklist: ${checklistPath}`);

  console.log('\n✅ PDF generation complete!');
}

// Run if called directly
main().catch(console.error);

