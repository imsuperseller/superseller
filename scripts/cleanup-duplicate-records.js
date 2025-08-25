#!/usr/bin/env node

/**
 * CLEANUP DUPLICATE RECORDS
 * 
 * This script removes duplicate records from the Airtable base
 * and keeps only the real, accurate business data
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        baseId: 'appQijHhqqP4z6wGe'
    }
};

class DuplicateRecordCleanup {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            cleaned: {},
            summary: {
                customers: { duplicates: 0, kept: 0, deleted: 0 },
                projects: { duplicates: 0, kept: 0, deleted: 0 },
                tasks: { duplicates: 0, kept: 0, deleted: 0 }
            }
        };
    }

    async getCustomers() {
        const response = await axios.get(
            `https://api.airtable.com/v0/${config.airtable.baseId}/Customers`,
            {
                headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
            }
        );
        return response.data.records || [];
    }

    async getProjects() {
        const response = await axios.get(
            `https://api.airtable.com/v0/${config.airtable.baseId}/Projects`,
            {
                headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
            }
        );
        return response.data.records || [];
    }

    async getTasks() {
        const response = await axios.get(
            `https://api.airtable.com/v0/${config.airtable.baseId}/Tasks`,
            {
                headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
            }
        );
        return response.data.records || [];
    }

    async deleteRecord(tableName, recordId) {
        try {
            await axios.delete(
                `https://api.airtable.com/v0/${config.airtable.baseId}/${tableName}/${recordId}`,
                {
                    headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
                }
            );
            return true;
        } catch (error) {
            console.log(`❌ Failed to delete ${tableName} record ${recordId}: ${error.message}`);
            return false;
        }
    }

    async cleanupCustomers() {
        console.log('\n🧹 Cleaning up duplicate customers...');

        const customers = await this.getCustomers();
        const customerMap = new Map();
        const duplicates = [];
        const toKeep = [];

        // Group customers by email (unique identifier)
        for (const customer of customers) {
            const email = customer.fields.Email;
            if (!customerMap.has(email)) {
                customerMap.set(email, customer);
                toKeep.push(customer);
            } else {
                duplicates.push(customer);
            }
        }

        console.log(`📊 Found ${customers.length} customers total`);
        console.log(`✅ Keeping ${toKeep.length} unique customers`);
        console.log(`🗑️ Found ${duplicates.length} duplicate customers`);

        // Delete duplicates
        for (const duplicate of duplicates) {
            const success = await this.deleteRecord('Customers', duplicate.id);
            if (success) {
                this.results.summary.customers.deleted++;
            }
        }

        this.results.summary.customers.duplicates = duplicates.length;
        this.results.summary.customers.kept = toKeep.length;
        this.results.cleaned.customers = toKeep.map(c => ({
            id: c.id,
            name: c.fields.Name,
            company: c.fields.Company,
            email: c.fields.Email,
            status: c.fields.Status
        }));

        console.log(`✅ Cleaned up ${this.results.summary.customers.deleted} duplicate customers`);
    }

    async cleanupProjects() {
        console.log('\n🧹 Cleaning up duplicate projects...');

        const projects = await this.getProjects();
        const projectMap = new Map();
        const duplicates = [];
        const toKeep = [];

        // Group projects by name and customer (unique identifier)
        for (const project of projects) {
            const key = `${project.fields.Name}-${project.fields.Customer}`;
            if (!projectMap.has(key)) {
                projectMap.set(key, project);
                toKeep.push(project);
            } else {
                duplicates.push(project);
            }
        }

        console.log(`📊 Found ${projects.length} projects total`);
        console.log(`✅ Keeping ${toKeep.length} unique projects`);
        console.log(`🗑️ Found ${duplicates.length} duplicate projects`);

        // Delete duplicates
        for (const duplicate of duplicates) {
            const success = await this.deleteRecord('Projects', duplicate.id);
            if (success) {
                this.results.summary.projects.deleted++;
            }
        }

        this.results.summary.projects.duplicates = duplicates.length;
        this.results.summary.projects.kept = toKeep.length;
        this.results.cleaned.projects = toKeep.map(p => ({
            id: p.id,
            name: p.fields.Name,
            customer: p.fields.Customer,
            budget: p.fields.Budget,
            status: p.fields.Status
        }));

        console.log(`✅ Cleaned up ${this.results.summary.projects.deleted} duplicate projects`);
    }

    async cleanupTasks() {
        console.log('\n🧹 Cleaning up duplicate tasks...');

        const tasks = await this.getTasks();
        const taskMap = new Map();
        const duplicates = [];
        const toKeep = [];

        // Group tasks by name and project (unique identifier)
        for (const task of tasks) {
            const key = `${task.fields.Name}-${task.fields.Project}`;
            if (!taskMap.has(key)) {
                taskMap.set(key, task);
                toKeep.push(task);
            } else {
                duplicates.push(task);
            }
        }

        console.log(`📊 Found ${tasks.length} tasks total`);
        console.log(`✅ Keeping ${toKeep.length} unique tasks`);
        console.log(`🗑️ Found ${duplicates.length} duplicate tasks`);

        // Delete duplicates
        for (const duplicate of duplicates) {
            const success = await this.deleteRecord('Tasks', duplicate.id);
            if (success) {
                this.results.summary.tasks.deleted++;
            }
        }

        this.results.summary.tasks.duplicates = duplicates.length;
        this.results.summary.tasks.kept = toKeep.length;
        this.results.cleaned.tasks = toKeep.map(t => ({
            id: t.id,
            name: t.fields.Name,
            project: t.fields.Project,
            status: t.fields.Status,
            priority: t.fields.Priority
        }));

        console.log(`✅ Cleaned up ${this.results.summary.tasks.deleted} duplicate tasks`);
    }

    async executeCleanup() {
        console.log('\n🚀 EXECUTING DUPLICATE RECORD CLEANUP...');
        console.log(`📅 Started at: ${new Date().toISOString()}`);

        try {
            // Clean up all tables
            await this.cleanupCustomers();
            await this.cleanupProjects();
            await this.cleanupTasks();

            // Save results
            console.log('\n💾 SAVING RESULTS...');
            const resultsPath = path.join(__dirname, '../docs/duplicate-cleanup-results.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));

            // Generate summary
            this.generateCleanupSummary();

            console.log('\n🎉 DUPLICATE CLEANUP COMPLETE!');
            console.log(`📄 Results saved to: ${resultsPath}`);

            return this.results;

        } catch (error) {
            console.error('\n❌ Cleanup failed:', error.message);
            return null;
        }
    }

    generateCleanupSummary() {
        console.log('\n📋 CLEANUP SUMMARY:');

        console.log('\n👥 CUSTOMERS:');
        console.log(`- Total: ${this.results.summary.customers.kept + this.results.summary.customers.deleted}`);
        console.log(`- Kept: ${this.results.summary.customers.kept}`);
        console.log(`- Deleted: ${this.results.summary.customers.deleted}`);

        console.log('\n📊 PROJECTS:');
        console.log(`- Total: ${this.results.summary.projects.kept + this.results.summary.projects.deleted}`);
        console.log(`- Kept: ${this.results.summary.projects.kept}`);
        console.log(`- Deleted: ${this.results.summary.projects.deleted}`);

        console.log('\n✅ TASKS:');
        console.log(`- Total: ${this.results.summary.tasks.kept + this.results.summary.tasks.deleted}`);
        console.log(`- Kept: ${this.results.summary.tasks.kept}`);
        console.log(`- Deleted: ${this.results.summary.tasks.deleted}`);

        console.log('\n🎯 REAL BUSINESS DATA:');
        for (const customer of this.results.cleaned.customers) {
            console.log(`- ${customer.name} (${customer.company}) - ${customer.status}`);
        }
    }
}

// Run the cleanup
async function main() {
    const cleanup = new DuplicateRecordCleanup();
    const results = await cleanup.executeCleanup();
    process.exit(results ? 0 : 1);
}

main().catch(console.error);
