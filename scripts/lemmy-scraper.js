#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * LEMMY SCRAPER
 * 
 * Fetches posts, comments, and user data from Lemmy instances
 * Uses Lemmy API (no scraping needed - official API)
 * 
 * Lemmy API Docs: https://join-lemmy.org/docs/contributors/04-api.html
 */

class LemmyScraper {
  constructor() {
    // Popular Lemmy instances
    this.instances = {
      'lemmy.world': 'https://lemmy.world',
      'lemmy.ml': 'https://lemmy.ml',
      'beehaw.org': 'https://beehaw.org',
      'sh.itjust.works': 'https://sh.itjust.works',
      'lemmy.one': 'https://lemmy.one'
    };
    
    this.defaultInstance = 'lemmy.world';
    this.baseUrl = this.instances[this.defaultInstance];
    this.outputDir = 'data/lemmy-data';
    this.results = {
      timestamp: new Date().toISOString(),
      instance: this.defaultInstance,
      baseUrl: this.baseUrl,
      communities: [],
      posts: [],
      comments: [],
      users: [],
      leads: [],
      analytics: {}
    };
  }

  async run() {
    console.log('🚀 LEMMY SCRAPER STARTING...\n');
    console.log(`🌐 Instance: ${this.defaultInstance}`);
    console.log(`🔗 Base URL: ${this.baseUrl}\n`);
    
    await fs.mkdir(this.outputDir, { recursive: true });
    
    try {
      // Step 1: Get communities list
      await this.getCommunities();
      
      // Step 2: Fetch posts from communities
      await this.fetchPosts();
      
      // Step 3: Extract leads from posts/comments
      await this.extractLeads();
      
      // Step 4: Save results
      await this.saveResults();
      
      console.log('✅ Lemmy scraping completed!');
      console.log(`📁 Data saved to: ${this.outputDir}`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      await this.saveErrorResults(error);
    }
  }

  /**
   * Get list of communities from instance
   */
  async getCommunities(params = {}) {
    console.log('📋 Fetching communities...');
    
    const defaultParams = {
      type_: 'All', // All, Subscribed, Local
      sort: 'TopMonth', // Active, Hot, New, Old, TopDay, TopWeek, TopMonth, TopYear, TopAll, MostComments, NewComments, TopHour, TopSixHour, TopTwelveHour
      limit: 50,
      page: 1,
      ...params
    };
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v3/community/list`,
        defaultParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Rensto-Lemmy-Scraper/1.0'
          },
          timeout: 30000
        }
      );
      
      const communities = response.data.communities || [];
      this.results.communities = communities.map(c => ({
        id: c.community.id,
        name: c.community.name,
        title: c.community.title,
        description: c.community.description,
        nsfw: c.community.nsfw,
        subscribers: c.counts.subscribers,
        posts: c.counts.posts,
        comments: c.counts.comments,
        url: `${this.baseUrl}/c/${c.community.name}`
      }));
      
      console.log(`✅ Found ${communities.length} communities`);
      return this.results.communities;
      
    } catch (error) {
      console.error('❌ Error fetching communities:', error.message);
      throw error;
    }
  }

  /**
   * Fetch posts from specific communities
   */
  async fetchPosts(communityNames = [], params = {}) {
    console.log('📝 Fetching posts...');
    
    // If no communities specified, use top communities
    if (communityNames.length === 0) {
      communityNames = this.results.communities
        .slice(0, 10)
        .map(c => c.name);
    }
    
    const defaultParams = {
      type_: 'All', // All, Local, Subscribed
      sort: 'Hot', // Active, Hot, New, Old, TopDay, TopWeek, TopMonth, TopYear, TopAll, MostComments, NewComments, TopHour, TopSixHour, TopTwelveHour
      limit: 50,
      page: 1,
      ...params
    };
    
    for (const communityName of communityNames) {
      try {
        console.log(`  📌 Fetching posts from: ${communityName}`);
        
        const response = await axios.post(
          `${this.baseUrl}/api/v3/post/list`,
          {
            ...defaultParams,
            community_name: communityName
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Rensto-Lemmy-Scraper/1.0'
            },
            timeout: 30000
          }
        );
        
        const posts = response.data.posts || [];
        const formattedPosts = posts.map(p => ({
          id: p.post.id,
          name: p.post.name,
          body: p.post.body,
          url: p.post.url,
          creator_id: p.post.creator_id,
          community_id: p.post.community_id,
          published: p.post.published,
          updated: p.post.updated,
          upvotes: p.counts.upvotes,
          downvotes: p.counts.downvotes,
          comments: p.counts.comments,
          score: p.counts.score,
          hot_rank: p.counts.hot_rank,
          creator: {
            id: p.creator.id,
            name: p.creator.name,
            display_name: p.creator.display_name,
            avatar: p.creator.avatar,
            banned: p.creator.banned
          },
          community: {
            id: p.community.id,
            name: p.community.name,
            title: p.community.title
          },
          lemmy_url: `${this.baseUrl}/post/${p.post.id}`
        }));
        
        this.results.posts.push(...formattedPosts);
        console.log(`    ✅ Found ${posts.length} posts`);
        
        // Rate limiting - be respectful
        await this.sleep(1000);
        
      } catch (error) {
        console.error(`    ❌ Error fetching posts from ${communityName}:`, error.message);
      }
    }
    
    console.log(`✅ Total posts fetched: ${this.results.posts.length}`);
    return this.results.posts;
  }

  /**
   * Get comments for a post
   */
  async getComments(postId, params = {}) {
    const defaultParams = {
      post_id: postId,
      type_: 'All',
      sort: 'Hot', // Top, New, Old, Hot
      limit: 50,
      page: 1,
      ...params
    };
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v3/comment/list`,
        defaultParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Rensto-Lemmy-Scraper/1.0'
          },
          timeout: 30000
        }
      );
      
      const comments = response.data.comments || [];
      return comments.map(c => ({
        id: c.comment.id,
        content: c.comment.content,
        creator_id: c.comment.creator_id,
        post_id: c.comment.post_id,
        published: c.comment.published,
        upvotes: c.counts.upvotes,
        downvotes: c.counts.downvotes,
        score: c.counts.score,
        creator: {
          id: c.creator.id,
          name: c.creator.name,
          display_name: c.creator.display_name
        }
      }));
      
    } catch (error) {
      console.error(`❌ Error fetching comments for post ${postId}:`, error.message);
      return [];
    }
  }

  /**
   * Extract leads from posts and comments
   */
  async extractLeads() {
    console.log('🔍 Extracting leads...');
    
    const leads = [];
    
    // Extract from posts
    for (const post of this.results.posts) {
      // Look for contact information, business mentions, etc.
      const text = `${post.name} ${post.body || ''}`.toLowerCase();
      
      // Simple lead extraction (can be enhanced with AI)
      if (this.isPotentialLead(text, post)) {
        leads.push({
          source: 'lemmy_post',
          source_id: post.id,
          source_url: post.lemmy_url,
          name: post.creator.display_name || post.creator.name,
          username: post.creator.name,
          email: this.extractEmail(text),
          phone: this.extractPhone(text),
          website: this.extractWebsite(text),
          company: this.extractCompany(text),
          message: post.body || post.name,
          community: post.community.name,
          score: post.score,
          published: post.published,
          metadata: {
            upvotes: post.upvotes,
            comments: post.comments,
            hot_rank: post.hot_rank
          }
        });
      }
    }
    
    this.results.leads = leads;
    console.log(`✅ Extracted ${leads.length} potential leads`);
    return leads;
  }

  /**
   * Check if post/comment is a potential lead
   */
  isPotentialLead(text, item) {
    // Keywords that indicate business/professional content
    const businessKeywords = [
      'business', 'company', 'startup', 'service', 'product',
      'consulting', 'agency', 'freelance', 'hire', 'looking for',
      'need help', 'contact', 'email', 'website', 'phone'
    ];
    
    const hasBusinessKeyword = businessKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    // High engagement posts are more likely to be leads
    const hasHighEngagement = item.score > 5 || item.comments > 3;
    
    return hasBusinessKeyword || hasHighEngagement;
  }

  /**
   * Extract email from text
   */
  extractEmail(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Extract phone from text
   */
  extractPhone(text) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Extract website from text
   */
  extractWebsite(text) {
    const urlRegex = /(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/g;
    const matches = text.match(urlRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Extract company name from text
   */
  extractCompany(text) {
    // Simple extraction - can be enhanced with NLP
    const companyPatterns = [
      /(?:company|business|startup|agency|firm)\s+([A-Z][a-zA-Z\s]+)/i,
      /([A-Z][a-zA-Z\s]+)\s+(?:LLC|Inc|Corp|Ltd)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    
    return null;
  }

  /**
   * Save results to files
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save full results
    await fs.writeFile(
      path.join(this.outputDir, `lemmy-results-${timestamp}.json`),
      JSON.stringify(this.results, null, 2)
    );
    
    // Save leads CSV
    if (this.results.leads.length > 0) {
      const csvHeader = 'Name,Username,Email,Phone,Website,Company,Message,Community,Score,Published,Source URL\n';
      const csvRows = this.results.leads.map(lead => 
        `"${lead.name || ''}","${lead.username || ''}","${lead.email || ''}","${lead.phone || ''}","${lead.website || ''}","${lead.company || ''}","${(lead.message || '').replace(/"/g, '""')}","${lead.community || ''}","${lead.score || 0}","${lead.published || ''}","${lead.source_url || ''}"`
      ).join('\n');
      
      await fs.writeFile(
        path.join(this.outputDir, `lemmy-leads-${timestamp}.csv`),
        csvHeader + csvRows
      );
    }
    
    // Save analytics
    this.results.analytics = {
      total_communities: this.results.communities.length,
      total_posts: this.results.posts.length,
      total_leads: this.results.leads.length,
      top_communities: this.results.communities
        .sort((a, b) => b.subscribers - a.subscribers)
        .slice(0, 10)
        .map(c => ({ name: c.name, subscribers: c.subscribers })),
      top_posts: this.results.posts
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(p => ({ title: p.name, score: p.score, community: p.community.name }))
    };
    
    await fs.writeFile(
      path.join(this.outputDir, `lemmy-analytics-${timestamp}.json`),
      JSON.stringify(this.results.analytics, null, 2)
    );
  }

  /**
   * Save error results
   */
  async saveErrorResults(error) {
    const errorData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      results: this.results
    };
    
    await fs.writeFile(
      path.join(this.outputDir, 'error.json'),
      JSON.stringify(errorData, null, 2)
    );
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new LemmyScraper();
  scraper.run().catch(console.error);
}

export default LemmyScraper;

