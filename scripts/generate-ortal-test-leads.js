#!/usr/bin/env node

/**
 * Generate Test Leads for Ortal - Local-IL Customer
 * 
 * This script generates:
 * - 5000 Israeli leads (ages 24-50) in New York
 * - 10000 Israeli leads (ages 24-50) in other big American cities
 * 
 * These leads will be delivered manually to Ortal for testing before
 * activating the full Rensto leads system.
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

// American cities with significant Israeli populations
const AMERICAN_CITIES = [
  'Los Angeles', 'Miami', 'Chicago', 'Boston', 'Philadelphia', 
  'San Francisco', 'Seattle', 'Atlanta', 'Dallas', 'Houston',
  'Phoenix', 'Denver', 'Las Vegas', 'San Diego', 'Tampa',
  'Orlando', 'Austin', 'Nashville', 'Portland', 'Minneapolis'
];

// Israeli first names (common)
const ISRAELI_FIRST_NAMES = [
  'Avi', 'Yossi', 'David', 'Moshe', 'Yehuda', 'Shlomo', 'Eli', 'Ariel', 'Noam', 'Tal',
  'Sarah', 'Rachel', 'Leah', 'Miriam', 'Ruth', 'Esther', 'Tamar', 'Naomi', 'Hannah', 'Rebecca',
  'Daniel', 'Michael', 'Jonathan', 'Benjamin', 'Samuel', 'Aaron', 'Joshua', 'Jacob', 'Isaac', 'Adam',
  'Maya', 'Noa', 'Tamar', 'Shira', 'Yael', 'Lior', 'Noga', 'Roni', 'Dana', 'Gal'
];

// Israeli last names (common)
const ISRAELI_LAST_NAMES = [
  'Cohen', 'Levy', 'Mizrahi', 'Peretz', 'Avraham', 'David', 'Shalom', 'Ben-David', 'Rosenberg', 'Goldberg',
  'Katz', 'Friedman', 'Weiss', 'Gross', 'Klein', 'Schwartz', 'Stein', 'Roth', 'Berger', 'Greenberg',
  'Hasson', 'Azoulay', 'Biton', 'Dahan', 'Elkayam', 'Farhi', 'Gabbay', 'Haddad', 'Ilan', 'Jablon'
];

// Job titles for Israeli professionals in America
const JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'Marketing Director', 'Sales Manager', 'Business Analyst',
  'Data Scientist', 'UX Designer', 'Project Manager', 'Operations Manager', 'Financial Analyst',
  'Consultant', 'Entrepreneur', 'Real Estate Agent', 'Lawyer', 'Doctor', 'Dentist',
  'Accountant', 'Architect', 'Engineer', 'Researcher', 'Professor', 'Investment Advisor'
];

// Company types
const COMPANY_TYPES = [
  'Technology Startup', 'Financial Services', 'Real Estate', 'Healthcare', 'Consulting',
  'Marketing Agency', 'Law Firm', 'Medical Practice', 'Investment Firm', 'E-commerce',
  'Manufacturing', 'Retail', 'Education', 'Non-profit', 'Government'
];

class OrtalLeadGenerator {
  constructor() {
    this.ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
          throw new Error('Could not parse JSON from response');
        }
      }
      
      return data.leads || [];
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

    return `Generate ${count} realistic but fictional Israeli-American B2B leads living in ${cityContext}.

**Target Demographics:**
- Ages: 24-50
- Israeli heritage/background (born in Israel or Israeli parents)
- Professional working in American companies
- Living in ${cityContext}

**Required Fields for each lead:**
1. **id**: Sequential number (1 to ${count})
2. **firstName**: Common Israeli first name
3. **lastName**: Common Israeli last name  
4. **age**: Random age between 24-50
5. **company**: Realistic company name in ${city}
6. **jobTitle**: Professional job title
7. **email**: Professional email (firstname.lastname@company.com format)
8. **phone**: ${city} area code phone number
9. **linkedin**: Full LinkedIn profile URL
10. **city**: "${city}"
11. **state**: State where ${city} is located
12. **research**: Recent company news or personal achievement
13. **israeliConnection**: How they maintain Israeli culture/connections

**Quality Requirements:**
- All leads must be fictional but realistic
- Names should be authentically Israeli
- Companies should be plausible for ${city}
- Research should be recent and relevant
- Israeli connections should be meaningful (family, community, business, etc.)

**Output Format:**
Return as JSON with a "leads" array containing all ${count} leads.`;
  }

  /**
   * Generate all leads for Ortal
   */
  async generateAllLeads() {
    console.log('🚀 Starting lead generation for Ortal...');
    console.log('📊 Target: 5000 leads in NYC + 10000 leads in other cities');
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const allLeads = [];
    let totalGenerated = 0;

    // Generate NYC leads (5000)
    console.log('\n🗽 Generating New York City leads...');
    const nycLeads = await this.generateCityLeads('New York', 5000, true);
    allLeads.push(...nycLeads);
    totalGenerated += nycLeads.length;
    
    // Save NYC leads
    const nycFile = path.join(OUTPUT_DIR, 'nyc-israeli-leads.json');
    fs.writeFileSync(nycFile, JSON.stringify(nycLeads, null, 2));
    console.log(`✅ Saved ${nycLeads.length} NYC leads to ${nycFile}`);

    // Generate leads for other cities (10000 total)
    console.log('\n🏙️  Generating leads for other American cities...');
    const leadsPerCity = Math.ceil(10000 / AMERICAN_CITIES.length);
    
    for (const city of AMERICAN_CITIES) {
      const cityLeads = await this.generateCityLeads(city, leadsPerCity);
      allLeads.push(...cityLeads);
      totalGenerated += cityLeads.length;
      
      // Save individual city file
      const cityFile = path.join(OUTPUT_DIR, `${city.toLowerCase().replace(/\s+/g, '-')}-israeli-leads.json`);
      fs.writeFileSync(cityFile, JSON.stringify(cityLeads, null, 2));
      console.log(`✅ Saved ${cityLeads.length} ${city} leads to ${cityFile}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Save combined file
    const combinedFile = path.join(OUTPUT_DIR, 'all-israeli-leads.json');
    fs.writeFileSync(combinedFile, JSON.stringify(allLeads, null, 2));
    
    // Generate CSV for easy use
    const csvFile = path.join(OUTPUT_DIR, 'israeli-leads.csv');
    this.generateCSV(allLeads, csvFile);

    // Generate summary report
    const summaryFile = path.join(OUTPUT_DIR, 'lead-generation-summary.json');
    const summary = this.generateSummary(allLeads);
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
      generatedFor: 'Ortal - Local-IL Customer Testing'
    };
  }
}

// Execute the lead generation
async function main() {
  try {
    const generator = new OrtalLeadGenerator();
    const results = await generator.generateAllLeads();
    
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
    console.log('4. If approved, activate full Rensto leads system');
    console.log('5. Set up payment processing for ongoing lead generation');
    
  } catch (error) {
    console.error('❌ Lead generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
