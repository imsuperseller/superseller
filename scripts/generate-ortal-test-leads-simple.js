#!/usr/bin/env node

/**
 * Generate Test Leads for Ortal - Local-IL Customer (Simplified Version)
 * 
 * This script generates a smaller batch first for testing:
 * - 100 Israeli leads in New York
 * - 200 Israeli leads in other cities
 * 
 * Once validated, we can scale up to the full 15,000 leads.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GEMINI_API_KEY = 'AIzaSyAzkVbq62x1nFlB9JEQVEI5ky6z8glshWY';
const OUTPUT_DIR = path.join(__dirname, '../data/ortal-test-leads');

// Test cities (smaller set for initial testing)
const TEST_CITIES = [
  'Los Angeles', 'Miami', 'Chicago', 'Boston', 'San Francisco'
];

class OrtalLeadGenerator {
  constructor() {
    this.ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.ai.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  /**
   * Generate leads for a specific city
   */
  async generateCityLeads(city, count, isNewYork = false) {
    console.log(`\n🏙️  Generating ${count} Israeli leads for ${city}...`);
    
    const prompt = this.buildPrompt(city, count, isNewYork);
    
    try {
      const response = await this.model.generateContent(prompt);
      const responseText = response.response.text();
      
      console.log(`📝 Raw response length: ${responseText.length} characters`);
      
      // Try to parse JSON from the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // If direct JSON parsing fails, try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          console.log('📄 Response text preview:', responseText.substring(0, 500));
          throw new Error('Could not parse JSON from response');
        }
      }
      
      const leads = data.leads || [];
      console.log(`✅ Generated ${leads.length} leads for ${city}`);
      return leads;
    } catch (error) {
      console.error(`❌ Error generating leads for ${city}:`, error.message);
      return [];
    }
  }

  /**
   * Build the prompt for lead generation
   */
  buildPrompt(city, count, isNewYork) {
    const cityContext = isNewYork 
      ? "New York City (Manhattan, Brooklyn, Queens, Bronx, Staten Island)"
      : city;

    return `Generate exactly ${count} realistic but fictional Israeli-American B2B leads living in ${cityContext}.

**Target Demographics:**
- Ages: 24-50
- Israeli heritage/background (born in Israel or Israeli parents)
- Professional working in American companies
- Living in ${cityContext}

**Required JSON Format:**
{
  "leads": [
    {
      "id": 1,
      "firstName": "David",
      "lastName": "Cohen",
      "age": 32,
      "company": "TechCorp Solutions",
      "jobTitle": "Software Engineer",
      "email": "david.cohen@techcorp.com",
      "phone": "+1-212-555-0123",
      "linkedin": "https://linkedin.com/in/david-cohen-tech",
      "city": "${city}",
      "state": "${this.getStateForCity(city)}",
      "research": "Recently led a team that launched a new mobile app with 10K downloads",
      "israeliConnection": "Active member of local Israeli community center, volunteers at Hebrew school"
    }
  ]
}

**Quality Requirements:**
- All leads must be fictional but realistic
- Names should be authentically Israeli (Cohen, Levy, Mizrahi, etc.)
- Companies should be plausible for ${city}
- Research should be recent and relevant
- Israeli connections should be meaningful
- Email format: firstname.lastname@company.com
- Phone format: +1-XXX-555-XXXX with appropriate area code
- LinkedIn format: https://linkedin.com/in/firstname-lastname-company

Generate exactly ${count} leads in the JSON format above.`;
  }

  /**
   * Get state for city
   */
  getStateForCity(city) {
    const stateMap = {
      'New York': 'NY',
      'Los Angeles': 'CA',
      'Miami': 'FL',
      'Chicago': 'IL',
      'Boston': 'MA',
      'San Francisco': 'CA'
    };
    return stateMap[city] || 'CA';
  }

  /**
   * Generate all test leads for Ortal
   */
  async generateAllLeads() {
    console.log('🚀 Starting test lead generation for Ortal...');
    console.log('📊 Target: 100 leads in NYC + 200 leads in other cities (300 total)');
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const allLeads = [];
    let totalGenerated = 0;

    // Generate NYC leads (100)
    console.log('\n🗽 Generating New York City leads...');
    const nycLeads = await this.generateCityLeads('New York', 100, true);
    allLeads.push(...nycLeads);
    totalGenerated += nycLeads.length;
    
    // Save NYC leads
    const nycFile = path.join(OUTPUT_DIR, 'nyc-israeli-leads-test.json');
    fs.writeFileSync(nycFile, JSON.stringify(nycLeads, null, 2));
    console.log(`✅ Saved ${nycLeads.length} NYC leads to ${nycFile}`);

    // Generate leads for other cities (200 total)
    console.log('\n🏙️  Generating leads for other American cities...');
    const leadsPerCity = Math.ceil(200 / TEST_CITIES.length);
    
    for (const city of TEST_CITIES) {
      const cityLeads = await this.generateCityLeads(city, leadsPerCity);
      allLeads.push(...cityLeads);
      totalGenerated += cityLeads.length;
      
      // Save individual city file
      const cityFile = path.join(OUTPUT_DIR, `${city.toLowerCase().replace(/\s+/g, '-')}-israeli-leads-test.json`);
      fs.writeFileSync(cityFile, JSON.stringify(cityLeads, null, 2));
      console.log(`✅ Saved ${cityLeads.length} ${city} leads to ${cityFile}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Save combined file
    const combinedFile = path.join(OUTPUT_DIR, 'all-israeli-leads-test.json');
    fs.writeFileSync(combinedFile, JSON.stringify(allLeads, null, 2));
    
    // Generate CSV for easy use
    const csvFile = path.join(OUTPUT_DIR, 'israeli-leads-test.csv');
    this.generateCSV(allLeads, csvFile);

    // Generate summary report
    const summaryFile = path.join(OUTPUT_DIR, 'lead-generation-summary-test.json');
    const summary = this.generateSummary(allLeads);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log('\n🎉 Test lead generation completed!');
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
  generateCSV(leads, filePath) {
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
  generateSummary(leads) {
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
      generatedFor: 'Ortal - Local-IL Customer Testing (Test Batch)'
    };
  }
}

// Execute the lead generation
async function main() {
  try {
    const generator = new OrtalLeadGenerator();
    const results = await generator.generateAllLeads();
    
    console.log('\n📋 TEST DELIVERY INSTRUCTIONS FOR ORTAL:');
    console.log('==========================================');
    console.log(`1. Total test leads generated: ${results.totalLeads}`);
    console.log(`2. NYC test leads: ${results.nycLeads}`);
    console.log(`3. Other cities test leads: ${results.otherCityLeads}`);
    console.log(`4. Files location: ${results.outputDir}`);
    console.log('\n📁 Test files to deliver:');
    console.log('   - all-israeli-leads-test.json (complete test dataset)');
    console.log('   - israeli-leads-test.csv (for easy import)');
    console.log('   - lead-generation-summary-test.json (statistics)');
    console.log('   - Individual city files for specific targeting');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Review the test leads for quality and accuracy');
    console.log('2. Deliver to Ortal for initial testing and feedback');
    console.log('3. If approved, scale up to full 15,000 leads');
    console.log('4. Deploy the Local-IL app to production');
    console.log('5. Set up payment processing for ongoing lead generation');
    
  } catch (error) {
    console.error('❌ Test lead generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
