#!/usr/bin/env node

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const roots = ['apps', 'packages', 'services', 'examples'];
const excludeDirs = ['archived', 'node_modules', '.git'];
const entityKeys = new Set();
const assetHashes = new Map();
let errors = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;

  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);

    // Skip excluded directories
    if (excludeDirs.some(exclude => p.startsWith(exclude + '/') || p === exclude)) {
      continue;
    }

    // Check for whitespace in path
    if (/\s/.test(p)) {
      errors.push(`Whitespace in path: ${p}`);
    }

    const s = fs.statSync(p);
    if (s.isDirectory()) {
      walk(p);
    } else {
      // Check for duplicate entities in JSON/YAML/CSV files
      if (/\.(json|ya?ml|csv)$/i.test(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf8');

          // Look for entity patterns: "kind": "...", "slug": "..."
          const entityMatches = raw.match(/"kind"\s*:\s*"([^"]+)".*?"slug"\s*:\s*"([^"]+)"/gs);
          if (entityMatches) {
            entityMatches.forEach(match => {
              const kindMatch = match.match(/"kind"\s*:\s*"([^"]+)"/);
              const slugMatch = match.match(/"slug"\s*:\s*"([^"]+)"/);

              if (kindMatch && slugMatch) {
                const kind = kindMatch[1];
                const slug = slugMatch[1];
                const k = `${kind}:${slug}`;

                if (entityKeys.has(k)) {
                  errors.push(`Duplicate entity ${k} in ${p}`);
                }
                entityKeys.add(k);
              }
            });
          }

          // Look for RGID patterns
          const rgidMatches = raw.match(/"rgid"\s*:\s*"([^"]+)"/g);
          if (rgidMatches) {
            rgidMatches.forEach(match => {
              const rgid = match.match(/"rgid"\s*:\s*"([^"]+)"/)[1];
              if (rgid && rgid.length < 24) {
                errors.push(`Invalid RGID format (too short): ${rgid} in ${p}`);
              }
            });
          }
        } catch (err) {
          // Skip files that can't be parsed
        }
      }

      // Check for duplicate assets
      if (/\.(png|jpg|jpeg|webp|svg|mp4|mov|gif|ico)$/i.test(p)) {
        try {
          const content = fs.readFileSync(p);
          const h = crypto.createHash('sha256').update(content).digest('hex');

          if (assetHashes.has(h) && assetHashes.get(h) !== p) {
            errors.push(`Duplicate asset content hash with different filenames: ${assetHashes.get(h)} <-> ${p}`);
          }
          assetHashes.set(h, p);
        } catch (err) {
          // Skip files that can't be read
        }
      }
    }
  }
}

// Scan all root directories
roots.forEach(walk);

// Check for prohibited directories
const prohibitedDirs = ['variations', 'variations3', 'infinite_ui_cursor', 'customer-portals'];
prohibitedDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    errors.push(`Prohibited directory found: ${dir} (should be moved to experiments/ or archived/)`);
  }
});

// Check for spaces in directory names
function checkSpacesInDirs(dir) {
  if (!fs.existsSync(dir)) return;

  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);

    // Skip excluded directories
    if (excludeDirs.some(exclude => p.startsWith(exclude + '/') || p === exclude)) {
      continue;
    }

    if (/\s/.test(f)) {
      errors.push(`Directory with spaces found: ${path.join(dir, f)}`);
    }

    const s = fs.statSync(p);
    if (s.isDirectory()) {
      checkSpacesInDirs(p);
    }
  }
}

checkSpacesInDirs('.');

// Report results
if (errors.length > 0) {
  console.error('❌ Duplicate and validation errors found:');
  errors.forEach(error => console.error(`  - ${error}`));
  console.error(`\nTotal errors: ${errors.length}`);
  process.exit(1);
} else {
  console.log('✅ No duplicates or validation errors found');
  console.log(`📊 Scanned ${entityKeys.size} unique entities and ${assetHashes.size} assets`);
}
