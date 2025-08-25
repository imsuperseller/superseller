#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableVerifyTableIdsAndFix404 {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // Base IDs to verify
        this.bases = [
            {
                name: 'Core Business Operations',
                baseId: 'app4nJpP1ytGukXQT',
                expectedTables: ['Companies', 'Contacts', 'Projects']
            },
            {
                name: 'Financial Management',
                baseId: 'app6yzlm67lRNuQZD',
                expectedTables: ['Invoices', 'Payments', 'Expenses']
            }
        ];

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            bases: [],
            tables: [],
            errors: [],
            recommendations: []
        };
    }

    async verifyTableIdsAndFix404() {
        console.log('🔍 VERIFYING TABLE IDs & FIXING 404 ERRORS');
        console.log('==========================================');
        console.log('Analyzing Airtable bases and tables to resolve access issues...');

        try {
            // Step 1: List all bases accessible to the API key
            await this.listAllBases();

            // Step 2: Analyze each base and its tables
            for (const base of this.bases) {
                await this.analyzeBase(base);
            }

            // Step 3: Generate recommendations for fixing issues
            await this.generateRecommendations();

            await this.saveResults();

            console.log('\n✅ TABLE ID VERIFICATION COMPLETED!');
            console.log('🎯 Analysis complete - check results for next steps');

        } catch (error) {
            console.error('❌ Verification failed:', error.message);
            this.results.errors.push({ step: 'verification', error: error.message });
            await this.saveResults();
        }
    }

    async listAllBases() {
        console.log('\n📋 Listing all accessible bases...');

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases`, {
                headers: this.headers
            });

            const bases = response.data.bases || [];
            console.log(`  📊 Found ${bases.length} accessible bases`);

            bases.forEach(base => {
                console.log(`    - ${base.name} (${base.id})`);
                this.results.bases.push({
                    name: base.name,
                    id: base.id,
                    access: 'success'
                });
            });

        } catch (error) {
            console.error(`  ❌ Failed to list bases: ${error.message}`);
            this.results.errors.push({
                step: 'listBases',
                error: error.message
            });
        }
    }

    async analyzeBase(baseConfig) {
        console.log(`\n🔍 Analyzing base: ${baseConfig.name} (${baseConfig.baseId})`);

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${baseConfig.baseId}`, {
                headers: this.headers
            });

            const tables = response.data.tables || [];
            console.log(`  📊 Found ${tables.length} tables in ${baseConfig.name}`);

            // Log all tables found
            tables.forEach(table => {
                console.log(`    - ${table.name} (${table.id})`);
                this.results.tables.push({
                    baseName: baseConfig.name,
                    baseId: baseConfig.baseId,
                    tableName: table.name,
                    tableId: table.id,
                    access: 'success'
                });
            });

            // Check for expected tables
            const foundTableNames = tables.map(t => t.name);
            const missingTables = baseConfig.expectedTables.filter(expected =>
                !foundTableNames.some(found =>
                    found.toLowerCase().includes(expected.toLowerCase())
                )
            );

            if (missingTables.length > 0) {
                console.log(`  ⚠️ Missing expected tables: ${missingTables.join(', ')}`);
                this.results.recommendations.push({
                    type: 'missing_tables',
                    base: baseConfig.name,
                    missing: missingTables
                });
            }

        } catch (error) {
            console.error(`  ❌ Failed to analyze base ${baseConfig.name}: ${error.message}`);
            this.results.errors.push({
                step: 'analyzeBase',
                base: baseConfig.name,
                error: error.message
            });
        }
    }

    async generateRecommendations() {
        console.log('\n💡 Generating recommendations for fixing issues...');

        // Check if we found the expected tables
        const foundTableIds = this.results.tables.map(t => ({
            baseName: t.baseName,
            tableName: t.tableName,
            tableId: t.tableId
        }));

        console.log('\n📋 CORRECT TABLE IDs FOUND:');
        foundTableIds.forEach(table => {
            console.log(`  ${table.baseName} - ${table.tableName}: ${table.tableId}`);
        });

        // Generate script with correct IDs
        await this.generateUpdatedScript(foundTableIds);

        // Check for common issues
        if (this.results.errors.length > 0) {
            console.log('\n🚨 ISSUES FOUND:');
            this.results.errors.forEach(error => {
                console.log(`  - ${error.step}: ${error.error}`);
            });
        }

        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            this.results.recommendations.forEach(rec => {
                if (rec.type === 'missing_tables') {
                    console.log(`  - Create missing tables in ${rec.base}: ${rec.missing.join(', ')}`);
                }
            });
        }
    }

    async generateUpdatedScript(foundTableIds) {
        console.log('\n📝 Generating updated script with correct table IDs...');

        const scriptContent = `#!/usr/bin/env node

// UPDATED AIRTABLE CONFIGURATION WITH CORRECT TABLE IDs
// Generated on: ${new Date().toISOString()}

export const AIRTABLE_CONFIG = {
    apiKey: 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12',
    baseUrl: 'https://api.airtable.com/v0',
    
    // Core Business Operations Base
    coreBusinessOperations: {
        baseId: 'app4nJpP1ytGukXQT',
        tables: {
${foundTableIds
                .filter(t => t.baseName === 'Core Business Operations')
                .map(t => `            ${t.tableName.toLowerCase().replace(/\s+/g, '_')}: '${t.tableId}'`)
                .join(',\n')}
        }
    },
    
    // Financial Management Base
    financialManagement: {
        baseId: 'app6yzlm67lRNuQZD',
        tables: {
${foundTableIds
                .filter(t => t.baseName === 'Financial Management')
                .map(t => `            ${t.tableName.toLowerCase().replace(/\s+/g, '_')}: '${t.tableId}'`)
                .join(',\n')}
        }
    }
};

// USAGE EXAMPLE:
// const companiesTableId = AIRTABLE_CONFIG.coreBusinessOperations.tables.companies;
// const invoicesTableId = AIRTABLE_CONFIG.financialManagement.tables.invoices;
`;

        const filename = 'scripts/airtable-config-with-correct-ids.js';
        await fs.writeFile(filename, scriptContent);
        console.log(`  ✅ Updated configuration saved to: ${filename}`);

        this.results.recommendations.push({
            type: 'updated_config',
            file: filename,
            tableCount: foundTableIds.length
        });
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/table-id-verification-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const verifier = new AirtableVerifyTableIdsAndFix404();
verifier.verifyTableIdsAndFix404().catch(console.error);
