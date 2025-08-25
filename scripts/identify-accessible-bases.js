#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AccessibleBasesIdentifier {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            accessibleBases: [],
            testResults: [],
            errors: []
        };
    }

    async identifyAccessibleBases() {
        console.log('🔍 IDENTIFYING ACCESSIBLE BASES');
        console.log('===============================');
        console.log('Finding bases that can be used for development...');
        
        try {
            // Step 1: Get all bases
            const allBases = await this.getAllBases();
            
            // Step 2: Test each base for data access
            await this.testEachBaseForDataAccess(allBases);
            
            // Step 3: Generate recommendations
            await this.generateRecommendations();
            
            await this.saveResults();
            
            console.log('\n✅ ACCESSIBLE BASES IDENTIFICATION COMPLETED!');
            console.log('🎯 Check results for development options');
            
        } catch (error) {
            console.error('❌ Identification failed:', error.message);
            this.results.errors.push({ step: 'identification', error: error.message });
            await this.saveResults();
        }
    }

    async getAllBases() {
        console.log('\n📋 Getting all available bases...');
        
        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases`, {
                headers: this.headers
            });

            const bases = response.data.bases || [];
            console.log(`  ✅ Found ${bases.length} total bases`);
            
            return bases;
            
        } catch (error) {
            console.error(`  ❌ Failed to get bases: ${error.message}`);
            throw error;
        }
    }

    async testEachBaseForDataAccess(bases) {
        console.log('\n🔍 Testing each base for data access...');
        
        // Test a subset of bases to avoid rate limiting
        const testBases = bases.slice(0, 10); // Test first 10 bases
        
        for (const base of testBases) {
            try {
                console.log(`  Testing: ${base.name} (${base.id})`);
                
                // Try to access the base directly without meta endpoint
                const response = await axios.get(`${this.baseUrl}/${base.id}`, {
                    headers: this.headers
                });
                
                console.log(`    ✅ SUCCESS! Base accessible: ${base.name}`);
                console.log(`       Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
                
                this.results.accessibleBases.push({
                    name: base.name,
                    id: base.id,
                    access: 'direct_data_access',
                    response: response.data
                });
                
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log(`    ⚠️ Base exists but no tables found: ${base.name}`);
                    this.results.accessibleBases.push({
                        name: base.name,
                        id: base.id,
                        access: 'no_tables',
                        error: 'No tables found'
                    });
                } else if (error.response?.status === 403) {
                    console.log(`    ❌ No access: ${base.name}`);
                    this.results.accessibleBases.push({
                        name: base.name,
                        id: base.id,
                        access: 'no_access',
                        error: '403 Forbidden'
                    });
                } else {
                    console.log(`    ❌ Error: ${base.name} - ${error.response?.status || 'Unknown'}`);
                    this.results.accessibleBases.push({
                        name: base.name,
                        id: base.id,
                        access: 'error',
                        error: error.response?.status || 'Unknown error'
                    });
                }
            }
        }
    }

    async generateRecommendations() {
        console.log('\n💡 Generating recommendations...');
        
        const accessibleBases = this.results.accessibleBases.filter(b => b.access === 'direct_data_access');
        const noTablesBases = this.results.accessibleBases.filter(b => b.access === 'no_tables');
        const noAccessBases = this.results.accessibleBases.filter(b => b.access === 'no_access');
        
        console.log(`\n📊 ACCESS SUMMARY:`);
        console.log(`  Direct Data Access: ${accessibleBases.length} bases`);
        console.log(`  No Tables: ${noTablesBases.length} bases`);
        console.log(`  No Access: ${noAccessBases.length} bases`);
        
        if (accessibleBases.length > 0) {
            console.log(`\n✅ IMMEDIATE DEVELOPMENT OPTIONS:`);
            console.log(`  These bases can be used for development:`);
            accessibleBases.forEach(base => {
                console.log(`    - ${base.name} (${base.id})`);
            });
        }
        
        if (noTablesBases.length > 0) {
            console.log(`\n🔧 POTENTIAL DEVELOPMENT BASES:`);
            console.log(`  These bases exist but need tables created:`);
            noTablesBases.forEach(base => {
                console.log(`    - ${base.name} (${base.id})`);
            });
        }
        
        this.results.recommendations = {
            accessibleBases: accessibleBases.length,
            noTablesBases: noTablesBases.length,
            noAccessBases: noAccessBases.length,
            suggestedAction: accessibleBases.length > 0 ? 'use_accessible_bases' : 'create_tables_in_empty_bases'
        };
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/accessible-bases-${timestamp}.json`;
        
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Results saved to: ${filename}`);
    }
}

const identifier = new AccessibleBasesIdentifier();
identifier.identifyAccessibleBases().catch(console.error);
