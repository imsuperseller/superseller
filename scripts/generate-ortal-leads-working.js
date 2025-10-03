#!/usr/bin/env node

/**
 * Generate Test Leads for Ortal - Working Version
 * Uses the same approach as the local-il app
 */

import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GEMINI_API_KEY = 'AIzaSyAzkVbq62x1nFlB9JEQVEI5ky6z8glshWY';
const OUTPUT_DIR = path.join(__dirname, '../data/ortal-test-leads');

// Initialize AI
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

// Lead schema for Israeli-American leads
const israeliLeadSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER },
    firstName: { type: Type.STRING },
    lastName: { type: Type.STRING },
    age: { type: Type.INTEGER },
    company: { type: Type.STRING },
    jobTitle: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    linkedin: { type: Type.STRING },
    city: { type: Type.STRING },
    state: { type: Type.STRING },
    research: { type: Type.STRING },
    israeliConnection: { type: Type.STRING }
  },
  required: ['id', 'firstName', 'lastName', 'age', 'company', 'jobTitle', 'email', 'phone', 'linkedin', 'city', 'state', 'research', 'israeliConnection']
};

/**
 * Generate leads for a specific city
 */
async function generateCityLeads(city, count, isNewYork = false) {
  console.log(`\n🏙️  Generating ${count} Israeli leads for ${city}...`);
  
  const cityContext = isNewYork 
    ? "New York City (Manhattan, Brooklyn, Queens, Bronx, Staten Island)"
    : city;

  const stateMap = {
    'New York': 'NY',
    'Los Angeles': 'CA',
    'Miami': 'FL',
    'Chicago': 'IL',
    'Boston': 'MA',
    'San Francisco': 'CA'
  };

  const prompt = `Generate exactly ${count} realistic but fictional Israeli-American B2B leads living in ${cityContext}.

**Target Demographics:**
- Ages: 24-50
- Israeli heritage/background (born in Israel or Israeli parents)
- Professional working in American companies
- Living in ${cityContext}

**Quality Requirements:**
- All leads must be fictional but realistic
- Names should be authentically Israeli (Cohen, Levy, Mizrahi, Peretz, Avraham, etc.)
- Companies should be plausible for ${city}
- Research should be recent and relevant
- Israeli connections should be meaningful (family, community, business, etc.)
- Email format: firstname.lastname@company.com
- Phone format: +1-XXX-555-XXXX with appropriate area code
- LinkedIn format: https://linkedin.com/in/firstname-lastname-company
- State: ${stateMap[city] || 'CA'}

Generate exactly ${count} leads with all required fields.`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            leads: {
              type: Type.ARRAY,
              items: israeliLeadSchema,
            },
          },
        },
      },
    });

    let responseText = '';
    for await (const chunk of responseStream) {
      responseText += chunk.text;
    }

    const json = JSON.parse(responseText);
    const leads = json.leads || [];
    
    console.log(`✅ Generated ${leads.length} leads for ${city}`);
    return leads;
  } catch (error) {
    console.error(`❌ Error generating leads for ${city}:`, error.message);
    return [];
  }
}

/**
 * Generate all test leads for Ortal
 */
async function generateAllLeads() {
  console.log('🚀 Starting test lead generation for Ortal...');
  console.log('📊 Target: 50 leads in NYC + 100 leads in other cities (150 total)');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allLeads = [];
  let totalGenerated = 0;

  // Test cities
  const testCities = ['Los Angeles', 'Miami', 'Chicago', 'Boston', 'San Francisco'];

  // Generate NYC leads (50)
  console.log('\n🗽 Generating New York City leads...');
  const nycLeads = await generateCityLeads('New York', 50, true);
  allLeads.push(...nycLeads);
  totalGenerated += nycLeads.length;
  
  // Save NYC leads
  const nycFile = path.join(OUTPUT_DIR, 'nyc-israeli-leads.json');
  fs.writeFileSync(nycFile, JSON.stringify(nycLeads, null, 2));
  console.log(`✅ Saved ${nycLeads.length} NYC leads to ${nycFile}`);

  // Generate leads for other cities (100 total)
  console.log('\n🏙️  Generating leads for other American cities...');
  const leadsPerCity = Math.ceil(100 / testCities.length);
  
  for (const city of testCities) {
    const cityLeads = await generateCityLeads(city, leadsPerCity);
    allLeads.push(...cityLeads);
    totalGenerated += cityLeads.length;
    
    // Save individual city file
    const cityFile = path.join(OUTPUT_DIR, `${city.toLowerCase().replace(/\s+/g, '-')}-israeli-leads.json`);
    fs.writeFileSync(cityFile, JSON.stringify(cityLeads, null, 2));
    console.log(`✅ Saved ${cityLeads.length} ${city} leads to ${cityFile}`);
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Save combined file
  const combinedFile = path.join(OUTPUT_DIR, 'all-israeli-leads.json');
  fs.writeFileSync(combinedFile, JSON.stringify(allLeads, null, 2));
  
  // Generate CSV for easy use
  const csvFile = path.join(OUTPUT_DIR, 'israeli-leads.csv');
  generateCSV(allLeads, csvFile);

  // Generate summary report
  const summaryFile = path.join(OUTPUT_DIR, 'lead-generation-summary.json');
  const summary = generateSummary(allLeads);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log('\n🎉 Lead generation completed!');
  console.log(`📊 Total leads generated: ${totalGenerated}`);
  console.log(`📁 Files saved to: ${OUTPUT_DIR}`);
  console.log(`📋 Summary: ${summaryFile}`);
  
  return {
    totalLeads: totalGenerated,
    nycLeads: nycLeads.length,
    otherCityLeads: totalGenerated - nycLeads.length,
    outputDir: OUTPUT_DIR
  };
}

/**
 * Generate CSV file for easy import
 */
function generateCSV(leads, filePath) {
  const headers = [
    'ID', 'First Name', 'Last Name', 'Age', 'Company', 'Job Title', 
    'Email', 'Phone', 'LinkedIn', 'City', 'State', 'Research', 'Israeli Connection'
  ];
  
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => [
      lead.id,
      `"${lead.firstName}"`,
      `"${lead.lastName}"`,
      lead.age,
      `"${lead.company}"`,
      `"${lead.jobTitle}"`,
      lead.email,
      lead.phone,
      lead.linkedin,
      `"${lead.city}"`,
      `"${lead.state}"`,
      `"${lead.research}"`,
      `"${lead.israeliConnection}"`
    ].join(','))
  ].join('\n');
  
  fs.writeFileSync(filePath, csvContent);
  console.log(`📊 CSV file generated: ${filePath}`);
}

/**
 * Generate summary statistics
 */
function generateSummary(leads) {
  const cities = {};
  const jobTitles = {};
  const ageGroups = { '24-30': 0, '31-40': 0, '41-50': 0 };
  
  leads.forEach(lead => {
    // Count by city
    cities[lead.city] = (cities[lead.city] || 0) + 1;
    
    // Count by job title
    jobTitles[lead.jobTitle] = (jobTitles[lead.jobTitle] || 0) + 1;
    
    // Count by age group
    if (lead.age <= 30) ageGroups['24-30']++;
    else if (lead.age <= 40) ageGroups['31-40']++;
    else ageGroups['41-50']++;
  });

  return {
    totalLeads: leads.length,
    nycLeads: cities['New York'] || 0,
    otherCityLeads: leads.length - (cities['New York'] || 0),
    cityDistribution: cities,
    topJobTitles: Object.entries(jobTitles)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10),
    ageDistribution: ageGroups,
    generatedAt: new Date().toISOString(),
    generatedFor: 'Ortal - Local-IL Customer Testing'
  };
}

// Execute the lead generation
async function main() {
  try {
    const results = await generateAllLeads();
    
    console.log('\n📋 DELIVERY INSTRUCTIONS FOR ORTAL:');
    console.log('=====================================');
    console.log(`1. Total leads generated: ${results.totalLeads}`);
    console.log(`2. NYC leads: ${results.nycLeads}`);
    console.log(`3. Other cities leads: ${results.otherCityLeads}`);
    console.log(`4. Files location: ${results.outputDir}`);
    console.log('\n📁 Files to deliver:');
    console.log('   - all-israeli-leads.json (complete dataset)');
    console.log('   - israeli-leads.csv (for easy import)');
    console.log('   - lead-generation-summary.json (statistics)');
    console.log('   - Individual city files for specific targeting');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review the generated leads for quality');
    console.log('2. Deliver to Ortal for testing');
    console.log('3. Get feedback on lead quality and relevance');
    console.log('4. If approved, scale up to full 15,000 leads');
    console.log('5. Deploy the Local-IL app to production');
    console.log('6. Set up payment processing for ongoing lead generation');
    
  } catch (error) {
    console.error('❌ Lead generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
