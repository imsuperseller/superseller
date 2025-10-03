#!/usr/bin/env node

/**
 * MongoDB Cluster0 Application Integration Example
 * Shows how to integrate MongoDB Cluster0 into your application
 */

import { MongoClient } from 'mongodb';

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://service:<db_password>@cluster0.g1s6vby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

class MongoDBService {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect(password) {
        try {
            const uri = MONGODB_URI.replace('<db_password>', password);

            this.client = new MongoClient(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            await this.client.connect();
            this.db = this.client.db('rensto');

            console.log('✅ Connected to MongoDB Cluster0');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('🔌 Disconnected from MongoDB');
        }
    }

    // Example: Create a new document
    async createDocument(collection, document) {
        try {
            const result = await this.db.collection(collection).insertOne(document);
            console.log(`📝 Document created with ID: ${result.insertedId}`);
            return result;
        } catch (error) {
            console.error('❌ Error creating document:', error.message);
            throw error;
        }
    }

    // Example: Find documents
    async findDocuments(collection, query = {}) {
        try {
            const documents = await this.db.collection(collection).find(query).toArray();
            console.log(`🔍 Found ${documents.length} documents`);
            return documents;
        } catch (error) {
            console.error('❌ Error finding documents:', error.message);
            throw error;
        }
    }

    // Example: Update a document
    async updateDocument(collection, filter, update) {
        try {
            const result = await this.db.collection(collection).updateOne(filter, update);
            console.log(`✏️ Document updated: ${result.modifiedCount} modified`);
            return result;
        } catch (error) {
            console.error('❌ Error updating document:', error.message);
            throw error;
        }
    }

    // Example: Delete a document
    async deleteDocument(collection, filter) {
        try {
            const result = await this.db.collection(collection).deleteOne(filter);
            console.log(`🗑️ Document deleted: ${result.deletedCount} deleted`);
            return result;
        } catch (error) {
            console.error('❌ Error deleting document:', error.message);
            throw error;
        }
    }
}

// Example usage
async function exampleUsage() {
    const password = process.argv[2];

    if (!password) {
        console.log('Usage: node scripts/mongodb-app-integration.js <password>');
        process.exit(1);
    }

    const mongoService = new MongoDBService();

    try {
        // Connect to MongoDB
        await mongoService.connect(password);

        // Example operations
        console.log('\n🧪 Running example operations...');

        // Create a test document
        const testDoc = {
            name: 'Test Document',
            type: 'example',
            createdAt: new Date(),
            data: { message: 'Hello from MongoDB Cluster0!' }
        };

        await mongoService.createDocument('test_collection', testDoc);

        // Find documents
        const documents = await mongoService.findDocuments('test_collection');
        console.log('📋 Documents found:', documents);

        // Update a document
        await mongoService.updateDocument(
            'test_collection',
            { name: 'Test Document' },
            { $set: { updatedAt: new Date() } }
        );

        // Find updated documents
        const updatedDocs = await mongoService.findDocuments('test_collection');
        console.log('📋 Updated documents:', updatedDocs);

        // Clean up - delete test document
        await mongoService.deleteDocument('test_collection', { name: 'Test Document' });

        console.log('\n🎉 Example operations completed successfully!');

    } catch (error) {
        console.error('❌ Example failed:', error.message);
    } finally {
        await mongoService.disconnect();
    }
}

// Run example if called directly
exampleUsage();

export { MongoDBService };
