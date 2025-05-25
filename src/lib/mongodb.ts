import { MongoClient } from 'mongodb';

// Check for either MongoDB URI or CosmosDB connection string
const mongoUri = process.env.MONGODB_URI || process.env.COSMOSDB_CONNECTION_STRING;
console.log('MongoDB URI exists:', !!mongoUri);

if (!mongoUri) {
  throw new Error('Please add your MongoDB URI or CosmosDB connection string to .env.local');
}

const uri = mongoUri;
console.log('MongoDB configuration detected');

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
  try {
    const client = await clientPromise;
    const db = client.db();

    // Test the connection
    await db.command({ ping: 1 });
    console.log('✓ Database connection verified');

    return { client, db };
  } catch (error) {
    console.error('× Database connection error:', error);
    throw new Error('Failed to connect to database. Please check your connection string and network connection.');
  }
} 
