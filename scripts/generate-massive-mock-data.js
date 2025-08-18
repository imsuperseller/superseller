#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * GENERATE MASSIVE MOCK DATA FOR ORTAL
 * 
 * This script generates 2000+ realistic mock users while real scraping is happening
 */

class MassiveMockDataGenerator {
  constructor() {
    this.outputDir = 'data/ortal-massive-mock-data';
    this.results = {
      timestamp: new Date().toISOString(),
      customer: 'Ortal Flanary',
      source: 'Massive Mock Data Generation',
      totalLeads: 0,
      totalAudiences: 0,
      leads: [],
      customAudiences: [],
      analytics: {}
    };
  }

  async generateMassiveMockData() {
    console.log('🚀 GENERATING MASSIVE MOCK DATA...\n');
    console.log(`🎯 TARGET: 2000+ REALISTIC MOCK USERS\n`);
    
    await fs.mkdir(this.outputDir, { recursive: true });
    
    try {
      // Generate massive mock data
      await this.generateMockUsers();
      
      // Process the data
      await this.processMockData();
      
      // Generate custom audiences
      await this.generateMockCustomAudiences();
      
      // Save all results
      await this.saveMockResults();
      
      console.log('✅ MASSIVE mock data generation completed!');
      console.log(`📁 Mock data saved to: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Error generating mock data:', error.message);
    }
  }

  async generateMockUsers() {
    console.log('👥 Generating 2000+ realistic mock users...');
    
    const groups = [
      "Great Kosher Restaurants Foodies",
      "Jewish Food x What Jew Wanna Eat", 
      "ישראלים במיאמי / דרום פלורידה",
      "Israelis in Los Angeles ישראלים בלוס אנג'לס",
      "רילוקיישן הצעות עבודה בחול",
      "Kosher Foodies Worldwide",
      "Israeli Expats in USA",
      "Jewish Business Network",
      "Kosher Travel & Tourism",
      "Israeli Tech Professionals"
    ];

    const locations = [
      "New York", "Los Angeles", "Miami", "Chicago", "Boston", "San Francisco",
      "Seattle", "Austin", "Dallas", "Houston", "Atlanta", "Philadelphia",
      "Washington DC", "Denver", "Phoenix", "Las Vegas", "Portland", "Nashville"
    ];

    const interests = [
      "kosher food", "jewish cuisine", "israeli restaurants", "mediterranean food",
      "travel", "business networking", "tech", "relocation", "community",
      "shabbat", "hebrew", "israeli culture", "kosher travel", "jewish business"
    ];

    const postTemplates = [
      "Looking for the best kosher restaurant in {location}! Any recommendations?",
      "Just had an amazing meal at {restaurant} in {location}. Highly recommend!",
      "Anyone know of good Israeli food spots in {location}?",
      "Planning a trip to {location}. Any kosher dining suggestions?",
      "Great networking event with the Jewish business community in {location}",
      "Found this amazing Mediterranean restaurant in {location}",
      "Looking for kosher options while traveling to {location}",
      "Amazing shabbat dinner at {restaurant} in {location}",
      "Any Israeli expats in {location} want to connect?",
      "Best kosher pizza in {location}? Need recommendations!"
    ];

    const restaurants = [
      "Saba's Pizza", "Judah's Mediterranean Grill", "Bambu", "La Bottega",
      "Kosher Delight", "Mediterranean Palace", "Israeli Kitchen", "Shalom Restaurant",
      "Kosher Corner", "Mediterranean Express", "Israeli Grill", "Kosher Kitchen"
    ];

    const firstNames = [
      "David", "Sarah", "Michael", "Rachel", "Daniel", "Leah", "Jonathan", "Miriam",
      "Benjamin", "Hannah", "Joshua", "Esther", "Samuel", "Rebecca", "Joseph", "Deborah",
      "Aaron", "Ruth", "Isaac", "Naomi", "Jacob", "Tamar", "Ethan", "Yael", "Noah",
      "Aviva", "Adam", "Shira", "Eli", "Talia", "Ari", "Maya", "Zach", "Liora",
      "Gabe", "Nina", "Max", "Sara", "Alex", "Dina", "Sam", "Rina", "Tom", "Yael",
      "Dan", "Michal", "Ben", "Adina", "Jake", "Shoshana", "Matt", "Eliana"
    ];

    const lastNames = [
      "Cohen", "Levy", "Goldberg", "Rosenberg", "Katz", "Weiss", "Friedman", "Schwartz",
      "Greenberg", "Silverman", "Klein", "Berger", "Roth", "Stein", "Gross", "Meyer",
      "Wagner", "Fischer", "Schneider", "Weber", "Hoffman", "Mueller", "Schmidt",
      "Anderson", "Taylor", "Thomas", "Jackson", "White", "Harris", "Martin",
      "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis",
      "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott"
    ];

    for (let i = 0; i < 2000; i++) {
      const group = groups[Math.floor(Math.random() * groups.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      const postTemplate = postTemplates[Math.floor(Math.random() * postTemplates.length)];
      const postText = postTemplate
        .replace('{location}', location)
        .replace('{restaurant}', restaurant);

      const likes = Math.floor(Math.random() * 200) + 1;
      const comments = Math.floor(Math.random() * 50) + 1;
      const shares = Math.floor(Math.random() * 20) + 1;

      const engagementScore = Math.min(100, (likes + comments * 2 + shares * 3) / 10);
      const leadScore = Math.min(100, engagementScore + Math.random() * 30 + 20);

      const userInterests = [];
      const numInterests = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numInterests; j++) {
        const interest = interests[Math.floor(Math.random() * interests.length)];
        if (!userInterests.includes(interest)) {
          userInterests.push(interest);
        }
      }

      const lead = {
        leadId: `mock_user_${i + 1}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        location,
        groupName: group,
        groupUrl: `https://www.facebook.com/groups/${Math.floor(Math.random() * 1000000000)}`,
        category: this.getCategoryFromGroup(group),
        engagementScore: Math.round(engagementScore * 10) / 10,
        leadScore: Math.round(leadScore * 10) / 10,
        interests: userInterests.join('; '),
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        extractedDate: new Date().toISOString(),
        postText,
        likesCount: likes,
        commentsCount: comments,
        sharesCount: shares,
        postAuthor: `${firstName} ${lastName}`,
        postAuthorUrl: `https://www.facebook.com/${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random() * 1000)}`,
        postUrl: `https://www.facebook.com/groups/${Math.floor(Math.random() * 1000000000)}/posts/${Math.floor(Math.random() * 1000000000000)}`
      };

      this.results.leads.push(lead);
    }

    console.log(`✅ Generated ${this.results.leads.length} realistic mock users`);
  }

  getCategoryFromGroup(group) {
    if (group.includes('Food') || group.includes('Restaurant') || group.includes('Kosher')) {
      return 'Food & Dining';
    } else if (group.includes('Israeli') || group.includes('ישראלים')) {
      return 'Israeli Community';
    } else if (group.includes('Business') || group.includes('Network')) {
      return 'Business & Networking';
    } else if (group.includes('Travel') || group.includes('Tourism')) {
      return 'Travel';
    } else if (group.includes('Tech') || group.includes('Professional')) {
      return 'Technology';
    } else if (group.includes('רילוקיישן') || group.includes('Job')) {
      return 'Jobs & Relocation';
    } else {
      return 'Community';
    }
  }

  async processMockData() {
    console.log('🧹 Processing mock data...');
    
    this.results.totalLeads = this.results.leads.length;
    
    this.results.analytics = {
      totalLeads: this.results.leads.length,
      groupsScraped: 10,
      averageLeadsPerGroup: Math.round(this.results.leads.length / 10),
      highValueLeads: this.results.leads.filter(lead => lead.leadScore >= 80).length,
      mediumValueLeads: this.results.leads.filter(lead => lead.leadScore >= 50 && lead.leadScore < 80).length,
      lowValueLeads: this.results.leads.filter(lead => lead.leadScore < 50).length,
      averageEngagementScore: Math.round(this.results.leads.reduce((sum, lead) => sum + lead.engagementScore, 0) / this.results.leads.length),
      averageLeadScore: Math.round(this.results.leads.reduce((sum, lead) => sum + lead.leadScore, 0) / this.results.leads.length),
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Mock analytics calculated:', this.results.analytics);
  }

  async generateMockCustomAudiences() {
    console.log('🎯 Generating mock custom audiences...');
    
    // Group leads by location for custom audiences
    const locationGroups = {};
    
    this.results.leads.forEach(lead => {
      const location = lead.location;
      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(lead);
    });
    
    this.results.customAudiences = Object.entries(locationGroups).map(([location, leads]) => ({
      name: `Ortal_${location}_Mock_${new Date().toISOString().split('T')[0]}`,
      location,
      leadCount: leads.length,
      leads: leads.slice(0, 1000), // Facebook limit
      created: new Date().toISOString(),
      description: `Mock leads from ${location} area`
    }));
    
    this.results.totalAudiences = this.results.customAudiences.length;
    
    console.log(`✅ Generated ${this.results.customAudiences.length} mock custom audiences`);
  }

  async saveMockResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const files = [
      { name: `massive-mock-data-${timestamp}.json`, data: JSON.stringify(this.results, null, 2) },
      { name: `massive-mock-leads-${timestamp}.csv`, data: this.generateMockCSV() },
      { name: `massive-mock-audiences-${timestamp}.csv`, data: this.generateMockAudiencesCSV() }
    ];
    
    for (const file of files) {
      const filePath = path.join(this.outputDir, file.name);
      await fs.writeFile(filePath, file.data);
      console.log(`💾 Saved: ${file.name}`);
    }
  }

  generateMockCSV() {
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

  generateMockAudiencesCSV() {
    if (this.results.customAudiences.length === 0) {
      return 'Audience Name,Location,Lead Count,Description\n';
    }
    
    const headers = 'Audience Name,Location,Lead Count,Description';
    const rows = this.results.customAudiences.map(audience => 
      `"${audience.name}","${audience.location}",${audience.leadCount},"${audience.description}"`
    );
    
    return [headers, ...rows].join('\n');
  }
}

async function main() {
  const generator = new MassiveMockDataGenerator();
  await generator.generateMassiveMockData();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
