#!/usr/bin/env node

/**
 * 🎯 BOOST.SPACE WORKING MODULES POPULATION
 * BMAD-Validated Solution
 * 
 * Only includes modules that actually work with API
 * Uses correct space IDs and field formats
 */

import axios from 'axios';

class BoostSpaceWorkingModulesPopulation {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.apiBaseUrl = 'https://superseller.boost.space/api';
        
        // BMAD-Validated working configurations
        this.workingModules = {
            'contact': { spaceId: 26, statusSystemId: 108 },
            'product': { spaceId: 27, statusSystemId: 52 },
            'business-case': { spaceId: 29, statusSystemId: 30 },
            'business-contract': { spaceId: 29, statusSystemId: 54 },
            'business-order': { spaceId: 27, statusSystemId: 26 },
            'business-offer': { spaceId: 27, statusSystemId: 34 },
            'invoice': { spaceId: 27, statusSystemId: 38 },
            'event': { spaceId: 27, statusSystemId: 21 },
            'note': { spaceId: 27, statusSystemId: 13 },
            'form': { spaceId: 27, statusSystemId: 73 }
        };
    }

    async populateWorkingModules() {
        console.log('🎯 BOOST.SPACE WORKING MODULES POPULATION');
        console.log('=========================================\n');

        for (const [moduleName, config] of Object.entries(this.workingModules)) {
            await this.populateModule(moduleName, config);
        }
    }

    async populateModule(moduleName, config) {
        console.log(`📦 Populating ${moduleName}...`);
        
        try {
            const response = await axios.post(`${this.apiBaseUrl}/${moduleName}`, {
                name: `Sample ${moduleName} Record`,
                spaceId: config.spaceId,
                statusSystemId: config.statusSystemId
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`  ✅ ${moduleName}: Created successfully`);
        } catch (error) {
            console.log(`  ❌ ${moduleName}: ${error.response?.status || 'Error'}`);
        }
    }
}

// Execute
const population = new BoostSpaceWorkingModulesPopulation();
population.populateWorkingModules();
