import { MongoClient, Db } from 'mongodb';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'rensto';

// Global variables for connection caching
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB
 */
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }

  db = client.db(MONGODB_DB);
  return db;
}

/**
 * Get database instance
 */
export async function getDatabase(): Promise<Db> {
  return connectToDatabase();
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

/**
 * Get collection with organization context
 */
export async function getCollection(collectionName: string, orgId?: string) {
  const db = await getDatabase();
  const collection = db.collection(collectionName);

  // Add organization filter if orgId is provided
  if (orgId) {
    return collection.withOptions({
      readPreference: 'primary',
      writeConcern: { w: 'majority' },
    });
  }

  return collection;
}

/**
 * Health check for MongoDB connection
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  details?: unknown;
}> {
  try {
    const db = await getDatabase();
    await db.admin().ping();

    return {
      status: 'healthy',
      message: 'MongoDB connection is operational',
      details: {
        database: db.databaseName,
        collections: await db.listCollections().toArray(),
      },
    };
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return {
      status: 'unhealthy',
      message: 'MongoDB connection failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Default export for backward compatibility
export default connectToDatabase;
