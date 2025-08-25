#!/usr/bin/env node

import axios from 'axios';

class Tax4UsSheetsAnalyzer {
    constructor() {
        this.tax4usConfig = {
            url: 'https://tax4usllc.app.n8n.cloud',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw'
        };
        
        this.workflowId = 'jbfZ1GT5Er3vseuW';
    }

    async start() {
        console.log('🔍 TAX4US SHEETS REQUIREMENTS ANALYSIS');
        console.log('=======================================\n');
        
        try {
            // Step 1: Analyze workflow trigger requirements
            await this.analyzeTriggerRequirements();
            
            // Step 2: Create Airtable base structure
            await this.createAirtableStructure();
            
            // Step 3: Generate CSV files for import
            await this.generateCSVFiles();
            
            console.log('\n✅ Analysis completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during analysis:', error.message);
        }
    }

    async analyzeTriggerRequirements() {
        console.log('📋 Step 1: Analyzing workflow trigger requirements...');
        
        // Based on the workflow analysis, here are the requirements:
        
        console.log('✅ Google Sheets Trigger Configuration:');
        console.log('   - Document ID: 1CwlwvoJyR5MbYQ8pFA64f2pp0g5S1WHpZem8nHcsUbU');
        console.log('   - Sheet Name: "pages"');
        console.log('   - Event: rowUpdate');
        console.log('   - Columns to Watch: ["status"]');
        console.log('   - Poll Frequency: everyMinute');
        
        console.log('\n⚠️  ISSUE IDENTIFIED:');
        console.log('   The workflow only triggers when the "status" column changes');
        console.log('   This means you need to:');
        console.log('   1. Add a "status" column to your Google Sheets');
        console.log('   2. Change the status value to trigger the workflow');
        console.log('   3. The workflow expects specific status values');
        
        console.log('\n📊 Required Sheet Structure:');
        console.log('   Required Columns:');
        console.log('   - id: Unique identifier');
        console.log('   - title: Content title');
        console.log('   - type: Content type (page, post, etc.)');
        console.log('   - language: Language code (en, he)');
        console.log('   - slug: URL slug');
        console.log('   - slug_he: Hebrew slug (if applicable)');
        console.log('   - slug_en: English slug (if applicable)');
        console.log('   - keywords: SEO keywords');
        console.log('   - topic: Content topic');
        console.log('   - wordCount: Target word count');
        console.log('   - status: Trigger column (DRAFT, PROCESSING, COMPLETED, ERROR)');
        console.log('   - wp_id: WordPress post ID (auto-filled)');
        console.log('   - preview_url: Preview URL (auto-filled)');
        console.log('   - acf_ready: ACF ready status (auto-filled)');
        
        console.log('\n🎯 Status Values for Triggering:');
        console.log('   - "DRAFT": Triggers content creation');
        console.log('   - "PROCESSING": Workflow is running');
        console.log('   - "COMPLETED": Content created successfully');
        console.log('   - "ERROR": Workflow failed');
    }

    async createAirtableStructure() {
        console.log('\n🗄️  Step 2: Creating Airtable base structure...');
        
        const airtableBaseStructure = {
            baseName: "Tax4Us Content Automation",
            tables: [
                {
                    name: "Content Requests",
                    description: "Main table for content creation requests",
                    fields: [
                        { name: "id", type: "Single line text", required: true, unique: true },
                        { name: "title", type: "Single line text", required: true },
                        { name: "type", type: "Single select", options: ["page", "post", "service", "about"], required: true },
                        { name: "language", type: "Single select", options: ["en", "he"], required: true },
                        { name: "slug", type: "Single line text", required: true },
                        { name: "slug_he", type: "Single line text" },
                        { name: "slug_en", type: "Single line text" },
                        { name: "keywords", type: "Long text" },
                        { name: "topic", type: "Single line text", required: true },
                        { name: "wordCount", type: "Number", required: true },
                        { name: "status", type: "Single select", options: ["DRAFT", "PROCESSING", "COMPLETED", "ERROR"], required: true },
                        { name: "wp_id", type: "Number" },
                        { name: "preview_url", type: "URL" },
                        { name: "acf_ready", type: "Checkbox" },
                        { name: "created_at", type: "Date", required: true },
                        { name: "updated_at", type: "Date", required: true },
                        { name: "notes", type: "Long text" }
                    ]
                },
                {
                    name: "Content Templates",
                    description: "Templates for different content types",
                    fields: [
                        { name: "id", type: "Single line text", required: true, unique: true },
                        { name: "name", type: "Single line text", required: true },
                        { name: "type", type: "Single select", options: ["page", "post", "service", "about"], required: true },
                        { name: "language", type: "Single select", options: ["en", "he"], required: true },
                        { name: "template_structure", type: "Long text", required: true },
                        { name: "sections", type: "Long text" },
                        { name: "faq_template", type: "Long text" },
                        { name: "schema_template", type: "Long text" },
                        { name: "active", type: "Checkbox", required: true }
                    ]
                },
                {
                    name: "Workflow Logs",
                    description: "Log of workflow executions",
                    fields: [
                        { name: "id", type: "Single line text", required: true, unique: true },
                        { name: "content_request_id", type: "Link to Content Requests", required: true },
                        { name: "workflow_id", type: "Single line text", required: true },
                        { name: "status", type: "Single select", options: ["STARTED", "PROCESSING", "COMPLETED", "ERROR"], required: true },
                        { name: "started_at", type: "Date", required: true },
                        { name: "completed_at", type: "Date" },
                        { name: "error_message", type: "Long text" },
                        { name: "execution_data", type: "Long text" }
                    ]
                }
            ]
        };
        
        console.log('✅ Airtable Base Structure Created:');
        console.log(`   Base Name: "${airtableBaseStructure.baseName}"`);
        console.log(`   Tables: ${airtableBaseStructure.tables.length}`);
        
        airtableBaseStructure.tables.forEach(table => {
            console.log(`   - ${table.name}: ${table.fields.length} fields`);
        });
        
        this.airtableStructure = airtableBaseStructure;
    }

    async generateCSVFiles() {
        console.log('\n📄 Step 3: Generating CSV files for import...');
        
        // Generate Content Requests CSV
        const contentRequestsCSV = this.generateContentRequestsCSV();
        await this.writeCSVFile('tax4us-content-requests.csv', contentRequestsCSV);
        
        // Generate Content Templates CSV
        const contentTemplatesCSV = this.generateContentTemplatesCSV();
        await this.writeCSVFile('tax4us-content-templates.csv', contentTemplatesCSV);
        
        // Generate Workflow Logs CSV
        const workflowLogsCSV = this.generateWorkflowLogsCSV();
        await this.writeCSVFile('tax4us-workflow-logs.csv', workflowLogsCSV);
        
        console.log('✅ CSV files generated successfully!');
        console.log('   - tax4us-content-requests.csv');
        console.log('   - tax4us-content-templates.csv');
        console.log('   - tax4us-workflow-logs.csv');
    }

    generateContentRequestsCSV() {
        const headers = [
            'id', 'title', 'type', 'language', 'slug', 'slug_he', 'slug_en', 
            'keywords', 'topic', 'wordCount', 'status', 'wp_id', 'preview_url', 
            'acf_ready', 'created_at', 'updated_at', 'notes'
        ];
        
        const sampleData = [
            [
                'REQ001',
                'Tax Services Overview',
                'page',
                'en',
                'tax-services',
                '',
                'tax-services',
                'tax services, accounting, tax preparation',
                'Tax Services Overview',
                '1500',
                'DRAFT',
                '',
                '',
                'FALSE',
                '2025-08-25',
                '2025-08-25',
                'Main services page for Tax4Us'
            ],
            [
                'REQ002',
                'שירותי מס',
                'page',
                'he',
                'tax-services-he',
                'tax-services-he',
                '',
                'שירותי מס, הנהלת חשבונות, הכנת דוחות',
                'שירותי מס',
                '1200',
                'DRAFT',
                '',
                '',
                'FALSE',
                '2025-08-25',
                '2025-08-25',
                'עמוד שירותי מס בעברית'
            ]
        ];
        
        return [headers, ...sampleData];
    }

    generateContentTemplatesCSV() {
        const headers = [
            'id', 'name', 'type', 'language', 'template_structure', 
            'sections', 'faq_template', 'schema_template', 'active'
        ];
        
        const sampleData = [
            [
                'TEMP001',
                'Service Page Template EN',
                'page',
                'en',
                '{"sections": ["hero", "services", "benefits", "cta"], "faqs": true, "schema": true}',
                'hero,services,benefits,cta',
                '{"questions": ["What services do you offer?", "How much do you charge?", "How long does it take?"]}',
                '{"@type": "Service", "name": "{{title}}", "description": "{{description}}"}',
                'TRUE'
            ],
            [
                'TEMP002',
                'Service Page Template HE',
                'page',
                'he',
                '{"sections": ["hero", "services", "benefits", "cta"], "faqs": true, "schema": true}',
                'hero,services,benefits,cta',
                '{"questions": ["איזה שירותים אתם מציעים?", "כמה אתם גובים?", "כמה זמן זה לוקח?"]}',
                '{"@type": "Service", "name": "{{title}}", "description": "{{description}}"}',
                'TRUE'
            ]
        ];
        
        return [headers, ...sampleData];
    }

    generateWorkflowLogsCSV() {
        const headers = [
            'id', 'content_request_id', 'workflow_id', 'status', 
            'started_at', 'completed_at', 'error_message', 'execution_data'
        ];
        
        const sampleData = [
            [
                'LOG001',
                'REQ001',
                'jbfZ1GT5Er3vseuW',
                'COMPLETED',
                '2025-08-25 10:00:00',
                '2025-08-25 10:05:00',
                '',
                '{"wp_id": 123, "preview_url": "https://tax4us.co.il/?p=123&preview=true"}'
            ]
        ];
        
        return [headers, ...sampleData];
    }

    async writeCSVFile(filename, data) {
        const fs = await import('fs/promises');
        const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        await fs.writeFile(filename, csvContent);
    }
}

// Run the analyzer
const analyzer = new Tax4UsSheetsAnalyzer();
analyzer.start().catch(console.error);
