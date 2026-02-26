// MongoDB setup script for SuperSeller AI SaaS
const { MongoClient } = require('mongodb');

async function setupDatabase() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('superseller-saas');
    
    // Create collections
    await db.createCollection('customers');
    await db.createCollection('subscriptions');
    await db.createCollection('usage');
    
    // Create indexes
    await db.collection('customers').createIndex({ email: 1 }, { unique: true });
    await db.collection('customers').createIndex({ 'tenant.subdomain': 1 }, { unique: true });
    await db.collection('customers').createIndex({ 'subscription.status': 1 });
    await db.collection('subscriptions').createIndex({ customerId: 1 });
    await db.collection('subscriptions').createIndex({ stripeSubscriptionId: 1 }, { unique: true });
    await db.collection('usage').createIndex({ customerId: 1, timestamp: 1 });
    
    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
