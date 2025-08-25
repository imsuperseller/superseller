#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableGetProjectsTableId {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.baseId = 'app4nJpP1ytGukXQT'; // Core Business Operations
    }

    async getProjectsTableId() {
        console.log('🔍 GETTING PROJECTS TABLE ID');
        console.log('============================');

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${this.baseId}/tables`, {
                headers: this.headers
            });

            const tables = response.data.tables || [];

            console.log(`\n📋 Tables in Core Business Operations Base:`);
            console.log(`📊 Total Tables: ${tables.length}`);
            console.log('\n📝 Table Details:');

            tables.forEach((table, index) => {
                console.log(`  ${index + 1}. ${table.name} (${table.id})`);
                if (table.description) {
                    console.log(`     Description: ${table.description}`);
                }
            });

            // Find Projects table
            const projectsTable = tables.find(table =>
                table.name.toLowerCase().includes('project') ||
                table.name.toLowerCase().includes('projects')
            );

            if (projectsTable) {
                console.log(`\n🎯 Found Projects Table:`);
                console.log(`   Name: ${projectsTable.name}`);
                console.log(`   ID: ${projectsTable.id}`);
                console.log(`   Use this ID in the implementation script: ${projectsTable.id}`);
            } else {
                console.log(`\n⚠️ No Projects table found. Available tables:`);
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
                projectsTable: projectsTable ? {
                    name: projectsTable.name,
                    id: projectsTable.id
                } : null
            };

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `docs/airtable-migration/projects-table-id-${timestamp}.json`;

            await fs.mkdir(path.dirname(filename), { recursive: true });
            await fs.writeFile(filename, JSON.stringify(tableInfo, null, 2));

            console.log(`\n📁 Table information saved to: ${filename}`);

        } catch (error) {
            console.error('❌ Failed to get table information:', error.message);
        }
    }
}

const getter = new AirtableGetProjectsTableId();
getter.getProjectsTableId().catch(console.error);
