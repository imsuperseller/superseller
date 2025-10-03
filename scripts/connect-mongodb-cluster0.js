#!/usr/bin/env node

/**
 * MongoDB Cluster0 Connection Script
 * Connects to the MongoDB Atlas cluster shown in the interface
 */

const { MongoClient } = require('mongodb');

// Connection string from the interface (replace <db_password> with actual password)
const CONNECTION_STRING = 'mongodb+srv://service:<db_password>@cluster0.g1s6vby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function connectToCluster0() {
    console.log('🔗 Connecting to MongoDB Cluster0...');
    
    try {
        // Replace <db_password> with actual password
        const uri = CONNECTION_STRING.replace('<db_password>', process.env.MONGODB_PASSWORD || 'YOUR_PASSWORD_HERE');
        
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
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
        const testDb = client.db('test');
        const testCollection = testDb.collection('connection_test');
        
        const testDoc = {
            message: 'MongoDB Cluster0 connection test',
            timestamp: new Date(),
            source: 'rensto-connection-script'
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
            console.log('   1. Make sure MONGODB_PASSWORD environment variable is set');
            console.log('   2. Or replace <db_password> in the connection string');
            console.log('   3. Verify the password in MongoDB Atlas dashboard');
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
if (require.main === module) {
    connectToCluster0()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { connectToCluster0 };
