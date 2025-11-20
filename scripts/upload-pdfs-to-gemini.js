#!/usr/bin/env node

/**
 * Upload PDFs to Gemini File Search Store
 * 
 * Uploads all PDFs from docs/pdfs/ to the Rensto knowledge base
 */

import { readFile } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const STORE_NAME = 'fileSearchStores/rensto-knowledge-base-ndf9fmymwb2p';
const API_KEY = 'AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE';
const PDF_DIR = join(rootDir, 'docs', 'pdfs');

/**
 * Upload file to Gemini using curl (Node.js compatible)
 */
async function uploadFileToGemini(filePath, filename) {
  console.log(`\n📤 Uploading: ${filename}...`);
  
  try {
    // Step 1: Upload file to Gemini using curl
    const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${API_KEY}`;
    
    console.log(`   ⏳ Uploading to Gemini...`);
    const uploadCommand = `curl -X POST "${uploadUrl}" -F "file=@${filePath}" -H "Content-Type: multipart/form-data" 2>&1`;
    const uploadResult = await execAsync(uploadCommand, { maxBuffer: 10 * 1024 * 1024 });
    
    let uploadData;
    try {
      uploadData = JSON.parse(uploadResult.stdout);
    } catch (e) {
      // Try to extract JSON from output
      const jsonMatch = uploadResult.stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        uploadData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Invalid JSON response: ${uploadResult.stdout.substring(0, 200)}`);
      }
    }
    
    const fileUri = uploadData.file?.uri || uploadData.uri;
    const fileName = uploadData.file?.name || filename;
    
    if (!fileUri) {
      throw new Error('No file URI returned from upload');
    }
    
    console.log(`   ✅ File uploaded: ${fileUri}`);
    
    // Step 2: Import file to store
    const importUrl = `https://generativelanguage.googleapis.com/v1beta/${STORE_NAME}:importFile?key=${API_KEY}`;
    
    const importBody = JSON.stringify({
      fileName: fileName,
      customMetadata: [
        {
          key: 'upload_date',
          stringValue: new Date().toISOString()
        },
        {
          key: 'source',
          stringValue: 'n8n-script'
        },
        {
          key: 'original_filename',
          stringValue: filename
        }
      ]
    });
    
    const importCommand = `curl -X POST "${importUrl}" -H "Content-Type: application/json" -d '${importBody.replace(/'/g, "'\\''")}' 2>&1`;
    const importResult = await execAsync(importCommand);
    
    let importData;
    try {
      importData = JSON.parse(importResult.stdout);
    } catch (e) {
      const jsonMatch = importResult.stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        importData = JSON.parse(jsonMatch[0]);
      } else {
        // Check if it's already successful
        if (importResult.stdout.includes('200') || importResult.stdout.includes('success')) {
          importData = { name: 'Success' };
        } else {
          throw new Error(`Import response: ${importResult.stdout.substring(0, 200)}`);
        }
      }
    }
    
    console.log(`   ✅ Imported to store: ${importData.name || 'Success'}`);
    
    return {
      success: true,
      fileUri,
      fileName,
      storeName: importData.name
    };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    if (error.stdout) console.error(`   Output: ${error.stdout.substring(0, 200)}`);
    if (error.stderr) console.error(`   Error: ${error.stderr.substring(0, 200)}`);
    return {
      success: false,
      error: error.message,
      filename
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('📄 Uploading PDFs to Gemini File Search Store\n');
  console.log('='.repeat(60));
  console.log(`Store: ${STORE_NAME}`);
  console.log(`Directory: ${PDF_DIR}\n`);
  
  // Get all PDF files
  const files = await readdir(PDF_DIR);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));
  
  if (pdfFiles.length === 0) {
    console.log('⚠️  No PDF files found in docs/pdfs/');
    return;
  }
  
  console.log(`Found ${pdfFiles.length} PDF files:\n`);
  pdfFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  
  const results = {
    success: [],
    failed: []
  };
  
  // Upload each file
  for (const filename of pdfFiles) {
    const filePath = join(PDF_DIR, filename);
    const result = await uploadFileToGemini(filePath, filename);
    
    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }
    
    // Wait 2 seconds between uploads to avoid rate limits
    if (pdfFiles.indexOf(filename) < pdfFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY\n');
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.success.length > 0) {
    console.log('\n✅ Uploaded Files:');
    results.success.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.fileName || 'Unknown'}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Files:');
    results.failed.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.filename}: ${r.error}`);
    });
  }
  
  console.log('\n✅ Upload complete!');
}

main().catch(console.error);

