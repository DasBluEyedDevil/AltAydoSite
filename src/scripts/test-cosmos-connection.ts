import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';

// Load environment variables directly from .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading environment variables from: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('.env.local file found.');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  
  // Apply each environment variable to process.env
  Object.entries(envConfig).forEach(([key, value]) => {
    process.env[key] = value;
  });
} else {
  console.log('.env.local file not found. Please create it with the required variables.');
  process.exit(1);
}

// Azure Cosmos DB Configuration
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_ID;
const containerId = process.env.COSMOS_CONTAINER_ID;

console.log('Environment variables:');
console.log(`COSMOS_ENDPOINT: ${endpoint ? 'Set' : 'Not set'}`);
console.log(`COSMOS_KEY: ${key ? 'Set' : 'Not set'}`);
console.log(`COSMOS_DATABASE_ID: ${databaseId ? 'Set' : 'Not set'}`);
console.log(`COSMOS_CONTAINER_ID: ${containerId ? 'Set' : 'Not set'}`);

// Validate Azure Cosmos DB configuration
if (!endpoint || !key || !databaseId || !containerId) {
  console.error('Missing Azure Cosmos DB configuration. Check your environment variables.');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Testing connection to Azure Cosmos DB...');
    
    // Initialize Cosmos Client
    const client = new CosmosClient({ endpoint, key });
    console.log('Connected to Azure Cosmos DB successfully.');
    
    // Get database reference and check if it exists
    console.log(`Checking if database '${databaseId}' exists...`);
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    console.log(`Database '${databaseId}' exists or was created.`);
    
    // Check if container exists
    console.log(`Checking if container '${containerId}' exists...`);
    const { container } = await database.containers.createIfNotExists({ 
      id: containerId,
      partitionKey: { paths: ['/id'] }
    });
    console.log(`Container '${containerId}' exists or was created.`);
    
    // Try to run a simple query
    console.log('Running a test query...');
    const querySpec = {
      query: 'SELECT COUNT(1) as count FROM c'
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    console.log(`Query result: ${resources[0].count} items in container`);
    
    console.log('Connection test completed successfully.');
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error); 