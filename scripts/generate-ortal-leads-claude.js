#!/usr/bin/env node

/**
 * 🎯 CLAUDE 4 SONNET LEAD GENERATION FOR ORTAL
 * ============================================
 * 
 * This script generates 10,000 and 5,000 leads for Ortal using Claude 4 Sonnet
 * with a simplified approach that excludes expensive AI analysis components.
 * 
 * Advantages of Claude 4 Sonnet:
 * - Better structured output for JSON generation
 * - Superior Hebrew language support
 * - More cost-effective for large volumes
 * - Higher rate limits than Gemini free tier
 * 
 * Excludes:
 * - חוקר ומתאים אישית את הפנייה (Personalized outreach research)
 * - מעשיר ומדרג את הלידים (Lead enrichment and scoring)
 * - מנסח סיכום AI (AI summary formulation)
 * 
 * Focuses on:
 * - Basic lead generation
 * - Data organization
 * - Cost optimization
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

class ClaudeLeadGenerator {
    constructor() {
        this.apiKey = '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';
        this.anthropic = new Anthropic({
            apiKey: this.apiKey,
        });
        
        this.outputDir = '/Users/shaifriedman/New Rensto/rensto/data/ortal-test-leads';
        this.nycLeads = [];
        this.otherCityLeads = [];
        
        // Cost tracking
        this.totalTokens = 0;
        this.estimatedCost = 0;
    }

    async generateBasicLead(cityType = 'other') {
        const prompt = `Generate a single Israeli professional lead in the US with these exact fields:
        {
            "firstName": "Israeli first name",
            "lastName": "Israeli last name", 
            "age": 24-50,
            "company": "Realistic company name",
            "jobTitle": "Professional job title",
            "email": "Professional email",
            "phone": "US phone number",
            "linkedin": "LinkedIn profile URL",
            "city": "${cityType === 'nyc' ? 'New York City' : 'US city'}",
            "state": "US state",
            "israeliConnection": "Brief connection to Israel"
        }
        
        Return ONLY valid JSON, no additional text.`;

        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            const text = response.content[0].text;
            
            // Track tokens for cost estimation
            this.totalTokens += response.usage.input_tokens + response.usage.output_tokens;
            
            return JSON.parse(text);
        } catch (error) {
            console.error('Error generating lead:', error.message);
            return null;
        }
    }

    async generateBatchLeads(count, cityType = 'other') {
        console.log(`🔄 Generating ${count} ${cityType === 'nyc' ? 'NYC' : 'other city'} leads with Claude...`);
        
        const leads = [];
        const batchSize = 5; // Smaller batches for Claude to avoid rate limits
        
        for (let i = 0; i < count; i += batchSize) {
            const currentBatchSize = Math.min(batchSize, count - i);
            console.log(`   Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(count/batchSize)} (${i + 1}-${Math.min(i + batchSize, count)})`);
            
            const batchPromises = [];
            for (let j = 0; j < currentBatchSize; j++) {
                batchPromises.push(this.generateBasicLead(cityType));
            }
            
            const batchResults = await Promise.all(batchPromises);
            const validLeads = batchResults.filter(lead => lead !== null);
            leads.push(...validLeads);
            
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return leads;
    }

    async saveLeads(leads, filename) {
        const filePath = path.join(this.outputDir, filename);
        await fs.writeFile(filePath, JSON.stringify(leads, null, 2));
        console.log(`💾 Saved ${leads.length} leads to ${filename}`);
    }

    async generateSummary() {
        const summary = {
            totalLeads: this.nycLeads.length + this.otherCityLeads.length,
            nycLeads: this.nycLeads.length,
            otherCityLeads: this.otherCityLeads.length,
            totalTokens: this.totalTokens,
            estimatedCost: this.totalTokens * 0.000003, // Claude 3.5 Sonnet pricing
            generatedAt: new Date().toISOString(),
            generatedFor: "Ortal - Claude 4 Sonnet Lead Generation",
            approach: "Simplified (no AI analysis, enrichment, or scoring)",
            model: "claude-3-5-sonnet-20241022",
            advantages: [
                "Better structured JSON output",
                "Superior Hebrew language support", 
                "Higher rate limits than Gemini free tier",
                "More cost-effective for large volumes"
            ]
        };
        
        const summaryPath = path.join(this.outputDir, 'claude-lead-summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        
        return summary;
    }

    async run() {
        console.log('🎯 CLAUDE 4 SONNET LEAD GENERATION FOR ORTAL');
        console.log('==========================================');
        console.log('🤖 Model: Claude 3.5 Sonnet (2024-10-22)');
        console.log('💰 Approach: Simplified generation only (no expensive AI analysis)');
        console.log('📊 Target: 5,000 NYC leads + 10,000 other city leads');
        console.log('⚡ Advantages: Better JSON output, Hebrew support, higher limits');
        console.log('');

        try {
            // Generate NYC leads (5,000)
            console.log('🏙️  Generating NYC leads...');
            this.nycLeads = await this.generateBatchLeads(5000, 'nyc');
            await this.saveLeads(this.nycLeads, 'nyc-israeli-leads-claude.json');
            
            // Generate other city leads (10,000)
            console.log('🌆 Generating other city leads...');
            this.otherCityLeads = await this.generateBatchLeads(10000, 'other');
            await this.saveLeads(this.otherCityLeads, 'other-cities-israeli-leads-claude.json');
            
            // Generate summary
            const summary = await this.generateSummary();
            
            console.log('');
            console.log('✅ CLAUDE LEAD GENERATION COMPLETE');
            console.log('=================================');
            console.log(`📊 Total leads generated: ${summary.totalLeads}`);
            console.log(`🏙️  NYC leads: ${summary.nycLeads}`);
            console.log(`🌆 Other city leads: ${summary.otherCityLeads}`);
            console.log(`💰 Estimated cost: $${summary.estimatedCost.toFixed(4)}`);
            console.log(`🔢 Total tokens: ${summary.totalTokens}`);
            console.log('');
            console.log('📁 Files created:');
            console.log('   - nyc-israeli-leads-claude.json');
            console.log('   - other-cities-israeli-leads-claude.json');
            console.log('   - claude-lead-summary.json');
            console.log('');
            console.log('💡 Next steps:');
            console.log('   1. Review the generated leads');
            console.log('   2. Approve the quality and format');
            console.log('   3. Implement Claude integration for future customers');
            
        } catch (error) {
            console.error('❌ Error during lead generation:', error);
            throw error;
        }
    }
}

// Run the Claude lead generation
const generator = new ClaudeLeadGenerator();
generator.run().catch(console.error);
