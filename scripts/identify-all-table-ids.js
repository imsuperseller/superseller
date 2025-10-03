#!/usr/bin/env node
import axios from 'axios';

class TableIdIdentifier {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };

        // Updated Rensto bases with actual IDs
        this.renstoBases = {
            operations: { id: 'app6saCaH88uK3kCO', name: 'Operations & Automation (Op)' },
            idempotency: { id: 'app9DhsrZ0VnuEH3t', name: 'Idempotency Systems (Id)' },
            rgid: { id: 'appCGexgpGPkMUPXF', name: 'RGID-based Entity Management (Rg)' },
            analytics: { id: 'appOvDNYenyx7WITR', name: 'Analytics & Monitoring (An)' },
            entities: { id: 'app9oouVkvTkFjf3t', name: 'Integrations (In)' },
            customerSuccess: { id: 'appSCBZk03GUCTfhN', name: 'Customer Success (Cu)' },
            marketingSales: { id: 'appQhVkIaWoGJG301', name: 'Marketing & Sales (Ma)' },
            financial: { id: 'app6yzlm67lRNuQZD', name: 'Financial Management (Fi)' },
            coreBusiness: { id: 'app4nJpP1ytGukXQT', name: 'Core Business Operations (Co)' },
            rensto: { id: 'appQijHhqqP4z6wGe', name: 'Rensto Client Operations' },
            additional: { id: 'appfpXxb5Vq8acLTy', name: 'Additional Base (Ad)' }
        };
    }

    async getTableSchema(baseId, baseName) {
        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${baseId}/tables`, { headers: this.headers });
            console.log(`\n📊 ${baseName} (${baseId})`);
            console.log(`   Tables: ${response.data.tables.length}`);

            const tableInfo = [];
            response.data.tables.forEach(table => {
                console.log(`   📋 ${table.name} (${table.id})`);
                console.log(`      Fields: ${table.fields.length}`);

                // Show first few fields as examples
                const fieldExamples = table.fields.slice(0, 3).map(field => `${field.name} (${field.type})`).join(', ');
                if (fieldExamples) {
                    console.log(`      Sample fields: ${fieldExamples}${table.fields.length > 3 ? '...' : ''}`);
                }

                tableInfo.push({
                    name: table.name,
                    id: table.id,
                    fieldCount: table.fields.length,
                    fields: table.fields.map(field => ({ name: field.name, type: field.type }))
                });
            });

            return { accessible: true, tables: tableInfo };
        } catch (error) {
            console.log(`\n❌ ${baseName} (${baseId}) - Not accessible: ${error.response?.data?.error?.message || error.message}`);
            return { accessible: false, tables: [] };
        }
    }

    async identifyAllTableIds() {
        console.log('🔍 IDENTIFYING ALL TABLE IDs FOR RENSTO BASES');
        console.log('=============================================');

        const results = {};
        const accessibleBases = [];
        const inaccessibleBases = [];

        for (const [key, base] of Object.entries(this.renstoBases)) {
            const result = await this.getTableSchema(base.id, base.name);
            results[key] = result;

            if (result.accessible) {
                accessibleBases.push({ key, base, tables: result.tables });
            } else {
                inaccessibleBases.push({ key, base });
            }
        }

        console.log('\n📊 SUMMARY');
        console.log('==========');
        console.log(`✅ Accessible bases: ${accessibleBases.length}`);
        console.log(`❌ Inaccessible bases: ${inaccessibleBases.length}`);

        if (inaccessibleBases.length > 0) {
            console.log('\n❌ INACCESSIBLE BASES:');
            inaccessibleBases.forEach(({ base }) => {
                console.log(`   - ${base.name}: ${base.id}`);
            });
        }

        console.log('\n✅ ACCESSIBLE BASES WITH TABLES:');
        accessibleBases.forEach(({ key, base, tables }) => {
            console.log(`\n📋 ${base.name} (${base.id})`);
            tables.forEach(table => {
                console.log(`   - ${table.name}: ${table.id} (${table.fieldCount} fields)`);
            });
        });

        // Generate JavaScript object for easy copying
        console.log('\n📝 JAVASCRIPT OBJECT FOR COPYING:');
        console.log('==================================');
        console.log('const renstoBasesWithTables = {');

        accessibleBases.forEach(({ key, base, tables }) => {
            console.log(`  ${key}: {`);
            console.log(`    id: '${base.id}',`);
            console.log(`    name: '${base.name}',`);
            console.log(`    tables: {`);
            tables.forEach(table => {
                console.log(`      ${table.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}: '${table.id}',`);
            });
            console.log(`    }`);
            console.log(`  },`);
        });

        console.log('};');

        return { accessibleBases, inaccessibleBases, results };
    }

    async testRecordCreation(baseId, tableId, tableName) {
        try {
            const testRecord = {
                fields: {
                    Name: `Test Record - ${new Date().toISOString()}`,
                    Notes: 'This is a test record to verify table accessibility'
                }
            };

            const response = await axios.post(`${this.baseUrl}/${baseId}/${tableId}`, testRecord, { headers: this.headers });
            console.log(`✅ Successfully created test record in ${tableName}`);

            // Clean up - delete the test record
            if (response.data.id) {
                await axios.delete(`${this.baseUrl}/${baseId}/${tableId}/${response.data.id}`, { headers: this.headers });
                console.log(`🗑️  Cleaned up test record from ${tableName}`);
            }

            return true;
        } catch (error) {
            console.log(`❌ Failed to create test record in ${tableName}: ${error.response?.data?.error?.message || error.message}`);
            return false;
        }
    }

    async testAllTables() {
        console.log('\n🧪 TESTING RECORD CREATION FOR ALL TABLES');
        console.log('=========================================');

        const { accessibleBases } = await this.identifyAllTableIds();

        for (const { base, tables } of accessibleBases) {
            console.log(`\n🔬 Testing ${base.name}:`);

            for (const table of tables) {
                console.log(`   Testing ${table.name}...`);
                await this.testRecordCreation(base.id, table.id, table.name);
            }
        }
    }
}

// Execute the identification
const identifier = new TableIdIdentifier();

// Choose what to run
const args = process.argv.slice(2);
if (args.includes('--test')) {
    identifier.testAllTables().catch(console.error);
} else {
    identifier.identifyAllTableIds().catch(console.error);
}
