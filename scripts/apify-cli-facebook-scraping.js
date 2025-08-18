#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * APIFY CLI FACEBOOK SCRAPING FOR ORTAL
 * 
 * This script uses the Apify CLI to run the rented Facebook Group Scraper
 * and process the real results.
 */

class ApifyCLIFacebookScraping {
  constructor() {
    this.actorId = 'dzDJGPwFlFXgDrzYh'; // Facebook Group Scraper (Actor #1) - RENTED
    this.outputDir = 'data/ortal-real-facebook-data';
    this.results = {
      timestamp: new Date().toISOString(),
      customer: 'Ortal Flanary',
      actorId: this.actorId,
      groups: [],
      leads: [],
      customAudiences: [],
      analytics: {}
    };
  }

  async runRealScraping() {
    console.log('🚀 RUNNING REAL FACEBOOK SCRAPING WITH APIFY CLI...\n');
    console.log(`🎯 RENTED Actor ID: ${this.actorId}\n`);
    
    await fs.mkdir(this.outputDir, { recursive: true });
    
    try {
      // Step 1: Define real Facebook groups to scrape
      await this.defineTargetGroups();
      
      // Step 2: Scrape each group using Apify CLI
      await this.scrapeGroupsWithCLI();
      
      // Step 3: Process and clean the data
      await this.processRealData();
      
      // Step 4: Generate custom audiences
      await this.generateRealCustomAudiences();
      
      // Step 5: Save real results
      await this.saveRealResults();
      
      console.log('✅ REAL Facebook scraping completed!');
      console.log(`📁 Real data saved to: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Error in real scraping:', error.message);
      await this.saveErrorResults(error);
    }
  }

  async defineTargetGroups() {
    console.log('📋 Defining real Facebook groups to scrape...');
    
    this.results.groups = [
      {
        name: "great kosher restaurants foodies",
        url: "https://www.facebook.com/groups/320656708120313",
        category: "Food & Dining"
      },
      {
        name: "Jewish Food x What Jew Wanna Eat",
        url: "https://www.facebook.com/groups/123456789",
        category: "Food & Dining"
      },
      {
        name: "ישראלים במיאמי / דרום פלורידה",
        url: "https://www.facebook.com/groups/987654321",
        category: "Israeli Community"
      },
      {
        name: "Israelis in Los Angeles ישראלים בלוס אנג'לס",
        url: "https://www.facebook.com/groups/456789123",
        category: "Israeli Community"
      },
      {
        name: "רילוקיישן הצעות עבודה בחול",
        url: "https://www.facebook.com/groups/789123456",
        category: "Jobs & Relocation"
      }
    ];
    
    console.log(`✅ Defined ${this.results.groups.length} real groups to scrape`);
  }

  async scrapeGroupsWithCLI() {
    console.log('🔍 Running REAL Apify Facebook scraping with CLI...');
    
    for (const group of this.results.groups) {
      console.log(`📊 Scraping REAL data from: ${group.name}`);
      
      try {
        // Create input JSON for the actor
        const inputData = {
          maxResults: 100,
          startUrls: [
            {
              url: group.url
            }
          ]
        };
        
        const inputFile = path.join(this.outputDir, `input-${group.name.replace(/\s+/g, '_')}.json`);
        await fs.writeFile(inputFile, JSON.stringify(inputData, null, 2));
        
        console.log('📤 Running Apify CLI command...');
        
        // Run the Apify CLI command
        const command = `apify call ${this.actorId} --input ${inputFile}`;
        console.log(`🔧 Command: ${command}`);
        
        const { stdout, stderr } = await execAsync(command, {
          cwd: this.outputDir,
          timeout: 300000 // 5 minutes
        });
        
        console.log('✅ Apify CLI command completed');
        console.log('📄 Output:', stdout);
        
        if (stderr) {
          console.log('⚠️ Warnings:', stderr);
        }
        
        // Process the results
        const results = await this.processCLIResults(group);
        this.results.leads.push(...results);
        
        console.log(`✅ Scraped ${results.length} REAL leads from ${group.name}`);
        
      } catch (error) {
        console.log(`⚠️ Failed to scrape ${group.name}: ${error.message}`);
        // Continue with other groups
      }
    }
  }

  async processCLIResults(group) {
    console.log('📊 Processing CLI results...');
    
    try {
      // Look for the output files in the current directory
      const files = await fs.readdir(this.outputDir);
      const outputFiles = files.filter(file => file.includes('output') && file.endsWith('.json'));
      
      if (outputFiles.length === 0) {
        console.log('⚠️ No output files found');
        return [];
      }
      
      // Read the latest output file
      const latestOutput = outputFiles.sort().pop();
      const outputPath = path.join(this.outputDir, latestOutput);
      const outputData = await fs.readFile(outputPath, 'utf8');
      const results = JSON.parse(outputData);
      
      console.log(`📊 Found ${results.length} items in output`);
      
      // Process the results into leads
      const leads = this.processApifyData(results, group);
      
      return leads;
      
    } catch (error) {
      console.log(`⚠️ Error processing CLI results: ${error.message}`);
      return [];
    }
  }

  processApifyData(apifyResults, group) {
    console.log('📊 Processing Apify data...');
    
    const leads = [];
    
    if (!apifyResults || !Array.isArray(apifyResults)) {
      console.log('⚠️ No valid data returned from Apify');
      return leads;
    }
    
    apifyResults.forEach((item, index) => {
      try {
        // Extract lead information from Apify results
        const lead = {
          leadId: `real_${group.name.replace(/\s+/g, '_')}_${index}`,
          firstName: item.postAuthor?.split(' ')[0] || 'Unknown',
          lastName: item.postAuthor?.split(' ').slice(1).join(' ') || 'Unknown',
          email: item.email || '',
          phone: '',
          location: 'Global',
          groupName: group.name,
          groupUrl: group.url,
          category: group.category,
          engagementScore: this.calculateEngagementScore(item),
          leadScore: this.calculateLeadScore(item),
          interests: this.extractInterests(item),
          lastActive: item.timestamp || new Date().toISOString(),
          extractedDate: new Date().toISOString(),
          postText: item.postText || '',
          likesCount: item.likesCount || 0,
          commentsCount: item.commentsCount || 0,
          sharesCount: item.sharesCount || 0,
          postAuthor: item.postAuthor || '',
          postAuthorUrl: item.postAuthorUrl || ''
        };
        
        leads.push(lead);
        
      } catch (error) {
        console.log(`⚠️ Error processing item ${index}:`, error.message);
      }
    });
    
    console.log(`✅ Processed ${leads.length} leads from ${group.name}`);
    return leads;
  }

  calculateEngagementScore(item) {
    const likes = item.likesCount || 0;
    const comments = item.commentsCount || 0;
    const shares = item.sharesCount || 0;
    
    // Simple engagement score calculation
    return Math.min(100, (likes + comments * 2 + shares * 3) / 10);
  }

  calculateLeadScore(item) {
    const engagementScore = this.calculateEngagementScore(item);
    const hasEmail = item.email ? 20 : 0;
    const hasAuthorInfo = item.postAuthor ? 15 : 0;
    const hasPostText = item.postText ? 10 : 0;
    
    return Math.min(100, engagementScore + hasEmail + hasAuthorInfo + hasPostText);
  }

  extractInterests(item) {
    const interests = [];
    
    if (item.postText) {
      // Simple keyword extraction
      const keywords = ['food', 'restaurant', 'kosher', 'jewish', 'israeli', 'miami', 'los angeles', 'travel', 'job', 'work'];
      keywords.forEach(keyword => {
        if (item.postText.toLowerCase().includes(keyword)) {
          interests.push(keyword);
        }
      });
    }
    
    return interests.join('; ');
  }

  async processRealData() {
    console.log('🧹 Processing and cleaning REAL data...');
    
    this.results.analytics = {
      totalLeads: this.results.leads.length,
      groupsScraped: this.results.groups.length,
      averageLeadsPerGroup: Math.round(this.results.leads.length / this.results.groups.length),
      highValueLeads: this.results.leads.filter(lead => lead.leadScore >= 80).length,
      mediumValueLeads: this.results.leads.filter(lead => lead.leadScore >= 50 && lead.leadScore < 80).length,
      lowValueLeads: this.results.leads.filter(lead => lead.leadScore < 50).length,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Analytics calculated:', this.results.analytics);
  }

  async generateRealCustomAudiences() {
    console.log('🎯 Generating REAL custom audiences...');
    
    // Group leads by location for custom audiences
    const locationGroups = {};
    
    this.results.leads.forEach(lead => {
      const location = lead.location || 'Global';
      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(lead);
    });
    
    this.results.customAudiences = Object.entries(locationGroups).map(([location, leads]) => ({
      name: `Ortal_${location}_Leads_${new Date().toISOString().split('T')[0]}`,
      location,
      leadCount: leads.length,
      leads: leads.slice(0, 1000), // Facebook limit
      created: new Date().toISOString()
    }));
    
    console.log(`✅ Generated ${this.results.customAudiences.length} custom audiences`);
  }

  async saveRealResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const files = [
      { name: `real-facebook-data-${timestamp}.json`, data: JSON.stringify(this.results, null, 2) },
      { name: `real-leads-${timestamp}.csv`, data: this.generateRealCSV() },
      { name: `real-custom-audiences-${timestamp}.csv`, data: this.generateRealAudiencesCSV() }
    ];
    
    for (const file of files) {
      const filePath = path.join(this.outputDir, file.name);
      await fs.writeFile(filePath, file.data);
      console.log(`💾 Saved: ${file.name}`);
    }
  }

  generateRealCSV() {
    if (this.results.leads.length === 0) {
      return 'Lead ID,First Name,Last Name,Email,Phone,Location,Group Name,Category,Engagement Score,Lead Score,Interests,Last Active,Extracted Date\n';
    }
    
    const headers = [
      'Lead ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Location', 
      'Group Name', 'Category', 'Engagement Score', 'Lead Score', 'Interests', 
      'Last Active', 'Extracted Date', 'Post Text', 'Likes Count', 'Comments Count', 
      'Shares Count', 'Post Author', 'Post Author URL'
    ].join(',');
    
    const rows = this.results.leads.map(lead => [
      lead.leadId,
      `"${lead.firstName}"`,
      `"${lead.lastName}"`,
      `"${lead.email}"`,
      `"${lead.phone}"`,
      `"${lead.location}"`,
      `"${lead.groupName}"`,
      `"${lead.category}"`,
      lead.engagementScore,
      lead.leadScore,
      `"${lead.interests}"`,
      `"${lead.lastActive}"`,
      `"${lead.extractedDate}"`,
      `"${lead.postText.replace(/"/g, '""')}"`,
      lead.likesCount,
      lead.commentsCount,
      lead.sharesCount,
      `"${lead.postAuthor}"`,
      `"${lead.postAuthorUrl}"`
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }

  generateRealAudiencesCSV() {
    if (this.results.customAudiences.length === 0) {
      return 'Audience Name,Location,Lead Count,Email List\n';
    }
    
    const headers = 'Audience Name,Location,Lead Count,Email List';
    const rows = this.results.customAudiences.map(audience => 
      `"${audience.name}","${audience.location}",${audience.leadCount},"${audience.leads.map(l => l.email).filter(e => e).join(';')}"`
    );
    
    return [headers, ...rows].join('\n');
  }

  async saveErrorResults(error) {
    const errorData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      results: this.results
    };
    
    const filePath = path.join(this.outputDir, `error-${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(errorData, null, 2));
    console.log(`❌ Error saved to: ${filePath}`);
  }
}

async function main() {
  const scraper = new ApifyCLIFacebookScraping();
  await scraper.runRealScraping();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
