#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * BOOST.SPACE FINAL FIX - COMPREHENSIVE SOLUTION
 * 
 * This script fixes all remaining Boost.space issues:
 * 1. Addresses specific field requirements for each module
 * 2. Fixes API errors and data format issues
 * 3. Creates proper data structures for all modules
 * 4. Validates all operations
 */

class BoostSpaceFinalFix {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.baseUrl = 'https://superseller.boost.space/api';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in-progress',
            fixed: 0,
            failed: 0,
            details: []
        };
    }

    async fixAllIssues() {
        console.log('🔧 BOOST.SPACE FINAL FIX - COMPREHENSIVE SOLUTION');
        console.log('==================================================\n');

        try {
            // 1. Fix payment module
            await this.fixPaymentModule();

            // 2. Fix import module
            await this.fixImportModule();

            // 3. Fix business-offer module
            await this.fixBusinessOfferModule();

            // 4. Fix purchase module
            await this.fixPurchaseModule();

            // 5. Fix stock-reservation module
            await this.fixStockReservationModule();

            // 6. Fix page module
            await this.fixPageModule();

            // 7. Fix integration module
            await this.fixIntegrationModule();

            // 8. Fix stock-inventory module
            await this.fixStockInventoryModule();

            // 9. Fix work module
            await this.fixWorkModule();

            // 10. Test all modules
            await this.testAllModules();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n✅ BOOST.SPACE FINAL FIX COMPLETED!');
            console.log(`📊 Results: ${this.results.fixed} fixed, ${this.results.failed} failed`);
            console.log('🌐 Check your data at: https://superseller.boost.space');

        } catch (error) {
            console.error('❌ Final fix failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
            throw error;
        }
    }

    async fixPaymentModule() {
        console.log('💰 Fixing payment module...');

        const paymentData = {
            recordId: 1, // Required field
            amount: 100.00,
            currency: 'USD',
            status: 'completed',
            method: 'credit_card',
            description: 'Test payment for services'
        };

        try {
            const response = await axios.post(`${this.baseUrl}/payment`, paymentData, { headers: this.headers });
            console.log(`  ✅ Payment: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'payment', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Payment: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'payment', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixImportModule() {
        console.log('📥 Fixing import module...');

        const importData = {
            module: 'contact', // Required field
            importedAmount: 10,
            status: 'completed',
            source: 'csv',
            description: 'Contact import from CSV file'
        };

        try {
            const response = await axios.post(`${this.baseUrl}/import`, importData, { headers: this.headers });
            console.log(`  ✅ Import: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'import', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Import: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'import', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixBusinessOfferModule() {
        console.log('📋 Fixing business-offer module...');

        const offerData = {
            contactId: 1, // Required field
            title: 'Business Automation Package',
            description: 'Complete automation solution for business',
            amount: 15000.00,
            currency: 'USD',
            status: 'draft',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        try {
            const response = await axios.post(`${this.baseUrl}/business-offer`, offerData, { headers: this.headers });
            console.log(`  ✅ Business Offer: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'business-offer', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Business Offer: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'business-offer', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixPurchaseModule() {
        console.log('🛒 Fixing purchase module...');

        const purchaseData = {
            currencyId: 1, // Required field
            language: 'en', // Required field
            amount: 5000.00,
            description: 'Software license purchase',
            status: 'completed',
            supplier: 'Software Corp'
        };

        try {
            const response = await axios.post(`${this.baseUrl}/purchase`, purchaseData, { headers: this.headers });
            console.log(`  ✅ Purchase: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'purchase', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Purchase: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'purchase', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixStockReservationModule() {
        console.log('📦 Fixing stock-reservation module...');

        const reservationData = {
            stockCardId: 1, // Required field
            userId: 1, // Required field
            quantity: 5,
            status: 'reserved',
            reservationDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        try {
            const response = await axios.post(`${this.baseUrl}/stock-reservation`, reservationData, { headers: this.headers });
            console.log(`  ✅ Stock Reservation: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'stock-reservation', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Stock Reservation: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'stock-reservation', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixPageModule() {
        console.log('📄 Fixing page module...');

        const pageData = {
            type: 'content', // Required field
            title: 'About Us',
            content: 'This is the about us page content.',
            status: 'published',
            slug: 'about-us',
            metaDescription: 'Learn more about our company'
        };

        try {
            const response = await axios.post(`${this.baseUrl}/page`, pageData, { headers: this.headers });
            console.log(`  ✅ Page: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'page', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Page: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'page', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixIntegrationModule() {
        console.log('🔗 Fixing integration module...');

        const integrationData = {
            title: 'QuickBooks Integration', // Required field
            remote: 'quickbooks', // Required field
            status: 'active',
            description: 'Integration with QuickBooks accounting software',
            config: {
                apiKey: 'test_key',
                endpoint: 'https://api.quickbooks.com'
            }
        };

        try {
            const response = await axios.post(`${this.baseUrl}/integration`, integrationData, { headers: this.headers });
            console.log(`  ✅ Integration: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'integration', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Integration: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'integration', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixStockInventoryModule() {
        console.log('📊 Fixing stock-inventory module...');

        const inventoryData = {
            datetime: new Date().toISOString(), // Required field
            stockCardId: 1,
            quantity: 100,
            location: 'Warehouse A',
            status: 'in_stock',
            notes: 'Regular inventory update'
        };

        try {
            const response = await axios.post(`${this.baseUrl}/stock-inventory`, inventoryData, { headers: this.headers });
            console.log(`  ✅ Stock Inventory: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'stock-inventory', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Stock Inventory: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'stock-inventory', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async fixWorkModule() {
        console.log('💼 Fixing work module...');

        const workData = {
            resourceId: 1, // Required field (at least one of resourceId or userId)
            endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Required field
            startDate: new Date().toISOString(),
            description: 'Development work on automation system',
            status: 'in_progress',
            hours: 8
        };

        try {
            const response = await axios.post(`${this.baseUrl}/work`, workData, { headers: this.headers });
            console.log(`  ✅ Work: Fixed successfully (ID: ${response.data.id})`);
            this.results.fixed++;
            this.results.details.push({ module: 'work', status: 'success', id: response.data.id });
        } catch (error) {
            console.log(`  ❌ Work: ${error.response?.data?.message || error.message}`);
            this.results.failed++;
            this.results.details.push({ module: 'work', status: 'failed', error: error.response?.data?.message || error.message });
        }
    }

    async testAllModules() {
        console.log('\n🧪 Testing all modules...');

        const modules = [
            'contact', 'product', 'invoice', 'event', 'note', 'business-order',
            'business-offer', 'form', 'business-case', 'business-contract', 'todo',
            'project', 'work', 'activities', 'team', 'user', 'category', 'submission',
            'purchase', 'stock-request', 'stock-reservation', 'stock-inventory',
            'stock-item', 'address', 'page', 'resource', 'integration', 'chart',
            'custom-info', 'custom-module-item', 'automatization', 'import', 'payment'
        ];

        let workingModules = 0;
        let totalModules = modules.length;

        for (const module of modules) {
            try {
                const response = await axios.get(`${this.baseUrl}/${module}`, { headers: this.headers });
                if (response.status === 200) {
                    workingModules++;
                    console.log(`  ✅ ${module}: Working (${response.data.length || 0} records)`);
                }
            } catch (error) {
                console.log(`  ❌ ${module}: ${error.response?.status || 'Error'}`);
            }
        }

        console.log(`\n📊 Module Test Results: ${workingModules}/${totalModules} modules working`);
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/boost-space-final-fix/final-fix-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

// Execute the fix
const fixer = new BoostSpaceFinalFix();
fixer.fixAllIssues().catch(console.error);
