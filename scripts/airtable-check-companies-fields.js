#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableCheckCompaniesFields {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.baseId = 'app4nJpP1ytGukXQT'; // Core Business Operations
        this.tableId = 'tbl1roDiTjOCU3wiz'; // Companies table
    }

    async checkCompaniesFields() {
        console.log('🔍 CHECKING COMPANIES TABLE FIELDS');
        console.log('==================================');

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${this.baseId}/tables/${this.tableId}`, {
                headers: this.headers
            });

            const table = response.data;
            const fields = table.fields || [];

            console.log(`\n📋 Table: ${table.name} (${table.id})`);
            console.log(`📊 Total Fields: ${fields.length}`);
            console.log('\n📝 Current Fields:');

            fields.forEach((field, index) => {
                console.log(`  ${index + 1}. ${field.name} (${field.type})`);
                if (field.description) {
                    console.log(`     Description: ${field.description}`);
                }
                if (field.options) {
                    console.log(`     Options: ${JSON.stringify(field.options)}`);
                }
            });

            // Save detailed field information
            const fieldDetails = {
                timestamp: new Date().toISOString(),
                tableName: table.name,
                tableId: table.id,
                totalFields: fields.length,
                fields: fields.map(f => ({
                    name: f.name,
                    type: f.type,
                    description: f.description,
                    options: f.options
                }))
            };

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `docs/airtable-migration/companies-fields-check-${timestamp}.json`;

            await fs.mkdir(path.dirname(filename), { recursive: true });
            await fs.writeFile(filename, JSON.stringify(fieldDetails, null, 2));

            console.log(`\n📁 Detailed field information saved to: ${filename}`);

        } catch (error) {
            console.error('❌ Failed to check fields:', error.message);
        }
    }
}

const check = new AirtableCheckCompaniesFields();
check.checkCompaniesFields().catch(console.error);
