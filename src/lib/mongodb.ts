import { MongoClient } from 'mongodb';

console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB...');

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
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
    console.log('Creating new MongoDB client in development mode...');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then((client) => {
        console.log('MongoDB connected successfully in development mode');
        return client;
      })
      .catch((error) => {
        console.error('MongoDB connection error in development mode:', error);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('Creating new MongoDB client in production mode...');
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((client) => {
      console.log('MongoDB connected successfully in production mode');
      return client;
    })
    .catch((error) => {
      console.error('MongoDB connection error in production mode:', error);
      throw error;
    });
}

export async function connectToDatabase() {
  try {
    console.log('Attempting to get database connection...');
    const client = await clientPromise;
    const db = client.db();
    console.log('Database connection successful');
    return { client, db };
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
} 