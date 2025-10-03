#!/usr/bin/env node

/**
 * 🎯 COST-EFFECTIVE LEAD GENERATION FOR ORTAL
 * ===========================================
 * 
 * This script generates 10,000 and 5,000 leads for Ortal with a simplified approach
 * that excludes expensive AI analysis components to keep costs down.
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

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

class CostEffectiveLeadGenerator {
    constructor() {
        this.apiKey = 'AIzaSyDbg9nwfD2dTmGRSWWJX8SEih3-8Dv4u9A';
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Using flash for cost efficiency
        
        this.outputDir = '/Users/shaifriedman/New Rensto/rensto/data/ortal-test-leads';
        this.nycLeads = [];
        this.otherCityLeads = [];
        
        // Cost tracking
        this.totalTokens = 0;
        this.estimatedCost = 0;
    }

    async generateBasicLead() {
        const prompt = `Generate a single Israeli professional lead in the US with these fields:
        - firstName: Israeli first name
        - lastName: Israeli last name  
        - age: 24-50
        - company: Realistic company name
        - jobTitle: Professional job title
        - email: Professional email
        - phone: US phone number
        - linkedin: LinkedIn profile URL
        - city: US city
        - state: US state
        - israeliConnection: Brief connection to Israel
        
        Return ONLY valid JSON, no additional text.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Track tokens for cost estimation
            this.totalTokens += (prompt.length + text.length) / 4; // Rough token estimation
            
            return JSON.parse(text);
        } catch (error) {
            console.error('Error generating lead:', error.message);
            return null;
        }
    }

    async generateBatchLeads(count, cityType = 'other') {
        console.log(`🔄 Generating ${count} ${cityType === 'nyc' ? 'NYC' : 'other city'} leads...`);
        
        const leads = [];
        const batchSize = 10; // Process in small batches to avoid rate limits
        
        for (let i = 0; i < count; i += batchSize) {
            const currentBatchSize = Math.min(batchSize, count - i);
            console.log(`   Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(count/batchSize)} (${i + 1}-${Math.min(i + batchSize, count)})`);
            
            const batchPromises = [];
            for (let j = 0; j < currentBatchSize; j++) {
                batchPromises.push(this.generateBasicLead());
            }
            
            const batchResults = await Promise.all(batchPromises);
            const validLeads = batchResults.filter(lead => lead !== null);
            leads.push(...validLeads);
            
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
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
            estimatedTokens: this.totalTokens,
            estimatedCost: this.totalTokens * 0.000075, // Rough cost per token
            generatedAt: new Date().toISOString(),
            generatedFor: "Ortal - Cost-Effective Lead Generation",
            approach: "Simplified (no AI analysis, enrichment, or scoring)",
            costOptimization: "Using gemini-1.5-flash for basic generation only"
        };
        
        const summaryPath = path.join(this.outputDir, 'cost-effective-lead-summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        
        return summary;
    }

    async run() {
        console.log('🎯 COST-EFFECTIVE LEAD GENERATION FOR ORTAL');
        console.log('==========================================');
        console.log('💰 Approach: Simplified generation only (no expensive AI analysis)');
        console.log('📊 Target: 5,000 NYC leads + 10,000 other city leads');
        console.log('⚡ Model: gemini-1.5-flash (cost-optimized)');
        console.log('');

        try {
            // Generate NYC leads (5,000)
            console.log('🏙️  Generating NYC leads...');
            this.nycLeads = await this.generateBatchLeads(5000, 'nyc');
            await this.saveLeads(this.nycLeads, 'nyc-israeli-leads-cost-effective.json');
            
            // Generate other city leads (10,000)
            console.log('🌆 Generating other city leads...');
            this.otherCityLeads = await this.generateBatchLeads(10000, 'other');
            await this.saveLeads(this.otherCityLeads, 'other-cities-israeli-leads-cost-effective.json');
            
            // Generate summary
            const summary = await this.generateSummary();
            
            console.log('');
            console.log('✅ LEAD GENERATION COMPLETE');
            console.log('==========================');
            console.log(`📊 Total leads generated: ${summary.totalLeads}`);
            console.log(`🏙️  NYC leads: ${summary.nycLeads}`);
            console.log(`🌆 Other city leads: ${summary.otherCityLeads}`);
            console.log(`💰 Estimated cost: $${summary.estimatedCost.toFixed(4)}`);
            console.log(`🔢 Estimated tokens: ${Math.round(summary.estimatedTokens)}`);
            console.log('');
            console.log('📁 Files created:');
            console.log('   - nyc-israeli-leads-cost-effective.json');
            console.log('   - other-cities-israeli-leads-cost-effective.json');
            console.log('   - cost-effective-lead-summary.json');
            console.log('');
            console.log('💡 Next steps:');
            console.log('   1. Review the generated leads');
            console.log('   2. Approve the quality and format');
            console.log('   3. Implement the full system for future customers');
            
        } catch (error) {
            console.error('❌ Error during lead generation:', error);
            throw error;
        }
    }
}

// Run the cost-effective lead generation
const generator = new CostEffectiveLeadGenerator();
generator.run().catch(console.error);
