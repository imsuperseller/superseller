#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableGetInvoicesTableId {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.baseId = 'app6yzlm67lRNuQZD'; // Financial Management Base
    }

    async getInvoicesTableId() {
        console.log('🔍 GETTING INVOICES TABLE ID');
        console.log('============================');

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${this.baseId}/tables`, {
                headers: this.headers
            });

            const tables = response.data.tables || [];

            console.log(`\n📋 Tables in Financial Management Base:`);
            console.log(`📊 Total Tables: ${tables.length}`);
            console.log('\n📝 Table Details:');

            tables.forEach((table, index) => {
                console.log(`  ${index + 1}. ${table.name} (${table.id})`);
                if (table.description) {
                    console.log(`     Description: ${table.description}`);
                }
            });

            // Find Invoices table
            const invoicesTable = tables.find(table =>
                table.name.toLowerCase().includes('invoice') ||
                table.name.toLowerCase().includes('invoices')
            );

            if (invoicesTable) {
                console.log(`\n🎯 Found Invoices Table:`);
                console.log(`   Name: ${invoicesTable.name}`);
                console.log(`   ID: ${invoicesTable.id}`);
                console.log(`   Use this ID in the implementation script: ${invoicesTable.id}`);
            } else {
                console.log(`\n⚠️ No Invoices table found. Available tables:`);
                tables.forEach(table => {
                    console.log(`   - ${table.name} (${table.id})`);
                });
            }

            // Save table information
            const tableInfo = {
                timestamp: new Date().toISOString(),
                baseId: this.baseId,
                totalTables: tables.length,
                tables: tables.map(t => ({
                    name: t.name,
                    id: t.id,
                    description: t.description
                })),
                invoicesTable: invoicesTable ? {
                    name: invoicesTable.name,
                    id: invoicesTable.id
                } : null
            };

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `docs/airtable-migration/invoices-table-id-${timestamp}.json`;

            await fs.mkdir(path.dirname(filename), { recursive: true });
            await fs.writeFile(filename, JSON.stringify(tableInfo, null, 2));

            console.log(`\n📁 Table information saved to: ${filename}`);

        } catch (error) {
            console.error('❌ Failed to get table information:', error.message);
        }
    }
}

const getter = new AirtableGetInvoicesTableId();
getter.getInvoicesTableId().catch(console.error);
