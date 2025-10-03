#!/usr/bin/env node

/**
 * MongoDB n8n Compatible Connection Test
 * Tests connection strings that should work with n8n
 */

import { MongoClient } from 'mongodb';

// Test different connection string formats for n8n compatibility
const connectionStrings = [
    {
        name: 'Standard Atlas (with TLS disabled)',
        uri: 'mongodb+srv://service:Qp4ttwKDPyIaKCNp@cluster0.g1s6vby.mongodb.net/rensto?retryWrites=true&w=majority&appName=Cluster0&tls=false'
    },
    {
        name: 'Standard Atlas (no TLS param)',
        uri: 'mongodb+srv://service:Qp4ttwKDPyIaKCNp@cluster0.g1s6vby.mongodb.net/rensto?retryWrites=true&w=majority&appName=Cluster0'
    },
    {
        name: 'Direct connection (no SRV)',
        uri: 'mongodb://service:Qp4ttwKDPyIaKCNp@ac-emmcaxs-shard-00-02.g1s6vby.mongodb.net:27017/rensto?retryWrites=true&w=majority&appName=Cluster0&tls=false'
    },
    {
        name: 'Direct connection with SSL disabled',
        uri: 'mongodb://service:Qp4ttwKDPyIaKCNp@ac-emmcaxs-shard-00-02.g1s6vby.mongodb.net:27017/rensto?retryWrites=true&w=majority&appName=Cluster0&ssl=false'
    }
];

async function testConnection(connectionString, name) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`URI: ${connectionString.uri.replace(/\/\/.*@/, '//***:***@')}`);

    try {
        const client = new MongoClient(connectionString.uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });

        await client.connect();
        console.log('✅ Connection successful!');

        // Test a simple operation
        const db = client.db('rensto');
        const collections = await db.listCollections().toArray();
        console.log(`📁 Found ${collections.length} collections`);

        await client.close();
        return { success: true, uri: connectionString.uri };

    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function runN8nCompatibilityTests() {
    console.log('🔍 Testing MongoDB connection strings for n8n compatibility...');
    console.log('Node.js version:', process.version);
    console.log('OpenSSL version:', process.versions.openssl);

    const results = [];

    for (const connStr of connectionStrings) {
        const result = await testConnection(connStr, connStr.name);
        results.push({
            name: connStr.name,
            ...result
        });
    }

    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    const workingConfigs = [];

    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
        if (result.success) {
            workingConfigs.push(result);
        }
    });

    if (workingConfigs.length > 0) {
        console.log('\n🎯 Recommended n8n Configuration:');
        console.log('==================================');

        const bestConfig = workingConfigs[0];
        console.log(`\nBest option: ${bestConfig.name}`);
        console.log(`Connection String: ${bestConfig.uri}`);

        console.log('\n📋 n8n Settings:');
        console.log('Configuration Type: Connection String');
        console.log(`Connection String: ${bestConfig.uri}`);
        console.log('Database: rensto');
        console.log('Use TLS: Off');

        // Also provide Values configuration
        if (bestConfig.uri.includes('mongodb+srv://')) {
            console.log('\n📋 Alternative n8n Settings (Values):');
            console.log('Configuration Type: Values');
            console.log('Host: cluster0.g1s6vby.mongodb.net');
            console.log('Database: rensto');
            console.log('User: service');
            console.log('Password: Qp4ttwKDPyIaKCNp');
            console.log('Port: 27017');
            console.log('Use TLS: Off');
        }
    } else {
        console.log('\n❌ No working configurations found.');
        console.log('This might be a network or MongoDB Atlas configuration issue.');
    }
}

runN8nCompatibilityTests().catch(console.error);
