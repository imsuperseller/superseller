#!/usr/bin/env node

/**
 * Split Ortal Leads by Location
 * 
 * This script splits the consolidated lead file into:
 * 1. NYC leads (New York City, Manhattan, Brooklyn, Queens, Bronx, Staten Island)
 * 2. Other US cities leads (all other locations)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  inputFile: '/Users/shaifriedman/New Rensto/rensto/data/ortal-delivery-package/consolidated/all-ortal-leads-raw.csv',
  outputDir: '/Users/shaifriedman/New Rensto/rensto/data/ortal-delivery-package/consolidated',
  
  // NYC identifiers
  nycIdentifiers: [
    'New York City', 'New York', 'NYC', 'Manhattan', 'Brooklyn', 'Queens', 
    'Bronx', 'Staten Island', 'Upper East Side', 'Upper West Side', 'Midtown',
    'Financial District', 'SoHo', 'Greenwich Village', 'East Village', 
    'Lower East Side', 'Williamsburg', 'Park Slope', 'Dumbo', 'Red Hook',
    'Bay Ridge', 'Astoria', 'Long Island City', 'Flushing', 'Jamaica', 
    'Forest Hills', 'NY'
  ]
};

// Function to parse CSV
function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return { headers: [], data: [] };
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return { headers, data };
}

// Function to convert data to CSV
function toCSV(headers, data) {
  if (data.length === 0) return headers.join(',');
  
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header] || '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Function to check if a lead is from NYC
function isNYCLead(lead) {
  const city = (lead.city || '').toLowerCase();
  const state = (lead.state || '').toLowerCase();
  
  // Check if city or state contains NYC identifiers
  for (const identifier of CONFIG.nycIdentifiers) {
    if (city.includes(identifier.toLowerCase()) || 
        state.includes(identifier.toLowerCase()) ||
        city === 'new york' ||
        state === 'ny') {
      return true;
    }
  }
  
  return false;
}

// Main processing function
async function splitLeadsByLocation() {
  console.log('🗽 Splitting Ortal Leads by Location...');
  console.log('');
  
  // Read the input file
  if (!fs.existsSync(CONFIG.inputFile)) {
    console.error(`❌ Input file not found: ${CONFIG.inputFile}`);
    return;
  }
  
  console.log(`📁 Reading ${CONFIG.inputFile}...`);
  const content = fs.readFileSync(CONFIG.inputFile, 'utf8');
  const { headers, data } = parseCSV(content);
  
  console.log(`📊 Total leads loaded: ${data.length}`);
  
  // Split leads
  const nycLeads = [];
  const otherCitiesLeads = [];
  
  for (const lead of data) {
    if (isNYCLead(lead)) {
      nycLeads.push(lead);
    } else {
      otherCitiesLeads.push(lead);
    }
  }
  
  console.log(`🗽 NYC leads: ${nycLeads.length}`);
  console.log(`🏙️ Other cities leads: ${otherCitiesLeads.length}`);
  console.log(`📊 Total: ${nycLeads.length + otherCitiesLeads.length}`);
  
  // Save NYC leads
  const nycPath = path.join(CONFIG.outputDir, 'ortal-nyc-leads-consolidated.csv');
  const nycCSV = toCSV(headers, nycLeads);
  fs.writeFileSync(nycPath, nycCSV);
  console.log(`💾 Saved NYC leads: ${nycPath}`);
  
  // Save other cities leads
  const otherPath = path.join(CONFIG.outputDir, 'ortal-other-cities-leads-consolidated.csv');
  const otherCSV = toCSV(headers, otherCitiesLeads);
  fs.writeFileSync(otherPath, otherCSV);
  console.log(`💾 Saved other cities leads: ${otherPath}`);
  
  // Copy to desktop for easy access
  const desktopNycPath = '/Users/shaifriedman/Desktop/ORTAL_NYC_CONSOLIDATED_LEADS.csv';
  const desktopOtherPath = '/Users/shaifriedman/Desktop/ORTAL_OTHER_CITIES_CONSOLIDATED_LEADS.csv';
  
  fs.writeFileSync(desktopNycPath, nycCSV);
  fs.writeFileSync(desktopOtherPath, otherCSV);
  
  console.log('');
  console.log('🎉 LEAD SPLITTING COMPLETE!');
  console.log('===========================');
  console.log(`🗽 NYC leads: ${nycLeads.length} (saved to Desktop)`);
  console.log(`🏙️ Other cities leads: ${otherCitiesLeads.length} (saved to Desktop)`);
  console.log('');
  console.log('📁 Files created:');
  console.log(`   ${nycPath}`);
  console.log(`   ${otherPath}`);
  console.log(`   ${desktopNycPath}`);
  console.log(`   ${desktopOtherPath}`);
  
  // Show sample leads from each category
  console.log('');
  console.log('📋 Sample NYC lead:');
  if (nycLeads.length > 0) {
    const sample = nycLeads[0];
    console.log(`   ${sample.firstName} ${sample.lastName} - ${sample.city}, ${sample.state}`);
  }
  
  console.log('');
  console.log('📋 Sample other cities lead:');
  if (otherCitiesLeads.length > 0) {
    const sample = otherCitiesLeads[0];
    console.log(`   ${sample.firstName} ${sample.lastName} - ${sample.city}, ${sample.state}`);
  }
}

// Run the script
splitLeadsByLocation().catch(console.error);
