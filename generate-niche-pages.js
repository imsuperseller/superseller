#!/usr/bin/env node

/**
 * Niche Solution Pages Generator
 * Generates individual HTML pages from template and data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read template
const templatePath = path.join(__dirname, 'NICHE_SOLUTION_TEMPLATE.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Read data
const dataPath = path.join(__dirname, 'NICHE_DATA.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Generate pages for each niche
data.niches.forEach((niche) => {
  console.log(`\n🔨 Generating page for ${niche.name}...`);

  let html = template;

  // Replace basic fields
  html = html.replace(/{{NICHE_NAME}}/g, niche.name);
  html = html.replace(/{{NICHE_ICON}}/g, niche.icon);
  html = html.replace(/{{NICHE_TAGLINE}}/g, niche.tagline);

  // Replace problems
  niche.problems.forEach((problem, index) => {
    const num = index + 1;
    html = html.replace(`{{PROBLEM_${num}_ICON}}`, problem.icon);
    html = html.replace(`{{PROBLEM_${num}_TITLE}}`, problem.title);
    html = html.replace(`{{PROBLEM_${num}_DESCRIPTION}}`, problem.description);
  });

  // Replace solutions
  niche.solutions.forEach((solution, index) => {
    const num = index + 1;
    html = html.replace(`{{SOLUTION_${num}_NAME}}`, solution.name);
    html = html.replace(`{{SOLUTION_${num}_DESCRIPTION}}`, solution.description);

    // Replace features
    solution.features.forEach((feature, featureIndex) => {
      const featureNum = featureIndex + 1;
      html = html.replace(`{{SOLUTION_${num}_FEATURE_${featureNum}}}`, feature);
    });
  });

  // Replace ROI metrics
  html = html.replace(/{{ROI_TIME_SAVED}}/g, niche.roi.timeSaved);
  html = html.replace(/{{ROI_EFFICIENCY}}/g, niche.roi.efficiency);
  html = html.replace(/{{ROI_REVENUE}}/g, niche.roi.revenue);
  html = html.replace(/{{ROI_PAYBACK}}/g, niche.roi.payback);

  // Write output file
  const outputPath = path.join(__dirname, `WEBFLOW_EMBED_${niche.slug.toUpperCase()}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');

  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log(`✅ Generated: WEBFLOW_EMBED_${niche.slug.toUpperCase()}.html (${sizeKB} KB)`);
});

console.log(`\n🎉 Successfully generated ${data.niches.length} niche pages!\n`);
console.log('📋 Generated files:');
data.niches.forEach((niche) => {
  console.log(`   - WEBFLOW_EMBED_${niche.slug.toUpperCase()}.html`);
});
console.log('\n🚀 Ready to deploy to Webflow!\n');
