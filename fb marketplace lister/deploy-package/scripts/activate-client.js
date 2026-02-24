#!/usr/bin/env node
const db = require('../database/postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node activate-client.js <client-id> <active|inactive>');
        console.log('Example: node activate-client.js uad active');
        console.log('Example: node activate-client.js missparty inactive');
        process.exit(1);
    }
    
    const [clientId, status] = args;
    const isActive = status === 'active';
    
    try {
        const result = await db.setClientActive(clientId, isActive);
        
        if (result) {
            console.log(`✅ ${result.name} is now ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
            
            if (isActive) {
                // Add a test listing when activating
                const testListing = {
                    clientId: clientId,
                    uniqueHash: `${clientId}-test-${Date.now()}`,
                    productName: clientId === 'uad' ? 'Classic Steel Garage Door' : 'White Bounce House',
                    size: clientId === 'uad' ? '16x7' : '15x15',
                    color: clientId === 'uad' ? 'Gray' : 'White',
                    price: clientId === 'uad' ? 2500 : 75,
                    phoneNumber: clientId === 'uad' ? '<bunk>' : '<bunk>',
                    location: 'Dallas, Texas',
                    listingTitle: clientId === 'uad' 
                        ? '16x7 Classic Steel Garage Door - Professional Installation'
                        : 'White Bounce House Rental - 24hr Party Fun!',
                    listingDescription: clientId === 'uad'
                        ? 'Premium Classic Steel garage door. Professional installation available. Call for free quote!'
                        : 'Perfect for kids parties! Includes blower and setup. Safe and clean. Book today!'
                };
                
                const listingId = await db.queueListing(testListing);
                console.log(`📝 Test listing created with ID: ${listingId}`);
            }
        } else {
            console.error(`❌ Client ${clientId} not found`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.pool.end();
    }
}

main();