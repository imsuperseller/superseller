#!/usr/bin/env node

/**
 * MongoDB Cluster0 Connection Script
 * Uses the official connection string from MongoDB Atlas
 */

import { MongoClient } from 'mongodb';

// Your MongoDB Atlas connection string
const CONNECTION_STRING = 'mongodb+srv://service:<db_password>@cluster0.g1s6vby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function connectToCluster0() {
    console.log('🔗 Connecting to MongoDB Cluster0...');
    console.log('📡 Using connection string from MongoDB Atlas');

    try {
        // Replace <db_password> with actual password
        const password = process.env.MONGODB_PASSWORD || process.argv[2];

        if (!password) {
            console.log('❌ Password required!');
            console.log('Usage: node scripts/mongodb-cluster0-connect.js <password>');
            console.log('Or set MONGODB_PASSWORD environment variable');
            process.exit(1);
        }

        const uri = CONNECTION_STRING.replace('<db_password>', password);
        console.log(`🔐 Connecting with username: service`);

        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('📡 Attempting connection...');
        await client.connect();

        console.log('✅ Successfully connected to MongoDB Cluster0!');

        // Test the connection
        const admin = client.db().admin();
        const serverStatus = await admin.serverStatus();

        console.log('📊 Server Information:');
        console.log(`   Host: ${serverStatus.host}`);
        console.log(`   Version: ${serverStatus.version}`);
        console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`);

        // List databases
        const databases = await client.db().admin().listDatabases();
        console.log('\n📁 Available Databases:');
        databases.databases.forEach(db => {
            console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });

        // Test a simple operation
        const testDb = client.db('rensto');
        const testCollection = testDb.collection('connection_test');

        const testDoc = {
            message: 'MongoDB Cluster0 connection test',
            timestamp: new Date(),
            source: 'rensto-connection-script',
            cluster: 'Cluster0'
        };

        const result = await testCollection.insertOne(testDoc);
        console.log(`\n🧪 Test document inserted with ID: ${result.insertedId}`);

        // Clean up test document
        await testCollection.deleteOne({ _id: result.insertedId });
        console.log('🧹 Test document cleaned up');

        await client.close();
        console.log('🔌 Connection closed successfully');

        return true;

    } catch (error) {
        console.error('❌ Connection failed:', error.message);

        if (error.message.includes('authentication failed')) {
            console.log('\n💡 Authentication Error - Check your password:');
            console.log('   1. Make sure the password is correct');
            console.log('   2. Verify the username is "service"');
            console.log('   3. Check if the user has proper permissions');
        }

        if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.log('\n💡 Network Error - Check your connection:');
            console.log('   1. Verify internet connection');
            console.log('   2. Check if your IP is whitelisted in MongoDB Atlas');
            console.log('   3. Try connecting from MongoDB Atlas dashboard');
        }

        return false;
    }
}

// Run the connection test
connectToCluster0().then(success => {
    if (success) {
        console.log('\n🎉 MongoDB Cluster0 connection successful!');
        console.log('You can now use this connection string in your application:');
        console.log('mongodb+srv://service:<YOUR_PASSWORD>@cluster0.g1s6vby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    } else {
        console.log('\n❌ Connection failed. Please check the error above.');
        process.exit(1);
    }
});
