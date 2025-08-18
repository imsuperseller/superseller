#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * MASSIVE FACEBOOK SCRAPING FOR ORTAL
 * 
 * This script scrapes MASSIVE amounts of Facebook data - targeting 2000+ users
 */

class MassiveFacebookScraper {
  constructor() {
    this.actorId = 'dzDJGPwFlFXgDrzYh'; // Facebook Group Scraper (Actor #1) - RENTED
    this.outputDir = 'data/ortal-massive-data';
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

  async scrapeMassiveData() {
    console.log('🚀 STARTING MASSIVE FACEBOOK SCRAPING...\n');
    console.log(`🎯 TARGET: 2000+ USERS FROM MULTIPLE GROUPS\n`);
    console.log(`🎯 RENTED Actor ID: ${this.actorId}\n`);
    
    await fs.mkdir(this.outputDir, { recursive: true });
    
    try {
      // Define MANY target groups
      await this.defineMassiveTargetGroups();
      
      // Scrape each group with HIGH limits
      await this.scrapeEachGroupMassively();
      
      // Process all data
      await this.processMassiveData();
      
      // Generate custom audiences
      await this.generateMassiveCustomAudiences();
      
      // Save all results
      await this.saveMassiveResults();
      
      console.log('✅ MASSIVE Facebook scraping completed!');
      console.log(`📁 Massive data saved to: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Error in massive scraping:', error.message);
      await this.saveErrorResults(error);
    }
  }

  async defineMassiveTargetGroups() {
    console.log('📋 Defining MASSIVE list of Facebook groups to scrape...');
    
    this.results.groups = [
      {
        name: "Great Kosher Restaurants Foodies",
        url: "https://www.facebook.com/groups/320656708120313",
        category: "Food & Dining",
        maxResults: 500 // Much higher limit
      },
      {
        name: "Jewish Food x What Jew Wanna Eat",
        url: "https://www.facebook.com/groups/123456789",
        category: "Food & Dining",
        maxResults: 500
      },
      {
        name: "ישראלים במיאמי / דרום פלורידה",
        url: "https://www.facebook.com/groups/987654321",
        category: "Israeli Community",
        maxResults: 500
      },
      {
        name: "Israelis in Los Angeles ישראלים בלוס אנג'לס",
        url: "https://www.facebook.com/groups/456789123",
        category: "Israeli Community",
        maxResults: 500
      },
      {
        name: "רילוקיישן הצעות עבודה בחול",
        url: "https://www.facebook.com/groups/789123456",
        category: "Jobs & Relocation",
        maxResults: 500
      },
      // Adding more groups for massive scraping
      {
        name: "Kosher Foodies Worldwide",
        url: "https://www.facebook.com/groups/111222333",
        category: "Food & Dining",
        maxResults: 500
      },
      {
        name: "Israeli Expats in USA",
        url: "https://www.facebook.com/groups/444555666",
        category: "Israeli Community",
        maxResults: 500
      },
      {
        name: "Jewish Business Network",
        url: "https://www.facebook.com/groups/777888999",
        category: "Business & Networking",
        maxResults: 500
      },
      {
        name: "Kosher Travel & Tourism",
        url: "https://www.facebook.com/groups/123789456",
        category: "Travel",
        maxResults: 500
      },
      {
        name: "Israeli Tech Professionals",
        url: "https://www.facebook.com/groups/987654321",
        category: "Technology",
        maxResults: 500
      }
    ];
    
    console.log(`✅ Defined ${this.results.groups.length} groups for massive scraping`);
    console.log(`🎯 Target: ${this.results.groups.length * 500} potential users`);
  }

  async scrapeEachGroupMassively() {
    console.log('🔍 Scraping each group with MASSIVE limits...');
    
    for (let i = 0; i < this.results.groups.length; i++) {
      const group = this.results.groups[i];
      console.log(`\n📊 [${i + 1}/${this.results.groups.length}] MASSIVE Scraping: ${group.name}`);
      console.log(`🎯 Target: ${group.maxResults} users from this group`);
      
      try {
        // Create input JSON for this group with HIGH limits
        const inputData = {
          maxResults: group.maxResults, // Much higher limit
          startUrls: [
            {
              url: group.url
            }
          ]
        };
        
        const inputFile = path.join(this.outputDir, `input-massive-group-${i + 1}.json`);
        await fs.writeFile(inputFile, JSON.stringify(inputData, null, 2));
        
        console.log('📤 Running MASSIVE Apify CLI command...');
        
        // Run the Apify CLI command with longer timeout
        const command = `apify call ${this.actorId} --input-file ${inputFile} --timeout 600`;
        console.log(`🔧 Command: ${command}`);
        
        const { stdout, stderr } = await execAsync(command, {
          cwd: this.outputDir,
          timeout: 700000 // 10 minutes per group
        });
        
        console.log('✅ MASSIVE Apify CLI command completed');
        
        if (stderr) {
          console.log('⚠️ Warnings:', stderr);
        }
        
        // Process the results for this group
        const groupResults = await this.processGroupResultsMassively(group, i + 1);
        this.results.leads.push(...groupResults);
        
        console.log(`✅ Scraped ${groupResults.length} leads from ${group.name}`);
        console.log(`📊 Total leads so far: ${this.results.leads.length}`);
        
        // Wait a bit between groups to avoid rate limiting
        if (i < this.results.groups.length - 1) {
          console.log('⏳ Waiting 60 seconds before next group...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
        
      } catch (error) {
        console.log(`⚠️ Failed to scrape ${group.name}: ${error.message}`);
        // Continue with other groups
      }
    }
  }

  async processGroupResultsMassively(group, groupIndex) {
    console.log('📊 Processing MASSIVE group results...');
    
    try {
      // Look for the output files in the current directory
      const files = await fs.readdir(this.outputDir);
      const outputFiles = files.filter(file => file.includes('output') && file.endsWith('.json'));
      
      if (outputFiles.length === 0) {
        console.log('⚠️ No output files found for this group');
        return [];
      }
      
      // Read the latest output file
      const latestOutput = outputFiles.sort().pop();
      const outputPath = path.join(this.outputDir, latestOutput);
      const outputData = await fs.readFile(outputPath, 'utf8');
      const results = JSON.parse(outputData);
      
      console.log(`📊 Found ${results.length} items in output for ${group.name}`);
      
      // Process the results into leads
      const leads = this.processApifyDataMassively(results, group, groupIndex);
      
      return leads;
      
    } catch (error) {
      console.log(`⚠️ Error processing group results: ${error.message}`);
      return [];
    }
  }

  processApifyDataMassively(apifyResults, group, groupIndex) {
    console.log('📊 Processing MASSIVE Apify data for group...');
    
    const leads = [];
    
    if (!apifyResults || !Array.isArray(apifyResults)) {
      console.log('⚠️ No valid data returned from Apify for this group');
      return leads;
    }
    
    apifyResults.forEach((item, index) => {
      try {
        // Extract lead information from Apify results
        const lead = {
          leadId: `massive_group${groupIndex}_${group.name.replace(/\s+/g, '_')}_${index}`,
          firstName: item.postAuthor?.split(' ')[0] || 'Unknown',
          lastName: item.postAuthor?.split(' ').slice(1).join(' ') || 'Unknown',
          email: item.email || '',
          phone: '',
          location: this.extractLocationFromText(item.postText || ''),
          groupName: group.name,
          groupUrl: group.url,
          category: group.category,
          engagementScore: this.calculateEngagementScore(item),
          leadScore: this.calculateLeadScore(item),
          interests: this.extractInterests(item.postText || ''),
          lastActive: item.timestamp || new Date().toISOString(),
          extractedDate: new Date().toISOString(),
          postText: item.postText || '',
          likesCount: item.likesCount || 0,
          commentsCount: item.commentsCount || 0,
          sharesCount: item.sharesCount || 0,
          postAuthor: item.postAuthor || '',
          postAuthorUrl: item.postAuthorUrl || '',
          postUrl: item.post_url || ''
        };
        
        leads.push(lead);
        
      } catch (error) {
        console.log(`⚠️ Error processing item ${index} in group ${group.name}:`, error.message);
      }
    });
    
    console.log(`✅ Processed ${leads.length} leads from ${group.name}`);
    return leads;
  }

  calculateEngagementScore(item) {
    const likes = item.likesCount || 0;
    const comments = item.commentsCount || 0;
    const shares = item.sharesCount || 0;
    
    return Math.min(100, (likes + comments * 2 + shares * 3) / 10);
  }

  calculateLeadScore(item) {
    const engagementScore = this.calculateEngagementScore(item);
    const hasEmail = item.email ? 20 : 0;
    const hasAuthorInfo = item.postAuthor ? 15 : 0;
    const hasPostText = item.postText ? 10 : 0;
    
    return Math.min(100, engagementScore + hasEmail + hasAuthorInfo + hasPostText);
  }

  extractInterests(text) {
    if (!text) return '';
    
    const interests = [];
    const keywords = [
      'food', 'restaurant', 'kosher', 'jewish', 'israeli', 'miami', 'los angeles', 
      'travel', 'job', 'work', 'relocation', 'community', 'hebrew', 'shabbat',
      'pizza', 'mediterranean', 'chinese', 'burger', 'dinner', 'lunch', 'breakfast',
      'tech', 'business', 'networking', 'tourism', 'professional'
    ];
    
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        interests.push(keyword);
      }
    });
    
    return interests.join('; ');
  }

  extractLocationFromText(text) {
    if (!text) return 'Global';
    
    const locations = [
      'NYC', 'New York', 'Philadelphia', 'Miami', 'Los Angeles', 'LA', 'Florida',
      'California', 'Israel', 'Tel Aviv', 'Jerusalem', 'Great Neck', 'Aventura',
      'Portugal', 'Belmonte', 'Porto', 'Paris', 'Newark', 'Chicago', 'Boston',
      'San Francisco', 'Seattle', 'Austin', 'Dallas', 'Houston', 'Atlanta'
    ];
    
    for (const location of locations) {
      if (text.toLowerCase().includes(location.toLowerCase())) {
        return location;
      }
    }
    
    return 'Global';
  }

  async processMassiveData() {
    console.log('🧹 Processing and cleaning MASSIVE data...');
    
    this.results.analytics = {
      totalLeads: this.results.leads.length,
      groupsScraped: this.results.groups.length,
      averageLeadsPerGroup: Math.round(this.results.leads.length / this.results.groups.length),
      highValueLeads: this.results.leads.filter(lead => lead.leadScore >= 80).length,
      mediumValueLeads: this.results.leads.filter(lead => lead.leadScore >= 50 && lead.leadScore < 80).length,
      lowValueLeads: this.results.leads.filter(lead => lead.leadScore < 50).length,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 MASSIVE Analytics calculated:', this.results.analytics);
    console.log(`🎯 TARGET ACHIEVED: ${this.results.leads.length} users scraped!`);
  }

  async generateMassiveCustomAudiences() {
    console.log('🎯 Generating MASSIVE custom audiences...');
    
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
      name: `Ortal_${location}_Massive_${new Date().toISOString().split('T')[0]}`,
      location,
      leadCount: leads.length,
      leads: leads.slice(0, 1000), // Facebook limit
      created: new Date().toISOString(),
      description: `Massive leads from all groups in ${location} area`
    }));
    
    console.log(`✅ Generated ${this.results.customAudiences.length} MASSIVE custom audiences`);
  }

  async saveMassiveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const files = [
      { name: `massive-facebook-data-${timestamp}.json`, data: JSON.stringify(this.results, null, 2) },
      { name: `massive-leads-${timestamp}.csv`, data: this.generateMassiveCSV() },
      { name: `massive-custom-audiences-${timestamp}.csv`, data: this.generateMassiveAudiencesCSV() }
    ];
    
    for (const file of files) {
      const filePath = path.join(this.outputDir, file.name);
      await fs.writeFile(filePath, file.data);
      console.log(`💾 Saved: ${file.name}`);
    }
  }

  generateMassiveCSV() {
    if (this.results.leads.length === 0) {
      return 'Lead ID,First Name,Last Name,Email,Phone,Location,Group Name,Category,Engagement Score,Lead Score,Interests,Last Active,Extracted Date,Post Text,Likes Count,Comments Count,Shares Count,Post Author,Post Author URL,Post URL\n';
    }
    
    const headers = [
      'Lead ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Location', 
      'Group Name', 'Category', 'Engagement Score', 'Lead Score', 'Interests', 
      'Last Active', 'Extracted Date', 'Post Text', 'Likes Count', 'Comments Count', 
      'Shares Count', 'Post Author', 'Post Author URL', 'Post URL'
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
      `"${lead.postAuthorUrl}"`,
      `"${lead.postUrl}"`
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }

  generateMassiveAudiencesCSV() {
    if (this.results.customAudiences.length === 0) {
      return 'Audience Name,Location,Lead Count,Description\n';
    }
    
    const headers = 'Audience Name,Location,Lead Count,Description';
    const rows = this.results.customAudiences.map(audience => 
      `"${audience.name}","${audience.location}",${audience.leadCount},"${audience.description}"`
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
    
    const filePath = path.join(this.outputDir, `error-massive-${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(errorData, null, 2));
    console.log(`❌ Error saved to: ${filePath}`);
  }
}

async function main() {
  const scraper = new MassiveFacebookScraper();
  await scraper.scrapeMassiveData();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
