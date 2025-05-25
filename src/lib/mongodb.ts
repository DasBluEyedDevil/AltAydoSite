import { MongoClient } from 'mongodb';

console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
console.log('MongoDB configuration detected');

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
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