import { NextResponse } from 'next/server';
import { CosmosClient } from '@azure/cosmos';

export async function GET() {
  try {
    console.log('Testing Cosmos DB connection');
    
    // Azure Cosmos DB Configuration
    const endpoint = process.env.COSMOS_ENDPOINT || '';
    const key = process.env.COSMOS_KEY || '';
    const databaseId = process.env.COSMOS_DATABASE_ID || '';
    const containerId = process.env.COSMOS_CONTAINER_ID || '';
    
    // Log configuration (without exposing full key)
    console.log({
      endpoint,
      keyProvided: key ? 'Yes' : 'No',
      keyLength: key ? key.length : 0,
      databaseId,
      containerId
    });
    
    if (!endpoint || !key) {
      return NextResponse.json({ error: 'Missing Cosmos DB configuration' }, { status: 500 });
    }
    
    // Initialize client
    console.log('Initializing CosmosClient');
    const client = new CosmosClient({ endpoint, key });
    
    // Try to access database
    console.log(`Accessing database: ${databaseId}`);
    const database = client.database(databaseId);
    
    // Create database if it doesn't exist
    console.log('Creating database if not exists');
    const { database: dbResponse } = await client.databases.createIfNotExists({ id: databaseId });
    console.log(`Database response id: ${dbResponse.id}`);
    
    // Try to access container
    console.log(`Accessing container: ${containerId}`);
    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ['/id'] }
    });
    console.log(`Container id: ${container.id}`);
    
    // Run a simple query
    console.log('Running test query');
    const querySpec = {
      query: 'SELECT VALUE COUNT(1) FROM c'
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    console.log(`Query result: ${resources[0]} items in container`);
    
    return NextResponse.json({
      status: 'Connected successfully',
      databaseId: dbResponse.id,
      containerId: container.id,
      itemCount: resources[0]
    });
    
  } catch (error: any) {
    console.error('Cosmos DB connection test failed:', error);
    
    // Format the error for easier debugging
    const formattedError = {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      body: error.body ? JSON.stringify(error.body) : undefined
    };
    
    return NextResponse.json({ 
      error: 'Cosmos DB connection failed', 
      details: formattedError 
    }, { status: 500 });
  }
} 