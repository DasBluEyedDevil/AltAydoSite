import { MongoClient } from 'mongodb';
import { ensureMongoIndexes } from '@/lib/mongo-indexes';

// Check for either MongoDB URI or CosmosDB connection string
const mongoUri = process.env.MONGODB_URI || process.env.COSMOSDB_CONNECTION_STRING;

// Strict validation for production environments
if (!mongoUri) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL: MongoDB/CosmosDB connection string is required in production. ' +
      'Set MONGODB_URI or COSMOSDB_CONNECTION_STRING in environment variables.'
    );
  } else {
    console.warn('⚠️  WARNING: No database connection string found. App will use fallback storage.');
  }
}

const uri: string = mongoUri || '';
if (uri && process.env.NODE_ENV !== 'production') {
  console.log('✓ MongoDB configuration detected');
}

// Options optimized for vCore MongoDB
const options = {
  maxPoolSize: 100,
  minPoolSize: 0,
  maxIdleTimeMS: 120000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  waitQueueTimeoutMS: 30000,
  retryWrites: false,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log('Initializing MongoDB client (development)...');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then((client) => {
        console.log('✓ MongoDB connected successfully (development)');
        return client;
      })
      .catch((error) => {
        console.error('× MongoDB connection error (development):', error);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('Initializing MongoDB client (production)...');
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((client) => {
      console.log('✓ MongoDB connected successfully (production)');
      return client;
    })
    .catch((error) => {
      console.error('× MongoDB connection error (production):', error);
      throw error;
    });
}

export async function connectToDatabase() {
  if (!uri) {
    throw new Error('Please add your MongoDB URI or CosmosDB connection string to .env.local');
  }
  try {
    const client = await clientPromise;
    const dbName = process.env.COSMOS_DATABASE_ID;
    const db = dbName ? client.db(dbName) : client.db();

    // Test the connection
    await db.command({ ping: 1 });
    console.log('✓ Database connection verified');

    // Ensure indexes are created (fail in dev, warn in prod)
    try {
      await ensureMongoIndexes(db);
      console.log('✓ Database indexes verified');
    } catch (err) {
      console.error('× Database index creation failed:', err);
      // In development, throw error to catch index issues early
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(`Index creation failed: ${err}`);
      }
      // In production, log but don't block startup
      console.warn('⚠️  Continuing without all indexes - performance may be degraded');
    }

    return { client, db };
  } catch (error) {
    console.error('× Database connection error:', error);
    throw new Error('Failed to connect to database. Please check your connection string and network connection.');
  }
} 
