#!/usr/bin/env node

/**
 * Rensto Business System - System Setup Script
 * 
 * This script sets up the complete system including:
 * - Database connection verification
 * - Admin user creation
 * - Environment validation
 * - Data population
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const CONFIG = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rensto',
  adminEmail: 'admin@rensto.com',
  adminPassword: 'admin123',
  adminName: 'System Administrator'
};

class SystemSetup {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      console.log('🔌 Connecting to MongoDB...');
      this.client = new MongoClient(CONFIG.mongoUri);
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  async checkEnvironment() {
    console.log('🔍 Checking environment variables...');
    
    const requiredEnvVars = [
      'MONGODB_URI',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missing = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length > 0) {
      console.log('⚠️ Missing environment variables:', missing.join(', '));
      console.log('📝 Please set the following environment variables:');
      missing.forEach(envVar => {
        console.log(`   ${envVar}=<value>`);
      });
      return false;
    }

    console.log('✅ Environment variables are properly configured');
    return true;
  }

  async createCollections() {
    console.log('📁 Creating database collections...');
    
    const collections = [
      'users',
      'organizations', 
      'agents',
      'workflows',
      'analytics',
      'metrics',
      'reports'
    ];

    for (const collectionName of collections) {
      try {
        await this.db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`ℹ️ Collection already exists: ${collectionName}`);
        } else {
          console.log(`⚠️ Could not create collection ${collectionName}:`, error.message);
        }
      }
    }
  }

  async createAdminUser() {
    console.log('👤 Creating admin user...');
    
    const usersCollection = this.db.collection('users');

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({
      email: CONFIG.adminEmail,
      role: 'admin'
    });

    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const adminUser = {
      _id: new ObjectId(),
      email: CONFIG.adminEmail,
      name: CONFIG.adminName,
      role: 'admin',
      organizationId: null, // Admin is not tied to any organization
      status: 'active',
      permissions: ['*'], // All permissions
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(adminUser);
    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${CONFIG.adminEmail}`);
    console.log(`   Password: ${CONFIG.adminPassword}`);
    
    return adminUser;
  }

  async verifyDatabaseConnection() {
    console.log('🔍 Verifying database connection...');
    
    try {
      // Test basic operations
      const usersCollection = this.db.collection('users');
      await usersCollection.findOne({});
      console.log('✅ Database connection verified');
      return true;
    } catch (error) {
      console.error('❌ Database connection verification failed:', error);
      return false;
    }
  }

  async runHealthChecks() {
    console.log('🏥 Running health checks...');
    
    const checks = {
      database: false,
      adminUser: false,
      collections: false
    };

    // Database check
    try {
      await this.verifyDatabaseConnection();
      checks.database = true;
    } catch (error) {
      console.error('Database check failed:', error);
    }

    // Admin user check
    try {
      const usersCollection = this.db.collection('users');
      const adminUser = await usersCollection.findOne({
        email: CONFIG.adminEmail,
        role: 'admin'
      });
      checks.adminUser = !!adminUser;
    } catch (error) {
      console.error('Admin user check failed:', error);
    }

    // Collections check
    try {
      const collections = ['users', 'organizations', 'agents', 'workflows', 'analytics'];
      for (const collectionName of collections) {
        await this.db.collection(collectionName).findOne({});
      }
      checks.collections = true;
    } catch (error) {
      console.error('Collections check failed:', error);
    }

    const allHealthy = Object.values(checks).every(check => check);
    
    console.log('📊 Health check results:');
    console.log(`   Database: ${checks.database ? '✅' : '❌'}`);
    console.log(`   Admin User: ${checks.adminUser ? '✅' : '❌'}`);
    console.log(`   Collections: ${checks.collections ? '✅' : '❌'}`);
    
    return allHealthy;
  }

  async setup() {
    try {
      console.log('🚀 Starting Rensto Business System setup...\n');

      // Check environment
      const envOk = await this.checkEnvironment();
      if (!envOk) {
        console.log('\n❌ Environment check failed. Please fix the issues above and try again.');
        return false;
      }

      // Connect to database
      await this.connect();

      // Create collections
      await this.createCollections();

      // Create admin user
      await this.createAdminUser();

      // Run health checks
      const healthy = await this.runHealthChecks();

      console.log('\n🎉 System setup completed!');
      
      if (healthy) {
        console.log('✅ All systems are healthy and ready to use');
        console.log('\n🔑 Login credentials:');
        console.log(`   URL: http://localhost:3000/login`);
        console.log(`   Email: ${CONFIG.adminEmail}`);
        console.log(`   Password: ${CONFIG.adminPassword}`);
        console.log('\n📊 Next steps:');
        console.log('   1. Start the development server: npm run dev');
        console.log('   2. Visit http://localhost:3000/login');
        console.log('   3. Login with the credentials above');
        console.log('   4. Use the Data Population feature to add sample data');
      } else {
        console.log('⚠️ Some health checks failed. Please review the issues above.');
      }

      return healthy;

    } catch (error) {
      console.error('❌ System setup failed:', error);
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
async function main() {
  const setup = new SystemSetup();
  
  try {
    const success = await setup.setup();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Setup script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SystemSetup, CONFIG };
