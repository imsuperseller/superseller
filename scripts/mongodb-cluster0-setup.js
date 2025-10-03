#!/usr/bin/env node

/**
 * MongoDB Cluster0 Setup and Connection Script
 * Helps configure the proper connection to Cluster0
 */

import { MongoClient } from 'mongodb';

// MongoDB Cluster0 Connection Details
const CLUSTER0_CONFIG = {
    host: 'cluster0.g1s6vby.mongodb.net',
    username: 'service',
    database: 'rensto', // or your preferred database name
    options: 'retryWrites=true&w=majority&appName=Cluster0'
};

function generateConnectionString(password) {
    return `mongodb+srv://${CLUSTER0_CONFIG.username}:${password}@${CLUSTER0_CONFIG.host}/${CLUSTER0_CONFIG.database}?${CLUSTER0_CONFIG.options}`;
}

async function testConnection(password) {
    console.log('🔗 Testing MongoDB Cluster0 Connection...');

    try {
        const uri = generateConnectionString(password);
        console.log(`📡 Connecting to: ${CLUSTER0_CONFIG.host}`);

        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        await client.connect();
        console.log('✅ Successfully connected to MongoDB Cluster0!');

        // Test basic operations
        const db = client.db(CLUSTER0_CONFIG.database);
        const collections = await db.listCollections().toArray();

        console.log(`📁 Database: ${CLUSTER0_CONFIG.database}`);
        console.log(`📋 Collections: ${collections.length}`);
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });

        await client.close();
        console.log('🔌 Connection closed successfully');

        return {
            success: true,
            connectionString: uri,
            database: CLUSTER0_CONFIG.database
        };

    } catch (error) {
        console.error('❌ Connection failed:', error.message);

        if (error.message.includes('authentication failed')) {
            console.log('\n💡 Authentication Error:');
            console.log('   - Check your password in MongoDB Atlas');
            console.log('   - Verify username is "service"');
            console.log('   - Make sure user has proper permissions');
        }

        if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.log('\n💡 Network Error:');
            console.log('   - Check your internet connection');
            console.log('   - Verify IP is whitelisted in MongoDB Atlas');
            console.log('   - Try connecting from MongoDB Atlas dashboard');
        }

        return {
            success: false,
            error: error.message
        };
    }
}

function printSetupInstructions() {
    console.log('\n📋 MongoDB Cluster0 Setup Instructions:');
    console.log('=====================================');
    console.log('');
    console.log('1. Go to MongoDB Atlas Dashboard:');
    console.log('   https://cloud.mongodb.com/');
    console.log('');
    console.log('2. Navigate to your Cluster0:');
    console.log('   - Click on "Clusters"');
    console.log('   - Find "Cluster0"');
    console.log('   - Click "Connect"');
    console.log('');
    console.log('3. Get Connection String:');
    console.log('   - Choose "Connect your application"');
    console.log('   - Copy the connection string');
    console.log('   - Note the password for user "service"');
    console.log('');
    console.log('4. Update Your Interface:');
    console.log('   - Replace localhost connection with:');
    console.log(`   - ${generateConnectionString('<YOUR_PASSWORD>')}`);
    console.log('');
    console.log('5. Test Connection:');
    console.log('   node scripts/mongodb-cluster0-setup.js <password>');
    console.log('');
}

// Main execution
const password = process.argv[2];

if (!password) {
    printSetupInstructions();
    process.exit(1);
}

testConnection(password).then(result => {
    if (result.success) {
        console.log('\n🎉 Connection successful!');
        console.log('Copy this connection string to your interface:');
        console.log(result.connectionString);
    } else {
        console.log('\n❌ Connection failed. Check the error above.');
        process.exit(1);
    }
});

export {
    testConnection,
    generateConnectionString,
    CLUSTER0_CONFIG
};
