import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection');
    
    // MongoDB Configuration
    const mongoUri = process.env.MONGODB_URI;
    const databaseId = process.env.COSMOS_DATABASE_ID || 'aydocorp-database';
    const collectionId = process.env.COSMOS_CONTAINER_ID || 'users';
    
    // Log configuration (without exposing credentials)
    const sanitizedUri = mongoUri ? mongoUri.replace(/\/\/[^@]+@/, '//[credentials]@') : '';
    console.log({
      uriProvided: mongoUri ? 'Yes' : 'No',
      uriStartsWith: sanitizedUri.substring(0, 50),
      databaseId,
      collectionId
    });
    
    if (!mongoUri) {
      return NextResponse.json({ error: 'Missing MongoDB URI configuration' }, { status: 500 });
    }
    
    // Initialize client
    console.log('Initializing MongoDB client');
    const client = new MongoClient(mongoUri, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 100,
      minPoolSize: 0,
      maxIdleTimeMS: 120000,
      waitQueueTimeoutMS: 30000,
    });
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');
    
    // Get database reference
    const db = client.db(databaseId);
    
    // Get collection
    const collection = db.collection(collectionId);
    
    // Run a simple query
    console.log('Running test query');
    const count = await collection.countDocuments();
    console.log(`Query result: ${count} items in collection`);
    
    // Close the connection
    await client.close();
    
    return NextResponse.json({ 
      status: 'success',
      message: 'MongoDB connection test successful',
      itemCount: count
    });
    
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({ 
      error: 'MongoDB connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 