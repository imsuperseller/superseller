#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceProjectsCorrectSpace {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.systemKey = 'superseller';
        this.apiBaseUrl = `https://${this.systemKey}.boost.space/api`;
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            projectsCreated: [],
            summary: { total: 0, successful: 0, failed: 0 }
        };

        // CORRECT space ID that the user created
        this.correctSpaceId = 33; // "Active Projects" space
        this.statusSystemId = 94; // "Active" status for custom-module-item
        this.contactIds = [11, 13, 15, 17]; // Existing contact IDs
    }

    async fixProjectsInCorrectSpace() {
        console.log('🔧 FIXING PROJECTS IN CORRECT SPACE (33)');
        console.log('=========================================\n');

        try {
            // Step 1: Verify the correct space exists
            await this.verifyCorrectSpace();

            // Step 2: Create projects in the correct space
            await this.createProjectsInCorrectSpace();

            // Step 3: Verify the projects are visible
            await this.verifyProjectsVisible();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n📊 PROJECTS FIX RESULTS:');
            console.log(`✅ Projects Created: ${this.results.summary.successful}/${this.results.summary.total}`);

        } catch (error) {
            console.error('❌ Projects fix failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async verifyCorrectSpace() {
        console.log('🔍 1. VERIFYING CORRECT SPACE (33)');
        console.log('===================================');

        try {
            const response = await axios.get(`${this.apiBaseUrl}/space`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                const space33 = response.data.find(space => space.id === this.correctSpaceId);
                if (space33) {
                    console.log(`  ✅ Found space 33: "${space33.name}" (${space33.module})`);
                } else {
                    console.log(`  ❌ Space 33 not found!`);
                    throw new Error('Space 33 not found');
                }
            }

        } catch (error) {
            console.log(`  ❌ Failed to verify space: ${error.response?.status || 'Error'}`);
            throw error;
        }
    }

    async createProjectsInCorrectSpace() {
        console.log('\n📦 2. CREATING PROJECTS IN CORRECT SPACE (33)');
        console.log('==============================================');

        const projects = [
            {
                name: 'E-Signatures Implementation',
                description: 'Complete e-signatures system implementation for business automation',
                startDate: '2024-01-15',
                endDate: '2024-06-30',
                statusSystemId: this.statusSystemId,
                spaceId: this.correctSpaceId, // CORRECT SPACE!
                contactId: this.contactIds[0],
                budget: 25000,
                priority: 'High'
            },
            {
                name: 'Business Process Automation',
                description: 'Automate key business processes for improved efficiency',
                startDate: '2024-02-01',
                endDate: '2024-08-31',
                statusSystemId: this.statusSystemId,
                spaceId: this.correctSpaceId, // CORRECT SPACE!
                contactId: this.contactIds[1] || this.contactIds[0],
                budget: 35000,
                priority: 'Medium'
            },
            {
                name: 'Insurance Management System',
                description: 'Comprehensive insurance management platform development',
                startDate: '2024-03-01',
                endDate: '2024-09-30',
                statusSystemId: this.statusSystemId,
                spaceId: this.correctSpaceId, // CORRECT SPACE!
                contactId: this.contactIds[2] || this.contactIds[0],
                budget: 40000,
                priority: 'High'
            }
        ];

        this.results.summary.total = projects.length;

        for (const project of projects) {
            try {
                console.log(`\n📦 Creating project: ${project.name}`);
                console.log(`  🔗 Space ID: ${this.correctSpaceId} (CORRECT!)`);
                console.log(`  📊 Status ID: ${this.statusSystemId}`);
                console.log(`  📊 Data: ${JSON.stringify(project).substring(0, 150)}...`);

                const response = await axios.post(`${this.apiBaseUrl}/custom-module-item`, project, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ SUCCESS! Project created in space ${this.correctSpaceId}`);
                console.log(`  📝 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);

                this.results.projectsCreated.push({
                    project: project,
                    status: 'success',
                    response: response.data
                });
                this.results.summary.successful++;

            } catch (error) {
                console.log(`  ❌ FAILED: ${error.response?.status || 'Error'} - ${error.response?.statusText || error.message}`);

                if (error.response?.data) {
                    console.log(`    📝 Error details: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
                }

                this.results.projectsCreated.push({
                    project: project,
                    status: 'failed',
                    error: error.message
                });
                this.results.summary.failed++;
            }
        }
    }

    async verifyProjectsVisible() {
        console.log('\n✅ 3. VERIFYING PROJECTS ARE VISIBLE IN SPACE 33');
        console.log('================================================');

        try {
            const response = await axios.get(`${this.apiBaseUrl}/custom-module-item`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                const projectsInSpace33 = response.data.filter(item => item.spaceId === this.correctSpaceId);
                console.log(`  ✅ Found ${projectsInSpace33.length} projects in space ${this.correctSpaceId}:`);

                projectsInSpace33.forEach(project => {
                    console.log(`    - ID: ${project.id}, Name: "${project.name || 'Unnamed'}", Space: ${project.spaceId}`);
                });

                if (projectsInSpace33.length === 0) {
                    console.log(`  ❌ NO PROJECTS FOUND IN SPACE ${this.correctSpaceId}!`);
                    console.log(`  ⚠️ This means the projects were not created in the correct space.`);
                }
            }

        } catch (error) {
            console.log(`  ❌ Failed to verify projects: ${error.response?.status || 'Error'}`);
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-projects-correct-space';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `projects-correct-space-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const projectsFix = new BoostSpaceProjectsCorrectSpace();
    await projectsFix.fixProjectsInCorrectSpace();
}

main().catch(console.error);
